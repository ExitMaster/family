import { DEFAULT_STATE } from './default-data-v2.js';
import { V12_BENEFIT_DETAILS } from './v12-details.js';
import { V12_CONTROL_KEY, V12_CURRENT_MONTH } from './v12-preload.js';

const app=document.querySelector('#app');
const cardByName=new Map(DEFAULT_STATE.cards.map(c=>[c.name,c]));
const benefitByName=new Map();
for(const card of DEFAULT_STATE.cards)for(const benefit of card.benefits)benefitByName.set(benefit.name,{card,benefit});
const imageByCard={
  '국민행복 삼성카드 V2':new URL('./assets/cards/samsung-happy-v2.webp',import.meta.url).href,
  '서울지방변호사회 로이어스 삼성카드':new URL('./assets/cards/samsung-lawyers.webp',import.meta.url).href
};
const classLabel={primary:'주사용',dormant:'휴면·비주력','family-backup':'가족·백업'};
let enhanceTimer=null;

function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function controls(){try{return JSON.parse(localStorage.getItem(V12_CONTROL_KEY)||'{}')}catch{return{}}}
function saveControls(c){localStorage.setItem(V12_CONTROL_KEY,JSON.stringify(c))}
function ensureStyles(){
  if(document.querySelector('#v12-style'))return;
  const s=document.createElement('style');s.id='v12-style';s.textContent=`
    .v12-group-title{margin:24px 2px 10px}.v12-group-title h3{margin:0;font-size:15px}.v12-group-title p{margin:3px 0 0;font-size:12px;color:#667085}
    .v12-badge{display:inline-flex;align-items:center;margin-left:7px;padding:2px 7px;border-radius:999px;background:#f2f4f7;color:#475467;font-size:11px;font-weight:700;vertical-align:middle}
    .v12-badge.family{background:#fff4e5;color:#934f00}.v12-badge.dormant{background:#f2f4f7;color:#667085}
    .v12-tier-note{margin:8px 0 12px;padding:9px 11px;border-radius:10px;background:#f8fafc;font-size:12px;color:#475467;line-height:1.45}
    .v12-tier-note.needs-check{background:#fff4e5;color:#7a4500}
    .v12-pool-summary{margin:10px 0 14px;padding:11px 12px;border-radius:12px;background:#f8fafc;font-size:12px;line-height:1.55}
    .v12-specific{margin-top:12px;padding-top:2px}.v12-specific h5{margin:10px 0 5px;font-size:13px}.v12-specific ul{margin:0;padding-left:19px}.v12-specific li{margin:4px 0;line-height:1.45}
    .hero-result .v12-result-badge{display:inline-flex;margin:0 0 8px;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:800;background:#fff4e5;color:#934f00}
  `;document.head.appendChild(s);
}

function groupTitle(title,desc){const d=document.createElement('div');d.className='v12-group-title';d.innerHTML=`<h3>${esc(title)}</h3><p>${esc(desc)}</p>`;return d}
function addCardGroups(){
  const ledgers=[...app.querySelectorAll('.card-ledger')];if(!ledgers.length||app.querySelector('.v12-group-title'))return;
  ledgers[0].before(groupTitle('주사용 카드','평소 추천의 기본 후보'));
  const family=ledgers.find(x=>x.querySelector('h3')?.textContent.trim()==='국민행복 삼성카드 V2');
  const dormant=ledgers.find(x=>x.querySelector('h3')?.textContent.trim()==='서울지방변호사회 로이어스 삼성카드');
  if(family)family.before(groupTitle('가족·백업 카드','실적이 확인되면 추천 후보에 포함하되 동일 혜택에서는 주사용 카드보다 후순위'));
  if(dormant)dormant.before(groupTitle('휴면·비주력 카드','기본은 실적 미달. 실적과 무관한 혜택만 평소에도 활성'));
}

function addCardBadgesAndNotes(){
  const ctl=controls();
  app.querySelectorAll('.card-ledger').forEach(section=>{
    const h=section.querySelector('h3');if(!h)return;const name=h.textContent.trim(),card=cardByName.get(name);if(!card)return;
    if(card.usageClass!=='primary'&&!h.querySelector('.v12-badge')){
      const b=document.createElement('span');b.className=`v12-badge ${card.usageClass==='family-backup'?'family':'dormant'}`;b.textContent=card.usageClass==='family-backup'?'남편 명의 · 가족 백업':'본인 · 휴면';h.appendChild(b);
    }
    if(card.id==='samsung-happy-v2'){
      const field=section.querySelector('.tier-select')?.closest('.field');
      if(field&&!section.querySelector('.v12-tier-note')){
        const n=document.createElement('div');const confirmed=ctl.familyTierMonth===V12_CURRENT_MONTH;n.className=`v12-tier-note ${confirmed?'':'needs-check'}`;
        n.textContent=confirmed?'이번 달 전월실적 구간을 확인했습니다.':'이번 달 실적 확인 필요 · 남편에게 확인한 뒤 실적구간을 선택하세요.';field.after(n);
      }
      if(!section.querySelector('.v12-pool-summary')){
        const tier=section.querySelector('.tier-select')?.value;const table={'30-60':['4,000원','10,000원'],'60-100':['8,000원','20,000원'],'100+':['16,000원','40,000원']};
        const p=document.createElement('div');p.className='v12-pool-summary';p.innerHTML=table[tier]?`<strong>7% 할인 한도</strong><br>쇼핑·보육·생활요금 각 ${table[tier][0]} · 세 영역 통합 ${table[tier][1]}`:'<strong>7% 할인</strong><br>현재 실적 미달 · 해외 1.5%만 실적과 무관하게 활성';
        const note=section.querySelector('.v12-tier-note');(note||section.querySelector('.field'))?.after(p);
      }
    }
    if(card.id==='samsung-lawyers'&&!section.querySelector('.v12-tier-note')){
      const field=section.querySelector('.tier-select')?.closest('.field');if(field){const n=document.createElement('div');n.className='v12-tier-note';n.textContent=section.querySelector('.tier-select')?.value==='40+'?'이번 달 40만원 이상 실적구간 활성 · 추가 적립/할인 혜택 사용 가능':'기본 상태: 실적 미달 · 국내 0.5%, 병원·약국·해외 1%는 계속 활성';field.after(n)}
    }
  });
}

const detailLabels={targets:'대상',conditions:'이용조건',count:'횟수·한도',amountRule:'혜택 기준',exclusions:'제외 대상',performance:'다음 달 실적'};
function detailHtml(id){const d=V12_BENEFIT_DETAILS[id];if(!d)return'';return Object.entries(detailLabels).flatMap(([key,label])=>{const v=d[key];if(!v)return[];const list=Array.isArray(v)?v:[v];return [`<section><h5>${label}</h5><ul>${list.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`]}).join('')}
function enrichV12Details(){
  app.querySelectorAll('.benefit-detail').forEach(detail=>{
    if(detail.dataset.v12Detail==='1')return;
    const benefitName=detail.querySelector('summary strong')?.textContent?.trim();const found=benefitByName.get(benefitName);if(!found||!V12_BENEFIT_DETAILS[found.benefit.id])return;
    const body=detail.querySelector('.detail-body');if(!body)return;const block=document.createElement('div');block.className='v12-specific';block.innerHTML=detailHtml(found.benefit.id);body.prepend(block);detail.dataset.v12Detail='1';
  });
  app.querySelectorAll('.list-item').forEach(row=>{
    if(row.dataset.v12Detail==='1')return;
    const benefitName=row.querySelector('.small.muted')?.textContent?.trim();const found=benefitByName.get(benefitName);if(!found||!V12_BENEFIT_DETAILS[found.benefit.id])return;
    const d=row.querySelector('.finder-detail .detail-body');if(d){const block=document.createElement('div');block.className='v12-specific';block.innerHTML=detailHtml(found.benefit.id);d.prepend(block)}
    row.dataset.v12Detail='1';
  });
}

function fixInformationalLabels(){
  app.querySelectorAll('.benefit-detail').forEach(d=>{const name=d.querySelector('summary strong')?.textContent?.trim(),found=benefitByName.get(name);if(found?.benefit.benefitType==='informational'){const meta=d.querySelector('summary .small.muted');if(meta&&meta.textContent.includes('현재 미적용'))meta.textContent=meta.textContent.replace('현재 미적용','정보성 혜택')}});
  app.querySelectorAll('.list-item').forEach(row=>{const name=row.querySelector('.small.muted')?.textContent?.trim(),found=benefitByName.get(name);if(found?.benefit.benefitType==='informational'){const meta=row.querySelector('.benefit-meta');if(meta&&meta.textContent.includes('현재 미적용'))meta.textContent=meta.textContent.replace('현재 미적용','정보성 혜택')}});
}

function addFinderBadges(){
  app.querySelectorAll('.list-item').forEach(row=>{if(row.querySelector('.v12-badge'))return;const cardName=row.querySelector('.list-head strong')?.textContent?.trim(),card=cardByName.get(cardName);if(!card||card.usageClass==='primary')return;const b=document.createElement('span');b.className=`v12-badge ${card.usageClass==='family-backup'?'family':'dormant'}`;b.textContent=card.usageClass==='family-backup'?'남편 명의 · 후순위':'휴면·비주력';row.querySelector('.list-head strong')?.appendChild(b)})
}

function addRecommendationMeta(){
  const result=app.querySelector('.hero-result');if(!result)return;const name=result.querySelector('h2')?.textContent?.trim(),card=cardByName.get(name);if(!card)return;
  if(card.usageClass!=='primary'&&!result.querySelector('.v12-result-badge')){const b=document.createElement('div');b.className='v12-result-badge';b.textContent=card.usageClass==='family-backup'?'남편 명의 · 가족 백업 · 동일 혜택 후순위':'휴면·비주력 카드';result.querySelector('h2')?.before(b)}
  if(!result.querySelector('.card-result-image')&&imageByCard[name]){const img=document.createElement('img');img.className='card-result-image';img.src=imageByCard[name];img.alt=`${name} 카드 이미지`;result.classList.add('with-card-image');result.appendChild(img)}
}

function enhance(){ensureStyles();addCardGroups();addCardBadgesAndNotes();enrichV12Details();fixInformationalLabels();addFinderBadges();addRecommendationMeta()}
function scheduleEnhance(){clearTimeout(enhanceTimer);enhanceTimer=setTimeout(enhance,0)}

document.addEventListener('change',e=>{
  const select=e.target.closest?.('.tier-select');
  if(select){const id=select.dataset.cardId;if(['samsung-happy-v2','samsung-lawyers'].includes(id)){const ctl=controls();if(id==='samsung-happy-v2')ctl.familyTierMonth=V12_CURRENT_MONTH;if(id==='samsung-lawyers')ctl.lawyersActiveMonth=select.value==='40+'?V12_CURRENT_MONTH:null;saveControls(ctl)}}
  scheduleEnhance();
},true);
document.addEventListener('click',scheduleEnhance,true);
document.addEventListener('submit',scheduleEnhance,true);

enhance();
