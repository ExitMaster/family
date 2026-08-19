import { evaluateBenefit, applyTransaction } from './engine-v12.js';

const STORAGE_KEY=globalThis.CARDPICK_STORAGE_KEY||'card-pick-state-v1';
const app=document.querySelector('#app');
let activePlan=null,enhanceTimer=null;

const clone=v=>JSON.parse(JSON.stringify(v));
const won=v=>`${Math.round(Number(v)||0).toLocaleString('ko-KR')}원`;
const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const priority={primary:0,dormant:1,'family-backup':2};
const normalizeMerchant=v=>String(v||'').toLowerCase().normalize('NFKC').replace(/\(주\)|주식회사|㈜/g,'').replace(/[\s·ㆍ._\-–—/\\()[\]{}'"`:;,!?]/g,'');

function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch{return null}}
function saveState(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function currentInput(){const form=document.querySelector('#recommendForm');if(!form)return null;const f=new FormData(form);return {merchant:String(f.get('merchant')||'').trim(),category:String(f.get('category')||'other'),amount:Number(f.get('amount')||0),channel:String(f.get('channel')||'unknown'),paymentMethod:String(f.get('paymentMethod')||'lump-sum')}}
function inputForExpense(expense,override=null){return {merchant:expense.merchant,category:expense.category||'academy',amount:Number(override?.amount||expense.amount||0),channel:override?.channel||expense.channel||'unknown',paymentMethod:override?.paymentMethod||'lump-sum'}}
function academyExpenses(state){return (state.fixedExpenses||[]).filter(x=>x.category==='academy')}
function matchExpense(state,input){if(!input||input.category!=='academy')return null;const key=normalizeMerchant(input.merchant);if(!key)return null;return academyExpenses(state).find(x=>{const k=normalizeMerchant(x.merchant);return k===key||k.includes(key)||key.includes(k)})||null}
function txForExpense(state,expense){const month=state.settings?.currentMonth||new Date().toISOString().slice(0,7),key=normalizeMerchant(expense.merchant);return (state.transactions||[]).find(tx=>tx.month===month&&(tx.fixedExpenseId===expense.id||(!tx.fixedExpenseId&&normalizeMerchant(tx.merchant)===key)))||null}
function bestLegForCard(state,card,input){const rows=(card.benefits||[]).map(b=>evaluateBenefit(state,card,b,input)).filter(r=>r.discount>0&&!r.blockers?.length);rows.sort((a,b)=>b.discount-a.discount||a.warnings.length-b.warnings.length);return rows[0]||null}
function zeroLeg(card,input){return {cardId:card.id,cardName:card.name,benefitId:null,benefitName:'적용 가능한 혜택 없음',amount:Math.max(0,Math.round(input.amount||0)),discount:0,capDiscount:0,bonusDiscount:0,warnings:[],blockers:[]}}

export function optimizeAcademyMonth(state,currentExpense=null,currentInputOverride=null){
  const expenses=academyExpenses(state);if(!expenses.length)return null;
  const paid=new Map();let realizedBenefit=0;
  for(const expense of expenses){const tx=txForExpense(state,expense);if(tx){paid.set(expense.id,tx);realizedBenefit+=Number(tx.expectedDiscount||0)}}
  const remaining=expenses.filter(x=>!paid.has(x.id)).map(x=>x.id===currentExpense?.id&&currentInputOverride?.amount>0?{...x,amount:currentInputOverride.amount,channel:currentInputOverride.channel||x.channel}:x);
  if(!remaining.length)return {assignments:[],paid,realizedBenefit,projectedBenefit:0,totalBenefit:realizedBenefit,expenses};
  let best=null;
  function dfs(index,simState,assignments,total,penalty,zeroCount){
    if(index>=remaining.length){const candidate={assignments:[...assignments],projectedBenefit:total,penalty,zeroCount};if(!best||candidate.projectedBenefit>best.projectedBenefit||(candidate.projectedBenefit===best.projectedBenefit&&candidate.zeroCount<best.zeroCount)||(candidate.projectedBenefit===best.projectedBenefit&&candidate.zeroCount===best.zeroCount&&candidate.penalty<best.penalty))best=candidate;return}
    const expense=remaining[index],input=inputForExpense(expense,expense.id===currentExpense?.id?currentInputOverride:null);
    for(const card of simState.cards||[]){
      const leg=bestLegForCard(simState,card,input)||zeroLeg(card,input),next=clone(simState);
      if(leg.benefitId&&leg.discount>0)applyTransaction(next,leg,input,{simulation:true,fixedExpenseId:expense.id});
      dfs(index+1,next,[...assignments,{expenseId:expense.id,merchant:expense.merchant,amount:input.amount,cardId:card.id,cardName:card.name,benefitId:leg.benefitId,benefitName:leg.benefitName,discount:leg.discount}],total+Number(leg.discount||0),penalty+(priority[card.usageClass]??0),zeroCount+(leg.discount>0?0:1));
    }
  }
  dfs(0,clone(state),[],0,0,0);
  if(!best)return null;
  return {...best,paid,realizedBenefit,totalBenefit:realizedBenefit+best.projectedBenefit,expenses};
}

function ensureStyles(){if(document.querySelector('#v15-academy-styles'))return;const s=document.createElement('style');s.id='v15-academy-styles';s.textContent=`
.v15-plan{border:1.5px solid #7f56d9;background:#fafaff;margin-bottom:14px}.v15-plan-title{display:flex;justify-content:space-between;gap:10px;align-items:start}.v15-plan-title h3{margin:0}.v15-total{font-size:20px;font-weight:900;color:#5925dc;white-space:nowrap}.v15-plan-note{margin:7px 0 12px;color:#667085;font-size:12px;line-height:1.5}.v15-groups{display:grid;gap:10px}.v15-group{background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:10px 12px}.v15-group strong{display:block;margin-bottom:4px}.v15-item{display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:3px 0}.v15-paid{color:#667085}.v15-current{font-weight:800;color:#5925dc}.v15-month-alert{border:1px solid #d6bbfb;background:#f9f5ff;color:#42307d}.v15-reference{opacity:.72}.v15-reference .result-kicker::after{content:' · 건별 계산을 월 전체 기준으로 조정함'}
`;document.head.appendChild(s)}
function planHtml(state,plan,currentExpense){
  const grouped=new Map();
  for(const [expenseId,tx] of plan.paid.entries()){const expense=plan.expenses.find(x=>x.id===expenseId);if(!expense)continue;const card=state.cards.find(c=>c.id===tx.cardId),name=card?.name||'카드';if(!grouped.has(name))grouped.set(name,[]);grouped.get(name).push({merchant:expense.merchant,amount:tx.amount||expense.amount,paid:true,current:expenseId===currentExpense?.id})}
  for(const a of plan.assignments){if(!grouped.has(a.cardName))grouped.set(a.cardName,[]);grouped.get(a.cardName).push({merchant:a.merchant,amount:a.amount,paid:false,current:a.expenseId===currentExpense?.id})}
  return `<section class="card v15-plan" id="v15AcademyPlan"><div class="v15-plan-title"><div><p class="result-kicker">이번 달 학원비 전체 최적</p><h3>남은 학원비 최적 배분</h3></div><div class="v15-total">${won(plan.totalBenefit)}</div></div><div class="v15-plan-note">이미 기록된 결제는 그대로 두고, 아직 결제하지 않은 학원비만 현재 카드 실적·잔여한도·20만원 이상 건수 보너스를 반영해 다시 배분합니다.</div><div class="v15-groups">${[...grouped.entries()].map(([card,items])=>`<div class="v15-group"><strong>${esc(card)}</strong>${items.map(x=>`<div class="v15-item ${x.paid?'v15-paid':''} ${x.current?'v15-current':''}"><span>${esc(x.merchant)}${x.paid?' · 결제완료':''}${x.current?' · 지금 결제':''}</span><span>${won(x.amount)}</span></div>`).join('')}</div>`).join('')}</div></section>`}
function showToastReload(message){sessionStorage.setItem('cardpick-v15-toast',message);location.reload()}
function showPendingToast(){const m=sessionStorage.getItem('cardpick-v15-toast');if(!m)return;sessionStorage.removeItem('cardpick-v15-toast');const t=document.querySelector('#toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}

function patchHero(state,plan,currentExpense,input){
  const hero=app?.querySelector('.hero-result');if(!hero)return;
  const assignment=plan.assignments.find(x=>x.expenseId===currentExpense.id);if(!assignment)return;
  const card=state.cards.find(c=>c.id===assignment.cardId),benefit=card?.benefits?.find(b=>b.id===assignment.benefitId);if(!card||!benefit)return;
  const live=evaluateBenefit(state,card,benefit,input);if(live.blockers?.length)return;
  activePlan={expenseId:currentExpense.id,cardId:card.id,benefitId:benefit.id};
  hero.classList.add('v15-reference');
  const kicker=hero.querySelector('.result-kicker');if(kicker)kicker.textContent='이번 달 전체 기준 추천';
  const title=hero.querySelector('h2');if(title)title.textContent=card.name;
  const money=hero.querySelector('.discount-value');if(money)money.textContent=won(live.discount);
  const muted=hero.querySelector('.muted');if(muted)muted.textContent=`${live.benefitName} · 결제 ${won(input.amount)}`;
  hero.querySelectorAll(':scope > .alert.warning,:scope > .alert.success,:scope > .v15-month-alert').forEach(x=>x.remove());
  const marker=document.createElement('div');marker.className='alert v15-month-alert';marker.innerHTML=`<span>✓</span><span>이 카드가 이번 결제 한 건만의 최대값이 아니라 <strong>이번 달 학원비 전체 예상혜택 ${won(plan.totalBenefit)}</strong>을 최대화하는 배분입니다.</span>`;
  const button=hero.querySelector('#recordSingle');hero.insertBefore(marker,button||null);
  for(const warning of (live.warnings||[]).slice(0,4)){const el=document.createElement('div');el.className='alert warning v15-live-warning';el.innerHTML=`<span>!</span><span>${esc(warning)}</span>`;hero.insertBefore(el,button||null)}
  const old=app.querySelector('#v15AcademyPlan');old?.remove();hero.before(document.createRange().createContextualFragment(planHtml(state,plan,currentExpense)));
  app.querySelectorAll('.card').forEach(section=>{const k=section.querySelector('.result-kicker');if(section!==hero&&k?.textContent?.includes('분할결제가'))section.style.display='none'});
}
function enhance(){
  ensureStyles();activePlan=null;
  const state=loadState(),input=currentInput(),hero=app?.querySelector('.hero-result');if(!state||!input||!hero)return;
  const expense=matchExpense(state,input);if(!expense||txForExpense(state,expense))return;
  const plan=optimizeAcademyMonth(state,expense,input);if(!plan)return;
  patchHero(state,plan,expense,input);
}
function recordOptimized(){
  if(!activePlan)return false;
  const state=loadState(),input=currentInput();if(!state||!input)return false;
  const expense=matchExpense(state,input);if(!expense||expense.id!==activePlan.expenseId)return false;
  const plan=optimizeAcademyMonth(state,expense,input),assignment=plan?.assignments?.find(x=>x.expenseId===expense.id);if(!assignment)return false;
  const card=state.cards.find(c=>c.id===assignment.cardId),benefit=card?.benefits?.find(b=>b.id===assignment.benefitId);if(!card||!benefit)return false;
  const live=evaluateBenefit(state,card,benefit,input);if(live.blockers?.length||live.discount<=0)return false;
  applyTransaction(state,live,input,{fixedExpenseId:expense.id,monthlyOptimized:true});saveState(state);showToastReload(`${card.name} 결제로 기록했습니다.`);return true;
}
function scheduleEnhance(){clearTimeout(enhanceTimer);enhanceTimer=setTimeout(enhance,0)}
document.addEventListener('submit',scheduleEnhance,true);
document.addEventListener('change',scheduleEnhance,true);
document.addEventListener('click',e=>{if(e.target?.closest?.('#recordSingle')&&activePlan){e.preventDefault();e.stopImmediatePropagation();if(recordOptimized())return}scheduleEnhance()},true);
showPendingToast();enhance();
