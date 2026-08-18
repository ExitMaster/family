import { DEFAULT_STATE, BROWSE_TREE } from './default-data-v2.js';

function findNode(id,nodes=BROWSE_TREE){for(const n of nodes){if(n.id===id)return n;const hit=n.children&&findNode(id,n.children);if(hit)return hit}return null}
function collect(nodes,out=[]){for(const n of nodes){out.push(n.id);if(n.children)collect(n.children,out)}return out}
const transport=findNode('transport-root');if(transport){transport.children||=[];if(!transport.children.some(x=>x.id==='fuel'))transport.children.push({id:'fuel',label:'주유'})}

const lawyers=DEFAULT_STATE.cards.find(c=>c.id==='samsung-lawyers');
const base=lawyers?.benefits.find(b=>b.id==='lawyers-domestic');
if(base){
  const excludedCategories=new Set(['overseas','transport','apartment','gas','electricity','social-insurance','government-voucher']);
  base.categories=(base.categories||[]).filter(id=>!excludedCategories.has(id));
  const excludedTags=new Set(['overseas-root','overseas','government-voucher','transport-root','bus','subway','taxi','apartment','gas','electricity','social-insurance']);
  base.browseTags=[...new Set(collect(BROWSE_TREE,[]).filter(id=>!excludedTags.has(id)))];
}
if(lawyers&&!lawyers.benefits.some(b=>b.id==='lawyers-mastercard-premium'))lawyers.benefits.push({
  id:'lawyers-mastercard-premium',name:'Mastercard Platinum 프리미엄 서비스',group:'Mastercard Platinum',sourceType:'network-common',benefitType:'informational',
  categories:['hotel','airport-transfer','rental-car'],browseTags:['travel','airport','airport-transfer','hotel','rental-car'],
  capByTier:{inactive:999999999,'40+':999999999},
  notes:['상품설명서(2022.10)에 호텔·공항픽업/주차·렌터카·여행·골프·로밍·라이프스타일 제휴서비스가 안내됨','Mastercard 프리미엄 서비스는 1년 단위로 제공되고 변경될 수 있으므로 실제 이용 전 Mastercard의 현재 연도 조건 확인 필요','이 정보성 혜택은 추천 할인액 계산에는 포함하지 않음']
});
