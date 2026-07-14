// 프로젝트 상세 — .태그 모아보기 + 마일스톤 관리 (SPEC 4.7)
import React, { useMemo, useState } from 'react';
import { CATEGORY_MAP } from '../config';
import { updateProject, newMilestone } from '../lib/db';
import { suggestMilestones } from '../lib/api';

export default function ProjectDetail({ project, entries, settings, onClose }) {
  const [newMs, setNewMs] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState(null); // AI 제안 마일스톤 확인용

  const milestones = useMemo(
    () => [...(project.milestones || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [project.milestones]
  );

  // .태그가 달린 항목 모아보기
  const items = entries.filter(
    (e) => e.status === 'open' && (e.tags || []).includes(project.tagName)
  );
  const openTasks = items.filter((e) => e.category === 'task').map((e) => e.content);

  function save(ms) {
    return updateProject(project.id, { milestones: ms });
  }
  function addMs() {
    const t = newMs.trim();
    if (!t) return;
    save([...milestones, newMilestone(t, milestones.length)]);
    setNewMs('');
  }
  function toggleMs(id) {
    save(
      milestones.map((m) =>
        m.id === id ? { ...m, status: m.status === 'done' ? 'open' : 'done' } : m
      )
    );
  }
  function delMs(id) {
    save(milestones.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i })));
  }
  function move(id, dir) {
    const idx = milestones.findIndex((m) => m.id === id);
    const j = idx + dir;
    if (j < 0 || j >= milestones.length) return;
    const arr = [...milestones];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    save(arr.map((m, i) => ({ ...m, order: i })));
  }

  async function propose() {
    setBusy(true);
    setError('');
    try {
      const { milestones: ms } = await suggestMilestones(project.goal || project.name, openTasks, settings);
      setProposal(ms);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }
  function acceptProposal() {
    const start = milestones.length;
    const added = proposal.map((t, i) => newMilestone(t, start + i));
    save([...milestones, ...added]);
    setProposal(null);
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>★ {project.name}</h2>
        {project.goal && <div className="sub">{project.goal}</div>}

        <div className="section">
          <h2>마일스톤</h2>
          {milestones.map((m) => (
            <div key={m.id} className="entry">
              <div className={`content ${m.status === 'done' ? 'done' : ''}`}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    checked={m.status === 'done'}
                    onChange={() => toggleMs(m.id)}
                  />
                  <span className={m.status === 'done' ? 'strike' : ''}>{m.title}</span>
                </label>
              </div>
              <div className="meta">
                <button className="ghost" onClick={() => move(m.id, -1)}>
                  ↑
                </button>
                <button className="ghost" onClick={() => move(m.id, 1)}>
                  ↓
                </button>
                <button className="ghost" onClick={() => delMs(m.id)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
          <div className="row">
            <input
              style={{ flex: 1 }}
              value={newMs}
              onChange={(e) => setNewMs(e.target.value)}
              placeholder="마일스톤 추가"
              onKeyDown={(e) => e.key === 'Enter' && addMs()}
            />
            <button onClick={addMs}>추가</button>
          </div>
          <button style={{ marginTop: 8 }} onClick={propose} disabled={busy}>
            {busy ? '제안 중…' : 'AI 마일스톤 제안'}
          </button>
          {error && <div className="sub">{error}</div>}
        </div>

        <div className="section">
          <h2>이 프로젝트의 할일 ({items.length})</h2>
          {items.map((e) => (
            <div key={e.id} className="entry">
              <div className="content">
                <span className="sign">{(CATEGORY_MAP[e.category] || {}).sign}</span>
                {e.content}
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="sub">아직 없어요. 덤프에서 {project.tagName} 태그를 붙여보세요.</div>}
        </div>

        <button style={{ width: '100%' }} onClick={onClose}>
          닫기
        </button>
      </div>

      {proposal && (
        <div className="overlay" onClick={() => setProposal(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>이 마일스톤들을 추가할까요?</h2>
            {proposal.map((t, i) => (
              <div key={i} className="entry">
                {t}
              </div>
            ))}
            <div className="row">
              <button className="primary" style={{ flex: 1 }} onClick={acceptProposal}>
                추가
              </button>
              <button onClick={() => setProposal(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
