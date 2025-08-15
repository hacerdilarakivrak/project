import type { Terminal } from "./types";

const STORAGE_KEY = "terminals";

export function loadTerminals(): Terminal[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? (JSON.parse(raw) as Terminal[]) : [];
  } catch {
    return [];
  }
}

export function saveTerminals(list: Terminal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addTerminals(newOnes: Terminal[]) {
  const all = [...loadTerminals(), ...newOnes];
  saveTerminals(all);
}

export function updateTerminal(updated: Terminal) {
  const list = loadTerminals();
  const i = list.findIndex((t) => t.id === updated.id);
  if (i !== -1) {
    list[i] = {
      ...list[i],
      ...updated,
      guncellemeTarihi: new Date().toISOString(),
    };
    saveTerminals(list);
  }
  return list;
}

export function deleteTerminal(id: string) {
  const list = loadTerminals().filter((t) => t.id !== id);
  saveTerminals(list);
  return list;
}

export function deleteTerminals(ids: string[]) {
  const set = new Set(ids);
  const list = loadTerminals().filter((t) => !set.has(t.id));
  saveTerminals(list);
  return list;
}



