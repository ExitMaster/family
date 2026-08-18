function bindLinkButtons(){document.querySelectorAll('.link-btn').forEach(b=>b.onclick=()=>{const a=state.attachments.find(x=>x.id===b.dataset.link);if(!a?.drive_url)return;window.open(a.drive_url,'_blank','noopener,noreferrer');});}

function bindModal(){
  $('#closeModal').onclick=()=>{state.modal=null;render();};
  const tx=$('#txForm'),careForm=$('#careForm'),health=$('#healthForm'),settle=$('#settleForm'),imp=$('#importForm');
  if(tx){const type=tx.elements.type,cat=tx.elements.category;const fill=()=>cat.innerHTML=state.categories.filter(c=>c.type===type.value).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');type.onchange=fill;fill();tx.onsubmit=saveTx;}
  if(careForm)careForm.onsubmit=saveCare;
  if(health)health.onsubmit=saveHealth;
  if(settle){settle.onsubmit=saveSettlement;$('#settleTotal').onchange=()=>{const v=Math.round(Number($('#settleTotal').value||0)/3);state.households.forEach(h=>settle.elements[`share_${h.id}`].value=v);};}
  if(imp)imp.onsubmit=importSeed;
}

async function saveTx(e){e.preventDefault();const f=new FormData(e.target);try{await addDoc(subcol('transactions'),{txn_date:f.get('date'),type:f.get('type'),category_id:f.get('category')||null,description:f.get('description'),amount:Number(f.get('amount')),household_id:f.get('household')||null,payment_method:f.get('payment'),memo:f.get('memo')||null,created_by:state.user.uid,created_at:serverTimestamp()});await done();}catch(err){alert(err.message);}}

async function saveCare(e){
  e.preventDefault();const f=new FormData(e.target);const driveUrl=String(f.get('drive_url')||'').trim();
  if(driveUrl && !/^https:\/\/(drive|docs)\.google\.com\//i.test(driveUrl)) return alert('Google Drive 또는 Google Docs 링크만 등록해 주세요.');
  if(driveUrl && !f.get('protected')) return alert('의료자료 링크를 등록하려면 파일 자체 비밀번호 보호 완료를 확인해 주세요.');
  try{
    const ref=await addDoc(subcol('care_events'),{event_date:f.get('date'),event_type:f.get('type'),place:f.get('place')||null,doctor:f.get('doctor')||null,companions:f.get('companions')||null,content:f.get('content')||null,memo:f.get('memo')||null,created_by:state.user.uid,created_at:serverTimestamp()});
    if(driveUrl) await addDoc(subcol('attachments'),{care_event_id:ref.id,drive_url:driveUrl,label:String(f.get('drive_label')||'Google Drive 자료').trim(),password_protected:true,created_by:state.user.uid,created_at:serverTimestamp()});
    await done();
  }catch(err){alert(err.message);}
}

async function saveHealth(e){e.preventDefault();const f=new FormData(e.target),num=n=>f.get(n)?Number(f.get(n)):null;try{await addDoc(subcol('health_logs'),{log_date:f.get('date'),weight_kg:num('weight'),wbc:num('wbc'),anc:num('anc'),neuropathy_score:num('neuropathy'),fatigue_score:num('fatigue'),meal_memo:f.get('memo')||null,created_by:state.user.uid,created_at:serverTimestamp()});await done();}catch(err){alert(err.message);}}

async function saveSettlement(e){e.preventDefault();const f=new FormData(e.target);try{const ref=await addDoc(subcol('settlements'),{settlement_date:f.get('date'),description:f.get('description'),total_amount:Number(f.get('total')),payer_household_id:f.get('payer'),is_example:false,created_by:state.user.uid,created_at:serverTimestamp()});const batch=writeBatch(state.db);state.households.forEach(h=>{const sr=doc(subcol('settlement_shares'));batch.set(sr,{settlement_id:ref.id,household_id:h.id,amount:Number(f.get(`share_${h.id}`)||0),status:f.get(`status_${h.id}`),created_by:state.user.uid,created_at:serverTimestamp()});});await batch.commit();await done();}catch(err){alert(err.message);}}

function containsSensitivePasswordKey(value,path='root'){
  if(!value||typeof value!=='object')return null;
  for(const [k,v] of Object.entries(value)){
    const key=String(k).toLowerCase();
    if(/password|passwd|passcode|\bpin\b|비번|비밀번호/.test(key)) return `${path}.${k}`;
    const nested=containsSensitivePasswordKey(v,`${path}.${k}`); if(nested)return nested;
  }
  return null;
}

async function importSeed(e){
  e.preventDefault();if(!state.isAdmin)return alert('관리자만 이관할 수 있습니다.');
  const f=new FormData(e.target),file=f.get('seed');if(!file?.size)return;
  try{
    const seed=JSON.parse(await file.text());const bad=containsSensitivePasswordKey(seed);if(bad)return alert(`비밀번호 관련 필드가 발견되어 중단했습니다: ${bad}`);
    if(state.transactions.length||state.settlements.length||state.careEvents.length){if(!confirm('이미 일부 데이터가 있습니다. 계속하면 중복 데이터가 생길 수 있습니다. 계속할까요?'))return;}
    await importSeedData(seed);state.modal=null;await refreshData();render();alert(`이관 완료: 거래 ${(seed.transactions||[]).length}건, 정산 ${(seed.settlements||[]).length}건, 간병 ${(seed.care_events||[]).length}건`);
  }catch(err){console.error(err);alert('이관 실패: '+(err.message||err));}
}

async function importSeedData(seed){
  const householdByName=Object.fromEntries(state.households.map(h=>[h.name,h.id]));
  const catByName=Object.fromEntries(state.categories.map(c=>[`${c.type}:${c.name}`,c.id]));
  const batch=writeBatch(state.db);let writes=0;
  const commitMaybe=async force=>{if(force&&writes){await batch.commit();}};
  for(const x of seed.transactions||[]){const r=doc(subcol('transactions'));batch.set(r,{txn_date:x.date,type:x.type,category_id:catByName[`${x.type}:${x.category}`]||null,description:x.description||'',amount:Number(x.amount||0),household_id:x.household?householdByName[x.household]||null:null,payment_method:x.payment_method||null,receipt_shared:x.receipt_shared||null,memo:x.memo||null,created_by:state.user.uid,created_at:serverTimestamp()});writes++;}
  for(const s of seed.settlements||[]){const sr=doc(subcol('settlements'));batch.set(sr,{settlement_date:s.date,description:s.description||'',total_amount:Number(s.total_amount||0),payer_household_id:householdByName[s.payer]||null,memo:s.memo||null,is_example:!!s.is_example,created_by:state.user.uid,created_at:serverTimestamp()});writes++;for(const [name,v] of Object.entries(s.shares||{})){const sh=doc(subcol('settlement_shares'));batch.set(sh,{settlement_id:sr.id,household_id:householdByName[name]||null,amount:Number(v.amount||0),status:v.status||'unpaid',created_by:state.user.uid,created_at:serverTimestamp()});writes++;}}
  for(const [i,x] of (seed.care_events||[]).entries()){const r=doc(subcol('care_events'));batch.set(r,{event_date:x.date,event_type:x.event_type||null,place:x.place||null,doctor:x.doctor||null,companions:x.companions||null,content:x.content||null,memo:x.memo||null,medication:x.medication||null,chemo_cycle:x.chemo_cycle||null,sort_order:i,created_by:state.user.uid,created_at:serverTimestamp()});writes++;}
  for(const x of seed.chemo_cycles||[]){batch.set(subdoc('chemo_cycles',x.cycle_number),{cycle_number:Number(x.cycle_number),cycle_date:x.cycle_date||null,hospital:x.hospital||null,medication:x.medication||null,condition_summary:x.condition_summary||null,notes:x.notes||null,updated_by:state.user.uid,updated_at:serverTimestamp()},{merge:true});writes++;}
  for(const x of seed.payout_accounts||[]){const hid=householdByName[x.household];if(!hid)continue;batch.set(subdoc('payout_accounts',hid),{household_id:hid,bank_name:x.bank_name||null,account_number:x.account_number||null,updated_at:serverTimestamp()},{merge:true});writes++;}
  for(const x of seed.health_logs||[]){const r=doc(subcol('health_logs'));batch.set(r,{log_date:x.date||x.log_date,weight_kg:x.weight_kg??null,wbc:x.wbc??null,anc:x.anc??null,neuropathy_score:x.neuropathy_score??null,fatigue_score:x.fatigue_score??null,meal_memo:x.meal_memo||null,created_by:state.user.uid,created_at:serverTimestamp()});writes++;}
  for(const x of seed.attachments||[]){if(!x.drive_url||!/^https:\/\/(drive|docs)\.google\.com\//i.test(x.drive_url))continue;const r=doc(subcol('attachments'));batch.set(r,{care_event_id:x.care_event_id||null,drive_url:x.drive_url,label:x.label||'Google Drive 자료',password_protected:x.password_protected!==false,created_by:state.user.uid,created_at:serverTimestamp()});writes++;}
  if(seed.emergency_guidance){batch.set(familyRef(),{emergency_guidance:String(seed.emergency_guidance),updated_at:serverTimestamp()},{merge:true});writes++;}
  if(writes>450) throw new Error(`이관 데이터가 ${writes}개 write로 너무 큽니다. 현재 도구는 450개 이하 seed를 전제로 합니다.`);
  await commitMaybe(true);
}

async function done(){state.modal=null;await refreshData();render();}
boot();
