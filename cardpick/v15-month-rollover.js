const STORAGE_KEY=globalThis.CARDPICK_STORAGE_KEY||'card-pick-state-v1';

function localMonth(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

try{
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw){
    const state=JSON.parse(raw);
    const currentMonth=localMonth();
    if(state?.settings && state.settings.currentMonth!==currentMonth){
      state.settings.currentMonth=currentMonth;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    }
  }
}catch{}

export const CURRENT_MONTH=localMonth();