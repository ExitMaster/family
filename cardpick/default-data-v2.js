export const CATEGORY_OPTIONS = [
  ['academy','학원·교육'],['kindergarten','유치원'],['study-material','학습지'],['online-lecture','인터넷강의'],
  ['supermarket','슈퍼마켓'],['hypermarket','대형마트'],['online-shopping','온라인쇼핑'],['bakery','베이커리'],['laundry','세탁소'],
  ['medical','병·의원'],['pharmacy','약국'],['animal-hospital','동물병원'],['apartment','아파트 관리비'],['telecom','통신비'],
  ['transport','교통비'],['restaurant','음식점'],['convenience','편의점'],['fuel','주유'],['delivery','배달앱'],
  ['digital','디지털콘텐츠'],['membership','멤버십'],['movie','영화'],['performance','공연'],['bookstore','서점'],['daiso','다이소'],['overseas','해외'],['other','기타']
];

export const BROWSE_TREE = [
  {id:'education',label:'교육',children:[
    {id:'academy',label:'학원',children:[{id:'general-academy',label:'일반전문학원'},{id:'exam-academy',label:'입시·보습'},{id:'language-academy',label:'외국어'},{id:'arts-academy',label:'예체능'}]},
    {id:'kindergarten',label:'유치원'},{id:'study-material',label:'학습지'},{id:'online-lecture',label:'인터넷강의'}]},
  {id:'shopping',label:'쇼핑',children:[
    {id:'online-shopping',label:'온라인쇼핑',children:[{id:'coupang',label:'쿠팡'},{id:'kurly',label:'컬리'},{id:'naver-store',label:'네이버플러스 스토어'},{id:'ssg',label:'SSG.COM'},{id:'gmarket',label:'G마켓'},{id:'auction',label:'옥션'},{id:'11st',label:'11번가'}]},
    {id:'hypermarket',label:'대형마트',children:[{id:'emart',label:'이마트'},{id:'homeplus',label:'홈플러스'},{id:'lottemart',label:'롯데마트'}]},
    {id:'ssm',label:'기업형 슈퍼',children:[{id:'emart-everyday',label:'이마트 에브리데이'},{id:'homeplus-express',label:'홈플러스 익스프레스'},{id:'lotte-super',label:'롯데슈퍼'}]},
    {id:'daily-goods',label:'생활잡화',children:[{id:'daiso',label:'다이소'}]},{id:'bookstore',label:'서점',children:[{id:'aladin',label:'알라딘'}]}]},
  {id:'living',label:'생활·공과금',children:[{id:'apartment',label:'아파트 관리비'},{id:'gas',label:'도시가스'},{id:'electricity',label:'전기요금'},{id:'telecom',label:'통신'}]},
  {id:'medical-root',label:'의료',children:[{id:'medical',label:'병·의원'},{id:'pharmacy',label:'약국'},{id:'animal-hospital',label:'동물병원'},{id:'postpartum',label:'산후조리원'}]},
  {id:'transport-root',label:'교통',children:[{id:'bus',label:'시내버스'},{id:'subway',label:'지하철'},{id:'taxi',label:'택시'}]},
  {id:'food',label:'외식',children:[{id:'restaurant',label:'음식점'},{id:'convenience',label:'편의점'},{id:'delivery',label:'배달앱'},{id:'wine-shop',label:'보틀숍'}]},
  {id:'culture',label:'문화·취미',children:[{id:'movie',label:'영화'},{id:'performance',label:'공연'},{id:'amusement',label:'유원지·놀이시설'}]},
  {id:'travel',label:'여행·공항',children:[{id:'airport',label:'공항',children:[{id:'airport-lounge',label:'라운지'},{id:'airport-valet',label:'발렛·주차대행'},{id:'airport-transfer',label:'공항 이동'},{id:'duty-free',label:'면세점'}]},{id:'hotel',label:'숙박'},{id:'rental-car',label:'렌터카'}]},
  {id:'digital-root',label:'디지털·멤버십',children:[{id:'digital',label:'디지털콘텐츠'},{id:'membership',label:'멤버십'}]},
  {id:'overseas-root',label:'해외',children:[{id:'overseas',label:'해외 가맹점·직구'}]}
];

const inactiveTier={id:'inactive',label:'혜택 미적용'};
const shinhanCommon=[
  '무이자할부(부분 무이자 포함) 거래는 할인·캐시백 제외',
  '상품권·선불전자지급수단 구매·충전, 기프트/선불카드 구매·충전 제외',
  '간편결제·키오스크에서 PG/간편결제 가맹점명으로 승인되면 일부 혜택 제외 가능',
  '취소 거래는 할인·캐시백 횟수와 한도 복원'
];
const samsungCommon=[
  '무이자할부 이용금액 제외',
  '삼성카드의 다른 결제일할인과 중복 적용되지 않으며 더 큰 할인만 적용',
  '기프트/선불카드 구매·충전 및 상품권 구매 제외',
  '자체 가맹점번호로 승인되는 일부 간편결제·키오스크 거래 제외 가능',
  '취소 시 할인 횟수·한도 복원'
];

export const DEFAULT_STATE={
  version:2,
  settings:{currentMonth:new Date().toISOString().slice(0,7),splitMinimumGain:2000},
  cards:[
    {id:'shinhan-plan-plus',issuer:'신한카드',name:'신한 Edu Plan+',network:'local',networkTier:null,confidence:'verified',source:'https://www.shinhancard.com/pconts/html/card/apply/credit/1228598_2207.html',commonRules:shinhanCommon,
      tiers:[inactiveTier,{id:'30-50',label:'30만원 이상 ~ 50만원 미만'},{id:'50-100',label:'50만원 이상 ~ 100만원 미만'},{id:'100-200',label:'100만원 이상 ~ 200만원 미만'},{id:'200+',label:'200만원 이상'}],selectedTier:'inactive',
      benefits:[
        {id:'spp-academy',name:'학원비 기본 캐시백',group:'교육',sourceType:'issuer-product',benefitType:'percentage',categories:['academy','kindergarten','study-material'],browseTags:['education','academy','general-academy','kindergarten','study-material'],rateByTier:{'30-50':.03,'50-100':.05,'100-200':.07,'200+':.10},capByTier:{'30-50':10000,'50-100':20000,'100-200':50000,'200+':90000},channel:'any',excludeInterestFree:true,nextMonthSpendTreatment:'excluded',bonusTracker:{threshold:200000,levels:[{count:3,amount:5000},{count:5,amount:10000}]},notes:['오프라인: 일반전문학원·학습지·유치원 가맹점 업종','온라인: 학원비 매출 전용 PG만 대상','온라인에서 학원비 외 매출이 함께 발생해 분리 불가하면 제외'],onlineConfirmation:['학원비 전용 PG를 통한 결제인가요?','학원비 외 다른 대금이 섞이지 않은 결제인가요?']},
        {id:'spp-hypermarket',name:'3대 할인점 1% 캐시백',group:'쇼핑',sourceType:'issuer-product',benefitType:'percentage',categories:['hypermarket'],browseTags:['shopping','hypermarket','emart','homeplus','lottemart','ssm','emart-everyday','homeplus-express','lotte-super'],rateByTier:{'50-100':.01,'100-200':.01,'200+':.01},capByTier:{'50-100':2000,'100-200':2000,'200+':2000},channel:'offline',merchantInclude:['이마트','홈플러스','롯데마트'],merchantExclude:['에브리데이','익스프레스','롯데슈퍼','트레이더스','맥스'],excludeInterestFree:true,notes:['기업형 슈퍼마켓, 창고형 할인매장, 주차장·문화센터·입점 임대매장 제외']},
        {id:'spp-medical-recurring',name:'의료·정기결제 1% 캐시백',group:'생활',sourceType:'issuer-product',benefitType:'percentage',categories:['medical','pharmacy','telecom','gas','electricity'],browseTags:['medical-root','medical','pharmacy','living','gas','electricity','telecom'],rateByTier:{'50-100':.01,'100-200':.01,'200+':.01},capByTier:{'50-100':2000,'100-200':2000,'200+':2000},sharedPool:'spp-medical-recurring',excludeInterestFree:true,notes:['병원·약국 및 도시가스·전기요금·SKT/KT/LG U+ 정기결제','아파트 관리비에 포함된 도시가스·전기요금 제외','이동통신 정기결제 외 이용, 알뜰폰·선불폰·결합상품 제외']},
        {id:'spp-megabox',name:'메가박스 온라인 예매 7천원 즉시할인',group:'문화·취미',sourceType:'issuer-product',benefitType:'fixed',categories:['movie'],browseTags:['culture','movie'],merchantInclude:['메가박스'],fixedByTier:{'50-100':7000,'100-200':7000,'200+':7000},capByTier:{'50-100':7000,'100-200':7000,'200+':7000},monthlyCountLimit:1,minAmount:7000,channel:'online',notes:['메가박스 공식 홈페이지/앱 영화 예매만 대상','현장·키오스크·매점 및 타 채널 예매 제외']}
      ]},
    {id:'shinhan-edu',issuer:'신한카드',name:'신한 Edu',network:'mastercard',networkTier:null,confidence:'verified',source:'https://www.shinhancard.com/pconts/html/card/apply/credit/1188281_2207.html',commonRules:shinhanCommon,
      tiers:[inactiveTier,{id:'50-100',label:'50만원 이상 ~ 100만원 미만'},{id:'100-150',label:'100만원 이상 ~ 150만원 미만'},{id:'150+',label:'150만원 이상'}],selectedTier:'inactive',
      benefits:[
        {id:'se-academy',name:'교육업종 캐시백',group:'교육',sourceType:'issuer-product',benefitType:'percentage',categories:['academy','kindergarten','study-material'],browseTags:['education','academy','general-academy','kindergarten','study-material'],rateByTier:{'50-100':.05,'100-150':.07,'150+':.10},capByTier:{'50-100':15000,'100-150':30000,'150+':45000},channel:'offline',nextMonthSpendTreatment:'excluded',bonusTracker:{threshold:200000,levels:[{count:2,amount:3000},{count:3,amount:4000},{count:4,amount:5000}]},notes:['일반전문학원·학습지·유치원 업종','학원 방문 결제시에만 적용']},
        {id:'se-apartment',name:'교육비 연계 아파트 관리비 5천원 캐시백',group:'생활',sourceType:'issuer-product',benefitType:'fixed',categories:['apartment'],browseTags:['living','apartment'],fixedByTier:{'50-100':5000,'100-150':5000,'150+':5000},capByTier:{'50-100':5000,'100-150':5000,'150+':5000},monthlyCountLimit:1,paymentRequired:'recurring',requiresMonthlyBenefit:'se-academy',notes:['당월 교육비 적격 결제가 있는 회원에게만 제공','아파트 관리비 자동이체']},
        {id:'se-hypermarket',name:'3대 마트 1% 캐시백',group:'쇼핑',sourceType:'issuer-product',benefitType:'percentage',categories:['hypermarket'],browseTags:['shopping','hypermarket','emart','homeplus','lottemart','ssm','emart-everyday','homeplus-express','lotte-super'],rateByTier:{'50-100':.01,'100-150':.01,'150+':.01},capByTier:{'50-100':2000,'100-150':2000,'150+':2000},channel:'offline',merchantInclude:['이마트','홈플러스','롯데마트'],merchantExclude:['에브리데이','익스프레스','롯데슈퍼'],notes:['기업형 슈퍼마켓, 온라인마트, 상품권, 주차장 제외']},
        {id:'se-medical',name:'의료 1% 캐시백',group:'의료',sourceType:'issuer-product',benefitType:'percentage',categories:['medical','pharmacy'],browseTags:['medical-root','medical','pharmacy'],rateByTier:{'50-100':.01,'100-150':.01,'150+':.01},capByTier:{'50-100':2000,'100-150':2000,'150+':2000},notes:['병원·약국 신한카드 가맹점 업종 기준']}
      ]},
    {id:'lotte-happy',issuer:'롯데카드',name:'롯데 국민행복',network:'local',networkTier:null,confidence:'verified',source:'https://www.lottecard.co.kr/app/LPCDADB_V100.lc?vtCdKndC=P10989-A10989',commonRules:['특화서비스는 하나의 통합할인한도를 공유','동일 가맹점의 다른 롯데 할인과 중복 시 큰 할인만 적용','취소 접수 후 할인한도 복원'],tiers:[inactiveTier,{id:'eligible',label:'전월 인정실적 30만원 이상'}],selectedTier:'inactive',customMonthlyPoolCap:0,recognizedSpend:0,
      benefits:[
        {id:'lotte-shopping',name:'온라인·쇼핑 5% 청구할인',group:'쇼핑',benefitType:'percentage',categories:['online-shopping'],browseTags:['shopping','online-shopping','gmarket','auction'],merchantInclude:['롯데마트','롯데홈쇼핑','G마켓','인터파크','옥션','베페','보리보리','아이맘','파스퇴르'],rateByTier:{eligible:.05},capByTier:{eligible:10000},perTxnCap:5000,monthlyCountLimit:2,sharedPool:'lotte-total'},
        {id:'lotte-kids',name:'토이저러스·키자니아 30% 청구할인',group:'키즈',benefitType:'percentage',categories:['other'],browseTags:['shopping','daily-goods','culture','amusement'],merchantInclude:['토이저러스','키자니아'],rateByTier:{eligible:.30},capByTier:{eligible:999999},sharedPool:'lotte-total'},
        {id:'lotte-medical',name:'병원·약국·산후조리원 5% 청구할인',group:'의료',benefitType:'percentage',categories:['medical','pharmacy'],browseTags:['medical-root','medical','pharmacy','postpartum'],rateByTier:{eligible:.05},capByTier:{eligible:5000},sharedPool:'lotte-total',notes:['월 매출 10만원 내','기타의료기관·비영리단체·동물병원 제외']},
        {id:'lotte-daycare',name:'어린이집·유치원 10% 청구할인',group:'교육',benefitType:'percentage',categories:['kindergarten'],browseTags:['education','kindergarten'],rateByTier:{eligible:.10},capByTier:{eligible:5000},sharedPool:'lotte-total',nextMonthSpendTreatment:'excluded',notes:['정부지원금 할인 제외','월 매출 5만원 내']},
        {id:'lotte-academy',name:'학원·학습지 10% 청구할인',group:'교육',benefitType:'percentage',categories:['academy','study-material'],browseTags:['education','academy','study-material'],rateByTier:{eligible:.10},capByTier:{eligible:10000},sharedPool:'lotte-total',monthlyCountLimit:1,channel:'offline',notes:['월 매출 10만원 내','인터넷강의·방문교육·인터넷 경로 및 별도 대행업체 온라인/모바일 결제 제외']},
        {id:'lotte-amusement',name:'유원지·놀이시설 10% 청구할인',group:'문화·취미',benefitType:'percentage',categories:['other'],browseTags:['culture','amusement'],rateByTier:{eligible:.10},capByTier:{eligible:999999},sharedPool:'lotte-total'},
        {id:'lotte-transport',name:'시내버스·지하철·택시 10% 청구할인',group:'교통',benefitType:'percentage',categories:['transport'],browseTags:['transport-root','bus','subway','taxi'],rateByTier:{eligible:.10},capByTier:{eligible:999999},sharedPool:'lotte-total',notes:['고속버스·시외버스·공항리무진 제외','버스·지하철은 다음 달 확정금액을 다음 달 통합한도에서 할인']},
        {id:'lotte-telecom',name:'이동통신요금 2천원 청구할인',group:'통신',benefitType:'fixed',categories:['telecom'],browseTags:['living','telecom'],fixedByTier:{eligible:2000},capByTier:{eligible:2000},sharedPool:'lotte-total',monthlyCountLimit:1,paymentRequired:'recurring',notes:['MVNO 자동이체 제외']},
        {id:'lotte-super',name:'롯데슈퍼 직영점 3% 청구할인',group:'쇼핑',benefitType:'percentage',categories:['supermarket'],browseTags:['shopping','ssm','lotte-super'],merchantInclude:['롯데슈퍼'],rateByTier:{eligible:.03},capByTier:{eligible:10000},minAmount:50000,channel:'offline',notes:['공통서비스로 특화서비스 통합한도와 별개']},
        {id:'lotte-culture-center',name:'롯데백화점 문화센터 정기강좌 10% 현장할인',group:'교육',benefitType:'percentage',categories:['academy'],browseTags:['education','academy'],merchantInclude:['롯데백화점 문화센터'],rateByTier:{eligible:.10},capByTier:{eligible:999999},channel:'offline',notes:['본인 기준 1인 2강좌']},
        {id:'lotte-seven-kids',name:'세븐일레븐 육아용품 10% 현장할인',group:'쇼핑',benefitType:'percentage',categories:['convenience'],browseTags:['shopping','daily-goods','food','convenience'],merchantInclude:['세븐일레븐'],rateByTier:{eligible:.10},capByTier:{eligible:30000},channel:'offline'},
        {id:'lotte-saint',name:'생어거스틴 10% 결제일할인',group:'외식',benefitType:'percentage',categories:['restaurant'],browseTags:['food','restaurant'],merchantInclude:['생어거스틴'],rateByTier:{eligible:.10},capByTier:{eligible:20000},perTxnCap:20000,notes:['일 1회, 이용금액 20만원까지','별도 지난달 20만원 실적조건은 카드 탭에서 확인 필요']},
        {id:'lotte-cinema',name:'롯데시네마 1,500원 청구할인',group:'문화·취미',benefitType:'fixed',categories:['movie'],browseTags:['culture','movie'],merchantInclude:['롯데시네마'],fixedByTier:{eligible:1500},capByTier:{eligible:7500},monthlyCountLimit:5,notes:['일 1회, 월 5회, 연 12회','별도 지난달 20만원 실적조건']}
      ]},
    {id:'samsung-select-all',issuer:'삼성카드',name:'삼성 iD SELECT ALL',network:'mastercard',networkTier:null,confidence:'verified',source:'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1875&code2=97342225601',commonRules:samsungCommon,
      tiers:[inactiveTier,{id:'40-80',label:'40만원 이상 ~ 80만원 미만'},{id:'80-120',label:'80만원 이상 ~ 120만원 미만'},{id:'120+',label:'120만원 이상'}],selectedTier:'inactive',select1Option:'apt-telecom',select2Option:'online-medical-delivery',nextSelect1Option:'apt-telecom',nextSelect2Option:'online-medical-delivery',
      benefits:[
        {id:'sam-select1-base',name:'SELECT 1: 국내 가맹점 0.7%',group:'SELECT 1',benefitType:'percentage',categories:['other','restaurant','convenience','hypermarket','online-shopping','medical','pharmacy','academy','telecom'],browseTags:['shopping','food','medical-root','education','living'],activeWhen:{field:'select1Option',value:'domestic-base'},rateByTier:{'40-80':.007,'80-120':.007,'120+':.007},capByTier:{'40-80':999999,'80-120':999999,'120+':999999},notes:['전월 이용금액과 할인한도 없이 국내 가맹점 0.7%']},
        {id:'sam-select1-apt',name:'SELECT 1: 아파트 관리비·통신 10%',group:'SELECT 1',benefitType:'percentage',categories:['apartment','telecom'],browseTags:['living','apartment','telecom'],activeWhen:{field:'select1Option',value:'apt-telecom'},rateByTier:{'40-80':.10,'80-120':.10,'120+':.10},capByTier:{'40-80':7000,'80-120':10000,'120+':15000},sharedPool:'sam-select1',nextMonthSpendTreatment:'excluded',notes:['아파트 관리비 및 대상 이동통신·인터넷·유선통신 정기결제','단말기 구매·대리점 결제 및 일부 결합/IoT 제외']},
        {id:'sam-select1-edu',name:'SELECT 1: 교육 10%',group:'SELECT 1',benefitType:'percentage',categories:['academy','study-material','online-lecture'],browseTags:['education','academy','exam-academy','language-academy','arts-academy','study-material','online-lecture'],activeWhen:{field:'select1Option',value:'education'},rateByTier:{'40-80':.10,'80-120':.10,'120+':.10},capByTier:{'40-80':7000,'80-120':10000,'120+':15000},sharedPool:'sam-select1',nextMonthSpendTreatment:'excluded',notes:['학원: 입시·보습·외국어·예체능계','지정 인터넷강의 및 학습지 대상']},
        {id:'sam-select2-a',name:'SELECT 2: 온라인쇼핑·의료·배달앱 7%',group:'SELECT 2',benefitType:'percentage',categories:['online-shopping','medical','pharmacy','animal-hospital','delivery'],browseTags:['shopping','online-shopping','coupang','kurly','naver-store','ssg','gmarket','auction','11st','medical-root','medical','pharmacy','animal-hospital','food','delivery'],activeWhen:{field:'select2Option',value:'online-medical-delivery'},rateByTier:{'40-80':.07,'80-120':.07,'120+':.07},capByTier:{'40-80':7000,'80-120':10000,'120+':15000},sharedPool:'sam-select2',nextMonthSpendTreatment:'excluded',notes:['온라인쇼핑: 쿠팡·네이버플러스 스토어·SSG.COM·G마켓·옥션·11번가·컬리·삼성카드 쇼핑','의료는 오프라인 병·의원·약국·동물병원, 요양병원·보건소 제외','배달앱은 배민·쿠팡이츠·요기요 공식 앱 결제']},
        {id:'sam-select2-b',name:'SELECT 2: 음식점·편의점·할인점·주유 7%',group:'SELECT 2',benefitType:'percentage',categories:['restaurant','convenience','hypermarket','fuel'],browseTags:['food','restaurant','convenience','shopping','hypermarket','emart','lottemart','homeplus','transport-root'],activeWhen:{field:'select2Option',value:'food-store-fuel'},rateByTier:{'40-80':.07,'80-120':.07,'120+':.07},capByTier:{'40-80':7000,'80-120':10000,'120+':15000},sharedPool:'sam-select2',nextMonthSpendTreatment:'excluded',notes:['음식점·편의점(CU, GS25, 세븐일레븐, 이마트24)·할인점·지정 주유']},
        {id:'sam-life-daiso',name:'생활 편의 5%: 다이소',group:'생활 편의',benefitType:'percentage',categories:['daiso'],browseTags:['shopping','daily-goods','daiso'],merchantInclude:['다이소'],rateByTier:{'40-80':.05,'80-120':.05,'120+':.05},capByTier:{'40-80':5000,'80-120':5000,'120+':5000},sharedPool:'sam-life',channel:'offline',notes:['백화점·할인점·쇼핑몰 임대매장 제외']},
        {id:'sam-life-performance',name:'생활 편의 5%: NOL 티켓',group:'생활 편의',benefitType:'percentage',categories:['performance'],browseTags:['culture','performance'],merchantInclude:['NOL','인터파크 티켓'],rateByTier:{'40-80':.05,'80-120':.05,'120+':.05},capByTier:{'40-80':5000,'80-120':5000,'120+':5000},sharedPool:'sam-life',channel:'online'},
        {id:'sam-life-book',name:'생활 편의 5%: 알라딘',group:'생활 편의',benefitType:'percentage',categories:['bookstore'],browseTags:['shopping','bookstore','aladin'],merchantInclude:['알라딘'],rateByTier:{'40-80':.05,'80-120':.05,'120+':.05},capByTier:{'40-80':5000,'80-120':5000,'120+':5000},sharedPool:'sam-life',channel:'offline'},
        {id:'sam-life-wine',name:'생활 편의 5%: 와인앤모어',group:'생활 편의',benefitType:'percentage',categories:['other'],browseTags:['food','wine-shop'],merchantInclude:['와인앤모어'],rateByTier:{'40-80':.05,'80-120':.05,'120+':.05},capByTier:{'40-80':5000,'80-120':5000,'120+':5000},sharedPool:'sam-life',channel:'offline'},
        {id:'sam-digital',name:'디지털콘텐츠·멤버십 정기결제 50%',group:'디지털·멤버십',benefitType:'percentage',categories:['digital','membership'],browseTags:['digital-root','digital','membership'],merchantInclude:['넷플릭스','디즈니','유튜브','티빙','쿠팡','네이버플러스'],rateByTier:{'40-80':.50,'80-120':.50,'120+':.50},capByTier:{'40-80':5000,'80-120':5000,'120+':5000},sharedPool:'sam-digital',paymentRequired:'recurring',notes:['유튜브는 YouTube Premium만','Google Play/App Store 등 인앱결제 제외']},
        {id:'sam-overseas',name:'해외 2% 결제일할인',group:'해외',benefitType:'percentage',categories:['overseas'],browseTags:['overseas-root','overseas'],networkRequired:'mastercard',rateByTier:{inactive:.02,'40-80':.02,'80-120':.02,'120+':.02},capByTier:{inactive:999999,'40-80':999999,'80-120':999999,'120+':999999},notes:['전월 이용금액·할인한도 없음','해외 가맹점 및 해외 직접구매']}
      ]}
  ],
  fixedExpenses:[
    {id:'fx-ban-seok',merchant:'반석수학',amount:350000,schedule:'월말',category:'academy',channel:'unknown',note:'현장 결제 조건 확인'},
    {id:'fx-vivaldi',merchant:'비발디음악학원',amount:210000,schedule:'월말',category:'academy',channel:'unknown',note:'카드사 학원 업종 확인 필요'},
    {id:'fx-trumpet',merchant:'트럼펫',amount:250000,schedule:'4회 수업마다',category:'academy',channel:'unknown',note:'예술교육·공연업 업종 가능성 확인'},
    {id:'fx-taekwondo',merchant:'웅비태권도',amount:210000,schedule:'매월 15일',category:'academy',channel:'unknown',note:'체육시설 또는 학원 업종 확인'},
    {id:'fx-rope',merchant:'줄넘기',amount:160000,schedule:'매월 15일',category:'academy',channel:'unknown',note:'체육시설 또는 학원 업종 확인'}
  ],
  merchantMemory:[],monthlyFlags:{},linkOffers:[],transactions:[],usage:{},monthlySnapshots:[]
};
