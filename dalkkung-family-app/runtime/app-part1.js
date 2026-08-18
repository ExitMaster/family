const $ = s => document.querySelector(s);
const fmt = n => new Intl.NumberFormat('ko-KR').format(Number(n||0)) + '원';
const dstr = d => d ? new Date(d + (String(d).length===10?'T00:00:00':'' )).toLocaleDateString('ko-KR',{year:'numeric',month:'short',day:'numeric'}) : '-';
const esc = s => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { sb:null, session:null, membership:null, family:null, members:[], households:[], categories:[], transactions:[], settlements:[], shares:[], careEvents:[], chemoCycles:[], healthLogs:[], payoutAccounts:[], attachments:[], tab:'home', ledgerFilter:'all', modal:null, message:null };

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});

async function boot(){
  if(!config || !config.SUPABASE_URL || config.SUPABASE_URL.includes('YOUR_PROJECT')) return renderSetup();
  state.sb = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  const {data:{session}} = await state.sb.auth.getSession(); state.session=session;
  state.sb.auth.onAuthStateChange((_e,s)=>{state.session=s; if(s) loadFamily(); else renderAuth();});
  if(!session) renderAuth(); else await loadFamily();
}

function renderSetup(){
  document.querySelector('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>딸꿍또꿍아꿍</h1><p class="sub">공유형 가족 웹앱 소스가 준비되었습니다. 실제 8인 공동 사용을 위해 Supabase 연결이 필요합니다.</p><div class="notice">README.md의 순서대로 Supabase SQL을 실행하고 <b>config.example.js</b>를 <b>config.js</b>로 복사한 뒤 프로젝트 URL과 anon key를 입력하세요.</div></div></div>`;
}

function renderAuth(mode='login',msg=''){
  $('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>딸꿍또꿍아꿍</h1><p class="sub">부모님과 세 형제 가정, 총 8명이 함께 쓰는 가족 장부·정산·간병 기록입니다.</p>${msg?`<div class="notice ${msg.startsWith('✓')?'success':'error'}">${esc(msg)}</div>`:''}<div class="tabs"><button data-mode="login" class="${mode==='login'?'active':''}">로그인</button><button data-mode="signup" class="${mode==='signup'?'active':''}">가입</button></div><form id="authForm" class="form"><div class="field"><label>이메일</label><input name="email" type="email" required autocomplete="email"></div><div class="field"><label>비밀번호</label><input name="password" type="password" minlength="8" required autocomplete="current-password"></div><button class="btn">${mode==='login'?'로그인':'계정 만들기'}</button></form><p class="muted" style="font-size:12px;line-height:1.5">웹앱 로그인 비밀번호는 Supabase Auth가 관리합니다. 기존 스프레드시트에 있던 금융 비밀번호는 이관되지 않습니다.</p></div></div>`;
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>renderAuth(b.dataset.mode));
  $('#authForm').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);const email=fd.get('email'),password=fd.get('password');
    if(mode==='login'){const {error}=await state.sb.auth.signInWithPassword({email,password}); if(error) renderAuth(mode,error.message);}
    else {const {error}=await state.sb.auth.signUp({email,password}); renderAuth(mode,error?error.message:'✓ 가입 요청이 완료되었습니다. 이메일 확인이 설정되어 있다면 확인 후 로그인하세요.');}
  };
}

async function loadFamily(){
  const uid=state.session.user.id;
  const {data:m}=await state.sb.from('family_members').select('*, families(*)').eq('user_id',uid).maybeSingle();
  if(!m) return renderOnboarding(); state.membership=m; state.family=m.families;
  await refreshData(); render();
}

function renderOnboarding(msg=''){
  $('#app').innerHTML=`<div class="auth"><div class="auth-card"><h1>가족 공간 연결</h1><p class="sub">첫 사용자는 새 가족 공간을 만들고, 나머지 가족은 초대 코드로 참여합니다. 한 공간에는 최대 8명만 참여할 수 있습니다.</p>${msg?`<div class="notice error">${esc(msg)}</div>`:''}<div class="tabs"><button id="createTab" class="active">새 공간</button><button id="joinTab">초대 코드</button></div><div id="onboardBody"></div><button id="logout" class="btn ghost" style="margin-top:12px;width:100%">로그아웃</button></div></div>`;
  const showCreate=()=>{ $('#createTab').classList.add('active');$('#joinTab').classList.remove('active');$('#onboardBody').innerHTML=`<form id="createFamily" class="form"><div class="field"><label>가족 공간 이름</label><input name="family" value="딸꿍또꿍아꿍" required></div><div class="field"><label>내 표시 이름</label><input name="name" required></div><button class="btn">가족 공간 만들기</button></form>`; $('#createFamily').onsubmit=createFamily;};
  const showJoin=()=>{ $('#joinTab').classList.add('active');$('#createTab').classList.remove('active');$('#onboardBody').innerHTML=`<form id="joinFamily" class="form"><div class="field"><label>초대 코드</label><input name="code" maxlength="16" required></div><div class="field"><label>내 표시 이름</label><input name="name" required></div><button class="btn">참여하기</button></form>`; $('#joinFamily').onsubmit=joinFamily;};
  $('#createTab').onclick=showCreate;$('#joinTab').onclick=showJoin;$('#logout').onclick=()=>state.sb.auth.signOut();showCreate();
}
async function createFamily(e){e.preventDefault();const fd=new FormData(e.target);const {data,error}=await state.sb.rpc('create_family',{p_name:fd.get('family'),p_display_name:fd.get('name')});if(error)return renderOnboarding(error.message);alert(`가족 공간이 만들어졌습니다.\n초대 코드: ${data.invite_code}\n\n이 코드는 가족에게만 전달하세요.`);await loadFamily();}
async function joinFamily(e){e.preventDefault();const fd=new FormData(e.target);const {error}=await state.sb.rpc('join_family',{p_invite_code:fd.get('code').trim(),p_display_name:fd.get('name')});if(error)return renderOnboarding(error.message);await loadFamily();}

async function refreshData(){const f=state.family.id;const [members,households,cats,tx,settles,shares,care,cycles,health,accounts,attachments]=await Promise.all([
  state.sb.from('family_members').select('*').eq('family_id',f).order('created_at'), state.sb.from('households').select('*').eq('family_id',f).order('sort_order'), state.sb.from('categories').select('*').eq('family_id',f).order('sort_order'), state.sb.from('transactions').select('*').eq('family_id',f).order('txn_date',{ascending:false}).order('created_at',{ascending:false}), state.sb.from('settlements').select('*').eq('family_id',f).order('settlement_date',{ascending:false}), state.sb.from('settlement_shares').select('*').eq('family_id',f), state.sb.from('care_events').select('*').eq('family_id',f).order('event_date',{ascending:false}).order('sort_order',{ascending:false}), state.sb.from('chemo_cycles').select('*').eq('family_id',f).order('cycle_number'), state.sb.from('health_logs').select('*').eq('family_id',f).order('log_date',{ascending:false}), state.sb.from('payout_accounts').select('*').eq('family_id',f), state.sb.from('attachments').select('*').eq('family_id',f)
]);
  Object.assign(state,{members:members.data||[],households:households.data||[],categories:cats.data||[],transactions:tx.data||[],settlements:settles.data||[],shares:shares.data||[],careEvents:care.data||[],chemoCycles:cycles.data||[],healthLogs:health.data||[],payoutAccounts:accounts.data||[],attachments:attachments.data||[]});
}
function hname(id){return state.households.find(h=>h.id===id)?.name || '공동';}
function cname(id){return state.categories.find(c=>c.id===id)?.name || '-';}
function calc(){const income=state.transactions.filter(x=>x.type==='income').reduce((a,x)=>a+Number(x.amount),0), expense=state.transactions.filter(x=>x.type==='expense').reduce((a,x)=>a+Number(x.amount),0);const unpaid=state.shares.filter(s=>s.status==='unpaid').reduce((a,s)=>a+Number(s.amount),0);return {income,expense,balance:income-expense,unpaid};}
