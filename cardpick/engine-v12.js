import {
  monthKey,usageKey,getBenefitUsed,getPoolUsed,getCount,matchingLinks,applyTransaction,reverseTransaction
} from './engine-v2.js?base=1';

export {monthKey,usageKey,getBenefitUsed,getPoolUsed,getCount,matchingLinks,applyTransaction,reverseTransaction};

const won=n=>Math.max(0,Math.round(Number(n)||0));
const priority={primary:0,dormant:1,'family-backup':2};
function tierValue(map,tier){return map?.[tier]??0}
function capFor(benefit,tier){return won(tierValue(benefit.capByTier,tier))}
function poolCap(state,card,benefit,tier){
  if(!benefit.sharedPool)return capFor(benefit,tier);
  if(benefit.sharedPoolCapByTier)return won(tierValue(benefit.sharedPoolCapByTier,tier));
  if(card.id==='lotte-happy'&&benefit.sharedPool==='lotte-total')return won(card.customMonthlyPoolCap);
  return capFor(benefit,tier);
}
function optionActive(card,benefit){return !benefit.activeWhen||card[benefit.activeWhen.field]===benefit.activeWhen.value}
function listsForCategory(map,category){return map?.[category]||null}
function merchantMatches(benefit,input){
  const n=(input.merchant||'').toLowerCase();
  const include=listsForCategory(benefit.merchantIncludeByCategory,input.category)||benefit.merchantInclude;
  const exclude=listsForCategory(benefit.merchantExcludeByCategory,input.category)||benefit.merchantExclude;
  if(include?.length&&!include.some(k=>n.includes(String(k).toLowerCase())))return false;
  if(exclude?.some(k=>n.includes(String(k).toLowerCase())))return false;
  return true;
}
function categoryMatches(benefit,input){
  if(benefit.domesticOnly&&input.category==='overseas')return false;
  if(!benefit.categories?.length)return true;
  return benefit.categories.includes(input.category);
}
function requiredChannel(benefit,input){return benefit.channelByCategory?.[input.category]||benefit.channel||null}
function rateFor(benefit,tier,input){return Number(benefit.rateByCategory?.[input.category]??tierValue(benefit.rateByTier,tier)??0)}
function baseValue(benefit,tier,input){const rate=rateFor(benefit,tier,input),fixed=won(tierValue(benefit.fixedByTier,tier)),raw=fixed||input.amount*rate;return benefit.perTxnCap?Math.min(raw,benefit.perTxnCap):raw}
function bonusAt(benefit,count){let out=0;for(const level of benefit.bonusTracker?.levels||[])if(count>=level.count)out=level.amount;return won(out)}
function monthlyRequirementMet(state,card,benefit){if(!benefit.requiresMonthlyBenefit)return true;return state.transactions.some(tx=>tx.month===state.settings.currentMonth&&tx.cardId===card.id&&tx.benefitId===benefit.requiresMonthlyBenefit&&tx.verification!=='failed')}
function annualCount(state,card,benefit){const year=String(state.settings.currentMonth||'').slice(0,4);return state.transactions.filter(tx=>tx.cardId===card.id&&tx.benefitId===benefit.id&&String(tx.month||'').startsWith(year)).length}
function hasTierBenefit(benefit,tier,inputCategory=null){
  if(benefit.benefitType==='informational')return capFor(benefit,tier)>0;
  if(benefit.rateByTier?.[tier]!=null||benefit.fixedByTier?.[tier]!=null)return true;
  return !!(benefit.rateByCategory&&inputCategory&&capFor(benefit,tier)>0);
}

export function benefitSummary(state,card,benefit){
  const tier=card.selectedTier,cap=capFor(benefit,tier),used=getBenefitUsed(state,card,benefit),pCap=poolCap(state,card,benefit,tier),pUsed=getPoolUsed(state,card,benefit),count=getCount(state,card,benefit);
  const individualRemaining=Math.max(0,cap-used),poolRemaining=Math.max(0,pCap-pUsed);
  return {cap,used,poolCap:pCap,poolUsed:pUsed,poolRemaining,remaining:Math.min(individualRemaining,poolRemaining),count,annualCount:annualCount(state,card,benefit),bonusCount:state.usage[usageKey(state.settings.currentMonth,card.id,benefit.id)]?.bonusCount||0,bonusAmount:bonusAt(benefit,state.usage[usageKey(state.settings.currentMonth,card.id,benefit.id)]?.bonusCount||0)};
}

export function benefitAvailability(state,card,benefit){
  const s=benefitSummary(state,card,benefit),reasons=[];
  if(benefit.networkRequired&&card.network!==benefit.networkRequired)reasons.push(`${benefit.networkRequired} 카드만 제공`);
  if(!optionActive(card,benefit))reasons.push('현재 선택 서비스가 아님');
  if(!hasTierBenefit(benefit,card.selectedTier))reasons.push('이번 달 실적조건 미충족');
  if((s.cap<=0||s.poolCap<=0)&&benefit.benefitType!=='informational')reasons.push('적용 한도 없음');
  if(s.remaining<=0&&s.cap>0)reasons.push('월 한도 소진');
  if(benefit.monthlyCountLimit&&s.count>=benefit.monthlyCountLimit)reasons.push('월 이용횟수 소진');
  if(benefit.annualCountLimit&&s.annualCount>=benefit.annualCountLimit)reasons.push('연간 이용횟수 소진');
  if(!monthlyRequirementMet(state,card,benefit))reasons.push('연계 조건 확인 필요');
  const hard=reasons.filter(x=>!x.includes('연계 조건'));
  return {status:hard.length?'inactive':reasons.length?'conditional':'active',reasons,summary:s};
}

export function evaluateBenefit(state,card,benefit,input){
  const tier=card.selectedTier,warnings=[],blockers=[];
  if(benefit.benefitType==='informational')blockers.push('정보성 혜택');
  if(benefit.networkRequired&&card.network!==benefit.networkRequired)blockers.push(`${benefit.networkRequired} 카드 전용`);
  if(!optionActive(card,benefit))blockers.push('현재 선택 서비스와 다름');
  if(!hasTierBenefit(benefit,tier,input.category))blockers.push('이번 달 혜택 미적용');
  if(!categoryMatches(benefit,input))blockers.push('대상 업종 아님');
  if(!merchantMatches(benefit,input))blockers.push('대상 가맹점 조건 불충족');
  if(input.amount<(benefit.minAmount||0))blockers.push(`최소 결제금액 ${won(benefit.minAmount).toLocaleString()}원 미달`);
  if(benefit.excludeInterestFree&&input.paymentMethod==='interest-free')blockers.push('무이자할부 제외');
  if(benefit.paymentRequired&&input.paymentMethod!==benefit.paymentRequired)blockers.push(benefit.paymentRequired==='recurring'?'자동이체·정기결제 필요':'결제방법 조건 불충족');
  const channel=requiredChannel(benefit,input);
  if(channel==='offline'){if(input.channel==='online')blockers.push('오프라인 결제 전용');else if(input.channel==='unknown')warnings.push('오프라인 결제 여부를 확인하세요.');}
  if(channel==='online'){if(input.channel==='offline')blockers.push('온라인 결제 전용');else if(input.channel==='unknown')warnings.push('온라인 결제 여부를 확인하세요.');}
  if(input.channel==='online'&&benefit.onlineConfirmation?.length)warnings.push(...benefit.onlineConfirmation.map(x=>`확인 필요: ${x}`));
  if(!monthlyRequirementMet(state,card,benefit))warnings.push('이번 달 연계 혜택 조건을 충족해야 최종 적용됩니다.');
  if(benefit.notes?.length)warnings.push(...benefit.notes);
  if(card.usageClass==='family-backup')warnings.push('남편 명의 가족·백업 카드입니다. 동일 혜택이면 주사용 카드가 우선됩니다.');
  if(card.usageClass==='dormant'&&card.selectedTier==='inactive')warnings.push('휴면·비주력 카드이며 현재 실적 미달 상태입니다.');
  if(benefit.nextMonthSpendTreatment==='excluded')warnings.push('이 혜택이 적용된 거래금액은 다음 달 실적 산정에서 제외됩니다.');

  const s=benefitSummary(state,card,benefit);
  if(benefit.monthlyCountLimit&&s.count>=benefit.monthlyCountLimit)blockers.push('월 이용횟수 소진');
  if(benefit.annualCountLimit&&s.annualCount>=benefit.annualCountLimit)blockers.push('연간 이용횟수 소진');
  if(s.cap<=0||s.poolCap<=0)blockers.push('적용 한도 없음');
  if(s.remaining<=0)blockers.push('월 할인한도 소진');
  const capDiscount=Math.min(won(baseValue(benefit,tier,input)),s.remaining);
  const currentBonus=bonusAt(benefit,s.bonusCount),nextBonus=benefit.bonusTracker&&input.amount>=benefit.bonusTracker.threshold?bonusAt(benefit,s.bonusCount+1):currentBonus;
  const bonusDiscount=Math.max(0,nextBonus-currentBonus);
  let discount=capDiscount+bonusDiscount;if(blockers.length)discount=0;
  return {cardId:card.id,cardName:card.name,cardUsageClass:card.usageClass||'primary',cardHolder:card.holder||'self',priorityRank:priority[card.usageClass]??0,benefitId:benefit.id,benefitName:benefit.name,amount:won(input.amount),discount,capDiscount:blockers.length?0:capDiscount,bonusDiscount:blockers.length?0:bonusDiscount,cap:s.cap,used:s.used,remaining:s.remaining,poolCap:s.poolCap,poolUsed:s.poolUsed,poolRemaining:s.poolRemaining,warnings:[...new Set(warnings)],blockers,rate:rateFor(benefit,tier,input),count:s.count,annualCount:s.annualCount,monthlyCountLimit:benefit.monthlyCountLimit||null,annualCountLimit:benefit.annualCountLimit||null,bonusEligible:!!(benefit.bonusTracker&&input.amount>=benefit.bonusTracker.threshold),bonusTracker:benefit.bonusTracker||null,sharedPool:benefit.sharedPool||null,nextMonthSpendTreatment:benefit.nextMonthSpendTreatment||'unknown',source:card.source};
}

export function getCandidates(state,input,{includeBlocked=false}={}){
  const out=[];for(const card of state.cards)for(const benefit of card.benefits){const r=evaluateBenefit(state,card,benefit,input);if(includeBlocked||r.discount>0)out.push(r)}
  return out.sort((a,b)=>b.discount-a.discount||a.priorityRank-b.priorityRank||a.warnings.length-b.warnings.length||a.cardName.localeCompare(b.cardName,'ko'));
}
function splitBreakpoints(amount,a,b){const p=new Set([0,amount]);for(const x of[a,b])if(x?.rate>0){const effective=Math.min(x.remaining,x.cap);p.add(Math.ceil(effective/x.rate));p.add(amount-Math.ceil(effective/x.rate))}for(let x=10000;x<amount;x+=10000)p.add(x);return[...p].filter(x=>x>=0&&x<=amount).map(won)}
export function recommend(state,input){
  const singles=getCandidates(state,input),bestSingle=singles[0]||null;let bestSplit=null;
  if(input.amount>=20000&&singles.length>=2){for(let i=0;i<singles.length;i++)for(let j=i+1;j<singles.length;j++){
    const a0=singles[i],b0=singles[j];if(a0.cardId===b0.cardId)continue;
    const ca=state.cards.find(c=>c.id===a0.cardId),cb=state.cards.find(c=>c.id===b0.cardId),ba=ca.benefits.find(b=>b.id===a0.benefitId),bb=cb.benefits.find(b=>b.id===b0.benefitId);
    for(const partA of splitBreakpoints(input.amount,a0,b0)){const partB=input.amount-partA;if(partA<=0||partB<=0)continue;const a=evaluateBenefit(state,ca,ba,{...input,amount:partA}),b=evaluateBenefit(state,cb,bb,{...input,amount:partB}),total=a.discount+b.discount;if(!bestSplit||total>bestSplit.discount)bestSplit={discount:total,legs:[a,b],gain:total-(bestSingle?.discount||0)}}
  }}
  if(bestSplit&&bestSplit.gain<(state.settings.splitMinimumGain||0))bestSplit=null;
  return{bestSingle,alternatives:singles.slice(1,4),bestSplit,all:singles};
}

export function benefitsForTag(state,tag){
  const rows=[];for(const card of state.cards)for(const benefit of card.benefits)if(benefit.browseTags?.includes(tag))rows.push({card,benefit,...benefitAvailability(state,card,benefit)});
  return rows.sort((a,b)=>({active:0,conditional:1,inactive:2}[a.status]-({active:0,conditional:1,inactive:2}[b.status]))||(priority[a.card.usageClass]??0)-(priority[b.card.usageClass]??0)||a.card.name.localeCompare(b.card.name,'ko'));
}
