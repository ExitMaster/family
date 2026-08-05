const won = n => Math.max(0, Math.round(Number(n) || 0));

export function monthKey(date = new Date()) {
  return typeof date === 'string' ? date.slice(0, 7) : date.toISOString().slice(0, 7);
}

export function usageKey(month, cardId, bucket) {
  return `${month}:${cardId}:${bucket}`;
}

export function getBenefitUsed(state, card, benefit, month = state.settings.currentMonth) {
  return won(state.usage[usageKey(month, card.id, benefit.id)]?.amount);
}

export function getPoolUsed(state, card, benefit, month = state.settings.currentMonth) {
  if (!benefit.sharedPool) return getBenefitUsed(state, card, benefit, month);
  return won(state.usage[usageKey(month, card.id, benefit.sharedPool)]?.amount);
}

export function getCount(state, card, benefit, month = state.settings.currentMonth) {
  return won(state.usage[usageKey(month, card.id, benefit.id)]?.count);
}

function valueForTier(map, tier) { return map?.[tier] ?? 0; }

function individualCap(benefit, tier) {
  return won(valueForTier(benefit.capByTier, tier));
}

function sharedPoolCap(state, card, benefit, tier) {
  if (!benefit.sharedPool) return individualCap(benefit, tier);
  if (card.id === 'lotte-happy' && benefit.sharedPool === 'lotte-total') return won(card.customMonthlyPoolCap);
  return individualCap(benefit, tier);
}

function merchantMatches(benefit, merchant) {
  const name = (merchant || '').toLowerCase();
  if (benefit.merchantInclude?.length && !benefit.merchantInclude.some(k => name.includes(k.toLowerCase()))) return false;
  if (benefit.merchantExclude?.some(k => name.includes(k.toLowerCase()))) return false;
  return true;
}

function activeByCardOption(card, benefit) {
  if (!benefit.activeWhen) return true;
  return card[benefit.activeWhen.field] === benefit.activeWhen.value;
}

function baseDiscount(benefit, tier, amount) {
  const rate = Number(valueForTier(benefit.rateByTier, tier));
  const fixed = won(valueForTier(benefit.fixedByTier, tier));
  const calculated = fixed || amount * rate;
  return benefit.perTxnCap ? Math.min(calculated, benefit.perTxnCap) : calculated;
}

export function evaluateBenefit(state, card, benefit, input, options = {}) {
  const tier = card.selectedTier;
  const warnings = [];
  const blockers = [];
  if (!tier || tier === 'inactive') blockers.push('이번 달 혜택 미적용');
  if (!activeByCardOption(card, benefit)) blockers.push('현재 선택 옵션과 다름');
  if (!benefit.categories.includes(input.category)) blockers.push('대상 업종 아님');
  if (!merchantMatches(benefit, input.merchant)) blockers.push('대상 가맹점 조건 불충족');
  if (input.amount < (benefit.minAmount || 0)) blockers.push(`최소 결제금액 ${won(benefit.minAmount).toLocaleString()}원 미달`);
  if (benefit.excludeInterestFree && input.paymentMethod === 'interest-free') blockers.push('무이자할부 제외');

  if (benefit.channel === 'offline') {
    if (input.channel === 'online') blockers.push('오프라인 결제 전용');
    else if (input.channel === 'unknown') warnings.push('오프라인 현장결제로 결제해야 합니다.');
  }
  if (benefit.channel === 'online') {
    if (input.channel === 'offline') blockers.push('온라인 결제 전용');
    else if (input.channel === 'unknown') warnings.push('온라인으로 결제해야 합니다.');
  }
  if (benefit.categoryWarning) warnings.push(benefit.categoryWarning);
  if (input.channel === 'online' && benefit.onlineWarning) warnings.push(benefit.onlineWarning);
  if (benefit.paymentWarning) warnings.push(benefit.paymentWarning);
  if (card.confidence === 'review' && card.reviewNote) warnings.push(card.reviewNote);

  const cap = individualCap(benefit, tier);
  const used = getBenefitUsed(state, card, benefit);
  const poolCap = sharedPoolCap(state, card, benefit, tier);
  const poolUsed = getPoolUsed(state, card, benefit);
  const individualRemaining = Math.max(0, cap - used);
  const poolRemaining = Math.max(0, poolCap - poolUsed);
  const remaining = Math.min(individualRemaining, poolRemaining);
  const count = getCount(state, card, benefit);
  if (benefit.monthlyCountLimit && count >= benefit.monthlyCountLimit) blockers.push('월 이용횟수 소진');
  if (cap <= 0 || poolCap <= 0) blockers.push('적용 한도 없음');
  if (remaining <= 0) blockers.push('월 할인한도 소진');

  let discount = Math.min(won(baseDiscount(benefit, tier, input.amount)), remaining);
  if (blockers.length) discount = 0;

  return {
    cardId: card.id, cardName: card.name, benefitId: benefit.id, benefitName: benefit.name,
    amount: won(input.amount), discount, cap, used, remaining, poolCap, poolUsed, poolRemaining, warnings: [...new Set(warnings)], blockers,
    rate: Number(valueForTier(benefit.rateByTier, tier)), count, monthlyCountLimit: benefit.monthlyCountLimit || null,
    bonusEligible: benefit.bonusTracker && input.amount >= benefit.bonusTracker.threshold,
    bonusTracker: benefit.bonusTracker || null,
    sharedPool: benefit.sharedPool || null,
    source: card.source
  };
}

export function getCandidates(state, input, { includeBlocked = false } = {}) {
  const out = [];
  for (const card of state.cards) {
    for (const benefit of card.benefits) {
      const result = evaluateBenefit(state, card, benefit, input);
      if (includeBlocked || result.discount > 0) out.push(result);
    }
  }
  return out.sort((a, b) => b.discount - a.discount || a.warnings.length - b.warnings.length);
}

function splitBreakpoints(amount, a, b) {
  const points = new Set([0, amount]);
  for (const x of [a, b]) {
    if (!x) continue;
    if (x.rate > 0) {
      const effectiveCap = Math.min(x.remaining, x.cap);
      points.add(Math.ceil(effectiveCap / x.rate));
      points.add(amount - Math.ceil(effectiveCap / x.rate));
    }
  }
  for (let p = 10000; p < amount; p += 10000) points.add(p);
  return [...points].filter(p => p >= 0 && p <= amount).map(won);
}

export function recommend(state, input) {
  const singles = getCandidates(state, input);
  const bestSingle = singles[0] || null;
  let bestSplit = null;
  if (input.amount >= 20000 && singles.length >= 2) {
    for (let i = 0; i < singles.length; i++) {
      for (let j = i + 1; j < singles.length; j++) {
        const aBase = singles[i], bBase = singles[j];
        if (aBase.cardId === bBase.cardId) continue;
        const cardA = state.cards.find(c => c.id === aBase.cardId);
        const cardB = state.cards.find(c => c.id === bBase.cardId);
        const benefitA = cardA.benefits.find(b => b.id === aBase.benefitId);
        const benefitB = cardB.benefits.find(b => b.id === bBase.benefitId);
        for (const partA of splitBreakpoints(input.amount, aBase, bBase)) {
          const partB = input.amount - partA;
          if (partA <= 0 || partB <= 0) continue;
          const eva = evaluateBenefit(state, cardA, benefitA, { ...input, amount: partA });
          const evb = evaluateBenefit(state, cardB, benefitB, { ...input, amount: partB });
          const total = eva.discount + evb.discount;
          if (!bestSplit || total > bestSplit.discount) bestSplit = { discount: total, legs: [eva, evb], gain: total - (bestSingle?.discount || 0) };
        }
      }
    }
  }
  if (bestSplit && bestSplit.gain < (state.settings.splitMinimumGain || 0)) bestSplit = null;
  return { bestSingle, alternatives: singles.slice(1, 4), bestSplit, all: singles };
}

export function matchingLinks(state, input) {
  const now = new Date().toISOString().slice(0, 10);
  return state.linkOffers.filter(link => {
    if (link.used || link.status === 'expired') return false;
    if (link.endDate && link.endDate < now) return false;
    const keyword = (link.merchant || '').trim().toLowerCase();
    const merchantMatch = keyword && input.merchant.toLowerCase().includes(keyword);
    const categoryMatch = link.category && link.category === input.category;
    return (merchantMatch || categoryMatch) && input.amount >= (link.minAmount || 0);
  });
}

export function applyTransaction(state, leg, input, extra = {}) {
  const card = state.cards.find(c => c.id === leg.cardId);
  const benefit = card.benefits.find(b => b.id === leg.benefitId);
  const month = state.settings.currentMonth;
  const bucket = benefit.sharedPool || benefit.id;
  const benefitKey = usageKey(month, card.id, benefit.id);
  state.usage[benefitKey] ||= { amount: 0, count: 0, bonusCount: 0 };
  state.usage[benefitKey].amount = won(state.usage[benefitKey].amount + leg.discount);
  if (benefit.sharedPool) {
    const poolKey = usageKey(month, card.id, bucket);
    state.usage[poolKey] ||= { amount: 0, count: 0 };
    state.usage[poolKey].amount = won(state.usage[poolKey].amount + leg.discount);
  }
  state.usage[benefitKey].count = won(state.usage[benefitKey].count + 1);
  if (benefit.bonusTracker && leg.amount >= benefit.bonusTracker.threshold) state.usage[benefitKey].bonusCount = won((state.usage[benefitKey].bonusCount || 0) + 1);
  state.transactions.unshift({
    id: crypto.randomUUID(), date: new Date().toISOString(), month, merchant: input.merchant, category: input.category,
    channel: input.channel, paymentMethod: input.paymentMethod, amount: leg.amount, cardId: leg.cardId, benefitId: leg.benefitId,
    expectedDiscount: leg.discount, warnings: leg.warnings, ...extra
  });
}

export function reverseTransaction(state, tx) {
  const card = state.cards.find(c => c.id === tx.cardId);
  const benefit = card?.benefits.find(b => b.id === tx.benefitId);
  if (!card || !benefit) return;
  const benefitKey = usageKey(tx.month, card.id, benefit.id);
  if (state.usage[benefitKey]) {
    state.usage[benefitKey].amount = Math.max(0, won(state.usage[benefitKey].amount - tx.expectedDiscount));
    state.usage[benefitKey].count = Math.max(0, won(state.usage[benefitKey].count - 1));
    if (benefit.bonusTracker && tx.amount >= benefit.bonusTracker.threshold) state.usage[benefitKey].bonusCount = Math.max(0, won((state.usage[benefitKey].bonusCount || 0) - 1));
  }
  if (benefit.sharedPool) {
    const poolKey = usageKey(tx.month, card.id, benefit.sharedPool);
    if (state.usage[poolKey]) state.usage[poolKey].amount = Math.max(0, won(state.usage[poolKey].amount - tx.expectedDiscount));
  }
}

export function benefitSummary(state, card, benefit) {
  const tier = card.selectedTier;
  const cap = individualCap(benefit, tier);
  const used = getBenefitUsed(state, card, benefit);
  const poolCap = sharedPoolCap(state, card, benefit, tier);
  const poolUsed = getPoolUsed(state, card, benefit);
  const benefitKey = usageKey(state.settings.currentMonth, card.id, benefit.id);
  return { cap, used, poolCap, poolUsed, remaining: Math.min(Math.max(0, cap - used), Math.max(0, poolCap - poolUsed)), count: state.usage[benefitKey]?.count || 0, bonusCount: state.usage[benefitKey]?.bonusCount || 0 };
}
