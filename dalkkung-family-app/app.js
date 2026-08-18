import * as FirebaseApp from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import * as FirebaseAuth from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import * as Firestore from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

let config = null;
try { config = await import('./config.js'); } catch {}

if (!config?.FIREBASE_CONFIG) {
  try {
    const r = await fetch('/__/firebase/init.json', { cache: 'no-store' });
    if (r.ok) config = { FIREBASE_CONFIG: await r.json(), FAMILY_ID: 'dalkkung' };
  } catch {}
}

const Firebase = { ...FirebaseApp, ...FirebaseAuth, ...Firestore };
const paths = ['./runtime/app-part1.js','./runtime/app-part2.js','./runtime/app-part3.js','./runtime/app-part4.js'];
const code = (await Promise.all(paths.map(async p => {
  const r = await fetch(p);
  if (!r.ok) throw new Error(`Failed to load ${p}`);
  return r.text();
}))).join('\n');
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
await new AsyncFunction('Firebase','config', code)(Firebase, config);
