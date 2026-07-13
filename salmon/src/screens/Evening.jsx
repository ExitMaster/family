// 저녁 정리 — 통합 리뷰: ① 인박스 확정 ② 죄책감 없는 이월 ③ 주간 아이디어 리뷰 (SPEC 4.3)
import React, { useEffect, useMemo, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { CATEGORIES, CATEGORY_MAP } from '../config';
import { updateEntry, migrateEntry, updateSettings } from '../lib/db';
import { classifyInbox, reviewIdeas } from '../lib/api';

const IDEA_ACTION_LABEL = {
  task: '할일로',
  project: '프로젝트로',
  discard: '폐기',
  hold: '보류',
};

export default function Evening({ entries, settings, onClose }) {
  const [suggestions, setSuggestions] = useState({}); // id → category
  const [ideaSuggestions, setIdeaSuggestions] = useState({}); // id → {action, reason}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inbox = entries.filter((e) => e.category === 'inbox' && e.status === 'open');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 이월 대상: (a) 기한 지난 할일 + (b) 오늘 포커스에 노출됐으나 미완료 (SPEC 4.3)
  const migrations = entries.filter(
    (e) =>
      e.status === 'open' &&
      e.category === 'task' &&
      ((e.dueDate && e.dueDate.toDate() < today) ||
        (e.lastFocusedAt && e.lastFocusedAt.toDate() >= today))
  );

  const lastReview = settings.lastIdeaReviewAt?.toDate?.();
  const ideaDue = !lastReview || (Date.now() - lastReview.getTime()) / 86400000 >= 7;
  const ideas = ideaDue ? entries.filter((e) => e.category === 'idea' && e.status === 'open') : [];

  // 진입 시 인박스 일괄 분류 제안 — batch 1회 호출 (SPEC 2)
  useEffect(() => {
    if (inbox.length === 0) return;
    const unclassified = inbox.filter((e) => !e.suggestedCategory);
    if (unclassified.length === 0) {
      setSuggestions(Object.fromEntries(inbox.map((e) => [e.id, e.suggestedCategory])));
      return;
    }
    setLoading(true);
    classifyInbox(unclassified)
      .then(({ results }) => {
        const map = {};
        for (const r of results) {
          map[r.id] = r.category;
          updateEntry(r.id, { suggestedCategory: r.category });
        }
        for (const e of inbox) if (e.suggestedCategory) map[e.id] = e.suggestedCategory;
        setSuggestions(map);
      })
      .catch((e) => setError(String(e.message || e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmInbox(entry, category) {
    updateEntry(entry.id, { category, classifiedBy: 'manual' });
  }

  async function runIdeaReview() {
    setLoading(true);
    setError('');
    try {
      const { results } = await reviewIdeas(ideas);
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
    // hold는 그대로 둠
  }

  function finishIdeaReview() {
    updateSettings({ lastIdeaReviewAt: Timestamp.now() });
    onClose();
  }

  const empty = inbox.length === 0 && migrations.length === 0 && ideas.length === 0;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>저녁 정리</h2>
        <div className="sub">
          오늘 이만큼 적어둔 것 자체가 진전이에요. 가볍게 훑어보기만 해요.
        </div>
        {error && <div className="sub">{error}</div>}

        {inbox.length > 0 && (
          <div className="section">
            <h2>◇ 인박스 {loading && '(분류 제안 준비 중…)'}</h2>
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
                  <button
                    className="ghost"
                    onClick={() => updateEntry(e.id, { status: 'discarded' })}
                  >
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
            {Object.keys(ideaSuggestions).length === 0 ? (
              <button className="primary" onClick={runIdeaReview} disabled={loading}>
                {loading ? '검토 중…' : 'AI 제안 받기'}
              </button>
            ) : null}
            {ideas.map((e) => {
              const s = ideaSuggestions[e.id];
              return (
                <div key={e.id} className="entry">
                  <div className="content">{e.content}</div>
                  {s && <div className="reason">{IDEA_ACTION_LABEL[s.action]} — {s.reason}</div>}
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

        {empty && <div className="sub">오늘은 정리할 게 없어요. 잘하고 있어요.</div>}
        <button style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
