import { evaluateBenefit, applyTransaction } from './engine-v12.js';

const STORAGE_KEY=globalThis.CARDPICK_STORAGE_KEY||'card-pick-state-v1';
const app=document.querySelector('#app');
const modal=document.querySelector('#modal');
let enhanceTimer=null;

const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const won=v=>`${Math.round(Number(v)||0).toLocaleString('ko-KR')}원`;

function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch{return null}}
function saveState(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function currentInput(){
  const form=document.querySelector('#recommendForm');if(!form)return null;
  const f=new FormData(form);
  return {merchant:String(f.get('merchant')||'').trim(),category:String(f.get('category')||'other'),amount:Number(f.get('amount')||0),channel:String(f.get('channel')||'unknown'),paymentMethod:String(f.get('paymentMethod')||'lump-sum')};
}
function bestForCard(state,card,input){
  const rows=(card.benefits||[]).map(b=>evaluateBenefit(state,card,b,input)).filter(r=>r.discount>0&&!r.blockers?.length);
  rows.sort((a,b)=>b.discount-a.discount||a.warnings.length-b.warnings.length);
  return rows[0]||null;
}
function recommendedCardId(){
  const hero=app?.querySelector('.hero-result');
  const name=hero?.querySelector('h2')?.textContent?.trim();
  const state=loadState();return state?.cards?.find(c=>c.name===name)?.id||null;
}
function ensureStyles(){
  if(document.querySelector('#v14-recording-styles'))return;
  const style=document.createElement('style');style.id='v14-recording-styles';style.textContent=`
    .record-other-button{margin-top:10px;width:100%}
    .v14-card-list{display:grid;gap:10px;margin:14px 0}
    .v14-card-choice{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;border:1px solid #d0d5dd;border-radius:14px;padding:13px;background:#fff;cursor:pointer}
    .v14-card-choice:has(input:checked){border:2px solid #6938ef;background:#f9f5ff;padding:12px}
    .v14-card-choice input{margin-top:3px;width:19px;height:19px;accent-color:#6938ef}
    .v14-card-name{font-weight:800;color:#101828}.v14-benefit{font-size:12px;color:#667085;margin-top:3px}.v14-value{font-weight:800;color:#027a48;margin-top:4px}.v14-zero{color:#667085}
    .v14-modal-note{font-size:12px;color:#667085;line-height:1.5;margin:8px 0 14px}
  `;document.head.appendChild(style);
}
function closeModal(){if(modal?.open)modal.close();if(modal)modal.innerHTML=''}
function showToastAfterReload(message){sessionStorage.setItem('cardpick-v14-toast',message);location.reload()}
function showPendingToast(){const message=sessionStorage.getItem('cardpick-v14-toast');if(!message)return;sessionStorage.removeItem('cardpick-v14-toast');const toast=document.querySelector('#toast');if(!toast)return;toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}

function openOtherCardModal(){
  const state=loadState(),input=currentInput(),recommendedId=recommendedCardId();
  if(!state?.cards?.length||!input||!modal)return;
  const choices=state.cards.filter(c=>c.id!==recommendedId).map(card=>({card,best:bestForCard(state,card,input)}));
  modal.innerHTML=`<div class="modal-body"><div class="modal-header"><h2>실제 결제한 카드</h2><button class="close-button" type="button">×</button></div><div class="v14-modal-note">추천과 다른 카드를 사용했다면 실제 결제카드를 선택하세요. 해당 카드에 적용되는 혜택을 다시 계산해 기록합니다.</div><div class="v14-card-list">${choices.map(({card,best},i)=>`<label class="v14-card-choice"><input type="radio" name="actualCard" value="${esc(card.id)}" ${i===0?'checked':''}><div><div class="v14-card-name">${esc(card.name)}</div>${best?`<div class="v14-benefit">${esc(best.benefitName)}</div><div class="v14-value">예상 혜택 ${won(best.discount)}</div>`:`<div class="v14-benefit">적용 가능한 카드 혜택 없음</div><div class="v14-value v14-zero">예상 혜택 0원</div>`}</div></label>`).join('')}</div><button type="button" class="primary-button" id="v14RecordActual">선택한 카드로 기록</button></div>`;
  modal.querySelector('.close-button').onclick=closeModal;
  modal.querySelector('#v14RecordActual').onclick=()=>recordActualCard(recommendedId,input);
  modal.showModal();
}
function recordActualCard(recommendedId,input){
  const cardId=modal.querySelector('input[name="actualCard"]:checked')?.value;if(!cardId)return;
  const state=loadState(),card=state?.cards?.find(c=>c.id===cardId);if(!state||!card)return;
  const best=bestForCard(state,card,input);
  if(best){
    applyTransaction(state,best,input,{actualChoice:true,recommendedCardId:recommendedId||null});
  }else{
    state.transactions=Array.isArray(state.transactions)?state.transactions:[];
    state.transactions.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),month:state.settings?.currentMonth||new Date().toISOString().slice(0,7),merchant:input.merchant,category:input.category,channel:input.channel,paymentMethod:input.paymentMethod,amount:Math.max(0,Math.round(input.amount||0)),cardId:card.id,benefitId:null,expectedDiscount:0,capDiscount:0,bonusDiscount:0,warnings:[],actualChoice:true,recommendedCardId:recommendedId||null});
  }
  saveState(state);closeModal();showToastAfterReload(`${card.name} 결제로 기록했습니다.`);
}
function enhance(){
  ensureStyles();
  const hero=app?.querySelector('.hero-result');const primary=hero?.querySelector('#recordSingle');
  if(!hero||!primary||hero.querySelector('#recordOtherCard'))return;
  const button=document.createElement('button');button.type='button';button.id='recordOtherCard';button.className='secondary-button record-other-button';button.textContent='다른 카드로 결제했어요';button.onclick=openOtherCardModal;primary.after(button);
}
function scheduleEnhance(){clearTimeout(enhanceTimer);enhanceTimer=setTimeout(enhance,0)}

document.addEventListener('submit',scheduleEnhance,true);
document.addEventListener('change',scheduleEnhance,true);
document.addEventListener('click',scheduleEnhance,true);
showPendingToast();enhance();
