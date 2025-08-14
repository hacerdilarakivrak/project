import type { Terminal } from "./types";

const LS_KEY = "terminals";
const mem: { v: string } = { v: "[]" };
const hasLS = typeof window !== "undefined" && !!window.localStorage;

function readRaw(): string {
  if (hasLS) return window.localStorage.getItem(LS_KEY) ?? "[]";
  return mem.v;
}

function writeRaw(s: string) {
  if (hasLS) window.localStorage.setItem(LS_KEY, s);
  else mem.v = s;
}

function safeJSONParse<T>(raw: string, fallback: T): T {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadTerminals(): Terminal[] {
  return safeJSONParse<Terminal[]>(readRaw(), []);
}

export function saveTerminals(list: Terminal[]): void {
  writeRaw(JSON.stringify(list));
}

export function addTerminals(items: Terminal[]): void {
  const cur = loadTerminals();
  saveTerminals([...cur, ...items]);
}

export function updateTerminal(updated: Terminal): void {
  const cur = loadTerminals();
  const idx = cur.findIndex((t) => t.terminalId === updated.terminalId);
  if (idx === -1) return;
  cur[idx] = { ...cur[idx], ...updated };
  saveTerminals(cur);
}

export function upsertTerminals(items: Terminal[]): void {
  const byId = new Map(loadTerminals().map((t) => [t.terminalId, t]));
  for (const it of items) {
    byId.set(it.terminalId, { ...(byId.get(it.terminalId) ?? {}), ...it });
  }
  saveTerminals(Array.from(byId.values()));
}

export function findByIsyeriNo(isyeriNo: string): Terminal[] {
  const cur = loadTerminals();
  return cur.filter((t) => t.isyeriNo === isyeriNo);
}

export function clearTerminals(): void {
  saveTerminals([]);
}
