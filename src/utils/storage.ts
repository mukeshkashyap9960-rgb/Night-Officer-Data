import { Officer, DutyRow } from '../types/roster';
import { DEFAULT_OFFICERS, NOVEMBER_2026_ROSTER } from '../data/rosterData';
import { supabase, TABLES } from './supabaseClient';

const STORAGE_KEYS = {
  OFFICERS: 'gp_night_officers_store_v2',
  ROSTER: 'gp_night_roster_store_v2',
  HAS_CUSTOM_OFFICERS: 'gp_has_custom_officers_v2',
};

/**
 * Loads officers with priority:
 * 1. Supabase (if connected and has records)
 * 2. LocalStorage (if user previously imported, added, or deleted)
 * 3. DEFAULT_OFFICERS (only on pristine first launch)
 */
export async function fetchAndSyncOfficers(): Promise<Officer[]> {
  // 1. Try Supabase if configured
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLES.OFFICERS)
        .select('*')
        .order('category', { ascending: true })
        .order('squad', { ascending: true });

      if (!error && data && data.length > 0) {
        saveOfficersToLocal(data);
        return data;
      }
    } catch (e) {
      console.warn('Supabase officers fetch error, falling back to local storage', e);
    }
  }

  // 2. Check LocalStorage
  const local = loadOfficersFromLocal();
  if (local !== null) {
    return local;
  }

  // 3. Fallback to default on pristine first run
  saveOfficersToLocal(DEFAULT_OFFICERS);
  return DEFAULT_OFFICERS;
}

export function loadOfficersFromLocal(): Officer[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFICERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading officers from localStorage', err);
  }
  return null;
}

export function saveOfficersToLocal(officers: Officer[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers));
    localStorage.setItem(STORAGE_KEYS.HAS_CUSTOM_OFFICERS, 'true');
    // Notify all components across the app
    window.dispatchEvent(new CustomEvent('officers_updated', { detail: officers }));
  } catch (err) {
    console.error('Error saving officers to localStorage', err);
  }
}

/**
 * Persists officers to both LocalStorage and Supabase.
 * If mode is 'replace', completely overwrites storage.
 */
export async function persistOfficers(officers: Officer[], mode: 'append' | 'replace'): Promise<void> {
  const current = loadOfficersFromLocal() || DEFAULT_OFFICERS;
  const updated = mode === 'replace' ? officers : [...current, ...officers];

  // 1. Save to LocalStorage immediately
  saveOfficersToLocal(updated);

  // 2. Save to Supabase if connected
  if (supabase) {
    try {
      if (mode === 'replace') {
        await supabase.from(TABLES.OFFICERS).delete().neq('name', 'DELETE_ALL_HACK_TOKEN');
      }
      await supabase.from(TABLES.OFFICERS).insert(
        officers.map(o => ({
          category: o.category,
          squad: o.squad,
          name: o.name,
          rank: o.rank,
          phone: o.phone,
          branch: o.branch || ''
        }))
      );
    } catch (err) {
      console.warn('Supabase sync warning on persistOfficers', err);
    }
  }
}

/**
 * Deletes an officer from both LocalStorage and Supabase.
 */
export async function removeOfficer(id: string): Promise<Officer[]> {
  const current = loadOfficersFromLocal() || DEFAULT_OFFICERS;
  const updated = current.filter(o => o.id !== id);

  // 1. Update LocalStorage immediately
  saveOfficersToLocal(updated);

  // 2. Delete from Supabase if connected
  if (supabase) {
    try {
      await supabase.from(TABLES.OFFICERS).delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete error on removeOfficer', err);
    }
  }

  return updated;
}

/**
 * Adds or updates a single officer in LocalStorage and Supabase.
 */
export async function upsertOfficer(officer: Officer): Promise<Officer[]> {
  const current = loadOfficersFromLocal() || DEFAULT_OFFICERS;
  const isExisting = current.some(o => o.id === officer.id);
  
  const updated = isExisting
    ? current.map(o => (o.id === officer.id ? officer : o))
    : [officer, ...current];

  // 1. Save to LocalStorage immediately
  saveOfficersToLocal(updated);

  // 2. Save to Supabase if connected
  if (supabase) {
    try {
      const { id, ...data } = officer;
      if (id && !id.toString().startsWith('new-') && !id.toString().startsWith('local-')) {
        await supabase.from(TABLES.OFFICERS).update(data).eq('id', id);
      } else {
        await supabase.from(TABLES.OFFICERS).insert([data]);
      }
    } catch (err) {
      console.warn('Supabase upsert error on upsertOfficer', err);
    }
  }

  return updated;
}

/**
 * Loads Roster with priority:
 * 1. Supabase
 * 2. LocalStorage
 * 3. NOVEMBER_2026_ROSTER
 */
export async function fetchAndSyncRoster(): Promise<DutyRow[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ROSTER)
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const normalized: DutyRow[] = data.map((r: any) => ({
          date: r.date,
          dayName: r.day_name || r.dayName || '',
          dayNameEn: r.day_name_en || r.dayNameEn || '',
          communalPi: r.communal_pi || r.communalPi || '',
          divisionPi: r.division_pi || r.divisionPi || '',
          cmMorchoPsi: r.cm_morcho_psi || r.cmMorchoPsi || '',
          campusPsi: r.campus_psi || r.campusPsi || '',
          vvipPsi: r.vvip_psi || r.vvipPsi || '',
        }));
        saveRosterToLocal(normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('Supabase roster fetch error', e);
    }
  }

  const local = loadRosterFromLocal();
  if (local !== null) {
    return local;
  }

  saveRosterToLocal(NOVEMBER_2026_ROSTER);
  return NOVEMBER_2026_ROSTER;
}

export function loadRosterFromLocal(): DutyRow[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROSTER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading roster from localStorage', err);
  }
  return null;
}

export function saveRosterToLocal(roster: DutyRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(roster));
    window.dispatchEvent(new CustomEvent('roster_updated', { detail: roster }));
  } catch (err) {
    console.error('Error saving roster to localStorage', err);
  }
}
