// 정리 화면 — 필터/검색 + 표시 시점 오버레이 + "정리하기" 하이브리드 엔진 (SPEC 4.2)
import React, { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_MAP, INBOX, SKIP_LIMIT, MIGRATION_LIMIT } from '../config';
import { updateEntry, loadArchived } from '../lib/db';
import { orderByOverlay } from '../lib/dates';
import { prioritize } from '../lib/api';
import ProjectDetail from './ProjectDetail';

const FILTERS = [{ key: 'all', label: '전체' }, ...CATEGORIES, INBOX];

function fmtDue(ts) {
  if (!ts) return null;
  const d = ts.toDate();
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 필터별 정렬 (SPEC 4.2). 할일은 표시 시점 오버레이, 그 외는 카테고리 관례.
function sortFor(filter, items, deepWorkSchedule) {
  const byNew = (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
  const byOld = (a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0);
  const byPrioDue = (a, b) => {
    const pa = a.priority ?? 9999;
    const pb = b.priority ?? 9999;
    if (pa !== pb) return pa - pb;
    const da = a.dueDate?.toMillis?.() ?? Infinity;
    const db_ = b.dueDate?.toMillis?.() ?? Infinity;
    return da - db_;
  };
  if (filter === 'task') return orderByOverlay(items, { deepWorkSchedule });
  if (filter === 'project') return [...items].sort(byPrioDue);
  if (filter === 'shopping') return [...items].sort(byOld);
  if (filter === 'idea' || filter === 'note' || filter === 'inbox')
    return [...items].sort(byNew);
  // all: 할일 대기열 우선(오버레이) → 프로젝트 → 나머지 최신
  const tasks = orderByOverlay(items.filter((e) => e.category === 'task'), { deepWorkSchedule });
  const projects = items.filter((e) => e.category === 'project').sort(byPrioDue);
  const rest = items
    .filter((e) => !['task', 'project'].includes(e.category))
    .sort(byNew);
  return [...tasks, ...projects, ...rest];
}

export default function Organize({ entries, projects, settings, aiEnabled, onOpenEvening, onOpenSettings }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [openProject, setOpenProject] = useState(null);
  // 완료/보관 토글 (SPEC 4.2 로드 범위) — 기본 off, 페이지네이션 로드
  const [showArchived, setShowArchived] = useState(false);
  const [archived, setArchived] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [archDone, setArchDone] = useState(false);
  const [loadingArch, setLoadingArch] = useState(false);

  const list = useMemo(() => {
    let l = entries.filter((e) => e.status === 'open');
    if (filter !== 'all') l = l.filter((e) => e.category === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      l = l.filter(
        (e) =>
          e.content.toLowerCase().includes(q) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return sortFor(filter, l, settings?.deepWorkSchedule);
  }, [entries, filter, search, settings]);

  const inboxCount = entries.filter((e) => e.category === 'inbox' && e.status === 'open').length;

  async function toggleArchived() {
    const next = !showArchived;
    setShowArchived(next);
    if (next && archived.length === 0) await loadMoreArchived();
  }
  async function loadMoreArchived() {
    setLoadingArch(true);
    try {
      const { items, cursor: c, done } = await loadArchived(cursor);
      setArchived((prev) => [...prev, ...items]);
      setCursor(c);
      setArchDone(done);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoadingArch(false);
    }
  }

  // "정리하기" — 미완료 할일 + 기한 있는 프로젝트만 평가 (SPEC 4.2)
  async function organize() {
    setBusy(true);
    setError('');
    try {
      const targets = entries.filter(
        (e) =>
          e.status === 'open' &&
          (e.category === 'task' || (e.category === 'project' && e.dueDate))
      );
      if (targets.length === 0) return;
      const { results } = await prioritize(targets, settings, projects);
      await Promise.all(
        results.map((r) =>
          updateEntry(r.id, {
            priority: r.priority ?? null,
            priorityReason: r.reason ?? null,
            suggest: r.suggest ?? null,
          })
        )
      );
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  function renderEntry(e, { archivedRow = false } = {}) {
    const cat = CATEGORY_MAP[e.category] || INBOX;
    const proj = e.category === 'project' && projects.find((p) => p.tagName && (e.tags || []).includes(p.tagName));
    const needsAttention =
      e.suggest || (e.skipCount || 0) >= SKIP_LIMIT || (e.migratedCount || 0) > MIGRATION_LIMIT;
    const unsorted = e.category === 'task' && e.priority == null && !e.pinned;
    return (
      <div key={e.id} className={`entry ${e.status !== 'open' ? 'done' : ''}`}>
        <div className="content">
          <span className="sign">{cat.sign}</span>
          {e.content}
          {unsorted && <span className="dot" title="미정렬">·</span>}
        </div>
        {e.priorityReason && e.status === 'open' && <div className="reason">{e.priorityReason}</div>}
        <div className="meta">
          {e.priority != null && <span>#{e.priority}</span>}
          {e.dueDate && <span>~{fmtDue(e.dueDate)}</span>}
          {(e.tags || []).map((t) => (
            <span key={t}>{t}</span>
          ))}
          {(e.migratedCount || 0) > 0 && <span>{'>'.repeat(Math.min(e.migratedCount, 3))}</span>}
          {e.suggest === 'split' && <span className="suggest">쪼갤까요?</span>}
          {e.suggest === 'discard' && <span className="suggest">보낼까요?</span>}
          {!e.suggest && needsAttention && <span className="suggest">쪼개거나 보내줄까요?</span>}
          {archivedRow ? (
            <button className="ghost" onClick={() => updateEntry(e.id, { status: 'open' })}>
              되돌리기
            </button>
          ) : (
            <>
              {proj && (
                <button className="ghost" onClick={() => setOpenProject(proj)}>
                  열기
                </button>
              )}
              <button className="ghost" onClick={() => updateEntry(e.id, { pinned: !e.pinned })}>
                {e.pinned ? '고정됨 ◉' : '고정'}
              </button>
              <button className="ghost" onClick={() => updateEntry(e.id, { status: 'done' })}>
                완료
              </button>
              <button className="ghost" onClick={() => updateEntry(e.id, { status: 'discarded' })}>
                폐기
              </button>
            </>
          )}
        </div>
      </div>
    );
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
        {aiEnabled ? (
          <button className="primary" style={{ flex: 1 }} onClick={organize} disabled={busy}>
            {busy ? '정리 중…' : '정리하기 (우선순위 재계산)'}
          </button>
        ) : (
          <button style={{ flex: 1 }} disabled title="AI 기능은 아직 준비 중이에요">
            정리하기 (AI 준비 중 — 고정으로 수동 정렬)
          </button>
        )}
        {inboxCount > 0 && <button onClick={onOpenEvening}>인박스 정리</button>}
      </div>
      {error && <div className="sub">{error}</div>}

      {list.map((e) => renderEntry(e))}
      {list.length === 0 && <div className="sub" style={{ marginTop: 24 }}>비어 있어요.</div>}

      <div className="section" style={{ marginTop: 20 }}>
        <button className="ghost" onClick={toggleArchived}>
          {showArchived ? '완료·보관 숨기기' : '완료·보관 보기'}
        </button>
        {showArchived && (
          <div style={{ marginTop: 10 }}>
            {archived.map((e) => renderEntry(e, { archivedRow: true }))}
            {archived.length === 0 && !loadingArch && (
              <div className="sub">보관된 항목이 없어요.</div>
            )}
            {!archDone && (
              <button className="ghost" onClick={loadMoreArchived} disabled={loadingArch}>
                {loadingArch ? '불러오는 중…' : '더 불러오기'}
              </button>
            )}
          </div>
        )}
      </div>

      {openProject && (
        <ProjectDetail
          project={openProject}
          entries={entries}
          settings={settings}
          aiEnabled={aiEnabled}
          onClose={() => setOpenProject(null)}
        />
      )}
    </div>
  );
}
