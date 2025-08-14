// src/features/terminals/storage.ts
import type { Terminal } from "./types";

const LS_KEY = "terminals";

// SSR/Node güvenliği: localStorage yoksa hafızada taklit et
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

/** Tüm terminalleri yükle */
export function loadTerminals(): Terminal[] {
  return safeJSONParse<Terminal[]>(readRaw(), []);
}

/** Tam listeyi kaydet (override) */
export function saveTerminals(list: Terminal[]): void {
  writeRaw(JSON.stringify(list));
}

/** Birden çok terminal ekle (append) */
export function addTerminals(items: Terminal[]): void {
  const cur = loadTerminals();
  saveTerminals([...cur, ...items]);
}

/** Tek kaydı güncelle (terminalId ile) */
export function updateTerminal(updated: Terminal): void {
  const cur = loadTerminals();
  const idx = cur.findIndex((t) => t.terminalId === updated.terminalId);
  if (idx === -1) return;
  cur[idx] = { ...cur[idx], ...updated };
  saveTerminals(cur);
}

/** Çoklu upsert (varsa günceller, yoksa ekler) */
export function upsertTerminals(items: Terminal[]): void {
  const byId = new Map(loadTerminals().map((t) => [t.terminalId, t]));
  for (const it of items) byId.set(it.terminalId, { ...(byId.get(it.terminalId) ?? {}), ...it });
  saveTerminals(Array.from(byId.values()));
}

/** İşyeri bazlı filtreleme */
export function findByIsyeriNo(isyeriNo: string): Terminal[] {
  const cur = loadTerminals();
  return cur.filter((t) => t.isyeriNo === isyeriNo);
}

/** Tümünü temizle (isteğe bağlı yardımcı) */
export function clearTerminals(): void {
  saveTerminals([]);
}
