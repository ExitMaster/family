import { BENEFIT_DETAILS } from './benefit-details-v2.js';

const esc=(v='')=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

const labels={
  targets:'할인 대상',conditions:'이용조건',exclusions:'제외 대상',count:'월 이용횟수·한도',amountRule:'할인 기준',bonus:'추가 캐시백',performance:'다음 달 실적',settlement:'정산 방식'
};

export function renderDetailedConditions(benefitId,cardCommonRules=[]){
  const d=BENEFIT_DETAILS[benefitId]||{};
  const order=['targets','conditions','count','amountRule','bonus','exclusions','performance','settlement'];
  const blocks=order.flatMap(key=>{
    const value=d[key]; if(!value)return [];
    const list=Array.isArray(value)?value:[value];
    return [`<section class="condition-section"><h5>${labels[key]}</h5><ul>${list.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`];
  });
  if(cardCommonRules?.length)blocks.push(`<section class="condition-section common"><h5>카드 공통 유의사항</h5><ul>${cardCommonRules.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`);
  return blocks.join('')||'<p class="small muted">추가 상세조건이 아직 구조화되지 않았습니다.</p>';
}

export function importantConditions(benefitId){
  const d=BENEFIT_DETAILS[benefitId]||{}; const items=[];
  if(d.count)items.push(d.count);
  if(d.conditions)items.push(...(Array.isArray(d.conditions)?d.conditions:[d.conditions]));
  if(d.exclusions)items.push(...(Array.isArray(d.exclusions)?d.exclusions:[d.exclusions]).slice(0,2));
  return items.slice(0,3);
}
