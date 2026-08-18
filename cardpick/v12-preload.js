import { DEFAULT_STATE, CATEGORY_OPTIONS, BROWSE_TREE } from './default-data-v2.js';

const CURRENT_MONTH=new Date().toISOString().slice(0,7);
const STORAGE_KEY=globalThis.CARDPICK_STORAGE_KEY||'card-pick-state-v1';
const CONTROL_KEY=`${STORAGE_KEY}:v12-controls`;

function addCategory(id,label){if(!CATEGORY_OPTIONS.some(([x])=>x===id))CATEGORY_OPTIONS.push([id,label]);}
function findNode(id,nodes=BROWSE_TREE){for(const n of nodes){if(n.id===id)return n;const hit=n.children&&findNode(id,n.children);if(hit)return hit}return null}
function addChild(parentId,node){const p=findNode(parentId);if(p){p.children||=[];if(!p.children.some(x=>x.id===node.id))p.children.push(node)}}

[
  ['department-store','백화점'],['premium-outlet','프리미엄 아울렛'],['fresh-delivery','신선식품 배송'],
  ['daycare','어린이집'],['online-bookstore','온라인서점'],['social-insurance','4대 사회보험'],['insurance','보험'],
  ['rental','렌탈'],['coffee','커피전문점'],['waterpark','워터파크'],['government-voucher','국가바우처']
].forEach(([id,label])=>addCategory(id,label));

addChild('shopping',{id:'department-store',label:'백화점'});
addChild('shopping',{id:'premium-outlet',label:'프리미엄 아울렛'});
addChild('shopping',{id:'fresh-delivery',label:'신선식품 배송',children:[{id:'kurly-fresh',label:'컬리'},{id:'oasis',label:'오아시스마켓'}]});
addChild('online-shopping',{id:'interpark',label:'인터파크'});
addChild('online-shopping',{id:'tmon',label:'티몬'});
addChild('online-shopping',{id:'wemakeprice',label:'위메프'});
addChild('online-shopping',{id:'lotteon',label:'롯데ON'});
addChild('education',{id:'daycare',label:'어린이집'});
addChild('bookstore',{id:'online-bookstore',label:'온라인서점'});
addChild('living',{id:'social-insurance',label:'4대 사회보험'});
addChild('living',{id:'insurance',label:'보험'});
addChild('living',{id:'rental',label:'렌탈'});
addChild('food',{id:'coffee',label:'커피전문점'});
addChild('food',{id:'bakery',label:'제과점'});
addChild('culture',{id:'waterpark',label:'워터파크'});
if(!BROWSE_TREE.some(x=>x.id==='government-voucher'))BROWSE_TREE.push({id:'government-voucher',label:'국가바우처'});

DEFAULT_STATE.schemaVersion=3;
DEFAULT_STATE.settings.appVersion='1.2';
for(const card of DEFAULT_STATE.cards){card.holder??='self';card.actualUser??='self';card.usageClass??='primary';}

const samsungV12Common=[
  '무이자할부 이용금액은 할인 제외',
  '삼성카드의 다른 결제일할인과 중복 적용되지 않으며 더 큰 할인만 적용',
  '기프트/선불카드 구매·충전 및 상품권 구매 제외',
  '삼성카드 가맹점 업종 분류 기준에 따른 등록 가맹점에 한함',
  '취소 거래는 매출취소전표 접수월 이용금액에서 차감 반영'
];

const cap7={'30-60':4000,'60-100':8000,'100+':16000};
const pool7={'30-60':10000,'60-100':20000,'100+':40000};
const rate7={'30-60':.07,'60-100':.07,'100+':.07};

const samsungHappy={
  id:'samsung-happy-v2',issuer:'삼성카드',name:'국민행복 삼성카드 V2',holder:'spouse',holderLabel:'남편',actualUser:'self',usageClass:'family-backup',
  network:'mastercard',networkTier:null,confidence:'verified',source:'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1688',commonRules:samsungV12Common,
  tiers:[{id:'inactive',label:'30만원 미만 · 실적 미달'},{id:'30-60',label:'30만원 이상 ~ 60만원 미만'},{id:'60-100',label:'60만원 이상 ~ 100만원 미만'},{id:'100+',label:'100만원 이상'}],selectedTier:'inactive',
  benefits:[
    {id:'shv2-shopping',name:'쇼핑 7% 결제일할인',group:'쇼핑',sourceType:'issuer-product',benefitType:'percentage',
      categories:['department-store','premium-outlet','hypermarket','online-shopping','daiso','fresh-delivery'],
      browseTags:['shopping','department-store','premium-outlet','hypermarket','emart','homeplus','lottemart','online-shopping','coupang','gmarket','auction','11st','ssg','interpark','tmon','wemakeprice','lotteon','daily-goods','daiso','fresh-delivery','kurly','kurly-fresh','oasis'],
      rateByTier:rate7,capByTier:cap7,sharedPool:'samsung-happy-total',sharedPoolCapByTier:pool7,
      channelByCategory:{'department-store':'offline','premium-outlet':'offline','daiso':'offline','fresh-delivery':'online'},
      merchantIncludeByCategory:{
        'department-store':['신세계','롯데백화점','현대백화점','갤러리아','동아백화점','대구백화점','세이백화점','AK플라자'],
        'premium-outlet':['신세계사이먼','현대프리미엄아울렛'],
        'hypermarket':['이마트','트레이더스','롯데마트','홈플러스'],
        'online-shopping':['삼성카드 쇼핑','G마켓','옥션','11번가','인터파크','쿠팡','티몬','위메프','SSG.COM','SSG','롯데ON'],
        'daiso':['다이소'],'fresh-delivery':['마켓컬리','컬리','오아시스마켓']},
      merchantExcludeByCategory:{'hypermarket':['에브리데이','롯데슈퍼','익스프레스']},excludeInterestFree:true,nextMonthSpendTreatment:'excluded',
      notes:['백화점·프리미엄 아울렛은 오프라인 일반결제만 대상, 임대매장·상품권·주차장 제외','할인점은 온라인몰 포함, 기업형 슈퍼마켓·임대매장 제외','신선식품 배송은 공식 홈페이지·앱 결제만 대상']},
    {id:'shv2-care',name:'보육 7% 결제일할인',group:'교육·육아',sourceType:'issuer-product',benefitType:'percentage',
      categories:['medical','pharmacy','postpartum','academy','study-material','online-bookstore','daycare','kindergarten','fuel'],
      browseTags:['medical-root','medical','pharmacy','postpartum','education','academy','study-material','bookstore','online-bookstore','daycare','kindergarten','fuel'],
      rateByTier:rate7,capByTier:cap7,sharedPool:'samsung-happy-total',sharedPoolCapByTier:pool7,
      channelByCategory:{'online-bookstore':'online'},
      merchantIncludeByCategory:{
        'study-material':['씽크빅','웅진씽크빅','교원','대교','한솔교육'],
        'online-bookstore':['YES24','예스24','인터파크 도서','알라딘','교보문고'],
        'fuel':['SK에너지','GS칼텍스','S-OIL','에쓰오일']},
      excludeInterestFree:true,nextMonthSpendTreatment:'excluded',
      notes:['학원은 입시·보습·외국어·예체능계 업종','어린이집·유치원은 국공립·사립 대상','보육료·유아학비 정부지원금 등 지정 국가바우처 이용건은 할인 제외']},
    {id:'shv2-living',name:'생활요금 7% 결제일할인',group:'생활·공과금',sourceType:'issuer-product',benefitType:'percentage',
      categories:['apartment','gas','electricity','social-insurance','insurance','telecom','rental'],
      browseTags:['living','apartment','gas','electricity','social-insurance','insurance','telecom','rental'],rateByTier:rate7,capByTier:cap7,
      sharedPool:'samsung-happy-total',sharedPoolCapByTier:pool7,paymentRequired:'recurring',excludeInterestFree:true,nextMonthSpendTreatment:'excluded',
      merchantIncludeByCategory:{'telecom':['SKT','SK텔레콤','SK브로드밴드','KT','LG U+','LG유플러스'],'rental':['코웨이','SK매직']},
      notes:['자동납부 연결 건에 한해 적용','통신은 SKT·SK브로드밴드·KT·LG U+ 이동통신/인터넷/유선전화요금','알뜰폰은 공식 대상 목록에 기재되어 있지 않아 할인대상으로 보지 않음']},
    {id:'shv2-streaming',name:'스트리밍 3,000원 결제일할인',group:'디지털·멤버십',sourceType:'issuer-product',benefitType:'fixed',categories:['digital'],
      browseTags:['digital-root','digital'],merchantInclude:['넷플릭스','웨이브','왓챠','멜론','FLO'],fixedByTier:{'30-60':3000,'60-100':3000,'100+':3000},
      capByTier:{'30-60':3000,'60-100':3000,'100+':3000},monthlyCountLimit:1,minAmount:5000,paymentRequired:'recurring',excludeInterestFree:true,
      notes:['건별 5,000원 이상 정기결제','간편결제 및 앱스토어 인앱결제 제외']},
    {id:'shv2-overseas',name:'해외 1.5% 결제일할인',group:'해외',sourceType:'issuer-product',benefitType:'percentage',categories:['overseas'],browseTags:['overseas-root','overseas'],
      rateByTier:{inactive:.015,'30-60':.015,'60-100':.015,'100+':.015},capByTier:{inactive:500000,'30-60':500000,'60-100':500000,'100+':500000},networkRequired:'mastercard',excludeInterestFree:true,
      notes:['전월 이용금액과 관계없이 제공','해외 가맹점 및 해외 직접구매 이용건','통합 월 할인한도 50만원']},
    {id:'shv2-voucher',name:'정부지원 국가바우처 이용',group:'기타',sourceType:'issuer-product',benefitType:'informational',categories:['government-voucher'],browseTags:['government-voucher'],
      capByTier:{inactive:999999999,'30-60':999999999,'60-100':999999999,'100+':999999999},notes:['임신·출산·육아 등 국가가 지원하는 바우처를 카드로 이용 가능','정부 정책에 따라 변경될 수 있으며 주관기관 및 삼성카드에서 최신 조건 확인']},
    {id:'shv2-shinsegae',name:'신세계백화점 제휴 서비스',group:'기타',sourceType:'issuer-partner',benefitType:'informational',categories:['department-store'],browseTags:['shopping','department-store'],
      merchantInclude:['신세계'],capByTier:{inactive:999999999,'30-60':999999999,'60-100':999999999,'100+':999999999},notes:['신세계백화점 할인쿠폰·신세계포인트 적립 관련 제휴서비스','구체적 제공조건은 신세계백화점/신세계포인트 최신 안내 확인']}
  ]
};

const domesticCategories=()=>CATEGORY_OPTIONS.map(([id])=>id).filter(id=>id!=='overseas');
const lawyersCommon=[
  '빅포인트는 1포인트=1원 가치이며 유효기간은 5년',
  '무이자할부·다이어트할부 및 삼성카드 할인이 적용된 이용금액은 적립/할인 제외',
  '기프트/선불카드 구매·충전 및 상품권 구매 제외',
  '전월실적 산정 시 세금·공과금·사회보험·대학등록금·대중교통·택시·아파트관리비 등 제외',
  '국제브랜드/프리미엄 서비스는 제공연도와 제휴사 정책에 따라 변경될 수 있어 이용 전 최신 조건 확인'
];
const unlimited={inactive:999999999,'40+':999999999};
const lawyers={
  id:'samsung-lawyers',issuer:'삼성카드',name:'서울지방변호사회 로이어스 삼성카드',holder:'self',actualUser:'self',usageClass:'dormant',
  network:'mastercard',networkTier:'platinum',confidence:'verified',source:'서울지방변호사회 로이어스 삼성카드 상품설명서 (2022.10)',commonRules:lawyersCommon,
  tiers:[{id:'inactive',label:'40만원 미만 · 실적 미달'},{id:'40+',label:'40만원 이상'}],selectedTier:'inactive',
  benefits:[
    {id:'lawyers-domestic',name:'국내 가맹점 0.5% 빅포인트',group:'기본 적립',sourceType:'issuer-product',benefitType:'percentage',categories:domesticCategories(),browseTags:[],
      rateByTier:{inactive:.005,'40+':.005},capByTier:unlimited,domesticOnly:true,excludeInterestFree:true,notes:['전월 이용금액과 관계없이, 적립한도 없이 제공']},
    {id:'lawyers-medical-overseas',name:'병원·약국·해외 1% 빅포인트',group:'기본 적립',sourceType:'issuer-product',benefitType:'percentage',categories:['medical','pharmacy','overseas'],
      browseTags:['medical-root','medical','pharmacy','overseas-root','overseas'],rateByTier:{inactive:.01,'40+':.01},capByTier:unlimited,channelByCategory:{medical:'offline',pharmacy:'offline'},excludeInterestFree:true,
      notes:['전월 이용금액과 관계없이, 적립한도 없이 제공','병원은 요양병원·보건소 제외','해외 가맹점 및 해외 직접구매 이용건']},
    {id:'lawyers-15',name:'할인점·주유·온라인쇼핑몰 1.5% 빅포인트',group:'40만원 이상 혜택',sourceType:'issuer-product',benefitType:'percentage',categories:['hypermarket','fuel','online-shopping'],
      browseTags:['shopping','hypermarket','emart','homeplus','lottemart','online-shopping','coupang','gmarket','auction','11st','interpark','tmon','wemakeprice','fuel'],rateByTier:{'40+':.015},capByTier:{'40+':999999999},
      merchantIncludeByCategory:{hypermarket:['이마트','트레이더스','롯데마트','홈플러스'],'online-shopping':['삼성카드 쇼핑','G마켓','옥션','11번가','인터파크','쿠팡','티몬','위메프']},
      merchantExcludeByCategory:{hypermarket:['에브리데이','익스프레스','롯데슈퍼']},excludeInterestFree:true,notes:['전월 이용금액 40만원 이상 시 적립한도 없이 제공','주유는 모든 주유소 및 LPG충전소 포함']},
    {id:'lawyers-2',name:'커피·제과·편의점 2% 빅포인트',group:'40만원 이상 혜택',sourceType:'issuer-product',benefitType:'percentage',categories:['coffee','bakery','convenience'],
      browseTags:['food','coffee','bakery','convenience'],rateByTier:{'40+':.02},capByTier:{'40+':999999999},channelByCategory:{coffee:'offline',bakery:'offline'},
      merchantIncludeByCategory:{coffee:['스타벅스','투썸플레이스','카페베네','탐앤탐스','커피빈','엔제리너스','할리스','파스쿠찌','아티제','폴 바셋','폴바셋'],bakery:['파리바게뜨','뚜레쥬르'],convenience:['CU','GS25','세븐일레븐','미니스톱']},
      excludeInterestFree:true,notes:['전월 이용금액 40만원 이상 시 적립한도 없이 제공','스타벅스 사이렌오더는 예외적으로 혜택 제공','백화점·할인점·쇼핑몰 등의 임대매장 제외']},
    {id:'lawyers-movie',name:'영화 5,000원 결제일할인',group:'40만원 이상 혜택',sourceType:'issuer-product',benefitType:'fixed',categories:['movie'],browseTags:['culture','movie'],
      merchantInclude:['CGV','롯데시네마','메가박스'],fixedByTier:{'40+':5000},capByTier:{'40+':5000},monthlyCountLimit:1,minAmount:12000,excludeInterestFree:true,
      notes:['오프라인 결제 또는 각 영화관 공식 홈페이지·앱 결제만 대상','다른 삼성카드 결제일할인과 중복 불가']},
    {id:'lawyers-leisure',name:'놀이공원 50%·워터파크 30% 현장할인',group:'40만원 이상 혜택',sourceType:'issuer-product',benefitType:'percentage',categories:['amusement','waterpark'],browseTags:['culture','amusement','waterpark'],
      merchantIncludeByCategory:{amusement:['에버랜드','롯데월드','서울랜드','통도환타지아','대전오월드','경주월드','이월드'],waterpark:['캐리비안 베이','캐리비안베이','아쿠아환타지아','캘리포니아비치','중흥골드스파','디오션','스파밸리']},
      rateByTier:{'40+':.5},rateByCategory:{amusement:.5,waterpark:.3},capByTier:{'40+':999999999},monthlyCountLimit:1,annualCountLimit:4,excludeInterestFree:true,
      notes:['현장할인 전용','놀이공원 자유이용권 50%, 워터파크 입장권 30%','일부 워터파크는 동반 1인 포함','이월드는 50% 현장할인 또는 무료입장']},
    {id:'lawyers-lounge',name:'공항 라운지 무료 입장',group:'Mastercard Platinum',sourceType:'network-plus-issuer',benefitType:'informational',categories:['airport-lounge'],browseTags:['travel','airport','airport-lounge'],
      capByTier:{'40+':999999999},annualCountLimit:1,notes:['상품설명서(2022.10) 기준 인천·김포·김해공항 대상, 통합 연 1회','전월 일시불·할부 40만원 이상','Mastercard/삼성카드 서비스는 연도별 변경 가능하므로 이용 전 최신 조건 확인']},
    {id:'lawyers-megabox-combo',name:'메가박스 콤보세트 무료',group:'Mastercard Platinum',sourceType:'network-plus-issuer',benefitType:'informational',categories:['movie'],browseTags:['culture','movie'],merchantInclude:['메가박스'],
      capByTier:{'40+':999999999},monthlyCountLimit:1,annualCountLimit:4,notes:['상품설명서(2022.10) 기준 마스터 콤보세트 무료, 월 1회·연 4회','일부 지점 제외','연도별 서비스 변경 가능하므로 이용 전 최신 조건 확인']}
  ]
};

if(!DEFAULT_STATE.cards.some(c=>c.id===samsungHappy.id))DEFAULT_STATE.cards.push(samsungHappy);
if(!DEFAULT_STATE.cards.some(c=>c.id===lawyers.id))DEFAULT_STATE.cards.push(lawyers);

// New cards deliberately reset at the start of each month. The family card must be re-confirmed;
// the dormant card becomes inactive unless the user explicitly activates it for that month.
try{
  const control=JSON.parse(localStorage.getItem(CONTROL_KEY)||'{}');
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw){
    const stored=JSON.parse(raw);let changed=false;
    const family=stored.cards?.find(c=>c.id==='samsung-happy-v2');
    if(family&&control.familyTierMonth!==CURRENT_MONTH&&family.selectedTier!=='inactive'){family.selectedTier='inactive';changed=true}
    const dormant=stored.cards?.find(c=>c.id==='samsung-lawyers');
    if(dormant&&control.lawyersActiveMonth!==CURRENT_MONTH&&dormant.selectedTier!=='inactive'){dormant.selectedTier='inactive';changed=true}
    if(changed)localStorage.setItem(STORAGE_KEY,JSON.stringify(stored));
  }
}catch{}

export const V12_CONTROL_KEY=CONTROL_KEY;
export const V12_CURRENT_MONTH=CURRENT_MONTH;
