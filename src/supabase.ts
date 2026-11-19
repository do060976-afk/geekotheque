import type { Item, Universe } from './db';

const URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const SESSION_KEY = 'geekotheque-supabase-session';
const TOMBSTONES_KEY = 'geekotheque-sync-tombstones-v1';
export type Session = { access_token: string; refresh_token?: string; user: { id: string; email?: string } };
type Tombstone = { id: string; kind: 'item' | 'universe'; updated: number };
export const isSupabaseConfigured = () => Boolean(URL && KEY);
export function getSession(): Session | null { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
function setSession(s: Session | null) { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); }
async function request(path: string, init: RequestInit = {}, token?: string) {
  if (!isSupabaseConfigured()) throw new Error('Configuration Supabase manquante.');
  const response = await fetch(`${URL}${path}`, { ...init, headers: { apikey: KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } });
  const body = await response.text(); let data: any = null; try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || data?.error || `Erreur Supabase ${response.status}`);
  return data;
}
export async function signIn(email: string, password: string) { const data = await request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) }); setSession(data); return data as Session; }
export async function signUp(email: string, password: string) { const data = await request('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) }); if (data?.access_token) setSession(data); return data; }
export function signOut() { setSession(null); }
function tombstones(): Tombstone[] { try { return JSON.parse(localStorage.getItem(TOMBSTONES_KEY) || '[]'); } catch { return []; } }
export function recordDeletion(id: string, kind: Tombstone['kind']) { const all = tombstones().filter(t => !(t.id === id && t.kind === kind)); all.push({ id, kind, updated: Date.now() }); localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(all)); }
function clearTombstone(id: string, kind: Tombstone['kind']) { localStorage.setItem(TOMBSTONES_KEY, JSON.stringify(tombstones().filter(t => !(t.id === id && t.kind === kind)))); }
async function table<T extends { id: string; updated: number }>(name: string, local: T[], kind: Tombstone['kind'], owner: string, token: string, save: (v: T) => Promise<any>, remove: (id: string) => Promise<any>) {
  const remote = await request(`/rest/v1/${name}?owner_id=eq.${owner}&select=id,data,updated_at,deleted_at`, {}, token) as any[];
  const localById = new Map(local.map(x => [x.id, x]));
  const remoteById = new Map(remote.map(x => [x.id, x]));
  const dead = tombstones().filter(t => t.kind === kind);
  // Upload local records that are newer, or absent remotely.
  for (const item of local) {
    const r = remoteById.get(item.id); const t = dead.find(x => x.id === item.id);
    if (t && (!r || t.updated >= new Date(r.updated_at).getTime())) continue;
    if (!r || item.updated > new Date(r.updated_at).getTime()) {
      await request(`/rest/v1/${name}?on_conflict=id,owner_id`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: item.id, owner_id: owner, data: item, updated_at: new Date(item.updated).toISOString(), deleted_at: null }) }, token);
    }
  }
  // Upload local deletions as tombstones.
  for (const t of dead) {
    const r = remoteById.get(t.id);
    if (!r || t.updated >= new Date(r.updated_at).getTime()) await request(`/rest/v1/${name}?on_conflict=id,owner_id`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ id: t.id, owner_id: owner, data: {}, updated_at: new Date(t.updated).toISOString(), deleted_at: new Date(t.updated).toISOString() }) }, token);
  }
  // Apply remote records and remote deletions locally.
  const refreshed = await request(`/rest/v1/${name}?owner_id=eq.${owner}&select=id,data,updated_at,deleted_at`, {}, token) as any[];
  for (const r of refreshed) {
    const remoteTime = new Date(r.updated_at).getTime(); const l = localById.get(r.id); const t = tombstones().find(x => x.id === r.id && x.kind === kind);
    if (r.deleted_at) { if (!l || remoteTime >= l.updated) { await remove(r.id); recordDeletion(r.id, kind); } }
    else if (!t || remoteTime > t.updated) { if (!l || remoteTime > l.updated) { await save({ ...r.data, updated: remoteTime } as T); clearTombstone(r.id, kind); } }
  }
  // Keep tombstones until acknowledged by the server; they are needed on other offline devices.
}
export async function synchronize(items: Item[], universes: Universe[]) {
  const session = getSession(); if (!session) throw new Error('Connecte-toi à ton compte avant de synchroniser.');
  await table('collection_items', items, 'item', session.user.id, session.access_token, async x => { const { saveItem } = await import('./db'); await saveItem(x as Item); }, async id => { const { deleteItemLocal } = await import('./db'); await deleteItemLocal(id); });
  await table('universes', universes, 'universe', session.user.id, session.access_token, async x => { const { saveUniverseLocal } = await import('./db'); await saveUniverseLocal(x as Universe); }, async id => { const { deleteUniverseLocal } = await import('./db'); await deleteUniverseLocal(id); });
}
