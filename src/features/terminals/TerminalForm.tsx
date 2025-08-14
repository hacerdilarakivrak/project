import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import type { Terminal, KayitDurum } from "./types";
import { addTerminals } from "./storage";
import {
  KULLANIM_TIPLERI,
  MODEL_KODLARI,
  SERVIS_FIRMALARI,
} from "./constants";
import { validateTerminal } from "./validation";

type KullanimTipi = (typeof KULLANIM_TIPLERI)[number];
type ModelKodu = (typeof MODEL_KODLARI)[number];
type ServisFirmasi = (typeof SERVIS_FIRMALARI)[number];

type FormState = {
  kayitDurum: KayitDurum;
  kullanimTipi: KullanimTipi;
  isyeriNo: string;
  kontakTelefon: string;
  kontakYetkiliIsmi: string;
  modelKodu: ModelKodu;
  servisFirmasi: ServisFirmasi;
  seriNo: string;
  adet: number;
};

const initialForm: FormState = {
  kayitDurum: 2,
  kullanimTipi: "masaüstü",
  isyeriNo: "",
  kontakTelefon: "",
  kontakYetkiliIsmi: "",
  modelKodu: "",
  servisFirmasi: "",
  seriNo: "",
  adet: 1,
};

export default function TerminalForm({
  onCreated,
}: {
  onCreated?: (created: Terminal[]) => void;
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errorText, setErrorText] = useState("");

  const trioAny =
    form.modelKodu !== "" || form.servisFirmasi !== "" || form.seriNo.trim() !== "";
  const trioAll =
    form.modelKodu !== "" && form.servisFirmasi !== "" && form.seriNo.trim() !== "";
  const adetEnabled = !trioAny;

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setErrorText("");
    setForm((f) => ({ ...f, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrorText("");
  };

  const buildSingle = (): Terminal => {
    const now = new Date().toISOString();
    return {
      terminalId: uuid(),
      kayitDurum: form.kayitDurum,
      kayitTarihi: now,
      isyeriNo: form.isyeriNo.trim(),
      kontakTelefon: form.kontakTelefon.trim(),
      kontakYetkiliIsmi: form.kontakYetkiliIsmi.trim(),
      kullanimTipi: form.kullanimTipi,
      modelKodu: form.modelKodu,
      servisFirmasi: form.servisFirmasi,
      seriNo: form.seriNo.toUpperCase(),
    };
  };

  const handleSubmit = () => {
    setErrorText("");

    // Üçlü kural
    if (trioAny && !trioAll) {
      setErrorText("Model, Servis ve Seri üçü beraber girilmeli.");
      return;
    }

    // Toplu ekleme
    if (adetEnabled && form.adet > 1) {
      const n = Math.max(1, Number(form.adet) || 1);

      // Zorunlu alanları örnek kayıtla kontrol et
      const probe: Terminal = {
        ...buildSingle(),
        modelKodu: "",
        servisFirmasi: "",
        seriNo: "",
      };
      const probeCheck = validateTerminal(probe);
      if (!probeCheck.success) {
        setErrorText(probeCheck.error.issues.map((i) => i.message).join("\n"));
        return;
      }

      const created: Terminal[] = Array.from({ length: n }).map(() => ({
        ...probe,
        terminalId: uuid(),
        kayitTarihi: new Date().toISOString(),
      }));

      addTerminals(created);
      onCreated?.(created);
      resetForm();
      return;
    }

    // Tekil ekleme
    const candidate = buildSingle();
    const result = validateTerminal(candidate);
    if (!result.success) {
      setErrorText(result.error.issues.map((i) => i.message).join("\n"));
      return;
    }

    addTerminals([candidate]);
    onCreated?.([candidate]);
    resetForm();
  };

  return (
    <div className="p-4 rounded-lg border space-y-3">
      <h3 className="font-semibold text-lg">Terminal Ekle</h3>

      {/* İşyeri ve kontak */}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">İşyeri No *</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={form.isyeriNo}
            onChange={(e) => onChange("isyeriNo", e.target.value)}
            placeholder="Örn: 123456"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Kontak Telefon</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={form.kontakTelefon}
            onChange={(e) => onChange("kontakTelefon", e.target.value)}
            placeholder="0xxxxxxxxxx"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Yetkili İsmi</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={form.kontakYetkiliIsmi}
            onChange={(e) => onChange("kontakYetkiliIsmi", e.target.value)}
            placeholder="Ad Soyad"
          />
        </div>
      </div>

      {/* Durum & kullanım tipi */}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Kayıt Durumu</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.kayitDurum}
            onChange={(e) => onChange("kayitDurum", Number(e.target.value) as KayitDurum)}
          >
            <option value={2}>Kurulum Bekliyor (2)</option>
            <option value={1}>Açık (1)</option>
            <option value={0}>Kapalı (0)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Kullanım Tipi</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.kullanimTipi}
            onChange={(e) => onChange("kullanimTipi", e.target.value as KullanimTipi)}
          >
            {KULLANIM_TIPLERI.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model / Servis / Seri (Üçlü Kural) */}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">
            Model Kodu {trioAny ? "*" : "(boş bırakılabilir)"}
          </label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.modelKodu}
            onChange={(e) => onChange("modelKodu", e.target.value as ModelKodu)}
          >
            {MODEL_KODLARI.map((m) => (
              <option key={m} value={m}>
                {m === "" ? "<boş>" : m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Servis Firması {trioAny ? "*" : "(boş bırakılabilir)"}
          </label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.servisFirmasi}
            onChange={(e) => onChange("servisFirmasi", e.target.value as ServisFirmasi)}
          >
            {SERVIS_FIRMALARI.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "<boş>" : s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Seri No {trioAny ? "*" : "(boş bırakılabilir)"}
          </label>
          <input
            className="w-full border rounded px-2 py-1"
            value={form.seriNo}
            onChange={(e) => onChange("seriNo", e.target.value.toUpperCase())}
            placeholder="Sadece A-Z ve 0-9"
          />
        </div>
      </div>

      {/* Adet (toplu) — sadece üçlü tamamen boşsa aktif */}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Adet (toplu ekleme)</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-2 py-1"
            value={form.adet}
            onChange={(e) =>
              onChange("adet", Math.max(1, Number(e.target.value) || 1))
            }
            disabled={!adetEnabled}
          />
          {!adetEnabled && (
            <p className="text-xs text-gray-500 mt-1">
              Model/Servis/Seri alanlarından biri dolu olduğu için toplu ekleme devre dışı.
            </p>
          )}
        </div>
      </div>

      {/* Hatalar */}
      {errorText && (
        <div className="text-red-600 text-sm whitespace-pre-line border border-red-200 bg-red-50 rounded p-2">
          {errorText}
        </div>
      )}

      {/* Aksiyonlar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={handleSubmit}
        >
          Kaydet
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={resetForm}
        >
          Temizle
        </button>
      </div>
    </div>
  );
}






