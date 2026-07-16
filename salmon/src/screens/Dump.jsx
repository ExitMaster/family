// 덤프 화면 — 캡처 3초 컷 (SPEC 4.1)
// 좌측 카테고리 레일 터치 = 즉시 확정 저장. 아무것도 안 누르면 인박스행.
import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../config';
import { addEntry } from '../lib/db';
import TagBar from '../components/TagBar';
import ProjectSetup from './ProjectSetup';

export default function Dump({ projects }) {
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [tags, setTags] = useState([]);
  const [savedFlash, setSavedFlash] = useState('');
  const [projectDraft, setProjectDraft] = useState(null); // 프로젝트 상세 설정으로 이어지는 초안
  const inputRef = useRef(null);

  // 진입 즉시 커서 포커스 (PWA shortcut ?dump=1 포함)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function reset() {
    setText('');
    setDue('');
    setTags([]);
  }

  function flash(msg) {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(''), 1600);
  }

  async function save(category) {
    const content = text.trim();
    if (!content) return;
    const dueDate = due ? new Date(due + 'T00:00:00') : null;

    if (category === 'project') {
      // 저장 후 프로젝트 상세 설정으로 자동 전환 (SPEC 4.1)
      setProjectDraft({ content, dueDate, tags });
      reset();
      return;
    }
    // 카테고리 미선택 → 인박스 (저녁 정리에서 AI 제안과 함께 확정)
    addEntry({ content, category: category ?? 'inbox', dueDate, tags });
    reset();
    inputRef.current?.focus();
    flash(category ? '저장됨' : '인박스에 담아뒀어요 — 저녁에 같이 정리해요');
  }

  return (
    <div>
      <div className="dump">
        <div className="cat-rail">
          {CATEGORIES.map((c) => (
            <button key={c.key} onClick={() => save(c.key)} title={c.label}>
              <span className="sign">{c.sign}</span>
              {c.label}
            </button>
          ))}
        </div>
        <div className="dump-main">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="머릿속에 있는 걸 그대로 던져두세요"
          />
          <div className="due-slot">
            <span className="sub">기한</span>
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            {due && (
              <button className="ghost" onClick={() => setDue('')}>
                지움
              </button>
            )}
          </div>
          <TagBar projects={projects} selected={tags} onChange={setTags} />
          <button className="primary" onClick={() => save(null)}>
            일단 저장 (나중에 분류)
          </button>
          {savedFlash && <div className="sub">{savedFlash}</div>}
        </div>
      </div>

      {projectDraft && (
        <ProjectSetup draft={projectDraft} onClose={() => setProjectDraft(null)} />
      )}
    </div>
  );
}
