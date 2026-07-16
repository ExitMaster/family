import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// 환경변수 미설정 상태에서도 앱이 죽지 않고 설정 안내를 띄울 수 있게 가드
export const configured = !!import.meta.env.VITE_FIREBASE_API_KEY;

let auth = null;
let db = null;

if (configured) {
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);
  // 오프라인 캡처 보장 — 로컬에 즉시 기록, 온라인 복귀 시 자동 동기화 (SPEC 5)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}

export { auth, db };

export function signIn() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}
export function logOut() {
  return signOut(auth);
}
