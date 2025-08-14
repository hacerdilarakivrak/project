export type KayitDurum = 0 | 1 | 2;

export interface Terminal {
  terminalId: string;
  kayitDurum: KayitDurum;
  kayitTarihi: string;
  isyeriNo: string;
  kontakTelefon: string;
  kontakYetkiliIsmi: string;
  kullanimTipi: "masaüstü" | "mobil" | "cep_pos" | "sanal";
  modelKodu: "" | "S900" | "MX915" | "T300" | "VX680-ECR" | "FR-8300" | "P1000" | "PAXA910";
  servisFirmasi:
    | ""
    | "ARCELIK"
    | "PROFILO"
    | "INGENICO"
    | "HUGIN"
    | "MIKROSARAY"
    | "VERIFONE"
    | "INFOTEKS";
  seriNo: string;
  kapanmaNedeni?: string;
}
