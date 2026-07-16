// 설정 — 컨텍스트 프로필 / 딥워크 스케줄 / 저녁 정리 / 도파민 메뉴 (SPEC 3.4, 4.0)
import React, { useState } from 'react';
import { updateSettings, updateContextProfile, Timestamp } from '../lib/db';
import { logOut } from '../firebase';
import { PROFILE_WRITING_GUIDE, WEEKDAYS, WEEKDAY_LABELS } from '../config';

export default function Settings({ settings, onClose }) {
  const [hour, setHour] = useState(settings.eveningReviewHour);
  const [menu, setMenu] = useState((settings.dopamineMenu || []).join('\n'));
  const cp = settings.contextProfile || {};
  const [fixedRules, setFixedRules] = useState(cp.fixedRules || '');
  const [quarterFocus, setQuarterFocus] = useState(cp.quarterFocus || '');
  const [weeklyStatus, setWeeklyStatus] = useState(cp.weeklyStatus || '');
  const [schedule, setSchedule] = useState({ ...(settings.deepWorkSchedule || {}) });

  function saveGeneral() {
    updateSettings({
      eveningReviewHour: Number(hour),
      dopamineMenu: menu.split('\n').map((s) => s.trim()).filter(Boolean),
      deepWorkSchedule: schedule,
    });
  }
  function saveProfile() {
    updateContextProfile({
      fixedRules: fixedRules.trim(),
      quarterFocus: quarterFocus.trim(),
      weeklyStatus: weeklyStatus.trim(),
      weeklyStatusUpdatedAt: Timestamp.now(),
    });
  }
  function saveAndClose() {
    saveGeneral();
    saveProfile();
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>설정</h2>

        <div className="section">
          <h2>컨텍스트 프로필</h2>
          <div className="sub" style={{ marginBottom: 8 }}>
            {PROFILE_WRITING_GUIDE.map((g, i) => (
              <div key={i}>· {g}</div>
            ))}
          </div>
          <div className="sub">불변 규칙 (거의 안 바뀜)</div>
          <textarea rows="6" value={fixedRules} onChange={(e) => setFixedRules(e.target.value)} />
          <div className="sub" style={{ marginTop: 8 }}>분기 초점 (월~분기)</div>
          <textarea rows="4" value={quarterFocus} onChange={(e) => setQuarterFocus(e.target.value)} />
          <div className="sub" style={{ marginTop: 8 }}>이번 주 상황 (주 단위 — 저녁 정리에서도 갱신 가능)</div>
          <textarea rows="2" value={weeklyStatus} onChange={(e) => setWeeklyStatus(e.target.value)} />
        </div>

        <div className="section">
          <h2>딥워크 요일·시간</h2>
          <div className="sub">시간 &gt; 0 인 요일이 딥워크일. #딥워크 항목이 그날 상위 배치됩니다.</div>
          <div className="row" style={{ flexWrap: 'nowrap', overflowX: 'auto', gap: 6 }}>
            {WEEKDAYS.map((d) => (
              <label key={d} style={{ textAlign: 'center', minWidth: 40 }}>
                <div className="sub">{WEEKDAY_LABELS[d]}</div>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={schedule[d] ?? 0}
                  onChange={(e) => setSchedule((s) => ({ ...s, [d]: Number(e.target.value) }))}
                  style={{ padding: '6px 4px', textAlign: 'center' }}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>기타</h2>
          <div className="sub">저녁 정리 시작 시각 (시)</div>
          <input type="number" min="0" max="23" value={hour} onChange={(e) => setHour(e.target.value)} />
          <div className="sub" style={{ marginTop: 8 }}>도파민 메뉴 (한 줄에 하나)</div>
          <textarea rows="3" value={menu} onChange={(e) => setMenu(e.target.value)} />
        </div>

        <div className="section">
          <div className="sub">부기능 (추후 이식 예정): 카운슬러 · 레퍼런스 · 생체인증</div>
          <div className="sub" style={{ marginTop: 6 }}>
            빠른 실행: 홈 화면 아이콘 길게 눌러 "새 덤프", 또는 갤럭시 설정 &gt; 유용한 기능 &gt;
            사이드 버튼에서 이 앱 지정.
          </div>
        </div>

        <div className="row">
          <button className="primary" style={{ flex: 1 }} onClick={saveAndClose}>
            저장
          </button>
          <button onClick={() => logOut()}>로그아웃</button>
        </div>
      </div>
    </div>
  );
}
