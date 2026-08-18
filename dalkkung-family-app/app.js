import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
let config;
try { config = await import('./config.js'); } catch { config = null; }
const paths = ['./runtime/app-part1.js','./runtime/app-part2.js','./runtime/app-part3.js','./runtime/app-part4.js'];
const code = (await Promise.all(paths.map(async p => { const r = await fetch(p); if(!r.ok) throw new Error(`Failed to load ${p}`); return r.text(); }))).join('\n');
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
await new AsyncFunction('createClient','config', code)(createClient, config);
