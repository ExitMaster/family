// 저녁 정리 — ① 인박스 확정 ② 죄책감 없는 이월 ③ 주간 아이디어 리뷰 ④ 프로필 갱신 (SPEC 4.3)
import React, { useEffect, useMemo, useState } from 'react';
import { CATEGORIES } from '../config';
import { updateEntry, migrateEntry, updateContextProfile, updateSettings, Timestamp } from '../lib/db';
import { daysLeftOf } from '../lib/dates';
import { classifyInbox, reviewIdeas } from '../lib/api';

const IDEA_ACTION_LABEL = { task: '할일로', project: '프로젝트로', discard: '폐기', hold: '보류' };

export default function Evening({ entries, projects, settings, aiEnabled, onClose }) {
  const [suggestions, setSuggestions] = useState({});
  const [ideaSuggestions, setIdeaSuggestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // 프로필 갱신 단계
  const [editingWeekly, setEditingWeekly] = useState(false);
  const [weeklyDraft, setWeeklyDraft] = useState(settings.contextProfile?.weeklyStatus || '');

  const inbox = entries.filter((e) => e.category === 'inbox' && e.status === 'open');
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 이월 대상: (a) 기한 지난 할일 + (b) 오늘 포커스 노출됐으나 미완료 (SPEC 4.3)
  const migrations = entries.filter(
    (e) =>
      e.status === 'open' &&
      e.category === 'task' &&
      ((e.dueDate && daysLeftOf(e.dueDate) < 0) ||
        (e.lastFocusedAt && e.lastFocusedAt.toDate() >= today))
  );

  const lastReview = settings.lastIdeaReviewAt?.toDate?.();
  const ideaDue = !lastReview || (Date.now() - lastReview.getTime()) / 86400000 >= 7;
  const ideas = ideaDue ? entries.filter((e) => e.category === 'idea' && e.status === 'open') : [];

  // weeklyStatus 갱신 노출 조건: null이거나 7일 초과 (SPEC 4.3 4단계)
  const wsAt = settings.contextProfile?.weeklyStatusUpdatedAt?.toDate?.();
  const showProfileStep = !wsAt || (Date.now() - wsAt.getTime()) / 86400000 >= 7;

  // 인박스 batch 분류 — 응답을 기다리지 않고 비동기로 라벨 채움 (SPEC 4.3 1단계)
  useEffect(() => {
    if (inbox.length === 0) return;
    const seeded = {};
    for (const e of inbox) if (e.suggestedCategory) seeded[e.id] = e.suggestedCategory;
    setSuggestions(seeded);
    if (!aiEnabled) return; // AI 미설정 — 수동 분류만
    const unclassified = inbox.filter((e) => !e.suggestedCategory);
    if (unclassified.length === 0) return;
    classifyInbox(unclassified, settings)
      .then(({ results }) => {
        setSuggestions((prev) => {
          const next = { ...prev };
          for (const r of results) {
            next[r.id] = r.category;
            updateEntry(r.id, { suggestedCategory: r.category });
          }
          return next;
        });
      })
      .catch((e) => setError(String(e.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmInbox(entry, category) {
    updateEntry(entry.id, { category, classifiedBy: 'manual' });
  }

  async function runIdeaReview() {
    setLoading(true);
    setError('');
    try {
      const { results } = await reviewIdeas(ideas, settings, projects);
      setIdeaSuggestions(Object.fromEntries(results.map((r) => [r.id, r])));
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }
  function applyIdea(entry, action) {
    if (action === 'discard') updateEntry(entry.id, { status: 'discarded' });
    else if (action === 'task' || action === 'project') updateEntry(entry.id, { category: action });
  }
  function finishIdeaReview() {
    // 주간 리뷰 완료 — 다음 7일간 재노출 방지
    updateSettings({ lastIdeaReviewAt: Timestamp.now() });
  }

  // 프로필 갱신 처리
  function keepWeekly() {
    updateContextProfile({ ...settings.contextProfile, weeklyStatusUpdatedAt: Timestamp.now() });
  }
  function saveWeekly() {
    updateContextProfile({
      ...settings.contextProfile,
      weeklyStatus: weeklyDraft.trim(),
      weeklyStatusUpdatedAt: Timestamp.now(),
    });
    setEditingWeekly(false);
  }

  const empty =
    inbox.length === 0 && migrations.length === 0 && ideas.length === 0 && !showProfileStep;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>저녁 정리</h2>
        <div className="sub">오늘 이만큼 적어둔 것 자체가 진전이에요. 가볍게 훑어보기만 해요.</div>
        {error && <div className="sub">{error}</div>}

        {inbox.length > 0 && (
          <div className="section">
            <h2>◇ 인박스</h2>
            {!aiEnabled && <div className="sub">직접 분류를 골라주세요 (AI 제안은 준비 중).</div>}
            {inbox.map((e) => (
              <div key={e.id} className="entry">
                <div className="content">{e.content}</div>
                <div className="meta">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      className={`chip ${suggestions[e.id] === c.key ? 'on' : ''}`}
                      onClick={() => confirmInbox(e, c.key)}
                    >
                      {c.sign} {c.label}
                      {suggestions[e.id] === c.key ? ' (제안)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {migrations.length > 0 && (
          <div className="section">
            <h2>&gt; 오늘 못 끝낸 것들</h2>
            <div className="sub">내일 하면 되죠. 어디로 보낼까요?</div>
            {migrations.map((e) => (
              <div key={e.id} className="entry">
                <div className="content">{e.content}</div>
                <div className="meta">
                  <button className="ghost" onClick={() => migrateEntry(e, 1)}>
                    &gt; 내일
                  </button>
                  <button className="ghost" onClick={() => migrateEntry(e, 7)}>
                    &gt;&gt; 다음주
                  </button>
                  <button className="ghost" onClick={() => updateEntry(e.id, { status: 'done' })}>
                    사실 끝냈어요
                  </button>
                  <button className="ghost" onClick={() => updateEntry(e.id, { status: 'discarded' })}>
                    보내주기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {ideas.length > 0 && (
          <div className="section">
            <h2>! 아이디어 리뷰 (주간)</h2>
            {aiEnabled && Object.keys(ideaSuggestions).length === 0 && (
              <button className="primary" onClick={runIdeaReview} disabled={loading}>
                {loading ? '검토 중…' : 'AI 제안 받기'}
              </button>
            )}
            {ideas.map((e) => {
              const s = ideaSuggestions[e.id];
              return (
                <div key={e.id} className="entry">
                  <div className="content">{e.content}</div>
                  {s && (
                    <div className="reason">
                      {IDEA_ACTION_LABEL[s.action]} — {s.reason}
                    </div>
                  )}
                  <div className="meta">
                    {['task', 'project', 'hold', 'discard'].map((a) => (
                      <button
                        key={a}
                        className={`chip ${s?.action === a ? 'on' : ''}`}
                        onClick={() => applyIdea(e, a)}
                      >
                        {IDEA_ACTION_LABEL[a]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            <button style={{ marginTop: 8 }} onClick={finishIdeaReview}>
              아이디어 리뷰 마침
            </button>
          </div>
        )}

        {showProfileStep && (
          <div className="section">
            <h2>이번 주 상황</h2>
            {editingWeekly ? (
              <>
                <textarea
                  rows="3"
                  value={weeklyDraft}
                  onChange={(e) => setWeeklyDraft(e.target.value)}
                />
                <div className="row">
                  <button className="primary" style={{ flex: 1 }} onClick={saveWeekly}>
                    저장
                  </button>
                  <button onClick={() => setEditingWeekly(false)}>취소</button>
                </div>
              </>
            ) : (
              <>
                <div className="entry">
                  <div className="content">
                    {settings.contextProfile?.weeklyStatus || '(아직 없음)'}
                  </div>
                </div>
                <div className="sub">이번 주 우선순위 기준이 바뀌었나요?</div>
                <div className="row">
                  <button className="primary" style={{ flex: 1 }} onClick={keepWeekly}>
                    그대로 두기
                  </button>
                  <button onClick={() => setEditingWeekly(true)}>고치기</button>
                </div>
              </>
            )}
          </div>
        )}

        {empty && <div className="sub">오늘은 정리할 게 없어요. 잘하고 있어요.</div>}
        <button style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
