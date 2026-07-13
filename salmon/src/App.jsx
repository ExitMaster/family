import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signIn, configured } from './firebase';
import { subscribeEntries, subscribeProjects, subscribeSettings } from './lib/db';
import Dump from './screens/Dump';
import Organize from './screens/Organize';
import Focus from './screens/Focus';
import Evening from './screens/Evening';
import Settings from './screens/Settings';

const TABS = [
  { key: 'dump', label: '덤프' },
  { key: 'organize', label: '정리' },
  { key: 'focus', label: '포커스' },
];

// 저녁 정리 노출 조건 (SPEC 4.3) — 로컬 트리거, 세션당 1회
function needsEvening(entries, settings) {
  if (new Date().getHours() < (settings.eveningReviewHour ?? 20)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hasInbox = entries.some((e) => e.category === 'inbox' && e.status === 'open');
  const hasOverdue = entries.some(
    (e) =>
      e.status === 'open' &&
      e.category === 'task' &&
      ((e.dueDate && e.dueDate.toDate() < today) ||
        (e.lastFocusedAt && e.lastFocusedAt.toDate() >= today))
  );
  const last = settings.lastIdeaReviewAt?.toDate?.();
  const ideaDue =
    entries.some((e) => e.category === 'idea' && e.status === 'open') &&
    (!last || (Date.now() - last.getTime()) / 86400000 >= 7);
  return hasInbox || hasOverdue || ideaDue;
}

export default function App() {
  const [user, setUser] = useState(undefined); // undefined=로딩중, null=미로그인
  const [tab, setTab] = useState('dump');
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showEvening, setShowEvening] = useState(false);
  const [eveningChecked, setEveningChecked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!configured) return;
    return onAuthStateChanged(auth, (u) => setUser(u ?? null));
  }, []);

  useEffect(() => {
    if (!user) return;
    const un1 = subscribeEntries(setEntries);
    const un2 = subscribeProjects(setProjects);
    const un3 = subscribeSettings(setSettings);
    return () => {
      un1();
      un2();
      un3();
    };
  }, [user]);

  // 저녁 정리 자동 노출 — 데이터 로드 후 1회만 판정
  useEffect(() => {
    if (!user || !settings || eveningChecked || entries.length === 0) return;
    setEveningChecked(true);
    if (needsEvening(entries, settings)) setShowEvening(true);
  }, [user, settings, entries, eveningChecked]);

  const inboxCount = useMemo(
    () => entries.filter((e) => e.category === 'inbox' && e.status === 'open').length,
    [entries]
  );

  if (!configured) {
    return (
      <div className="app">
        <div className="login">
          <div className="logo">🐟</div>
          <div>연어항해일지</div>
          <div className="sub" style={{ padding: '0 24px', textAlign: 'center' }}>
            Firebase 환경변수가 아직 설정되지 않았어요.
            <br />
            .env.example을 참고해 .env를 만들어주세요.
          </div>
        </div>
      </div>
    );
  }

  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="app">
        <div className="login">
          <div className="logo">🐟</div>
          <div>연어항해일지</div>
          <button
            className="primary"
            onClick={() => signIn().catch((e) => setAuthError(String(e.message || e)))}
          >
            Google 계정으로 로그인
          </button>
          {authError && <div className="sub">{authError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="screen">
        {tab === 'dump' && <Dump projects={projects} />}
        {tab === 'organize' && (
          <Organize
            entries={entries}
            projects={projects}
            onOpenEvening={() => setShowEvening(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
        {tab === 'focus' && <Focus entries={entries} settings={settings} />}
      </div>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === 'organize' && inboxCount > 0 && <span className="badge">{inboxCount}</span>}
          </button>
        ))}
      </nav>

      {showEvening && settings && (
        <Evening entries={entries} settings={settings} onClose={() => setShowEvening(false)} />
      )}
      {showSettings && settings && (
        <Settings settings={settings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
