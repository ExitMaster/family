// 정리 화면 — 카테고리 필터 / 클라이언트 검색 / "정리하기" 우선순위 재계산 (SPEC 4.2)
import React, { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_MAP, INBOX, SKIP_LIMIT, MIGRATION_LIMIT } from '../config';
import { updateEntry } from '../lib/db';
import { prioritize } from '../lib/api';

const FILTERS = [{ key: 'all', label: '전체' }, ...CATEGORIES, INBOX, { key: 'done', label: '완료' }];

function fmtDue(ts) {
  if (!ts) return null;
  const d = ts.toDate();
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Organize({ entries, projects, onOpenEvening, onOpenSettings }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const list = useMemo(() => {
    let l = entries.filter((e) => e.status !== 'discarded' && e.status !== 'archived');
    if (filter === 'done') l = l.filter((e) => e.status === 'done');
    else {
      l = l.filter((e) => e.status === 'open');
      if (filter !== 'all') l = l.filter((e) => e.category === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      l = l.filter(
        (e) =>
          e.content.toLowerCase().includes(q) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    // 우선순위 있는 항목 우선, 나머지는 최신순 (구독 쿼리가 최신순)
    return [...l].sort((a, b) => (a.priority ?? 9999) - (b.priority ?? 9999));
  }, [entries, filter, search]);

  const inboxCount = entries.filter((e) => e.category === 'inbox' && e.status === 'open').length;

  // "정리하기" — 미완료 항목 전체를 AI로 재정렬 (버튼 클릭 시에만 호출)
  async function organize() {
    setBusy(true);
    setError('');
    try {
      const open = entries.filter(
        (e) => e.status === 'open' && ['task', 'project', 'idea'].includes(e.category)
      );
      if (open.length === 0) return;
      const { results } = await prioritize(open);
      await Promise.all(
        results.map((r) =>
          updateEntry(r.id, {
            priority: r.priority ?? null,
            priorityReason: r.reason ?? null,
          })
        )
      );
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="row spread">
        <input
          style={{ flex: 1 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색"
        />
        <button className="ghost" onClick={onOpenSettings}>
          설정
        </button>
      </div>

      <div className="filters" style={{ marginTop: 10 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? 'on' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'inbox' && inboxCount > 0 ? ` ${inboxCount}` : ''}
          </button>
        ))}
      </div>

      <div className="row" style={{ margin: '10px 0' }}>
        <button className="primary" style={{ flex: 1 }} onClick={organize} disabled={busy}>
          {busy ? '정리 중…' : '정리하기 (우선순위 재계산)'}
        </button>
        {inboxCount > 0 && <button onClick={onOpenEvening}>인박스 정리</button>}
      </div>
      {error && <div className="sub">{error}</div>}

      {list.map((e) => {
        const cat = CATEGORY_MAP[e.category] || INBOX;
        const needsAttention =
          (e.skipCount || 0) >= SKIP_LIMIT || (e.migratedCount || 0) > MIGRATION_LIMIT;
        return (
          <div key={e.id} className={`entry ${e.status === 'done' ? 'done' : ''}`}>
            <div className="content">
              <span className="sign">{cat.sign}</span>
              {e.content}
            </div>
            {e.priorityReason && <div className="reason">{e.priorityReason}</div>}
            <div className="meta">
              {e.priority != null && <span>#{e.priority}</span>}
              {e.dueDate && <span>~{fmtDue(e.dueDate)}</span>}
              {(e.tags || []).map((t) => (
                <span key={t}>{t}</span>
              ))}
              {(e.migratedCount || 0) > 0 && <span>{'>'.repeat(Math.min(e.migratedCount, 3))}</span>}
              {needsAttention && <span>쪼개거나 보내줄까요?</span>}
              {e.status === 'open' ? (
                <>
                  <button
                    className="ghost"
                    onClick={() => updateEntry(e.id, { pinned: !e.pinned })}
                  >
                    {e.pinned ? '고정됨 ◉' : '고정'}
                  </button>
                  <button className="ghost" onClick={() => updateEntry(e.id, { status: 'done' })}>
                    완료
                  </button>
                  <button
                    className="ghost"
                    onClick={() => updateEntry(e.id, { status: 'discarded' })}
                  >
                    폐기
                  </button>
                </>
              ) : (
                <button className="ghost" onClick={() => updateEntry(e.id, { status: 'open' })}>
                  되돌리기
                </button>
              )}
            </div>
          </div>
        );
      })}
      {list.length === 0 && <div className="sub" style={{ marginTop: 24 }}>비어 있어요.</div>}
    </div>
  );
}
