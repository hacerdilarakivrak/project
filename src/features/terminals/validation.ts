import { z } from "zod";
import type { Terminal } from "./types";
import {
  MODEL_KODLARI,
  SERVIS_FIRMALARI,
  KAPANMA_NEDENLERI,
  KULLANIM_TIPLERI,
} from "./constants";

/**
 * Zod şeması — iş kuralları:
 * - Model+Servis+Seri üçü ya birlikte dolu ya da birlikte boş (trio kuralı)
 * - Kayıt durumu 0 (kapalı) ise kapanma nedeni ZORUNLU
 * - Seri no: yalnızca A-Z ve 0-9 (uppercase’ı UI’da veriyoruz)
 */
export const TerminalSchema = z
  .object({
    terminalId: z.string().min(1),
    kayitDurum: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    kayitTarihi: z.string().min(1), // ISO string
    isyeriNo: z.string().min(1, "İşyeri numarası zorunludur."),
    kontakTelefon: z.string().min(5, "Telefon en az 5 karakter olmalı."),
    kontakYetkiliIsmi: z.string().min(1, "Yetkili ismi zorunludur."),
    kullanimTipi: z.enum(KULLANIM_TIPLERI),
    modelKodu: z.enum(MODEL_KODLARI),
    servisFirmasi: z.enum(SERVIS_FIRMALARI),
    seriNo: z
      .string()
      .regex(/^[A-Z0-9]*$/, "Seri yalnızca A-Z ve 0-9 içerebilir."),
    kapanmaNedeni: z.enum(KAPANMA_NEDENLERI).optional(),
  })
  .superRefine((v, ctx) => {
    const anyOfTrio = !!v.modelKodu || !!v.servisFirmasi || !!v.seriNo;
    const allOfTrio = !!v.modelKodu && !!v.servisFirmasi && !!v.seriNo;

    // Üçlü kuralı
    if (anyOfTrio && !allOfTrio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Model, Servis ve Seri üçü beraber girilmeli.",
        path: ["modelKodu"],
      });
    }

    // Kapalı durumda kapanma nedeni zorunlu
    if (v.kayitDurum === 0 && !v.kapanmaNedeni) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kapalı durumunda kapanma nedeni zorunludur.",
        path: ["kapanmaNedeni"],
      });
    }
  });

/** Tek kayıt doğrulama (ekleme/düzenleme) */
export function validateTerminal(candidate: Terminal) {
  return TerminalSchema.safeParse(candidate);
}

/** Hata varsa Error fırlatır; try/catch ile kullanışlı */
export function assertValidTerminal(candidate: Terminal) {
  const res = validateTerminal(candidate);
  if (!res.success) {
    const msg = res.error.issues.map((i) => i.message).join("\n");
    throw new Error(msg);
  }
}

/**
 * (Opsiyonel) Toplu ekleme için yardımcı:
 * Üçlü alanlar boş bırakılarak (model/servis/seri) geri kalan zorunluları kontrol eder.
 * UI’da `TerminalForm` toplu ekleme prob’unda bunu kullanabilirsin.
 */
export function validateTerminalForBulk(base: Terminal) {
  const bulkCandidate: Terminal = {
    ...base,
    modelKodu: "",
    servisFirmasi: "",
    seriNo: "",
  };
  return TerminalSchema.safeParse(bulkCandidate);
}




