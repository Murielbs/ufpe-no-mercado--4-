export type AreaKey =
  | "comercial"
  | "logistica"
  | "operacional"
  | "admfin"
  | "tech"
  | "engenharia"
  | "rh";

export type NivelKey = "jovem" | "estagio" | "primeiro" | "efetivo";
export type BuscaKey = NivelKey | "conhecer";

export type Escolaridade = "medio" | "tecnico" | "superior";

/** vaga = link direto · busca = abre uma busca no portal · banco = banco de talentos */
export type TipoLink = "vaga" | "busca" | "banco";

export interface Vaga {
  id: string;
  /** número da vaga no Gupy (0 = portal) */
  ref: number;
  titulo: string;
  url: string;
  tipo: TipoLink;
  /** níveis em que a vaga se encaixa (técnicos e "Jr" cabem em primeiro emprego e efetiva) */
  niveis: NivelKey[];
  /** a primeira é a área principal */
  areas: AreaKey[];
  /** texto exibido: "Belo Jardim, PE" */
  local: string;
  /** estados (nome completo). Vazio = diversas localidades */
  ufs: string[];
  cidades: string[];
  minEscolaridade: Escolaridade;
  /** cursos (da lista do formulário) que combinam com a vaga */
  cursos: string[];
  /** vaga/banco genérico, serve para qualquer área */
  geral: boolean;
  pcd: boolean;
}

export interface Answers {
  escolaridade: string;
  curso: string;
  periodo: string;
  uf: string;
  cidade: string;
  busca: BuscaKey | "";
  area: AreaKey | "";
}

export type ChoiceField = "escolaridade" | "curso" | "periodo" | "busca" | "area";

export interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: AreaKey;
}

export type Step =
  | {
      id: ChoiceField;
      kind: "choice";
      title: string;
      field: ChoiceField;
      layout: "list" | "grid" | "chips" | "cards";
      options: Option[];
    }
  | { id: "local"; kind: "local"; title: string };

export interface Match {
  vaga: Vaga;
  score: number;
  /** por que a vaga foi sugerida (exibido ao participante) */
  motivos: string[];
  /** nível exibido no cartão */
  tag: string;
}

export interface Recommendation {
  tipo: "vaga" | "portal";
  principal: Vaga;
  motivos: string[];
  descricao: string;
  areaLabel?: string;
  nivelLabel?: string;
  relacionadas: Match[];
  /** total de vagas compatíveis encontradas */
  total: number;
}

export type SetAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => void;
