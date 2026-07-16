// 프로젝트 상세 설정 — 덤프에서 [프로젝트] 선택 시 자동 전환 (SPEC 4.1)
// 이름 확정 → .태그 자동 발급 → 목표·기한 입력
import React, { useState } from 'react';
import { addEntry, addProject } from '../lib/db';

export default function ProjectSetup({ draft, onClose }) {
  const firstLine = draft.content.split('\n')[0].slice(0, 30);
  const [name, setName] = useState(firstLine);
  const [goal, setGoal] = useState('');
  const [due, setDue] = useState(
    draft.dueDate ? draft.dueDate.toISOString().slice(0, 10) : ''
  );

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const tagName = '.' + trimmed.replace(/\s+/g, '');
    const dueDate = due ? new Date(due + 'T00:00:00') : null;
    await addProject({ name: trimmed, goal: goal.trim(), dueDate });
    // 원문 덤프도 프로젝트 항목으로 보존 (프로젝트 태그 자동 부착)
    await addEntry({
      content: draft.content,
      category: 'project',
      dueDate,
      tags: [...new Set([...(draft.tags || []), tagName])],
    });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>★ 새 프로젝트</h2>
        <div className="section">
          <div className="sub">프로젝트 이름 (태그: .{name.trim().replace(/\s+/g, '') || '…'})</div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="section">
          <div className="sub">목표</div>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="이 프로젝트가 끝나면 무엇이 달라지나요?"
          />
        </div>
        <div className="section">
          <div className="sub">기한 (선택)</div>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="row">
          <button className="primary" style={{ flex: 1 }} onClick={submit}>
            만들기
          </button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}
