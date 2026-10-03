// 한글마켓 보안 규칙 테스트 — Realtime Database Emulator에서 실행 (README 참고)
import {test, before, after, beforeEach} from 'node:test';
import fs from 'node:fs';
import {initializeTestEnvironment, assertFails, assertSucceeds} from '@firebase/rules-unit-testing';
import {ref, get, set, update, remove, runTransaction} from 'firebase/database';

const P = 'hangulMarket/products/p1';
const JPEG = 'data:image/jpeg;base64,AAAA';
const product = (owner, extra = {}) => ({
  name: '머그컵', price: 5000, priceType: 'price', quantity: 2, description: '시험 상품',
  thumb: JPEG, photoCount: 1, owner, sellerName: '판매자', sellerContact: '010',
  createdAt: 1, updatedAt: 1, sold: false, slots: {0: true, 1: true}, ...extra,
});
let env, seller, buyer, buyer2;

const reservation = (uid, slot) => ({nickname: uid, contact: '010', at: 1, slot});
const reserve = (db, uid, slot) =>
  update(ref(db, P), {[`slots/${slot}`]: uid, [`reservations/${uid}`]: reservation(uid, slot)});
const cancel = (db, uid, slot) =>
  update(ref(db, P), {[`slots/${slot}`]: true, [`reservations/${uid}`]: null});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-hangul-market',
    database: {rules: fs.readFileSync(new URL('../../firebase-rules.json', import.meta.url), 'utf8'), host: '127.0.0.1', port: 9000},
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearDatabase();
  seller = env.authenticatedContext('seller').database();
  buyer = env.authenticatedContext('buyer').database();
  buyer2 = env.authenticatedContext('buyer2').database();
  await assertSucceeds(update(ref(seller, 'hangulMarket'), {'products/p1': product('seller'), 'photos/p1': [JPEG]}));
});

test('비로그인 사용자는 읽을 수 없다', async () => {
  await assertFails(get(ref(env.unauthenticatedContext().database(), P)));
});

test('구매자는 빈 칸을 예약할 수 있다', async () => {
  await assertSucceeds(reserve(buyer, 'buyer', '0'));
});

test('같은 칸은 한 명만 예약할 수 있다', async () => {
  await assertSucceeds(reserve(buyer, 'buyer', '0'));
  await assertFails(reserve(buyer2, 'buyer2', '0'));
});

test('수량(칸 수)을 넘겨 예약할 수 없다', async () => {
  await assertSucceeds(reserve(buyer, 'buyer', '0'));
  await assertSucceeds(reserve(buyer2, 'buyer2', '1'));
  const buyer3 = env.authenticatedContext('buyer3').database();
  await assertFails(reserve(buyer3, 'buyer3', '2'));
});

test('한 사람이 같은 상품을 두 칸 예약할 수 없다', async () => {
  await assertSucceeds(reserve(buyer, 'buyer', '0'));
  await assertFails(reserve(buyer, 'buyer', '1'));
});

test('칸이나 예약 한쪽만 쓸 수 없다', async () => {
  await assertFails(set(ref(buyer, `${P}/slots/0`), 'buyer'));
  await assertFails(set(ref(buyer, `${P}/reservations/buyer`), reservation('buyer', '0')));
});

test('남의 이름으로 예약할 수 없다', async () => {
  await assertFails(update(ref(buyer, P), {'slots/0': 'buyer2', 'reservations/buyer2': reservation('buyer2', '0')}));
});

test('판매완료 상품은 예약할 수 없다', async () => {
  await assertSucceeds(update(ref(seller, P), {sold: true}));
  await assertFails(reserve(buyer, 'buyer', '0'));
});

test('자기 예약은 취소하고, 남의 예약은 취소하지 못한다', async () => {
  await assertSucceeds(reserve(buyer, 'buyer', '0'));
  await assertFails(cancel(buyer2, 'buyer', '0'));
  await assertFails(remove(ref(buyer2, `${P}/reservations/buyer`)));
  await assertSucceeds(cancel(buyer, 'buyer', '0'));
});

test('구매자는 상품을 수정·판매완료·삭제할 수 없다', async () => {
  await assertFails(update(ref(buyer, P), {name: '바꿈'}));
  await assertFails(update(ref(buyer, P), {sold: true}));
  await assertFails(remove(ref(buyer, P)));
  await assertFails(update(ref(buyer, P), {'slots/2': true}));
});

test('판매자는 트랜잭션으로 상품을 수정하고 판매완료·삭제할 수 있다', async () => {
  await assertSucceeds(reserve(buyer, 'buyer', '0'));
  await assertSucceeds(runTransaction(ref(seller, P), p => p && {...p, name: '새 이름', quantity: 3, slots: {...p.slots, 2: true}}));
  await assertSucceeds(update(ref(seller, P), {sold: true}));
  await assertSucceeds(remove(ref(seller, P)));
});

test('남의 UID로 상품을 만들 수 없다', async () => {
  await assertFails(set(ref(buyer, 'hangulMarket/products/p2'), product('seller')));
  await assertSucceeds(set(ref(buyer, 'hangulMarket/products/p2'), product('buyer')));
});

test('상품 필드 검증: 잘못된 값과 모르는 필드는 거부된다', async () => {
  const bad = [
    {name: ''}, {name: 'x'.repeat(41)}, {price: -1}, {priceType: 'free', price: 100}, {priceType: 'gift'},
    {quantity: 0}, {quantity: 100}, {quantity: 1.5}, {description: ''}, {description: 'x'.repeat(1001)},
    {thumb: 'data:text/html,hi'}, {photoCount: 6}, {sold: 'no'}, {slots: {abc: true}}, {admin: true},
  ];
  for (const extra of bad) await assertFails(set(ref(seller, 'hangulMarket/products/p3'), product('seller', extra)));
  const {thumb, ...noThumb} = product('seller');
  await assertFails(set(ref(seller, 'hangulMarket/products/p3'), noThumb));
  await assertSucceeds(set(ref(seller, 'hangulMarket/products/p3'), product('seller', {priceType: 'free', price: 0})));
});

test('예약 기록 필드 검증', async () => {
  await assertFails(update(ref(buyer, P), {'slots/0': 'buyer', 'reservations/buyer': {...reservation('buyer', '0'), contact: 'x'.repeat(31)}}));
  await assertFails(update(ref(buyer, P), {'slots/0': 'buyer', 'reservations/buyer': {...reservation('buyer', '0'), extra: 1}}));
});

test('프로필: 자기 UID에만, 길이 제한 안에서', async () => {
  await assertSucceeds(set(ref(buyer, 'hangulMarket/profiles/buyer'), {nickname: '구매자', contact: '010'}));
  await assertFails(set(ref(buyer, 'hangulMarket/profiles/seller'), {nickname: '사칭', contact: '010'}));
  await assertFails(set(ref(buyer, 'hangulMarket/profiles/buyer'), {nickname: 'x'.repeat(13), contact: '010'}));
  await assertFails(set(ref(buyer, 'hangulMarket/profiles/buyer'), {nickname: '구매자'}));
});

test('원본 사진: 판매자만 쓰고 지우며, JPEG 5장 이하', async () => {
  await assertFails(set(ref(buyer, 'hangulMarket/photos/p1'), [JPEG]));
  await assertFails(remove(ref(buyer, 'hangulMarket/photos/p1')));
  await assertFails(set(ref(seller, 'hangulMarket/photos/p1'), Array(6).fill(JPEG)));
  await assertFails(set(ref(seller, 'hangulMarket/photos/p1'), ['data:text/html,hi']));
  await assertFails(set(ref(seller, 'hangulMarket/photos/p1'), [JPEG + 'A'.repeat(400000)]));
  await assertSucceeds(set(ref(seller, 'hangulMarket/photos/p1'), Array(5).fill(JPEG)));
  await assertSucceeds(update(ref(seller, 'hangulMarket'), {'products/p1': null, 'photos/p1': null}));
});

test('남의 상품 번호로 사진을 미리 올려둘 수 없다', async () => {
  await assertFails(set(ref(buyer, 'hangulMarket/photos/p9'), [JPEG]));
});
