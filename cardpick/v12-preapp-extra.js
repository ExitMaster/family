import { DEFAULT_STATE, BROWSE_TREE } from './default-data-v2.js';

function collect(nodes,out=[]){for(const n of nodes){out.push(n.id);if(n.children)collect(n.children,out)}return out}
const domesticTags=collect(BROWSE_TREE,[]).filter(id=>!['overseas-root','overseas','government-voucher'].includes(id));
const lawyers=DEFAULT_STATE.cards.find(c=>c.id==='samsung-lawyers');
const base=lawyers?.benefits.find(b=>b.id==='lawyers-domestic');
if(base)base.browseTags=[...new Set(domesticTags)];
