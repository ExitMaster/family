export const CATEGORY_OPTIONS = [
  ['academy', '학원·교육'], ['supermarket', '슈퍼마켓'], ['hypermarket', '대형마트'],
  ['online-shopping', '온라인쇼핑'], ['bakery', '베이커리'], ['laundry', '세탁소'],
  ['medical', '병·의원'], ['pharmacy', '약국'], ['daiso', '다이소'],
  ['telecom', '통신비'], ['transport', '교통비'], ['restaurant', '음식점'],
  ['convenience', '편의점'], ['fuel', '주유'], ['delivery', '배달앱'], ['other', '기타']
];

const inactiveTier = { id: 'inactive', label: '혜택 미적용' };

export const DEFAULT_STATE = {
  version: 1,
  settings: {
    currentMonth: new Date().toISOString().slice(0, 7),
    splitMinimumGain: 2000,
    samsungSelect2Option: 'online-medical-delivery'
  },
  cards: [
    {
      id: 'shinhan-plan-plus', issuer: '신한카드', name: '신한 Edu Plan+', confidence: 'verified',
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1228598_2207.html',
      tiers: [inactiveTier,
        { id: '30-50', label: '30만원 이상 ~ 50만원 미만' },
        { id: '50-100', label: '50만원 이상 ~ 100만원 미만' },
        { id: '100-200', label: '100만원 이상 ~ 200만원 미만' },
        { id: '200+', label: '200만원 이상' }
      ],
      selectedTier: 'inactive',
      benefits: [
        {
          id: 'spp-academy', name: '학원비 기본 캐시백', categories: ['academy'], rateByTier: { '30-50': .03, '50-100': .05, '100-200': .07, '200+': .10 },
          capByTier: { '30-50': 10000, '50-100': 20000, '100-200': 50000, '200+': 90000 },
          channel: 'any', monthlyCountLimit: null, perTxnCap: null, minAmount: 0, excludeInterestFree: true,
          categoryWarning: '신한카드 가맹점 업종이 일반전문학원·학습지·유치원이어야 합니다.',
          onlineWarning: '온라인은 학원비 매출 전용 PG로 승인되는 거래만 적용될 수 있습니다.',
          paymentWarning: '간편결제·키오스크에서 가맹점명이 PG 또는 간편결제명으로 표시되면 제외될 수 있습니다.',
          bonusTracker: { threshold: 200000, levels: [{ count: 3, amount: 5000 }, { count: 5, amount: 10000 }] }
        },
        {
          id: 'spp-hypermarket', name: '3대 할인점 1%', categories: ['hypermarket'], rateByTier: { '50-100': .01, '100-200': .01, '200+': .01 },
          capByTier: { '50-100': 2000, '100-200': 2000, '200+': 2000 }, channel: 'offline', excludeInterestFree: true,
          merchantInclude: ['이마트', '홈플러스', '롯데마트'], merchantExclude: ['에브리데이', '익스프레스', '롯데슈퍼', '트레이더스', '맥스'],
          categoryWarning: '대형마트 본 매장만 대상이며 기업형 슈퍼마켓과 입점 임대매장은 제외됩니다.'
        },
        {
          id: 'spp-medical-recurring', name: '의료·정기결제 1%', categories: ['medical', 'pharmacy', 'telecom'], rateByTier: { '50-100': .01, '100-200': .01, '200+': .01 },
          capByTier: { '50-100': 2000, '100-200': 2000, '200+': 2000 }, sharedPool: 'spp-medical-recurring', channel: 'any', excludeInterestFree: true,
          categoryWarning: '병원·약국은 카드사 업종 기준이며 통신은 SKT·KT·LG U+ 정기결제만 대상입니다.'
        }
      ]
    },
    {
      id: 'shinhan-edu', issuer: '신한카드', name: '신한 Edu', confidence: 'verified',
      source: 'https://www.shinhancard.com/pconts/html/card/apply/credit/1188281_2207.html',
      tiers: [inactiveTier,
        { id: '50-100', label: '50만원 이상 ~ 100만원 미만' },
        { id: '100-150', label: '100만원 이상 ~ 150만원 미만' },
        { id: '150+', label: '150만원 이상' }
      ],
      selectedTier: 'inactive',
      benefits: [
        {
          id: 'se-academy', name: '교육업종 캐시백', categories: ['academy'], rateByTier: { '50-100': .05, '100-150': .07, '150+': .10 },
          capByTier: { '50-100': 15000, '100-150': 30000, '150+': 45000 }, channel: 'offline', minAmount: 0,
          categoryWarning: '신한카드 가맹점 업종이 일반전문학원·학습지·유치원이어야 합니다.',
          paymentWarning: '학원 방문 결제시에만 적용됩니다.',
          bonusTracker: { threshold: 200000, levels: [{ count: 2, amount: 3000 }, { count: 3, amount: 4000 }, { count: 4, amount: 5000 }] }
        },
        {
          id: 'se-hypermarket', name: '3대 마트 1%', categories: ['hypermarket'], rateByTier: { '50-100': .01, '100-150': .01, '150+': .01 },
          capByTier: { '50-100': 2000, '100-150': 2000, '150+': 2000 }, channel: 'offline',
          merchantInclude: ['이마트', '홈플러스', '롯데마트'], merchantExclude: ['에브리데이', '익스프레스', '롯데슈퍼'],
          categoryWarning: '기업형 슈퍼마켓과 온라인 마트는 제외됩니다.'
        },
        {
          id: 'se-medical', name: '의료 1%', categories: ['medical', 'pharmacy'], rateByTier: { '50-100': .01, '100-150': .01, '150+': .01 },
          capByTier: { '50-100': 2000, '100-150': 2000, '150+': 2000 }, channel: 'any',
          categoryWarning: '병원·약국은 신한카드 가맹점 업종 기준입니다.'
        }
      ]
    },
    {
      id: 'lotte-happy', issuer: '롯데카드', name: '롯데 국민행복', confidence: 'user-confirmed',
      source: 'https://www.card-gorilla.com/card/detail/455',
      tiers: [inactiveTier, { id: 'eligible', label: '전월 실적 충족' }], selectedTier: 'inactive',
      customMonthlyPoolCap: 0,
      benefits: [
        {
          id: 'lotte-academy', name: '학원 10%', categories: ['academy'], rateByTier: { eligible: .10 }, capByTier: { eligible: 10000 },
          sharedPool: 'lotte-total', monthlyCountLimit: 1, channel: 'offline', categoryWarning: '롯데카드 업종코드상 학원·학습지 등 대상 업종이어야 합니다.',
          paymentWarning: '온라인·모바일 결제는 제외될 수 있습니다.'
        },
        { id: 'lotte-medical', name: '병원·약국 5%', categories: ['medical', 'pharmacy'], rateByTier: { eligible: .05 }, capByTier: { eligible: 5000 }, sharedPool: 'lotte-total', channel: 'any', categoryWarning: '롯데카드 업종코드 기준입니다.' },
        { id: 'lotte-super', name: '롯데슈퍼 3%', categories: ['supermarket'], merchantInclude: ['롯데슈퍼'], rateByTier: { eligible: .03 }, capByTier: { eligible: 10000 }, sharedPool: 'lotte-total', minAmount: 50000, channel: 'offline', categoryWarning: '롯데슈퍼 직영점 여부를 확인하세요.' },
        { id: 'lotte-transport', name: '교통 10%', categories: ['transport'], rateByTier: { eligible: .10 }, capByTier: { eligible: 999999 }, sharedPool: 'lotte-total', channel: 'any' },
        { id: 'lotte-telecom', name: '통신 2천원', categories: ['telecom'], fixedByTier: { eligible: 2000 }, capByTier: { eligible: 2000 }, sharedPool: 'lotte-total', channel: 'any', categoryWarning: '자동이체 등 카드 상품의 세부 조건을 확인하세요.' }
      ]
    },
    {
      id: 'samsung-select-all', issuer: '삼성카드', name: '삼성 iD SELECT ALL', confidence: 'review',
      source: 'https://www.samsungcard.com/home/card/cardinfo/PGHPPCCCardCardinfoDetails001?code=AAP1875',
      tiers: [inactiveTier, { id: '40-80', label: '40만원 이상 ~ 80만원 미만' }, { id: '80-120', label: '80만원 이상 ~ 120만원 미만' }, { id: '120+', label: '120만원 이상' }],
      selectedTier: 'inactive',
      select2Option: 'online-medical-delivery',
      benefits: [
        {
          id: 'sam-select2-a', name: 'SELECT 2: 온라인쇼핑·의료·배달 7%', categories: ['online-shopping', 'medical', 'pharmacy', 'delivery'],
          activeWhen: { field: 'select2Option', value: 'online-medical-delivery' }, rateByTier: { '40-80': .07, '80-120': .07, '120+': .07 },
          capByTier: { '40-80': 7000, '80-120': 10000, '120+': 15000 }, sharedPool: 'sam-select2', channel: 'any', excludeInterestFree: true,
          categoryWarning: '삼성카드 대상 가맹점·업종과 실제 선택 옵션을 확인하세요.'
        },
        {
          id: 'sam-select2-b', name: 'SELECT 2: 음식점·편의점·할인점·주유 7%', categories: ['restaurant', 'convenience', 'hypermarket', 'fuel'],
          activeWhen: { field: 'select2Option', value: 'food-store-fuel' }, rateByTier: { '40-80': .07, '80-120': .07, '120+': .07 },
          capByTier: { '40-80': 7000, '80-120': 10000, '120+': 15000 }, sharedPool: 'sam-select2', channel: 'any', excludeInterestFree: true,
          categoryWarning: '삼성카드 대상 가맹점·업종과 실제 선택 옵션을 확인하세요.'
        },
        {
          id: 'sam-daiso', name: '다이소 등 생활편의 5%', categories: ['daiso'], merchantInclude: ['다이소'], rateByTier: { '40-80': .05, '80-120': .05, '120+': .05 },
          capByTier: { '40-80': 5000, '80-120': 5000, '120+': 5000 }, sharedPool: 'sam-basic-life', channel: 'any', excludeInterestFree: true,
          categoryWarning: '기본 서비스의 정확한 월 한도는 카드 앱에서 확인 후 보정하세요.'
        }
      ],
      reviewNote: 'SELECT 서비스 2 옵션과 구간별 한도는 카드 앱의 내 카드 혜택 화면으로 최종 확인하세요.'
    }
  ],
  fixedExpenses: [
    { id: 'fx-ban-seok', merchant: '반석수학', amount: 350000, schedule: '월말', category: 'academy', channel: 'unknown', note: '현장 결제 조건 확인' },
    { id: 'fx-vivaldi', merchant: '비발디음악학원', amount: 210000, schedule: '월말', category: 'academy', channel: 'unknown', note: '카드사 학원 업종 확인 필요' },
    { id: 'fx-trumpet', merchant: '트럼펫', amount: 250000, schedule: '4회 수업마다', category: 'academy', channel: 'unknown', note: '예술교육·공연업 업종 가능성 확인' },
    { id: 'fx-taekwondo', merchant: '웅비태권도', amount: 210000, schedule: '매월 15일', category: 'academy', channel: 'unknown', note: '체육시설 또는 학원 업종 확인' },
    { id: 'fx-rope', merchant: '줄넘기', amount: 160000, schedule: '매월 15일', category: 'academy', channel: 'unknown', note: '체육시설 또는 학원 업종 확인' }
  ],
  merchantMemory: [],
  linkOffers: [],
  transactions: [],
  usage: {},
  monthlySnapshots: []
};
