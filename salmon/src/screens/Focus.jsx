// 포커스 모드 — 단 하나의 카드 + 뽀모도로 비주얼 타이머 (SPEC 4.4, 4.5)
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { POMODORO_PHASES } from '../config';
import { updateEntry, addEntry, increment, Timestamp } from '../lib/db';
import { orderByOverlay } from '../lib/dates';
import { splitTask } from '../lib/api';

export default function Focus({ entries, settings }) {
  const [cursor, setCursor] = useState(0);
  const [splitting, setSplitting] = useState(false);
  const [steps, setSteps] = useState(null);
  const [error, setError] = useState('');

  // 대기열은 할일만 (SPEC 4.4) — 표시 시점 오버레이 적용
  const queue = useMemo(() => {
    const tasks = entries.filter((e) => e.status === 'open' && e.category === 'task');
    return orderByOverlay(tasks, { deepWorkSchedule: settings?.deepWorkSchedule });
  }, [entries, settings]);

  const current = queue[Math.min(cursor, Math.max(queue.length - 1, 0))];
  const weeklyStatus = settings?.contextProfile?.weeklyStatus;

  // 포커스에 노출됐으나 미완료 = 이월 리뷰 대상 (b) — 노출 기록 (SPEC 4.3)
  const markedRef = useRef(new Set());
  useEffect(() => {
    if (current && !markedRef.current.has(current.id)) {
      markedRef.current.add(current.id);
      updateEntry(current.id, { lastFocusedAt: Timestamp.now() });
    }
  }, [current]);

  async function doSplit() {
    if (!current) return;
    setSplitting(true);
    setError('');
    try {
      const { steps } = await splitTask(current.content, settings);
      setSteps(steps);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSplitting(false);
    }
  }
  async function confirmSplit() {
    for (const s of steps) {
      await addEntry({ content: s, category: 'task', tags: current.tags || [] });
    }
    await updateEntry(current.id, { status: 'archived' });
    setSteps(null);
  }

  return (
    <div>
      {current ? (
        <div className="focus-card">
          {weeklyStatus && <div className="anchor">{weeklyStatus}</div>}
          <div className="sub">지금은 이것만</div>
          <div className="content">{current.content}</div>
          <div className="meta">
            {current.dueDate && `기한 ${current.dueDate.toDate().toLocaleDateString('ko-KR')}`}
          </div>
          <div className="focus-actions">
            <button className="primary" onClick={() => updateEntry(current.id, { status: 'done' })}>
              완료
            </button>
            <button
              onClick={() => {
                updateEntry(current.id, { skipCount: increment(1) });
                setCursor((c) => (c + 1) % Math.max(queue.length, 1));
              }}
            >
              건너뛰기
            </button>
            <button onClick={doSplit} disabled={splitting}>
              {splitting ? '쪼개는 중…' : '쪼개기'}
            </button>
          </div>
          {error && <div className="sub" style={{ marginTop: 10 }}>{error}</div>}
        </div>
      ) : (
        <div className="focus-card">
          {weeklyStatus && <div className="anchor">{weeklyStatus}</div>}
          <div className="content">지금 할 일이 없어요</div>
          <div className="meta">덤프에 던져두거나, 정리 탭에서 우선순위를 매겨보세요</div>
        </div>
      )}

      <Pomodoro dopamineMenu={settings?.dopamineMenu || []} />

      {steps && (
        <div className="overlay" onClick={() => setSteps(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h2>이렇게 쪼개볼까요?</h2>
            {steps.map((s, i) => (
              <div key={i} className="entry">
                <span className="sign">•</span>
                {s}
              </div>
            ))}
            <div className="row">
              <button className="primary" style={{ flex: 1 }} onClick={confirmSplit}>
                이대로 만들기
              </button>
              <button onClick={() => setSteps(null)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 뽀모도로 — 고정 패턴 25-5-25-5-25-15, 색이 줄어드는 비주얼 타이머 (SPEC 4.5)
function Pomodoro({ dopamineMenu }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remaining, setRemaining] = useState(POMODORO_PHASES[0].min * 60);
  const [running, setRunning] = useState(false);
  const [dopamine, setDopamine] = useState('');

  const phase = POMODORO_PHASES[phaseIdx];
  const total = phase.min * 60;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        const next = (phaseIdx + 1) % POMODORO_PHASES.length;
        setPhaseIdx(next);
        if (POMODORO_PHASES[next].kind === 'break' && dopamineMenu.length > 0) {
          setDopamine(dopamineMenu[Math.floor(Math.random() * dopamineMenu.length)]);
        } else {
          setDopamine('');
        }
        return POMODORO_PHASES[next].min * 60;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phaseIdx, dopamineMenu]);

  const frac = remaining / total;
  const color = phase.kind === 'work' ? 'var(--accent)' : 'var(--ok)';
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  function reset() {
    setRunning(false);
    setPhaseIdx(0);
    setRemaining(POMODORO_PHASES[0].min * 60);
    setDopamine('');
  }

  return (
    <div className="timer-wrap">
      <div
        className="timer-disc"
        style={{
          background: `conic-gradient(${color} ${frac * 360}deg, var(--surface) ${frac * 360}deg)`,
        }}
      >
        <div className="center">
          <div className="time">
            {mm}:{ss}
          </div>
          <div className="phase">
            {phase.kind === 'work' ? '집중' : '휴식'} · {phaseIdx + 1}/{POMODORO_PHASES.length}
          </div>
        </div>
      </div>
      {dopamine && <div className="sub">쉬는 동안: {dopamine}</div>}
      <div className="row">
        <button className="primary" onClick={() => setRunning((r) => !r)}>
          {running ? '일시정지' : '시작'}
        </button>
        <button onClick={reset}>처음으로</button>
      </div>
    </div>
  );
}
