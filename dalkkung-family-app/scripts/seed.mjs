import fs from 'node:fs/promises';

const url=process.env.SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerEmail=process.env.SEED_OWNER_EMAIL;
if(!url||!key||!ownerEmail) throw new Error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_OWNER_EMAIL 환경변수가 필요합니다.');
const seed=JSON.parse(await fs.readFile(new URL('../private/seed-data.json',import.meta.url),'utf8'));
const headers={apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'};
async function req(path,{method='GET',body}={}){const r=await fetch(`${url}/rest/v1/${path}`,{method,headers:{...headers,Prefer:'return=representation'},body:body?JSON.stringify(body):undefined});const t=await r.text();if(!r.ok)throw new Error(`${method} ${path}: ${r.status} ${t}`);return t?JSON.parse(t):null;}
async function authUsers(){let page=1,users=[];for(;;){const r=await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=100`,{headers});if(!r.ok)throw new Error(await r.text());const j=await r.json();users.push(...(j.users||[]));if((j.users||[]).length<100)break;page++;}return users;}
const owner=(await authUsers()).find(u=>u.email?.toLowerCase()===ownerEmail.toLowerCase());if(!owner)throw new Error('SEED_OWNER_EMAIL에 해당하는 Auth 사용자를 찾지 못했습니다. 먼저 첫 사용자가 가입하고 가족 공간을 만들어야 합니다.');
const membership=(await req(`family_members?user_id=eq.${owner.id}&select=family_id`))?.[0];if(!membership)throw new Error('첫 사용자가 아직 가족 공간을 만들지 않았습니다.');
const familyId=membership.family_id;
const households=await req(`households?family_id=eq.${familyId}&select=id,name`);const h=Object.fromEntries(households.map(x=>[x.name,x.id]));
const cats=await req(`categories?family_id=eq.${familyId}&select=id,type,name`);const c=Object.fromEntries(cats.map(x=>[`${x.type}:${x.name}`,x.id]));
const existingTx=await req(`transactions?family_id=eq.${familyId}&select=id&limit=1`);if(existingTx.length)throw new Error('이미 거래 데이터가 있습니다. 중복 이관을 막기 위해 중단했습니다.');

await req('transactions',{method:'POST',body:seed.transactions.map(x=>({family_id:familyId,txn_date:x.date,type:x.type,category_id:c[`${x.type}:${x.category}`]||null,description:x.description,amount:x.amount,household_id:x.household?h[x.household]:null,payment_method:x.payment_method,receipt_shared:x.receipt_shared,memo:x.memo,created_by:owner.id}))});
for(const s of seed.settlements){const row=(await req('settlements',{method:'POST',body:{family_id:familyId,settlement_date:s.date,description:s.description,total_amount:s.total_amount,payer_household_id:h[s.payer],memo:s.memo,is_example:s.is_example,created_by:owner.id}}))[0];await req('settlement_shares',{method:'POST',body:Object.entries(s.shares).map(([name,v])=>({family_id:familyId,settlement_id:row.id,household_id:h[name],amount:v.amount,status:v.status,created_by:owner.id}))});}
await req('care_events',{method:'POST',body:seed.care_events.map((x,i)=>({family_id:familyId,event_date:x.date,event_type:x.event_type,place:x.place,doctor:x.doctor,companions:x.companions,content:x.content,memo:x.memo,medication:x.medication||null,chemo_cycle:x.chemo_cycle||null,sort_order:i,created_by:owner.id}))});
for(const x of seed.chemo_cycles){await fetch(`${url}/rest/v1/chemo_cycles?family_id=eq.${familyId}&cycle_number=eq.${x.cycle_number}`,{method:'PATCH',headers:{...headers,Prefer:'return=minimal'},body:JSON.stringify({cycle_date:x.cycle_date,hospital:x.hospital,medication:x.medication,condition_summary:x.condition_summary,notes:x.notes,created_by:owner.id})}).then(async r=>{if(!r.ok)throw new Error(await r.text())});}
if(seed.payout_accounts?.length) await req('payout_accounts',{method:'POST',body:seed.payout_accounts.filter(x=>h[x.household]).map(x=>({family_id:familyId,household_id:h[x.household],bank_name:x.bank_name,account_number:x.account_number}))});
console.log(`이관 완료: 거래 ${seed.transactions.length}건, 정산 ${seed.settlements.length}건, 간병 ${seed.care_events.length}건, 항암 회차 ${seed.chemo_cycles.length}건`);
console.log('원본 금융 비밀번호 값은 이관 데이터에 포함되지 않았습니다.');
