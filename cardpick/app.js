import { DEFAULT_STATE, CATEGORY_OPTIONS } from './default-data.js';
import { recommend, matchingLinks, applyTransaction, reverseTransaction, benefitSummary, usageKey } from './engine.js';

const STORAGE_KEY = 'card-pick-state-v1';
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const toast = document.querySelector('#toast');
const categoryLabel = Object.fromEntries(CATEGORY_OPTIONS);
let deferredInstallPrompt = null;
let route = 'home';
let ui = { lastInput: null, result: null, selectedFixedId: null };

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return parsed.version === DEFAULT_STATE.version ? parsed : clone(DEFAULT_STATE);
  } catch { return clone(DEFAULT_STATE); }
}
let state = loadState();
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(value = '') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function won(value) { return `${Math.round(Number(value) || 0).toLocaleString('ko-KR')}원`; }
function pct(value) { return `${Math.round((Number(value) || 0) * 1000) / 10}%`; }
function today() { return new Date().toISOString().slice(0, 10); }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
function closeModal() { modal.close(); modal.innerHTML = ''; }
function openModal(title, body, onReady) {
  modal.innerHTML = `<div class="modal-body"><div class="modal-header"><h2>${esc(title)}</h2><button class="close-button" type="button">×</button></div>${body}</div>`;
  modal.querySelector('.close-button').addEventListener('click', closeModal);
  modal.showModal();
  onReady?.(modal);
}
function categoryOptions(selected = '') {
  return CATEGORY_OPTIONS.map(([id, label]) => `<option value="${id}" ${selected === id ? 'selected' : ''}>${label}</option>`).join('');
}
function confidenceBadge(card) {
  if (card.confidence === 'verified') return '<span class="badge green">공식 확인</span>';
  if (card.confidence === 'user-confirmed') return '<span class="badge blue">사용자 확인</span>';
  return '<span class="badge orange">조건 확인 필요</span>';
}

function render() {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.route === route));
  if (route === 'home') renderHome();
  if (route === 'fixed') renderFixed();
  if (route === 'cards') renderCards();
  if (route === 'links') renderLinks();
  if (route === 'more') renderMore();
}

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => { route = button.dataset.route; render(); window.scrollTo({top: 0, behavior: 'smooth'}); }));

function fixedChips() {
  return state.fixedExpenses.map(f => `<button type="button" class="chip" data-fixed-id="${f.id}">${esc(f.merchant)} · ${won(f.amount)}</button>`).join('');
}

function homeForm(input = {}) {
  const data = { merchant: '', category: 'academy', amount: '', channel: 'unknown', paymentMethod: 'lump-sum', ...input };
  return `<section class="card">
    <form id="recommendForm" class="form-grid">
      <div class="field"><label for="merchant">결제처</label><input id="merchant" name="merchant" required value="${esc(data.merchant)}" placeholder="예: 반석수학, 컬리, 피부과" autocomplete="off"></div>
      <div class="inline-grid">
        <div class="field"><label for="category">추정 업종</label><select id="category" name="category">${categoryOptions(data.category)}</select></div>
        <div class="field"><label for="amount">결제금액</label><input id="amount" name="amount" type="number" min="1" step="1000" required value="${esc(data.amount)}" inputmode="numeric" placeholder="350000"></div>
      </div>
      <div class="field"><label>결제 위치</label><div class="chips" data-chip-group="channel">
        ${[['unknown','미정'],['offline','오프라인'],['online','온라인']].map(([v,l]) => `<button type="button" class="chip ${data.channel === v ? 'active':''}" data-value="${v}">${l}</button>`).join('')}
      </div><input type="hidden" name="channel" value="${data.channel}"></div>
      <div class="field"><label for="paymentMethod">결제방법</label><select id="paymentMethod" name="paymentMethod">
        <option value="lump-sum" ${data.paymentMethod === 'lump-sum'?'selected':''}>일시불</option>
        <option value="installment" ${data.paymentMethod === 'installment'?'selected':''}>유이자 할부</option>
        <option value="interest-free" ${data.paymentMethod === 'interest-free'?'selected':''}>무이자할부</option>
        <option value="simple-pay" ${data.paymentMethod === 'simple-pay'?'selected':''}>간편결제</option>
        <option value="recurring" ${data.paymentMethod === 'recurring'?'selected':''}>자동이체·정기결제</option>
      </select></div>
      <button class="primary-button" type="submit">가장 유리한 카드 찾기</button>
    </form>
  </section>`;
}

function resultCard(result, input) {
  if (!result.bestSingle) return `<section class="card"><div class="empty"><strong>적용 가능한 혜택을 찾지 못했습니다.</strong><br><span class="small">카드별 월초 실적구간과 업종을 확인하세요.</span></div></section>`;
  const best = result.bestSingle;
  const links = matchingLinks(state, input);
  const warningHtml = best.warnings.map(w => `<div class="alert warning"><span>!</span><span>${esc(w)}</span></div>`).join('');
  const linkHtml = links.length ? `<div class="alert info"><span>✦</span><span><strong>사용 가능한 Link ${links.length}건</strong><br>${links.map(l => `${esc(l.merchant || categoryLabel[l.category])}: ${esc(l.benefitText)}`).join('<br>')}</span></div>` : '';
  const splitHtml = result.bestSplit ? `<section class="card">
    <p class="result-kicker">분할결제가 ${won(result.bestSplit.gain)} 더 유리</p>
    <h3>두 카드로 나누기</h3>
    <div class="discount-value money">${won(result.bestSplit.discount)}</div>
    <div class="split-grid">${result.bestSplit.legs.map(leg => `<div class="split-leg"><strong>${esc(leg.cardName)} · ${won(leg.amount)}</strong><span>${esc(leg.benefitName)} → ${won(leg.discount)}</span></div>`).join('')}</div>
    <div class="alert warning"><span>!</span><span>매장에서 분할결제가 가능한지 먼저 확인하세요. 각 결제 건은 카드사 업종·결제경로 조건을 각각 충족해야 합니다.</span></div>
    <button type="button" class="primary-button" id="recordSplit">이대로 분할결제 기록</button>
  </section>` : '';
  const alternatives = result.alternatives.length ? `<section class="card flat"><h3>다른 카드</h3><div class="list">${result.alternatives.map(a => `<div class="list-item"><div class="list-head"><div><strong>${esc(a.cardName)}</strong><div class="small muted">${esc(a.benefitName)}</div></div><strong class="money">${won(a.discount)}</strong></div></div>`).join('')}</div></section>` : '';
  return `<section class="card hero-result">
    <p class="result-kicker">단일 카드 추천</p>
    <h2 class="result-title">${esc(best.cardName)}</h2>
    <div class="discount-value money">${won(best.discount)}</div>
    <div class="muted">${esc(best.benefitName)} · 결제 ${won(input.amount)}</div>
    <dl class="stat-grid"><div class="stat"><dt>이번 달 남은 한도</dt><dd>${won(best.remaining)}</dd></div><div class="stat"><dt>적용 할인율</dt><dd>${best.rate ? pct(best.rate) : '정액'}</dd></div></dl>
    ${warningHtml}${linkHtml}
    ${best.bonusEligible ? '<div class="alert success"><span>+</span><span>20만원 이상 교육비 결제 건수 보너스에 1건 반영될 수 있습니다.</span></div>' : ''}
    <button type="button" class="primary-button" id="recordSingle">이 카드로 결제 기록</button>
  </section>${splitHtml}${alternatives}`;
}

function renderHome() {
  app.innerHTML = `<div class="summary-strip">${state.cards.map(c => `<span class="summary-pill">${esc(c.name)} · ${esc(c.tiers.find(t=>t.id===c.selectedTier)?.label || '미설정')}</span>`).join('')}</div>
  <div class="section-title"><div><h2>어디에서 결제하나요?</h2><p>예상 할인액이 가장 큰 카드와 분할안을 계산합니다.</p></div></div>
  ${homeForm(ui.lastInput || {})}
  <div class="section-title"><div><h2>고정결제 불러오기</h2><p>결제 전 조건을 다시 확인하세요.</p></div></div>
  <div class="chips">${fixedChips()}</div>
  <div id="resultArea">${ui.result && ui.lastInput ? resultCard(ui.result, ui.lastInput) : ''}</div>`;
  bindChipGroups();
  document.querySelector('#recommendForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = { merchant: String(form.get('merchant')).trim(), category: form.get('category'), amount: Number(form.get('amount')), channel: form.get('channel'), paymentMethod: form.get('paymentMethod') };
    ui.lastInput = input; ui.result = recommend(state, input);
    document.querySelector('#resultArea').innerHTML = resultCard(ui.result, input);
    bindResultActions();
    document.querySelector('#resultArea').scrollIntoView({behavior:'smooth', block:'start'});
  });
  document.querySelectorAll('[data-fixed-id]').forEach(button => button.addEventListener('click', () => {
    const f = state.fixedExpenses.find(x => x.id === button.dataset.fixedId);
    ui.lastInput = { merchant: f.merchant, category: f.category, amount: f.amount, channel: f.channel, paymentMethod: 'lump-sum' };
    ui.result = recommend(state, ui.lastInput); renderHome();
    setTimeout(() => document.querySelector('#resultArea')?.scrollIntoView({behavior:'smooth'}), 0);
  }));
  bindResultActions();
}

function bindChipGroups() {
  document.querySelectorAll('[data-chip-group]').forEach(group => group.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); chip.classList.add('active');
    group.parentElement.querySelector('input[type="hidden"]').value = chip.dataset.value;
  })));
}
function bindResultActions() {
  document.querySelector('#recordSingle')?.addEventListener('click', () => recordRecommendation([ui.result.bestSingle], false));
  document.querySelector('#recordSplit')?.addEventListener('click', () => recordRecommendation(ui.result.bestSplit.legs, true));
}
function recordRecommendation(legs, isSplit) {
  legs.forEach(leg => applyTransaction(state, leg, ui.lastInput, { splitGroup: isSplit ? crypto.randomUUID() : null }));
  saveState(); showToast('결제기록과 월 할인한도에 반영했습니다.'); ui.result = recommend(state, ui.lastInput); renderHome();
}

function renderFixed() {
  app.innerHTML = `<div class="section-title"><div><h2>고정결제</h2><p>예정금액과 반드시 지킬 결제조건을 저장합니다.</p></div><button class="secondary-button" id="addFixed">추가</button></div>
  <div class="list">${state.fixedExpenses.map(f => `<article class="list-item"><div class="list-head"><div><h3>${esc(f.merchant)}</h3><div class="muted small">${esc(f.schedule)} · ${esc(categoryLabel[f.category])}</div></div><strong>${won(f.amount)}</strong></div>${f.note?`<div class="alert warning"><span>!</span><span>${esc(f.note)}</span></div>`:''}<div class="button-row"><button class="secondary-button use-fixed" data-id="${f.id}">추천 계산</button><button class="ghost-button edit-fixed" data-id="${f.id}">수정</button></div></article>`).join('')}</div>`;
  document.querySelector('#addFixed').addEventListener('click', () => fixedModal());
  document.querySelectorAll('.edit-fixed').forEach(b => b.addEventListener('click', () => fixedModal(state.fixedExpenses.find(f => f.id === b.dataset.id))));
  document.querySelectorAll('.use-fixed').forEach(b => b.addEventListener('click', () => {
    const f = state.fixedExpenses.find(x => x.id === b.dataset.id); ui.lastInput = { merchant:f.merchant, category:f.category, amount:f.amount, channel:f.channel, paymentMethod:'lump-sum' }; ui.result = recommend(state, ui.lastInput); route='home'; render();
  }));
}
function fixedModal(existing = null) {
  const f = existing || { merchant:'', amount:'', schedule:'매월', category:'academy', channel:'unknown', note:'' };
  openModal(existing ? '고정결제 수정' : '고정결제 추가', `<form id="fixedForm" class="form-grid">
    <div class="field"><label>결제처</label><input name="merchant" required value="${esc(f.merchant)}"></div>
    <div class="inline-grid"><div class="field"><label>금액</label><input name="amount" type="number" required value="${esc(f.amount)}"></div><div class="field"><label>시점</label><input name="schedule" value="${esc(f.schedule)}"></div></div>
    <div class="field"><label>추정 업종</label><select name="category">${categoryOptions(f.category)}</select></div>
    <div class="field"><label>결제 위치</label><select name="channel"><option value="unknown" ${f.channel==='unknown'?'selected':''}>미정</option><option value="offline" ${f.channel==='offline'?'selected':''}>오프라인</option><option value="online" ${f.channel==='online'?'selected':''}>온라인</option></select></div>
    <div class="field"><label>주의사항</label><textarea name="note">${esc(f.note)}</textarea></div>
    <button class="primary-button" type="submit">저장</button>${existing?'<button class="danger-button" type="button" id="deleteFixed">삭제</button>':''}
  </form>`, root => {
    root.querySelector('#fixedForm').addEventListener('submit', e => { e.preventDefault(); const d=new FormData(e.currentTarget); const value={id:existing?.id||crypto.randomUUID(),merchant:String(d.get('merchant')).trim(),amount:Number(d.get('amount')),schedule:String(d.get('schedule')),category:d.get('category'),channel:d.get('channel'),note:String(d.get('note'))}; if(existing) Object.assign(existing,value); else state.fixedExpenses.push(value); saveState(); closeModal(); renderFixed(); });
    root.querySelector('#deleteFixed')?.addEventListener('click', () => { state.fixedExpenses=state.fixedExpenses.filter(x=>x.id!==existing.id); saveState(); closeModal(); renderFixed(); });
  });
}

function renderCards() {
  app.innerHTML = `<div class="section-title"><div><h2>${esc(state.settings.currentMonth)} 월초 설정</h2><p>드롭다운 선택만으로 할인율과 한도를 적용합니다.</p></div><button class="secondary-button" id="changeMonth">월 변경</button></div>
  ${state.cards.map(card => `<section class="card">
    <div class="list-head"><div><h3>${esc(card.name)}</h3><div class="small muted">${esc(card.issuer)}</div></div>${confidenceBadge(card)}</div>
    <div class="field" style="margin-top:12px"><label>적용 실적구간</label><select class="tier-select" data-card-id="${card.id}">${card.tiers.map(t=>`<option value="${t.id}" ${card.selectedTier===t.id?'selected':''}>${esc(t.label)}</option>`).join('')}</select></div>
    ${card.id==='lotte-happy'?`<div class="field"><label>이번 달 통합할인한도</label><input class="lotte-pool-cap" type="number" inputmode="numeric" value="${card.customMonthlyPoolCap||0}"><span class="field-hint">카드사 앱에 표시되는 실제 한도를 입력하세요.</span></div>`:''}
    ${card.id==='samsung-select-all'?`<div class="field"><label>SELECT 서비스 2 옵션</label><select class="samsung-option"><option value="online-medical-delivery" ${card.select2Option==='online-medical-delivery'?'selected':''}>온라인쇼핑·의료·배달앱 7%</option><option value="food-store-fuel" ${card.select2Option==='food-store-fuel'?'selected':''}>음식점·편의점·할인점·주유 7%</option></select></div>`:''}
    <div class="divider"></div>
    <div class="list">${card.benefits.filter(b=>!b.activeWhen||card[b.activeWhen.field]===b.activeWhen.value).map(benefit=>benefitRow(card,benefit)).join('')}</div>
    <p class="source-note">${card.reviewNote?esc(card.reviewNote)+' ':''}혜택 조건은 카드사 앱·상품 안내와 다를 수 있으므로 월 2~3회 잔여한도를 보정하세요.</p>
  </section>`).join('')}`;
  document.querySelectorAll('.tier-select').forEach(s=>s.addEventListener('change',()=>{ state.cards.find(c=>c.id===s.dataset.cardId).selectedTier=s.value; saveState(); renderCards(); }));
  document.querySelector('.lotte-pool-cap')?.addEventListener('change',e=>{ state.cards.find(c=>c.id==='lotte-happy').customMonthlyPoolCap=Number(e.target.value); saveState(); renderCards(); });
  document.querySelector('.samsung-option')?.addEventListener('change',e=>{ state.cards.find(c=>c.id==='samsung-select-all').select2Option=e.target.value; saveState(); renderCards(); });
  document.querySelectorAll('.reconcile').forEach(b=>b.addEventListener('click',()=>reconcileModal(b.dataset.cardId,b.dataset.benefitId)));
  document.querySelector('#changeMonth').addEventListener('click', monthModal);
}
function benefitRow(card, benefit) {
  const s=benefitSummary(state,card,benefit); const ratio=s.cap?Math.min(100,s.used/s.cap*100):0;
  return `<div class="list-item"><div class="list-head"><div><strong>${esc(benefit.name)}</strong><div class="small muted">${benefit.rateByTier?.[card.selectedTier]?pct(benefit.rateByTier[card.selectedTier]):benefit.fixedByTier?.[card.selectedTier]?won(benefit.fixedByTier[card.selectedTier]):'현재 미적용'}</div></div><span class="badge ${s.remaining?'blue':'gray'}">잔여 ${won(s.remaining)}</span></div>
  <div class="progress"><span style="width:${ratio}%"></span></div><div class="small muted">사용 ${won(s.used)} / 한도 ${won(s.cap)}${benefit.monthlyCountLimit?` · ${s.count}/${benefit.monthlyCountLimit}회`:''}${benefit.bonusTracker?` · 20만원 이상 ${s.bonusCount}건`:''}</div>
  <button class="ghost-button reconcile" data-card-id="${card.id}" data-benefit-id="${benefit.id}">카드사 값으로 보정</button></div>`;
}
function reconcileModal(cardId, benefitId) {
  const card=state.cards.find(c=>c.id===cardId), benefit=card.benefits.find(b=>b.id===benefitId), summary=benefitSummary(state,card,benefit), bucket=benefit.sharedPool||benefit.id;
  const targetCap=benefit.sharedPool?summary.poolCap:summary.cap;
  openModal('잔여한도 보정', `<form id="reconcileForm" class="form-grid"><div class="alert info"><span>i</span><span>${esc(card.name)} · ${esc(benefit.name)}<br>앱 계산 잔여 ${won(summary.remaining)}${benefit.sharedPool?' (통합한도 기준)':''}</span></div><div class="field"><label>카드사 앱의 실제 잔여한도</label><input name="remaining" type="number" min="0" max="${targetCap}" value="${summary.remaining}" inputmode="numeric"></div><div class="field"><label>실제 사용횟수</label><input name="count" type="number" min="0" value="${summary.count}" inputmode="numeric"></div><button class="primary-button">보정 적용</button></form>`, root=>root.querySelector('#reconcileForm').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);const remaining=Number(d.get('remaining'));const key=usageKey(state.settings.currentMonth,card.id,bucket);state.usage[key]||={amount:0,count:0};state.usage[key].amount=Math.max(0,targetCap-remaining);const bkey=usageKey(state.settings.currentMonth,card.id,benefit.id);state.usage[bkey]||={amount:0,count:0};state.usage[bkey].count=Number(d.get('count'));saveState();closeModal();renderCards();showToast('보정값을 적용했습니다.');}));
}
function monthModal(){ openModal('적용 월 변경',`<form id="monthForm" class="form-grid"><div class="field"><label>적용 월</label><input name="month" type="month" value="${state.settings.currentMonth}"></div><div class="alert info"><span>i</span><span>실적구간은 지난 설정을 유지합니다. 새 월의 사용한도와 횟수는 자동으로 0에서 시작합니다.</span></div><button class="primary-button">이 월 사용</button></form>`,root=>root.querySelector('#monthForm').addEventListener('submit',e=>{e.preventDefault();state.settings.currentMonth=new FormData(e.currentTarget).get('month');saveState();closeModal();renderCards();})); }

function renderLinks() {
  const active=state.linkOffers.filter(l=>!l.used && (!l.endDate||l.endDate>=today()));
  app.innerHTML=`<div class="section-title"><div><h2>Link 혜택</h2><p>사용 가능성이 있는 혜택만 등록합니다.</p></div><button id="addLink" class="secondary-button">추가</button></div>
  <div class="alert info"><span>i</span><span>현재 버전은 스크린샷을 참고해 항목을 직접 확인·등록합니다. 이미지 자동 추출은 다음 단계 기능입니다.</span></div>
  <div class="list">${state.linkOffers.length?state.linkOffers.map(l=>`<article class="list-item"><div class="list-head"><div><h3>${esc(l.merchant||categoryLabel[l.category]||'Link')}</h3><div class="small muted">${esc(l.cardName)} · ${esc(l.benefitText)}</div></div><span class="badge ${l.used?'gray':(l.endDate&&l.endDate<today()?'red':'green')}">${l.used?'사용완료':(l.endDate&&l.endDate<today()?'만료':'사용 가능')}</span></div><div class="small muted">${l.minAmount?`${won(l.minAmount)} 이상 · `:''}${esc(l.startDate||'')} ~ ${esc(l.endDate||'기한 없음')}</div><div class="button-row"><button class="secondary-button toggle-link" data-id="${l.id}">${l.used?'사용 취소':'사용 완료'}</button><button class="ghost-button edit-link" data-id="${l.id}">수정</button></div></article>`).join(''):'<div class="empty">등록된 Link 혜택이 없습니다.</div>'}</div>`;
  document.querySelector('#addLink').addEventListener('click',()=>linkModal());
  document.querySelectorAll('.edit-link').forEach(b=>b.addEventListener('click',()=>linkModal(state.linkOffers.find(l=>l.id===b.dataset.id))));
  document.querySelectorAll('.toggle-link').forEach(b=>b.addEventListener('click',()=>{const l=state.linkOffers.find(x=>x.id===b.dataset.id);l.used=!l.used;saveState();renderLinks();}));
}
function linkModal(existing=null){const l=existing||{cardName:'',merchant:'',category:'other',benefitText:'',minAmount:0,startDate:today(),endDate:'',used:false,screenshotName:''};openModal(existing?'Link 수정':'Link 추가',`<form id="linkForm" class="form-grid"><div class="field"><label>스크린샷</label><input name="screenshot" type="file" accept="image/*"><span class="field-hint">원본 이미지는 저장하지 않고 파일명만 기록합니다.</span></div><div class="field"><label>대상 카드</label><select name="cardName">${state.cards.map(c=>`<option ${l.cardName===c.name?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="field"><label>결제처·브랜드</label><input name="merchant" value="${esc(l.merchant)}" placeholder="예: 컬리"></div><div class="field"><label>업종</label><select name="category">${categoryOptions(l.category)}</select></div><div class="field"><label>혜택 내용</label><input name="benefitText" required value="${esc(l.benefitText)}" placeholder="5만원 이상 5천원 캐시백"></div><div class="inline-grid"><div class="field"><label>최소 결제금액</label><input name="minAmount" type="number" value="${l.minAmount||0}"></div><div class="field"><label>종료일</label><input name="endDate" type="date" value="${esc(l.endDate)}"></div></div><button class="primary-button">저장</button>${existing?'<button type="button" id="deleteLink" class="danger-button">삭제</button>':''}</form>`,root=>{root.querySelector('#linkForm').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget),file=d.get('screenshot');const value={id:existing?.id||crypto.randomUUID(),cardName:d.get('cardName'),merchant:String(d.get('merchant')).trim(),category:d.get('category'),benefitText:String(d.get('benefitText')).trim(),minAmount:Number(d.get('minAmount')),startDate:l.startDate||today(),endDate:d.get('endDate'),used:l.used,screenshotName:file?.name||l.screenshotName||''};if(existing)Object.assign(existing,value);else state.linkOffers.push(value);saveState();closeModal();renderLinks();});root.querySelector('#deleteLink')?.addEventListener('click',()=>{state.linkOffers=state.linkOffers.filter(x=>x.id!==existing.id);saveState();closeModal();renderLinks();});});}

function renderMore() {
  app.innerHTML=`<div class="section-title"><div><h2>결제 기록</h2><p>예상 할인액과 실제 카드사 결과를 비교합니다.</p></div></div>
  <div class="list">${state.transactions.length?state.transactions.map(tx=>transactionRow(tx)).join(''):'<div class="empty">아직 기록된 결제가 없습니다.</div>'}</div>
  <div class="section-title"><div><h2>백업·복원</h2><p>안드로이드 공유 메뉴에서 Google Drive를 선택할 수 있습니다.</p></div></div>
  <section class="card"><div class="button-row"><button class="primary-button" id="shareBackup">Drive로 수동 백업</button><button class="secondary-button" id="downloadBackup">JSON 다운로드</button></div><div class="field" style="margin-top:12px"><label>백업 복원</label><input id="restoreFile" type="file" accept="application/json,.json"></div><div class="divider"></div><button class="danger-button" id="resetApp">기본 데이터로 초기화</button></section>
  <section class="card flat"><h3>앱 설정</h3><div class="field"><label>분할결제 최소 추가혜택</label><input id="splitGain" type="number" value="${state.settings.splitMinimumGain||0}" step="1000"><span class="field-hint">이 금액 이상 더 유리할 때만 분할결제를 추천합니다.</span></div></section>`;
  document.querySelectorAll('.delete-tx').forEach(b=>b.addEventListener('click',()=>deleteTransaction(b.dataset.id)));
  document.querySelectorAll('.verify-tx').forEach(b=>b.addEventListener('click',()=>verifyTransaction(b.dataset.id,b.dataset.status)));
  document.querySelector('#downloadBackup').addEventListener('click',downloadBackup);
  document.querySelector('#shareBackup').addEventListener('click',shareBackup);
  document.querySelector('#restoreFile').addEventListener('change',restoreBackup);
  document.querySelector('#resetApp').addEventListener('click',()=>{if(confirm('모든 기록을 지우고 기본 데이터로 초기화할까요?')){state=clone(DEFAULT_STATE);saveState();renderMore();}});
  document.querySelector('#splitGain').addEventListener('change',e=>{state.settings.splitMinimumGain=Number(e.target.value);saveState();});
}
function transactionRow(tx){const card=state.cards.find(c=>c.id===tx.cardId),benefit=card?.benefits.find(b=>b.id===tx.benefitId);return `<article class="list-item"><div class="list-head"><div><h3>${esc(tx.merchant)}</h3><div class="small muted">${new Date(tx.date).toLocaleDateString('ko-KR')} · ${esc(card?.name||'삭제된 카드')}</div></div><strong>${won(tx.expectedDiscount)}</strong></div><div class="small muted">${won(tx.amount)} · ${esc(benefit?.name||'혜택')}</div><div class="button-row"><button class="secondary-button verify-tx" data-id="${tx.id}" data-status="applied">실제 적용</button><button class="ghost-button verify-tx" data-id="${tx.id}" data-status="failed">미적용</button><button class="danger-button delete-tx" data-id="${tx.id}">삭제</button></div>${tx.verification?`<span class="badge ${tx.verification==='applied'?'green':'red'}">${tx.verification==='applied'?'적용 확인':'미적용 확인'}</span>`:''}</article>`;}
function deleteTransaction(id){const tx=state.transactions.find(t=>t.id===id);if(!tx)return;if(tx.expectedDiscount>0)reverseTransaction(state,tx);state.transactions=state.transactions.filter(t=>t.id!==id);saveState();renderMore();}
function verifyTransaction(id,status){const tx=state.transactions.find(t=>t.id===id);if(!tx)return;if(status==='failed'&&tx.expectedDiscount>0){reverseTransaction(state,tx);tx.originalExpectedDiscount=tx.expectedDiscount;tx.expectedDiscount=0;}tx.verification=status;saveState();renderMore();showToast(status==='applied'?'할인 적용을 확인했습니다.':'미적용으로 보정했습니다.');}
function backupBlob(){return new Blob([JSON.stringify(state,null,2)],{type:'application/json'});}
function backupName(){return `card-pick-${state.settings.currentMonth}-${today()}.json`;}
function downloadBackup(){const url=URL.createObjectURL(backupBlob()),a=document.createElement('a');a.href=url;a.download=backupName();a.click();URL.revokeObjectURL(url);}
async function shareBackup(){const file=new File([backupBlob()],backupName(),{type:'application/json'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({title:'카드픽 백업',text:'Google Drive를 선택해 백업 파일을 저장하세요.',files:[file]});return;}catch(e){if(e.name==='AbortError')return;}}downloadBackup();showToast('공유를 지원하지 않아 JSON 파일로 내려받았습니다.');}
async function restoreBackup(e){const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!parsed.cards||!parsed.settings)throw new Error('형식 오류');if(confirm('현재 데이터를 백업 파일로 교체할까요?')){state=parsed;saveState();renderMore();showToast('백업을 복원했습니다.');}}catch{alert('올바른 카드픽 JSON 백업 파일이 아닙니다.');}e.target.value='';}

window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredInstallPrompt=event; document.querySelector('#installButton').classList.remove('hidden'); });
document.querySelector('#installButton').addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;document.querySelector('#installButton').classList.add('hidden');});
if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));

render();
