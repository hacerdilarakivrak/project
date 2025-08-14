import { z } from "zod";
import type { Terminal } from "./types";
import {
  MODEL_KODLARI,
  SERVIS_FIRMALARI,
  KAPANMA_NEDENLERI,
  KULLANIM_TIPLERI,
} from "./constants";

export const TerminalSchema = z
  .object({
    terminalId: z.string().min(1),
    kayitDurum: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    kayitTarihi: z.string().min(1),
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
