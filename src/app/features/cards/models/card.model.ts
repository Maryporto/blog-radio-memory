/**
 * Formato CRU que a API devolve. Mantido separado do modelo da tela porque
 * a API tem inconsistências reais (ex.: "" vs null, data "0000-00-00").
 */
export interface ApiCard {
  id: number;
  titulo: string;
  subtitulo: string;
  corpo: string;
  urlPost: string;
  imgUrl: string;
  autor: string;
  status: number;
  data: string;
  categoria: string;
  videoUrl: string;
  data_fixo: string | null;
}

/**
 * Formato NORMALIZADO usado pelo app: campos opcionais viram `null`,
 * datas viram `Date` e URLs já chegam validadas.
 */
export interface Card {
  id: number;
  titulo: string;
  subtitulo: string;
  /** HTML cru — só pode ser exibido via [innerHTML] (sanitizado pelo Angular). */
  corpo: string;
  urlPost: string | null;
  imgUrl: string | null;
  autor: string;
  status: number;
  data: Date | null;
  categoria: string;
  /** Só URLs de embed do YouTube passam na validação. */
  videoUrl: string | null;
  dataFixo: Date | null;
}

/** Filtros da listagem (também refletidos na querystring). */
export interface CardFilters {
  categoria: string | null;
  busca: string;
}
