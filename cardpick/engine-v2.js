const won=n=>Math.max(0,Math.round(Number(n)||0));
export function monthKey(date=new Date()){return typeof date==='string'?date.slice(0,7):date.toISOString().slice(0,7)}
export function usageKey(month,cardId,bucket){return `${month}:${cardId}:${bucket}`}
export function getBenefitUsed(state,card,benefit,month=state.settings.currentMonth){return won(state.usage[usageKey(month,card.id,benefit.id)]?.amount)}
export function getPoolUsed(state,card,benefit,month=state.settings.currentMonth){if(!benefit.sharedPool)return getBenefitUsed(state,card,benefit,month);return won(state.usage[usageKey(month,card.id,benefit.sharedPool)]?.amount)}
export function getCount(state,card,benefit,month=state.settings.currentMonth){return won(state.usage[usageKey(month,card.id,benefit.id)]?.count)}
function tierValue(map,tier){return map?.[tier]??0}
function capFor(benefit,tier){return won(tierValue(benefit.capByTier,tier))}
function poolCap(state,card,benefit,tier){if(!benefit.sharedPool)return capFor(benefit,tier);if(card.id==='lotte-happy'&&benefit.sharedPool==='lotte-total')return won(card.customMonthlyPoolCap);return capFor(benefit,tier)}
function optionActive(card,benefit){return !benefit.activeWhen||card[benefit.activeWhen.field]===benefit.activeWhen.value}
function merchantMatches(benefit,merchant){const n=(merchant||'').toLowerCase();if(benefit.merchantInclude?.length&&!benefit.merchantInclude.some(k=>n.includes(k.toLowerCase())))return false;if(benefit.merchantExclude?.some(k=>n.includes(k.toLowerCase())))return false;return true}
function baseValue(benefit,tier,amount){const rate=Number(tierValue(benefit.rateByTier,tier));const fixed=won(tierValue(benefit.fixedByTier,tier));const raw=fixed||amount*rate;return benefit.perTxnCap?Math.min(raw,benefit.perTxnCap):raw}
function bonusAt(benefit,count){let out=0;for(const level of benefit.bonusTracker?.levels||[])if(count>=level.count)out=level.amount;return won(out)}
function monthlyRequirementMet(state,card,benefit){if(!benefit.requiresMonthlyBenefit)return true;return state.transactions.some(tx=>tx.month===state.settings.currentMonth&&tx.cardId===card.id&&tx.benefitId===benefit.requiresMonthlyBenefit&&tx.verification!=='failed')}
function categoryMatches(benefit,input){if(!benefit.categories?.length)return true;return benefit.categories.includes(input.category)}

export function benefitSummary(state,card,benefit){
  const tier=card.selectedTier,cap=capFor(benefit,tier),used=getBenefitUsed(state,card,benefit),pCap=poolCap(state,card,benefit,tier),pUsed=getPoolUsed(state,card,benefit),count=getCount(state,card,benefit);
  const individualRemaining=Math.max(0,cap-used),poolRemaining=Math.max(0,pCap-pUsed);
  return {cap,used,poolCap:pCap,poolUsed:pUsed,poolRemaining,remaining:Math.min(individualRemaining,poolRemaining),count,bonusCount:state.usage[usageKey(state.settings.currentMonth,card.id,benefit.id)]?.bonusCount||0,bonusAmount:bonusAt(benefit,state.usage[usageKey(state.settings.currentMonth,card.id,benefit.id)]?.bonusCount||0)}
}

export function benefitAvailability(state,card,benefit){
  const s=benefitSummary(state,card,benefit),reasons=[];
  if(benefit.networkRequired&&card.network!==benefit.networkRequired)reasons.push(`${benefit.networkRequired} 카드만 제공`);
  if(!optionActive(card,benefit))reasons.push('현재 선택 서비스가 아님');
  if(card.selectedTier==='inactive'&&!benefit.rateByTier?.inactive&&!benefit.fixedByTier?.inactive)reasons.push('이번 달 실적조건 미충족');
  if((s.cap<=0||s.poolCap<=0)&&!benefit.rateByTier?.inactive&&!benefit.fixedByTier?.inactive)reasons.push('적용 한도 없음');
  if(s.remaining<=0&&s.cap>0)reasons.push('월 한도 소진');
  if(benefit.monthlyCountLimit&&s.count>=benefit.monthlyCountLimit)reasons.push('월 이용횟수 소진');
  if(!monthlyRequirementMet(state,card,benefit))reasons.push('연계 조건 확인 필요');
  const hard=reasons.filter(x=>!x.includes('연계 조건'));
  return {status:hard.length?'inactive':reasons.length?'conditional':'active',reasons,summary:s};
}

export function evaluateBenefit(state,card,benefit,input){
  const tier=card.selectedTier,warnings=[],blockers=[];
  if(benefit.networkRequired&&card.network!==benefit.networkRequired)blockers.push(`${benefit.networkRequired} 카드 전용`);
  if(!optionActive(card,benefit))blockers.push('현재 선택 서비스와 다름');
  if(card.selectedTier==='inactive'&&!benefit.rateByTier?.inactive&&!benefit.fixedByTier?.inactive)blockers.push('이번 달 혜택 미적용');
  if(!categoryMatches(benefit,input))blockers.push('대상 업종 아님');
  if(!merchantMatches(benefit,input.merchant))blockers.push('대상 가맹점 조건 불충족');
  if(input.amount<(benefit.minAmount||0))blockers.push(`최소 결제금액 ${won(benefit.minAmount).toLocaleString()}원 미달`);
  if(benefit.excludeInterestFree&&input.paymentMethod==='interest-free')blockers.push('무이자할부 제외');
  if(benefit.paymentRequired&&input.paymentMethod!==benefit.paymentRequired)blockers.push(benefit.paymentRequired==='recurring'?'자동이체·정기결제 필요':'결제방법 조건 불충족');
  if(benefit.channel==='offline'){if(input.channel==='online')blockers.push('오프라인 결제 전용');else if(input.channel==='unknown')warnings.push('오프라인 결제 여부를 확인하세요.');}
  if(benefit.channel==='online'){if(input.channel==='offline')blockers.push('온라인 결제 전용');else if(input.channel==='unknown')warnings.push('온라인 결제 여부를 확인하세요.');}
  if(input.channel==='online'&&benefit.onlineConfirmation?.length)warnings.push(...benefit.onlineConfirmation.map(x=>`확인 필요: ${x}`));
  if(!monthlyRequirementMet(state,card,benefit))warnings.push('이번 달 연계 혜택 조건을 충족해야 최종 적용됩니다.');
  if(benefit.notes?.length)warnings.push(...benefit.notes);
  if(benefit.nextMonthSpendTreatment==='excluded')warnings.push('이 혜택이 적용된 거래금액은 다음 달 실적 산정에서 제외됩니다.');

  const s=benefitSummary(state,card,benefit);
  if(benefit.monthlyCountLimit&&s.count>=benefit.monthlyCountLimit)blockers.push('월 이용횟수 소진');
  if(s.cap<=0||s.poolCap<=0)blockers.push('적용 한도 없음');
  if(s.remaining<=0)blockers.push('월 할인한도 소진');
  const capDiscount=Math.min(won(baseValue(benefit,tier,input.amount)),s.remaining);
  const currentBonus=bonusAt(benefit,s.bonusCount),nextBonus=benefit.bonusTracker&&input.amount>=benefit.bonusTracker.threshold?bonusAt(benefit,s.bonusCount+1):currentBonus;
  const bonusDiscount=Math.max(0,nextBonus-currentBonus);
  let discount=capDiscount+bonusDiscount;if(blockers.length)discount=0;
  return {cardId:card.id,cardName:card.name,benefitId:benefit.id,benefitName:benefit.name,amount:won(input.amount),discount,capDiscount:blockers.length?0:capDiscount,bonusDiscount:blockers.length?0:bonusDiscount,cap:s.cap,used:s.used,remaining:s.remaining,poolCap:s.poolCap,poolUsed:s.poolUsed,poolRemaining:s.poolRemaining,warnings:[...new Set(warnings)],blockers,rate:Number(tierValue(benefit.rateByTier,tier)),count:s.count,monthlyCountLimit:benefit.monthlyCountLimit||null,bonusEligible:!!(benefit.bonusTracker&&input.amount>=benefit.bonusTracker.threshold),bonusTracker:benefit.bonusTracker||null,sharedPool:benefit.sharedPool||null,nextMonthSpendTreatment:benefit.nextMonthSpendTreatment||'unknown',source:card.source};
}

export function getCandidates(state,input,{includeBlocked=false}={}){const out=[];for(const card of state.cards)for(const benefit of card.benefits){const r=evaluateBenefit(state,card,benefit,input);if(includeBlocked||r.discount>0)out.push(r)}return out.sort((a,b)=>b.discount-a.discount||a.warnings.length-b.warnings.length)}
function splitBreakpoints(amount,a,b){const p=new Set([0,amount]);for(const x of[a,b])if(x?.rate>0){const effective=Math.min(x.remaining,x.cap);p.add(Math.ceil(effective/x.rate));p.add(amount-Math.ceil(effective/x.rate))}for(let x=10000;x<amount;x+=10000)p.add(x);return[...p].filter(x=>x>=0&&x<=amount).map(won)}
export function recommend(state,input){const singles=getCandidates(state,input),bestSingle=singles[0]||null;let bestSplit=null;if(input.amount>=20000&&singles.length>=2){for(let i=0;i<singles.length;i++)for(let j=i+1;j<singles.length;j++){const a0=singles[i],b0=singles[j];if(a0.cardId===b0.cardId)continue;const ca=state.cards.find(c=>c.id===a0.cardId),cb=state.cards.find(c=>c.id===b0.cardId),ba=ca.benefits.find(b=>b.id===a0.benefitId),bb=cb.benefits.find(b=>b.id===b0.benefitId);for(const partA of splitBreakpoints(input.amount,a0,b0)){const partB=input.amount-partA;if(partA<=0||partB<=0)continue;const a=evaluateBenefit(state,ca,ba,{...input,amount:partA}),b=evaluateBenefit(state,cb,bb,{...input,amount:partB}),total=a.discount+b.discount;if(!bestSplit||total>bestSplit.discount)bestSplit={discount:total,legs:[a,b],gain:total-(bestSingle?.discount||0)}}}}if(bestSplit&&bestSplit.gain<(state.settings.splitMinimumGain||0))bestSplit=null;return{bestSingle,alternatives:singles.slice(1,4),bestSplit,all:singles}}

export function benefitsForTag(state,tag){const rows=[];for(const card of state.cards)for(const benefit of card.benefits)if(benefit.browseTags?.includes(tag))rows.push({card,benefit,...benefitAvailability(state,card,benefit)});return rows.sort((a,b)=>({active:0,conditional:1,inactive:2}[a.status]-({active:0,conditional:1,inactive:2}[b.status]))||a.card.name.localeCompare(b.card.name,'ko'))}

export function matchingLinks(state,input){const now=new Date().toISOString().slice(0,10);return state.linkOffers.filter(link=>{if(link.used||link.status==='expired')return false;if(link.endDate&&link.endDate<now)return false;const keyword=(link.merchant||'').trim().toLowerCase(),merchantMatch=keyword&&input.merchant.toLowerCase().includes(keyword),categoryMatch=link.category&&link.category===input.category;return(merchantMatch||categoryMatch)&&input.amount>=(link.minAmount||0)})}

export function applyTransaction(state,leg,input,extra={}){const card=state.cards.find(c=>c.id===leg.cardId),benefit=card.benefits.find(b=>b.id===leg.benefitId),month=state.settings.currentMonth,benefitKey=usageKey(month,card.id,benefit.id),capDiscount=won(leg.capDiscount??leg.discount);state.usage[benefitKey]||={amount:0,count:0,bonusCount:0};state.usage[benefitKey].amount=won(state.usage[benefitKey].amount+capDiscount);if(benefit.sharedPool){const poolKey=usageKey(month,card.id,benefit.sharedPool);state.usage[poolKey]||={amount:0,count:0};state.usage[poolKey].amount=won(state.usage[poolKey].amount+capDiscount)}state.usage[benefitKey].count=won(state.usage[benefitKey].count+1);if(benefit.bonusTracker&&leg.amount>=benefit.bonusTracker.threshold)state.usage[benefitKey].bonusCount=won((state.usage[benefitKey].bonusCount||0)+1);state.transactions.unshift({id:crypto.randomUUID(),date:new Date().toISOString(),month,merchant:input.merchant,category:input.category,channel:input.channel,paymentMethod:input.paymentMethod,amount:leg.amount,cardId:leg.cardId,benefitId:leg.benefitId,expectedDiscount:leg.discount,capDiscount,bonusDiscount:leg.bonusDiscount||0,warnings:leg.warnings,...extra})}
export function reverseTransaction(state,tx){const card=state.cards.find(c=>c.id===tx.cardId),benefit=card?.benefits.find(b=>b.id===tx.benefitId);if(!card||!benefit)return;const benefitKey=usageKey(tx.month,card.id,benefit.id),capDiscount=won(tx.capDiscount??tx.expectedDiscount);if(state.usage[benefitKey]){state.usage[benefitKey].amount=Math.max(0,won(state.usage[benefitKey].amount-capDiscount));state.usage[benefitKey].count=Math.max(0,won(state.usage[benefitKey].count-1));if(benefit.bonusTracker&&tx.amount>=benefit.bonusTracker.threshold)state.usage[benefitKey].bonusCount=Math.max(0,won((state.usage[benefitKey].bonusCount||0)-1))}if(benefit.sharedPool){const poolKey=usageKey(tx.month,card.id,benefit.sharedPool);if(state.usage[poolKey])state.usage[poolKey].amount=Math.max(0,won(state.usage[poolKey].amount-capDiscount))}}
