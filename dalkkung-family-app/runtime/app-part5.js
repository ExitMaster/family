function careToneClass(e){
  if(e?.event_type==='환자보고') return 'tone-report';
  if(e?.event_type==='병문안') return 'tone-visit';
  return '';
}
function canManageCare(e){return !!(state.isAdmin || (e?.created_by && e.created_by===state.user?.uid));}
function eventCard(e){const editable=canManageCare(e);return `<div class="event ${careToneClass(e)} ${editable?'editable':''}" ${editable?`data-edit-care="${esc(e.id)}" role="button" tabindex="0" aria-label="${esc(e.event_type||'간병 기록')} 수정 또는 삭제"`:''}><div class="date">${dstr(e.event_date)}</div><div class="item"><div class="row"><div class="event-title"><div class="event-icon">${eventEmoji(e.event_type,e.chemo_cycle)}</div><div class="event-title-copy"><h3>${e.chemo_cycle?`항암 ${e.chemo_cycle}회차`:esc(e.event_type||'기록')}</h3><div class="meta">${e.place?`<span>${esc(e.place)}</span>`:''}${e.doctor?`<span>주치의 ${esc(e.doctor)}</span>`:''}</div></div></div>${e.place?`<span class="badge">${esc(e.place)}</span>`:''}</div>${e.companions?`<div class="meta"><span>함께 · ${esc(e.companions)}</span></div>`:''}${e.content?`<p>${esc(e.content)}</p>`:''}${e.memo?`<p class="muted">${esc(e.memo)}</p>`:''}${state.attachments.filter(a=>a.care_event_id===e.id).map(a=>`<button class="btn ghost small link-btn" data-link="${a.id}">자료 · ${esc(a.label||'Google Drive')}${a.password_protected?' · 파일 비밀번호 보호':''}</button>`).join('')}</div></div>`;}

function bindOpen(){document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{if(b.dataset.open==='care')state.editingCareId=null;state.modal=b.dataset.open;render();});}

function bindLinkButtons(){
  document.querySelectorAll('.link-btn').forEach(b=>b.onclick=e=>{e.stopPropagation();const a=state.attachments.find(x=>x.id===b.dataset.link);if(!a?.drive_url)return;window.open(a.drive_url,'_blank','noopener,noreferrer');});
  document.querySelectorAll('[data-edit-care]').forEach(card=>{
    const open=()=>openCareEditor(card.dataset.editCare);
    card.onclick=e=>{if(e.target.closest('.link-btn'))return;open();};
    card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};
  });
}

function openCareEditor(id){
  const event=state.careEvents.find(x=>x.id===id);
  if(!event||!canManageCare(event))return;
  state.editingCareId=id;
  state.modal='care';
  render();
  hydrateCareEditor(id);
}

function hydrateCareEditor(id){
  const event=state.careEvents.find(x=>x.id===id),form=$('#careForm');
  if(!event||!form)return;
  const titleEl=document.querySelector('.modal-head h2');if(titleEl)titleEl.textContent='간병 기록 수정';
  form.elements.date.value=event.event_date||'';
  form.elements.type.value=event.event_type||'기타';
  form.elements.place.value=event.place||'';
  form.elements.doctor.value=event.doctor||'';
  form.elements.companions.value=event.companions||'';
  form.elements.content.value=event.content||'';
  form.elements.memo.value=event.memo||'';
  const attachment=state.attachments.find(a=>a.care_event_id===id);
  form.elements.drive_url.value=attachment?.drive_url||'';
  form.elements.drive_label.value=attachment?.label||'';
  form.elements.protected.checked=!!attachment?.password_protected;
  const save=form.querySelector('button.btn');if(save)save.textContent='수정 저장';
  const del=document.createElement('button');del.type='button';del.className='btn danger';del.style.marginTop='2px';del.textContent='이 기록 삭제';del.onclick=()=>deleteCareRecord(id);form.appendChild(del);
}

async function saveCare(e){
  e.preventDefault();const f=new FormData(e.target),driveUrl=String(f.get('drive_url')||'').trim();
  if(driveUrl && !/^https:\/\/(drive|docs)\.google\.com\//i.test(driveUrl)) return alert('Google Drive 또는 Google Docs 링크만 등록해 주세요.');
  if(driveUrl && !f.get('protected')) return alert('의료자료 링크를 등록하려면 파일 자체 비밀번호 보호 완료를 확인해 주세요.');
  const payload={event_date:f.get('date'),event_type:f.get('type'),place:f.get('place')||null,doctor:f.get('doctor')||null,companions:f.get('companions')||null,content:f.get('content')||null,memo:f.get('memo')||null};
  try{
    if(state.editingCareId){
      const current=state.careEvents.find(x=>x.id===state.editingCareId);if(!current||!canManageCare(current))return alert('이 기록을 수정할 권한이 없습니다.');
      const attachments=state.attachments.filter(a=>a.care_event_id===state.editingCareId),primary=attachments[0];
      const batch=writeBatch(state.db);batch.update(subdoc('care_events',state.editingCareId),{...payload,updated_by:state.user.uid,updated_at:serverTimestamp()});
      if(driveUrl){
        const attachmentPayload={drive_url:driveUrl,label:String(f.get('drive_label')||'Google Drive 자료').trim(),password_protected:true,updated_by:state.user.uid,updated_at:serverTimestamp()};
        if(primary)batch.update(subdoc('attachments',primary.id),attachmentPayload);else{const ar=doc(subcol('attachments'));batch.set(ar,{care_event_id:state.editingCareId,...attachmentPayload,created_by:state.user.uid,created_at:serverTimestamp()});}
      }else attachments.forEach(a=>batch.delete(subdoc('attachments',a.id)));
      await batch.commit();state.editingCareId=null;await done();return;
    }
    const ref=await addDoc(subcol('care_events'),{...payload,created_by:state.user.uid,created_at:serverTimestamp()});
    if(driveUrl) await addDoc(subcol('attachments'),{care_event_id:ref.id,drive_url:driveUrl,label:String(f.get('drive_label')||'Google Drive 자료').trim(),password_protected:true,created_by:state.user.uid,created_at:serverTimestamp()});
    await done();
  }catch(err){alert(err.message);}
}

async function deleteCareRecord(id){
  const event=state.careEvents.find(x=>x.id===id);if(!event||!canManageCare(event))return alert('이 기록을 삭제할 권한이 없습니다.');
  if(!confirm('이 간병 기록을 삭제할까요? 연결된 Google Drive 파일 자체는 삭제되지 않습니다.'))return;
  try{const batch=writeBatch(state.db);state.attachments.filter(a=>a.care_event_id===id).forEach(a=>batch.delete(subdoc('attachments',a.id)));batch.delete(subdoc('care_events',id));await batch.commit();state.editingCareId=null;await done();}catch(err){alert(err.message);}
}
