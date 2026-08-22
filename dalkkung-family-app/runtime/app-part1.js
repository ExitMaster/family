const {
  initializeApp, getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, sendEmailVerification, reload, signOut,
  getFirestore, doc, collection, getDoc, getDocs, setDoc, updateDoc, addDoc,
  serverTimestamp, writeBatch, onSnapshot
} = Firebase;

const APP_NAME = '꿍스';
const $ = s => document.querySelector(s);
const fmt = n => new Intl.NumberFormat('ko-KR').format(Number(n||0)) + '원';
const dstr = d => d ? new Date(d + (String(d).length===10?'T00:00:00':'')).toLocaleDateString('ko-KR',{year:'numeric',month:'short',day:'numeric'}) : '-';
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const normEmail = s => String(s||'').trim().toLowerCase();
const FAMILY_ID = config?.FAMILY_ID || 'dalkkung';
const state = {app:null,auth:null,db:null,user:null,membership:null,family:null,allowlist:null,isAdmin:false,members:[],households:[],categories:[],transactions:[],settlements:[],shares:[],careEvents:[],chemoCycles:[],healthLogs:[],payoutAccounts:[],attachments:[],tab:'home',ledgerFilter:'all',modal:null,editingCareId:null,message:null,unsubs:[]};

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
function validConfig(){const c=config?.FIREBASE_CONFIG;return !!(c?.apiKey&&c?.projectId&&c?.appId&&!String(c.projectId).includes('YOUR_'));}
function accessRef(){return doc(state.db,'access','allowlist');}
function familyRef(){return doc(state.db,'families',FAMILY_ID);}
function subcol(name){return collection(state.db,'families',FAMILY_ID,name);}
function subdoc(name,id){return doc(state.db,'families',FAMILY_ID,name,String(id));}
function rowData(snap){return snap.docs.map(x=>({id:x.id,...x.data()}));}
function dateSort(a,b,key){return String(b[key]||'').localeCompare(String(a[key]||''));}
function stopRealtime(){state.unsubs.forEach(fn=>{try{fn();}catch{}});state.unsubs=[];}

async function boot(){
  if(!validConfig()) return renderSetup();
  state.app=initializeApp(config.FIREBASE_CONFIG);state.auth=getAuth(state.app);state.db=getFirestore(state.app);
  onAuthStateChanged(state.auth,async user=>{stopRealtime();state.user=user;if(!user)return renderAuth();if(!user.emailVerified)return renderVerify(user);await loadFamily();});
}
function renderSetup(){$('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>${APP_NAME}</h1><p class="sub">Firebase 프로젝트 연결을 기다리고 있습니다.</p><div class="notice">Firebase Hosting에 배포하면 프로젝트 설정은 자동으로 읽습니다. 로컬 테스트를 할 때만 <b>config.example.js</b>를 <b>config.js</b>로 복사해 Firebase Web App 설정을 넣어 주세요.</div></div></div>`;}
function renderAuth(mode='login',msg=''){
  $('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>${APP_NAME}</h1><p class="sub">부모님과 세 형제 가정, 최대 8명이 함께 쓰는 가족 기록입니다.</p>${msg?`<div class="notice ${msg.startsWith('✓')?'success':'error'}">${esc(msg)}</div>`:''}<div class="tabs"><button data-mode="login" class="${mode==='login'?'active':''}">로그인</button><button data-mode="signup" class="${mode==='signup'?'active':''}">가입</button></div><form id="authForm" class="form"><div class="field"><label>이메일</label><input name="email" type="email" required autocomplete="email"></div><div class="field"><label>비밀번호</label><input name="password" type="password" minlength="8" required autocomplete="${mode==='login'?'current-password':'new-password'}"></div><button class="btn">${mode==='login'?'로그인':'계정 만들기'}</button></form><p class="muted" style="font-size:12px;line-height:1.5">Firebase Authentication + 이메일 인증 + 최대 8명 allowlist를 모두 통과해야 데이터에 접근할 수 있습니다.</p></div></div>`;
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>renderAuth(b.dataset.mode));
  $('#authForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),email=normEmail(f.get('email')),password=f.get('password');try{if(mode==='login'){await signInWithEmailAndPassword(state.auth,email,password);}else{const cred=await createUserWithEmailAndPassword(state.auth,email,password);await sendEmailVerification(cred.user);renderVerify(cred.user,'✓ 인증 메일을 보냈습니다.');}}catch(err){renderAuth(mode,friendlyError(err));}};
}
function renderVerify(user,msg=''){
  $('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>이메일 확인</h1><p class="sub">${esc(user.email)}로 보낸 Firebase 인증 메일의 링크를 누른 뒤 아래 버튼을 선택하세요.</p>${msg?`<div class="notice success">${esc(msg)}</div>`:''}<button id="verified" class="btn" style="width:100%">인증 완료 확인</button><button id="resend" class="btn ghost" style="width:100%;margin-top:8px">인증 메일 다시 보내기</button><button id="logout" class="btn ghost" style="width:100%;margin-top:8px">다른 계정 사용</button></div></div>`;
  $('#verified').onclick=async()=>{try{await reload(user);state.user=state.auth.currentUser;if(state.user?.emailVerified)await loadFamily();else renderVerify(state.user,'아직 이메일 인증이 확인되지 않았습니다.');}catch(err){alert(err.message);}};
  $('#resend').onclick=async()=>{try{await sendEmailVerification(user);renderVerify(user,'✓ 인증 메일을 다시 보냈습니다.');}catch(err){alert(err.message);}};
  $('#logout').onclick=()=>signOut(state.auth);
}
function friendlyError(err){const c=err?.code||'';if(c.includes('invalid-credential'))return '이메일 또는 비밀번호가 올바르지 않습니다.';if(c.includes('email-already-in-use'))return '이미 가입된 이메일입니다.';if(c.includes('weak-password'))return '비밀번호는 8자 이상으로 설정해 주세요.';if(c.includes('too-many-requests'))return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';return err?.message||'요청을 처리하지 못했습니다.';}

async function loadFamily(){
  try{
    const access=await getDoc(accessRef());if(!access.exists())return renderUnauthorized('가족 접근 목록이 아직 설정되지 않았습니다.');state.allowlist=access.data();
    const email=normEmail(state.user.email);
    const approvedEmails=(state.allowlist.emails||[]).map(normEmail);
    const adminEmails=(state.allowlist.admins||[]).map(normEmail);
    state.isAdmin=adminEmails.includes(email);
    if(!approvedEmails.includes(email))return renderUnauthorized('이 이메일은 가족 사용자로 승인되지 않았습니다.');
    let fsnap=await getDoc(familyRef());
    if(!fsnap.exists()){
      await setDoc(familyRef(),{name:APP_NAME,created_at:serverTimestamp(),updated_at:serverTimestamp()});
      await ensureDefaults();
      fsnap=await getDoc(familyRef());
    }
    state.family={id:fsnap.id,...fsnap.data()};if(state.isAdmin)await ensureDefaults();
    const msnap=await getDoc(subdoc('members',state.user.uid));if(!msnap.exists())return renderMemberSetup();state.membership={user_id:msnap.id,...msnap.data()};await refreshData();render();startRealtime();
  }catch(err){console.error(err);if(err?.code==='permission-denied')return renderUnauthorized('이 계정은 allowlist에 없거나 이메일 인증/Firestore Rules 설정이 완료되지 않았습니다.');$('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>연결 오류</h1><div class="notice error">${esc(err?.message||err)}</div><button id="logout" class="btn ghost">로그아웃</button></div></div>`;$('#logout').onclick=()=>signOut(state.auth);}
}
function renderUnauthorized(msg){$('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>${APP_NAME} · 가족 전용</h1><p class="sub">현재 계정: ${esc(state.user?.email||'')}</p><div class="notice error">${esc(msg)}</div><p class="muted" style="font-size:12px;line-height:1.6">Firestore의 <b>access/allowlist</b> 문서에는 최대 8개의 승인 이메일만 둡니다.</p><button id="logout" class="btn ghost" style="width:100%">다른 계정으로 로그인</button></div></div>`;$('#logout').onclick=()=>signOut(state.auth);}
function renderMemberSetup(msg=''){$('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>내 프로필 설정</h1><p class="sub">승인된 가족 계정입니다. 앱에서 표시할 이름만 입력하세요.</p>${msg?`<div class="notice error">${esc(msg)}</div>`:''}<form id="memberForm" class="form"><div class="field"><label>표시 이름</label><input name="name" required></div><button class="btn">시작하기</button></form><button id="logout" class="btn ghost" style="margin-top:12px;width:100%">로그아웃</button></div></div>`;$('#memberForm').onsubmit=async e=>{e.preventDefault();const name=new FormData(e.target).get('name').trim();try{await setDoc(subdoc('members',state.user.uid),{email:normEmail(state.user.email),display_name:name,role:state.isAdmin?'admin':'member',household_id:null,created_at:serverTimestamp(),updated_at:serverTimestamp()});await loadFamily();}catch(err){renderMemberSetup(err.message);}};$('#logout').onclick=()=>signOut(state.auth);}

async function ensureDefaults(){
  const [h,c,cycles]=await Promise.all([getDocs(subcol('households')),getDocs(subcol('categories')),getDocs(subcol('chemo_cycles'))]);const batch=writeBatch(state.db);let changed=false;
  if(h.empty)[['hayoung','하영',1],['harim','하림',2],['kyungsu','경수',3]].forEach(([id,name,sort_order])=>{batch.set(subdoc('households',id),{name,sort_order});changed=true;});
  if(c.empty)[['income_regular','income','정기납입',1],['income_extra','income','추가갹출',2],['income_interest','income','이자',3],['income_other','income','기타수입',4],['expense_event','expense','정기행사·기념일',1],['expense_health','expense','건강·의료',2],['expense_living','expense','주거·생활',3],['expense_leisure','expense','여가·기타',4],['expense_misc','expense','기타잡비',5]].forEach(([id,type,name,sort_order])=>{batch.set(subdoc('categories',id),{type,name,sort_order});changed=true;});
  if(cycles.empty){for(let i=1;i<=12;i++){batch.set(subdoc('chemo_cycles',i),{cycle_number:i,cycle_date:null,hospital:null,medication:null,condition_summary:null,notes:null});changed=true;}}
  if(changed)await batch.commit();
}
async function readCollection(name){return rowData(await getDocs(subcol(name)));}
async function refreshData(){const [members,households,cats,tx,settles,shares,care,cycles,health,accounts,attachments]=await Promise.all(['members','households','categories','transactions','settlements','settlement_shares','care_events','chemo_cycles','health_logs','payout_accounts','attachments'].map(readCollection));Object.assign(state,{members,households,categories:cats,transactions:tx.sort((a,b)=>dateSort(a,b,'txn_date')),settlements:settles.sort((a,b)=>dateSort(a,b,'settlement_date')),shares,careEvents:care.sort((a,b)=>dateSort(a,b,'event_date')),chemoCycles:cycles.sort((a,b)=>Number(a.cycle_number)-Number(b.cycle_number)),healthLogs:health.sort((a,b)=>dateSort(a,b,'log_date')),payoutAccounts:accounts,attachments});}
function startRealtime(){stopRealtime();const defs=[['members','members',a=>a],['transactions','transactions',a=>a.sort((x,y)=>dateSort(x,y,'txn_date'))],['settlements','settlements',a=>a.sort((x,y)=>dateSort(x,y,'settlement_date'))],['settlement_shares','shares',a=>a],['care_events','careEvents',a=>a.sort((x,y)=>dateSort(x,y,'event_date'))],['chemo_cycles','chemoCycles',a=>a.sort((x,y)=>Number(x.cycle_number)-Number(y.cycle_number))],['health_logs','healthLogs',a=>a.sort((x,y)=>dateSort(x,y,'log_date'))],['attachments','attachments',a=>a],['payout_accounts','payoutAccounts',a=>a]];defs.forEach(([col,key,sorter])=>state.unsubs.push(onSnapshot(subcol(col),snap=>{state[key]=sorter(rowData(snap));if(state.family&&state.membership&&!state.modal)render();},err=>console.warn('realtime',col,err?.code))));}
// 모달이 열려 있는 동안에는 다시 그리지 않는다. render()는 화면 전체를 새로 만들기 때문에
// 다른 가족의 저장 한 번이 입력 중인 폼을 비워 버린다. 특히 간병 기록 수정 중이면
// state.editingCareId는 남은 채 폼만 빈 값이 되어 그대로 저장하면 기록이 지워진다.
// 상태는 위에서 이미 갱신했으므로 모달을 닫을 때 부르는 render()가 최신 값을 그린다.
function hname(id){return state.households.find(h=>h.id===id)?.name||'공동';}
function cname(id){return state.categories.find(c=>c.id===id)?.name||'-';}
function calc(){const income=state.transactions.filter(x=>x.type==='income').reduce((a,x)=>a+Number(x.amount),0),expense=state.transactions.filter(x=>x.type==='expense').reduce((a,x)=>a+Number(x.amount),0),unpaid=state.shares.filter(s=>s.status==='unpaid').reduce((a,s)=>a+Number(s.amount),0);return{income,expense,balance:income-expense,unpaid};}
