import { DEFAULT_STATE, BROWSE_TREE } from './default-data-v2.js';
import { renderDetailedConditions, importantConditions } from './benefit-ui-v2.js';

const app=document.querySelector('#app');
const byName=new Map();
for(const card of DEFAULT_STATE.cards)for(const benefit of card.benefits)byName.set(benefit.name,{card,benefit});
let pathLabels=[];

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
    crumb.textContent=pathLabels.join(' › ');
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

function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function enhance(){fixBenefitFinder();enrichBenefitFinder();enrichCardTab()}

// Track Benefit Finder navigation labels in capture phase, before app re-renders.
document.addEventListener('click',e=>{
  const tile=e.target.closest?.('.browse-tile');
  if(tile){const label=tile.querySelector('strong')?.textContent?.trim();if(label)pathLabels.push(label);setTimeout(enhance,0);return}
  if(e.target.closest?.('#browseBack')){pathLabels.pop();setTimeout(enhance,0);return}
  const nav=e.target.closest?.('.nav-item');if(nav&&nav.dataset.route!=='benefits')pathLabels=[];
},true);

const observer=new MutationObserver(()=>queueMicrotask(enhance));observer.observe(app,{childList:true,subtree:true});enhance();
