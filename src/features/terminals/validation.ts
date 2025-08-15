// src/validation.ts
import { z } from "zod";
import type { Terminal } from "./types";
import {
  MODEL_KODLARI,
  SERVIS_FIRMALARI,
  KAPANMA_NEDENLERI,
  KULLANIM_TIPLERI,
} from "./constants";

const asEnum = <T extends readonly [string, ...string[]]>(arr: T) => z.enum(arr);

const KULLANIM_TIPLERI_ENUM = asEnum(KULLANIM_TIPLERI);
const MODEL_KODLARI_ENUM = asEnum(MODEL_KODLARI);
const SERVIS_FIRMALARI_ENUM = asEnum(SERVIS_FIRMALARI);
const KAPANMA_NEDENLERI_ENUM = asEnum(KAPANMA_NEDENLERI);

export const TerminalSchema = z
  .object({
    id: z.string().min(1),
    kayitDurum: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    kayitTarihi: z.string().min(1),

    isyeriNo: z.string().min(1, "İşyeri numarası zorunludur."),

    // Opsiyonel: boş bırakılabilir ya da en az 5 karakter
    kontakTelefon: z
      .string()
      .optional()
      .refine((v) => !v || v.length === 0 || v.length >= 5, {
        message: "Telefon en az 5 karakter olmalı.",
      }),

    // Opsiyonel: boş bırakılabilir
    kontakYetkiliIsmi: z.string().optional(),

    kullanimTipi: KULLANIM_TIPLERI_ENUM,

    // Boş ("") seçeneği dahil
    modelKodu: MODEL_KODLARI_ENUM,
    servisFirmasi: SERVIS_FIRMALARI_ENUM,

    // Boş olabilir veya A-Z0-9
    seriNo: z
      .string()
      .regex(/^[A-Z0-9]*$/, "Seri yalnızca A-Z ve 0-9 içerebilir."),

    // Sadece kapalıyken zorunlu olacak (superRefine'de kontrol)
    kapanmaNedeni: KAPANMA_NEDENLERI_ENUM.optional(),

    guncellemeTarihi: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    const anyOfTrio = !!v.modelKodu || !!v.servisFirmasi || !!v.seriNo;
    const allOfTrio = !!v.modelKodu && !!v.servisFirmasi && !!v.seriNo;

    if (anyOfTrio && !allOfTrio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Model, Servis ve Seri üçü beraber girilmeli.",
        path: ["modelKodu"],
      });
    }

    if (v.kayitDurum === 0 && !v.kapanmaNedeni) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kapalı durumunda kapanma nedeni zorunludur.",
        path: ["kapanmaNedeni"],
      });
    }
  });

export function validateTerminal(candidate: Terminal) {
  return TerminalSchema.safeParse(candidate);
}

export function assertValidTerminal(candidate: Terminal) {
  const res = validateTerminal(candidate);
  if (!res.success) {
    const msg = res.error.issues.map((i) => i.message).join("\n");
    throw new Error(msg);
  }
}

export function validateTerminalForBulk(base: Terminal) {
  const bulkCandidate: Terminal = {
    ...base,
    modelKodu: "",
    servisFirmasi: "",
    seriNo: "",
  };
  return TerminalSchema.safeParse(bulkCandidate);
}

