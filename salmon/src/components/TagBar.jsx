// 태그 바 — 프로젝트(.형식)/기능(#딥워크)/주제(#형식) 구간 분리 (SPEC 3.2)
// 최근 것 우선 일부만 노출 + "더보기"
import React, { useState } from 'react';
import { TOPIC_TAGS, DEEP_WORK_TAG } from '../config';

const VISIBLE = 4;

export default function TagBar({ projects, selected, onChange }) {
  const [moreProj, setMoreProj] = useState(false);
  const [moreTopic, setMoreTopic] = useState(false);

  const projectTags = projects.filter((p) => p.status === 'active').map((p) => p.tagName);

  function toggle(tag) {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }

  function renderChips(tags, more, setMore, extraClass = '') {
    const shown = more ? tags : tags.slice(0, VISIBLE);
    return (
      <>
        {shown.map((t) => (
          <button
            key={t}
            className={`chip ${extraClass} ${selected.includes(t) ? 'on' : ''}`}
            onClick={() => toggle(t)}
          >
            {t}
          </button>
        ))}
        {tags.length > VISIBLE && !more && (
          <button className="chip" onClick={() => setMore(true)}>
            더보기
          </button>
        )}
      </>
    );
  }

  return (
    <div className="tagbar">
      {projectTags.length > 0 && (
        <>
          <span className="group-label">프로젝트</span>
          {renderChips(projectTags, moreProj, setMoreProj)}
        </>
      )}
      {/* 기능 태그 — 우선순위 규칙 발동, 시각적으로 구분 */}
      <span className="group-label">기능</span>
      <button
        className={`chip deepwork ${selected.includes(DEEP_WORK_TAG) ? 'on' : ''}`}
        onClick={() => toggle(DEEP_WORK_TAG)}
      >
        {DEEP_WORK_TAG}
      </button>
      <span className="group-label">주제</span>
      {renderChips(TOPIC_TAGS, moreTopic, setMoreTopic)}
    </div>
  );
}
