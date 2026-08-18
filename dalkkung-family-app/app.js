import * as FirebaseApp from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import * as FirebaseAuth from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import * as Firestore from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

let config = null;
try { config = await import('./config.js'); } catch {}

// Firebase Web App configuration is public client metadata, not a secret.
// Keep local config.js override support, but make the production Hosting build
// independent of /__/firebase/init.json so multisite Hosting works reliably.
if (!config?.FIREBASE_CONFIG) {
  config = {
    FIREBASE_CONFIG: {
      apiKey: 'AIzaSyBPZHWStQ9_wvZJ1bztwzyusc6ieWiPIRU',
      authDomain: 'salmon-logs.firebaseapp.com',
      projectId: 'salmon-logs',
      storageBucket: 'salmon-logs.firebasestorage.app',
      messagingSenderId: '1009990142557',
      appId: '1:1009990142557:web:e84c162156b0ef2d1e9bb4'
    },
    FAMILY_ID: 'dalkkung'
  };
}

const Firebase = { ...FirebaseApp, ...FirebaseAuth, ...Firestore };
const paths = ['./runtime/app-part1.js','./runtime/app-part2.js','./runtime/app-part3.js','./runtime/app-part4.js'];
const code = (await Promise.all(paths.map(async p => {
  const r = await fetch(p, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Failed to load ${p}`);
  return r.text();
}))).join('\n');
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
await new AsyncFunction('Firebase','config', code)(Firebase, config);
