// 설정 — 저녁 정리 시각 / 도파민 메뉴 / 부기능 자리 (SPEC 4.0)
import React, { useState } from 'react';
import { updateSettings } from '../lib/db';
import { logOut } from '../firebase';

export default function Settings({ settings, onClose }) {
  const [hour, setHour] = useState(settings.eveningReviewHour);
  const [menu, setMenu] = useState((settings.dopamineMenu || []).join('\n'));

  function save() {
    updateSettings({
      eveningReviewHour: Number(hour),
      dopamineMenu: menu
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>설정</h2>

        <div className="section">
          <div className="sub">저녁 정리 시작 시각 (시)</div>
          <input
            type="number"
            min="0"
            max="23"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
          />
        </div>

        <div className="section">
          <div className="sub">도파민 메뉴 — 휴식 때 추천받을 건강한 행동 (한 줄에 하나)</div>
          <textarea rows="4" value={menu} onChange={(e) => setMenu(e.target.value)} />
        </div>

        <div className="section">
          <div className="sub">부기능 (추후 이식 예정)</div>
          <div className="row">
            <button disabled>카운슬러</button>
            <button disabled>레퍼런스</button>
            <button disabled>생체인증</button>
          </div>
        </div>

        <div className="section">
          <div className="sub">
            빠른 실행: 홈 화면 아이콘을 길게 눌러 "새 덤프"를 선택하거나, 갤럭시 설정 &gt; 유용한
            기능 &gt; 사이드 버튼에서 이 앱을 지정하세요.
          </div>
        </div>

        <div className="row">
          <button className="primary" style={{ flex: 1 }} onClick={save}>
            저장
          </button>
          <button onClick={() => logOut()}>로그아웃</button>
        </div>
      </div>
    </div>
  );
}
