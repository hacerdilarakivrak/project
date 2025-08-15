export type KayitDurum = 0 | 1 | 2;
export type KullanimTipi = 'masaüstü' | 'mobil' | 'cep pos' | 'sanal';
export type ModelKodu =
  | ''
  | 'S900'
  | 'MX915'
  | 'T300'
  | 'VX680-ECR'
  | 'FR-8300'
  | 'P1000'
  | 'PAXA910';
export type ServisFirmasi =
  | ''
  | 'ARCELIK'
  | 'PROFILO'
  | 'INGENICO'
  | 'HUGIN'
  | 'MIKROSARAY'
  | 'VERIFONE'
  | 'INFOTEKS';
export type KapanmaNedeni =
  | ''
  | 'Sahtekarlık'
  | 'Borç'
  | 'Verimsizlik'
  | 'Ciro Yetersizliği'
  | 'Sözleşme sonu'
  | 'Geçici Kapama'
  | 'Devir'
  | 'Şube İsteği'
  | 'İşyeri Talebi'
  | 'Diğer';

export type Terminal = {
  id: string;
  kayitDurum: KayitDurum;
  kayitTarihi: string;
  isyeriNo: string;
  kontakTelefon?: string;
  kontakYetkiliIsmi?: string;
  kullanimTipi: KullanimTipi;
  modelKodu: ModelKodu;
  servisFirmasi: ServisFirmasi;
  seriNo: string;
  kapanmaNedeni?: KapanmaNedeni;
  guncellemeTarihi?: string;
};



