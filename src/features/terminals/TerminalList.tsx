import React, { useMemo, useState } from "react";
import type { Terminal, KayitDurum } from "./types";

type Props = {
  items: Terminal[];
  onEdit: (t: Terminal) => void;
  onDelete?: (id: string) => void;
};

function durumLabel(d: KayitDurum) {
  if (d === 0) return "Kapalı";
  if (d === 1) return "Açık";
  return "Kurulum";
}

type SortKey =
  | "id"
  | "kayitDurum"
  | "isyeriNo"
  | "modelKodu"
  | "seriNo"
  | "servisFirmasi"
  | "kullanimTipi"
  | "kayitTarihi";

export default function TerminalList({ items, onEdit, onDelete }: Props) {
  const [isyeriNo, setIsyeriNo] = useState("");
  const [kayitDurum, setKayitDurum] = useState<"" | "0" | "1" | "2">("");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("kayitTarihi");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const uniqueIsyeri = useMemo(
    () => Array.from(new Set(items.map((i) => i.isyeriNo))).sort(),
    [items]
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "kayitTarihi" ? "desc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    const query = q.trim().toUpperCase();
    const base = items
      .filter((t) => (isyeriNo ? t.isyeriNo === isyeriNo : true))
      .filter((t) => (kayitDurum === "" ? true : String(t.kayitDurum) === kayitDurum))
      .filter((t) =>
        query
          ? (t.seriNo || "").toUpperCase().includes(query) ||
            (t.modelKodu || "").toUpperCase().includes(query) ||
            (t.servisFirmasi || "").toUpperCase().includes(query)
          : true
      );

    const getVal = (t: Terminal): string | number => {
      switch (sortKey) {
        case "id":
          return t.id;
        case "kayitDurum":
          return t.kayitDurum;
        case "isyeriNo":
          return t.isyeriNo || "";
        case "modelKodu":
          return t.modelKodu || "";
        case "seriNo":
          return t.seriNo || "";
        case "servisFirmasi":
          return t.servisFirmasi || "";
        case "kullanimTipi":
          return t.kullanimTipi || "";
        case "kayitTarihi":
          return new Date(t.kayitTarihi).getTime();
      }
    };

    const sorted = [...base].sort((a, b) => {
      const av = getVal(a);
      const bv = getVal(b);
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), "tr", { numeric: true });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [items, isyeriNo, kayitDurum, q, sortKey, sortDir]);

  const sortIcon = (key: SortKey) =>
    sortKey !== key ? "↕" : sortDir === "asc" ? "▲" : "▼";

  return (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-sm mb-1">İşyeri No (filtre)</label>
          <select
            className="border rounded px-2 py-1 min-w-[160px]"
            value={isyeriNo}
            onChange={(e) => setIsyeriNo(e.target.value)}
          >
            <option value="">Hepsi</option>
            {uniqueIsyeri.map((no) => (
              <option key={no} value={no}>
                {no}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Kayıt Durumu</label>
          <select
            className="border rounded px-2 py-1"
            value={kayitDurum}
            onChange={(e) => setKayitDurum(e.target.value as any)}
          >
            <option value="">Hepsi</option>
            <option value="2">Kurulum</option>
            <option value="1">Açık</option>
            <option value="0">Kapalı</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Ara (Seri / Model / Servis)</label>
          <input
            className="border rounded px-2 py-1"
            placeholder="örn: S900 veya AB12"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-black/60 backdrop-blur border-b">
            <tr className="text-left">
              {([
                ["id", "TERMINAL ID"],
                ["kayitDurum", "DURUM"],
                ["isyeriNo", "İŞYERİ"],
                ["modelKodu", "MODEL"],
                ["seriNo", "SERI"],
                ["servisFirmasi", "SERVIS"],
                ["kullanimTipi", "KULLANIM"],
                ["kayitTarihi", "KAYIT TARIHI"],
              ] as [SortKey, string][]).map(([key, label]) => (
                <th key={key} className="py-2 pr-2">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="flex items-center gap-1 select-none cursor-pointer"
                    title="Sırala"
                  >
                    <span>{label}</span>
                    <span className="text-xs opacity-70">{sortIcon(key)}</span>
                  </button>
                </th>
              ))}
              <th className="py-2 pr-2">AKSİYON</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="py-2 pr-2 font-mono">{t.id}</td>
                <td className="py-2 pr-2">
                  <span
                    className={
                      "px-2 py-0.5 rounded text-xs " +
                      (t.kayitDurum === 0
                        ? "bg-red-100 text-red-700"
                        : t.kayitDurum === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700")
                    }
                  >
                    {durumLabel(t.kayitDurum)}
                  </span>
                </td>
                <td className="py-2 pr-2">{t.isyeriNo}</td>
                <td className="py-2 pr-2">{t.modelKodu || "-"}</td>
                <td className="py-2 pr-2">{t.seriNo || "-"}</td>
                <td className="py-2 pr-2">{t.servisFirmasi || "-"}</td>
                <td className="py-2 pr-2">{t.kullanimTipi}</td>
                <td className="py-2 pr-2">
                  {new Date(t.kayitTarihi).toLocaleString()}
                </td>
                <td className="py-2 pr-2">
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 rounded border"
                      onClick={() => onEdit(t)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="px-2 py-1 rounded border bg-red-50"
                      onClick={() => onEdit({ ...t, kayitDurum: 0 as KayitDurum })}
                      title="Kapat"
                    >
                      Kapat
                    </button>
                    <button
                      className="px-2 py-1 rounded border bg-red-600 text-white"
                      onClick={() => onDelete?.(t.id)}
                      title="Sil"
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-gray-500">
                  Kayıt bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
