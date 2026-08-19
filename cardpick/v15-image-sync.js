const app=document.querySelector('#app');
let timer=null;

function syncRecommendationImage(){
  clearTimeout(timer);
  timer=setTimeout(()=>globalThis.CardPickSyncRecommendationImage?.(),0);
}

document.addEventListener('submit',syncRecommendationImage,true);
document.addEventListener('change',syncRecommendationImage,true);
document.addEventListener('click',syncRecommendationImage,true);

syncRecommendationImage();
