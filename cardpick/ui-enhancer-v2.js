import { DEFAULT_STATE, BROWSE_TREE } from './default-data-v2.js';
import { renderDetailedConditions, importantConditions } from './benefit-ui-v2.js';
import { CARD_IMAGES } from './card-images-v2.js';

const app=document.querySelector('#app');
const byName=new Map();
for(const card of DEFAULT_STATE.cards)for(const benefit of card.benefits)byName.set(benefit.name,{card,benefit});
let pathLabels=[];
let homeSelections={channel:null,paymentMethod:null};
let enhanceTimer=null;

function ensureImageStyles(){
  if(document.querySelector('#card-result-image-style'))return;
  const style=document.createElement('style');style.id='card-result-image-style';
  style.textContent=`
    .hero-result.with-card-image{position:relative;padding-right:124px;min-height:168px}
    .card-result-image{position:absolute;top:18px;right:18px;width:94px;height:98px;object-fit:contain;border-radius:8px;background:#fff;box-shadow:0 2px 10px rgba(16,24,40,.12)}
    @media(max-width:420px){.hero-result.with-card-image{padding-right:108px}.card-result-image{width:80px;height:88px;top:16px;right:14px}}
  `;
  document.head.appendChild(style);
}

function topLabels(){return new Set(BROWSE_TREE.map(x=>x.label))}
function fixBenefitFinder(){
  const title=[...app.querySelectorAll('.section-title h2')].find(x=>x.textContent.trim().endsWith('카드 혜택'));
  if(!title)return;
  const grid=app.querySelector('.browse-grid');
  if(grid){
    const labels=[...grid.querySelectorAll('.browse-tile strong')].map(x=>x.textContent.trim());
    const tops=topLabels();
    const looksLikeTop=labels.length===BROWSE_TREE.length&&labels.every(x=>tops.has(x));
    if(looksLikeTop&&app.querySelector('#browseBack'))grid.remove();
  }
  if(pathLabels.length){
    let crumb=app.querySelector('.benefit-breadcrumb');
    if(!crumb){crumb=document.createElement('div');crumb.className='benefit-breadcrumb';title.closest('.section-title').before(crumb)}
    const nextText=pathLabels.join(' › ');
    if(crumb.textContent!==nextText)crumb.textContent=nextText;
  }
}

function enrichBenefitFinder(){
  const finderHeading=[...app.querySelectorAll('.section-title h2')].find(x=>x.textContent.trim().endsWith('카드 혜택'));
  if(!finderHeading)return;
  app.querySelectorAll('.list-item').forEach(row=>{
    if(row.dataset.detailed==='1')return;
    const benefitName=row.querySelector('.small.muted')?.textContent?.trim();
    const found=byName.get(benefitName);if(!found)return;
    const {card,benefit}=found;
    const important=importantConditions(benefit.id);
    const box=document.createElement('details');box.className='benefit-detail finder-detail';
    box.innerHTML=`<summary><span>상세 이용조건</span><span class="small muted">펼쳐보기</span></summary><div class="detail-body">${important.length?`<section class="condition-section key"><h5>판단에 중요한 조건</h5><ul>${important.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></section>`:''}${renderDetailedConditions(benefit.id,card.commonRules||[])}</div>`;
    row.appendChild(box);row.dataset.detailed='1';
  });
}

function enrichCardTab(){
  if(!app.querySelector('.card-ledger'))return;
  app.querySelectorAll('.benefit-detail').forEach(d=>{
    if(d.dataset.fullConditions==='1')return;
    const benefitName=d.querySelector('summary strong')?.textContent?.trim();
    const found=byName.get(benefitName);if(!found)return;
    const body=d.querySelector('.detail-body');if(!body)return;
    const section=document.createElement('div');section.className='full-condition-block';section.innerHTML=renderDetailedConditions(found.benefit.id,found.card.commonRules||[]);
    const reconcile=body.querySelector('.reconcile');if(reconcile)body.insertBefore(section,reconcile);else body.appendChild(section);
    d.dataset.fullConditions='1';
  });
}

function enrichRecommendationImage(){
  ensureImageStyles();
  const result=app.querySelector('.hero-result');
  if(!result||result.querySelector('.card-result-image'))return;
  const cardName=result.querySelector('h2')?.textContent?.trim();
  const src=CARD_IMAGES[cardName];
  if(!src)return;
  const img=document.createElement('img');
  img.className='card-result-image';img.src=src;img.alt=`${cardName} 카드 이미지`;img.loading='eager';img.decoding='async';
  result.classList.add('with-card-image');result.appendChild(img);
}

function rememberHomeSelections(form=document.querySelector('#recommendForm')){
  if(!form)return;
  const channel=form.querySelector('[name="channel"]');
  const paymentMethod=form.querySelector('[name="paymentMethod"]');
  if(channel)homeSelections.channel=channel.value;
  if(paymentMethod)homeSelections.paymentMethod=paymentMethod.value;
}

function restoreHomeSelections(){
  const form=document.querySelector('#recommendForm');
  if(!form)return;
  const channel=form.querySelector('[name="channel"]');
  const paymentMethod=form.querySelector('[name="paymentMethod"]');
  if(channel&&homeSelections.channel)channel.value=homeSelections.channel;
  if(paymentMethod&&homeSelections.paymentMethod)paymentMethod.value=homeSelections.paymentMethod;
  if(!homeSelections.channel||!homeSelections.paymentMethod)rememberHomeSelections(form);
}

function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function enhance(){restoreHomeSelections();fixBenefitFinder();enrichBenefitFinder();enrichCardTab();enrichRecommendationImage()}
function scheduleEnhance(){clearTimeout(enhanceTimer);enhanceTimer=setTimeout(enhance,0)}

// The app re-renders synchronously on navigation/form actions. Run enhancement
// once after the user action instead of observing every DOM mutation. This avoids
// observer feedback loops that can hang Chromium in Benefit Finder.
document.addEventListener('submit',e=>{
  if(e.target?.id==='recommendForm')rememberHomeSelections(e.target);
  scheduleEnhance();
},true);
document.addEventListener('change',e=>{
  if(e.target?.closest?.('#recommendForm')&&(e.target.name==='channel'||e.target.name==='paymentMethod'))rememberHomeSelections(e.target.form);
  scheduleEnhance();
},true);
document.addEventListener('click',e=>{
  const tile=e.target.closest?.('.browse-tile');
  if(tile){const label=tile.querySelector('strong')?.textContent?.trim();if(label)pathLabels.push(label)}
  else if(e.target.closest?.('#browseBack'))pathLabels.pop();
  else {const nav=e.target.closest?.('.nav-item');if(nav&&nav.dataset.route!=='benefits')pathLabels=[]}
  scheduleEnhance();
},true);

enhance();
