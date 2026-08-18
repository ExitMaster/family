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
