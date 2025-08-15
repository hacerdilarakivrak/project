import React, { useEffect, useState } from "react";
import type { Terminal, KayitDurum } from "./types";
import {
  KULLANIM_TIPLERI,
  MODEL_KODLARI,
  SERVIS_FIRMALARI,
  KAPANMA_NEDENLERI,
} from "./constants";
import { validateTerminal } from "./validation";

export default function TerminalEditModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Terminal;
  onSave: (t: Terminal) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Terminal>({ ...initial });
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    setForm({ ...initial });
    setErrorText("");
  }, [initial]);

  const trioAny =
    form.modelKodu !== "" ||
    form.servisFirmasi !== "" ||
    (form.seriNo || "").trim() !== "";
  const trioAll =
    form.modelKodu !== "" &&
    form.servisFirmasi !== "" &&
    (form.seriNo || "").trim() !== "";

  const showKapanma = Number(form.kayitDurum) === 0;

  // Generic imzayı gevşetip güvenli cast ile tek noktadan güncelliyoruz.
  function setField<K extends keyof Terminal>(key: K, value: Terminal[K] | any) {
    setErrorText("");
    setForm((f) => ({ ...f, [key]: value as Terminal[K] }));
  }

  const handleSave = () => {
    setErrorText("");

    if (trioAny && !trioAll) {
      setErrorText("Model, Servis ve Seri üçü beraber girilmeli.");
      return;
    }
    if (Number(form.kayitDurum) === 0 && !form.kapanmaNedeni) {
      setErrorText("Kapalı durumunda kapanma nedeni zorunludur.");
      return;
    }

    const candidate: Terminal = {
      ...form,
      seriNo: (form.seriNo || "").toUpperCase(),
    };

    const res = validateTerminal(candidate);
    if (!res.success) {
      setErrorText(res.error.issues.map((i) => i.message).join("\n"));
      return;
    }

    onSave(candidate);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[min(920px,95vw)] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Terminal Düzenle</h3>
          <button className="px-2 py-1 rounded border" onClick={onClose}>
            Kapat
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Kayıt Durumu</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.kayitDurum}
              onChange={(e) =>
                setField("kayitDurum", Number(e.target.value) as KayitDurum)
              }
            >
              <option value={2}>Kurulum</option>
              <option value={1}>Açık</option>
              <option value={0}>Kapalı</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">İşyeri No</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.isyeriNo}
              onChange={(e) => setField("isyeriNo", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Kullanım Tipi</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.kullanimTipi}
              onChange={(e) =>
                setField(
                  "kullanimTipi",
                  e.target.value as Terminal["kullanimTipi"]
                )
              }
            >
              {KULLANIM_TIPLERI.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="block text-sm mb-1">Kontak Telefon</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.kontakTelefon || ""}
              onChange={(e) => setField("kontakTelefon", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Yetkili İsmi</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.kontakYetkiliIsmi || ""}
              onChange={(e) => setField("kontakYetkiliIsmi", e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="block text-sm mb-1">Model Kodu</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.modelKodu}
              onChange={(e) =>
                setField("modelKodu", e.target.value as Terminal["modelKodu"])
              }
            >
              {MODEL_KODLARI.map((m) => (
                <option key={m} value={m}>
                  {m === "" ? "<boş>" : m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Servis Firması</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.servisFirmasi}
              onChange={(e) =>
                setField(
                  "servisFirmasi",
                  e.target.value as Terminal["servisFirmasi"]
                )
              }
            >
              {SERVIS_FIRMALARI.map((s) => (
                <option key={s} value={s}>
                  {s === "" ? "<boş>" : s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Seri No</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={form.seriNo || ""}
              onChange={(e) => setField("seriNo", e.target.value.toUpperCase())}
              placeholder="A-Z ve 0-9"
            />
          </div>
        </div>

        {showKapanma && (
          <div className="mt-3">
            <label className="block text-sm mb-1">Kapanma Nedeni *</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.kapanmaNedeni ?? ""}
              onChange={(e) =>
                setField(
                  "kapanmaNedeni",
                  (e.target.value || undefined) as Terminal["kapanmaNedeni"]
                )
              }
            >
              <option value="">Seçiniz</option>
              {KAPANMA_NEDENLERI.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        )}

        {errorText && (
          <div className="text-red-600 text-sm whitespace-pre-line border border-red-200 bg-red-50 rounded p-2 mt-3">
            {errorText}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-1 rounded border" onClick={onClose}>
            Vazgeç
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={handleSave}
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

