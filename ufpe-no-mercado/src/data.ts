import type { Answers, AreaKey, NivelKey, Option, Step } from "./types";

export const PORTAL_VAGAS = "https://grupomoura.gupy.io/";

/** Reinicia sozinho após 2 min sem toque (totem/TV de evento). */
export const IDLE_MS = 120_000;

export const NIVEL_ORDER: NivelKey[] = ["jovem", "estagio", "primeiro", "efetivo"];

export const NIVEL_LABEL: Record<NivelKey, string> = {
  jovem: "Jovem Aprendiz",
  estagio: "Estágio",
  primeiro: "Primeiro emprego",
  efetivo: "Vaga efetiva",
};

export const AREA_LABEL: Record<AreaKey, string> = {
  comercial: "Comercial & Vendas",
  logistica: "Logística & Suprimentos",
  operacional: "Operacional & Produção Fabril",
  admfin: "Administrativo & Financeiro",
  tech: "Tecnologia & Inovação",
  engenharia: "Engenharia & P&D",
  rh: "Recursos Humanos / Gestão",
};

/** Requisitos divulgados em moura.com.br/carreiras para o Jovem Aprendiz. */
export const JOVEM_NOTA =
  "Jovem Aprendiz: idade entre 18 e 21 anos e 9 meses, ensino médio concluído ou em andamento.";

/** Aviso exibido no resultado: o teste sugere, não garante. */
export const AVISO_SUGESTAO =
  "As vagas indicadas são sugestões baseadas nas suas respostas: não garantem seleção e podem ser encerradas a qualquer momento. Confira os requisitos e a disponibilidade na página da vaga.";

/** Quantas sugestões extras aparecem em "Outras sugestões" (o texto do total já indica que há mais). */
export const MAX_RELACIONADAS = 2;

export const ESTADOS_BR = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo",
  "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba",
  "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul",
  "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins",
];

const simple = (labels: string[]): Option[] => labels.map((l) => ({ value: l, label: l }));

export const STEPS: Step[] = [
  {
    id: "escolaridade",
    kind: "choice",
    field: "escolaridade",
    layout: "grid",
    title: "Qual é a sua escolaridade?",
    options: simple([
      "Ensino Médio em andamento",
      "Ensino Médio concluído",
      "Curso Técnico em andamento",
      "Curso Técnico concluído",
      "Ensino Superior em andamento",
      "Ensino Superior concluído",
    ]),
  },
  {
    id: "curso",
    kind: "choice",
    field: "curso",
    layout: "chips",
    title: "Qual curso você faz ou concluiu?",
    options: simple([
      "Administração", "Engenharia Mecânica", "Engenharia de Produção", "Engenharia Elétrica",
      "Engenharia Eletrônica", "Engenharia Química", "Engenharia Ambiental", "Tecnologia da Informação",
      "Logística", "Ciências Contábeis", "Economia", "Psicologia", "Recursos Humanos",
      "Técnico em Administração", "Técnico em Eletrotécnica", "Técnico em Eletrônica", "Técnico em Mecânica",
      "Técnico em Mecatrônica", "Técnico em Química", "Técnico em Logística", "Técnico em Segurança do Trabalho",
      "Outros", "Nenhum",
    ]),
  },
  { id: "local", kind: "local", title: "Onde você mora atualmente?" },
  {
    id: "busca",
    kind: "choice",
    field: "busca",
    layout: "list",
    title: "O que você busca neste momento?",
    options: [
      { value: "jovem", label: "Jovem Aprendiz", description: "Aprender a profissão trabalhando" },
      { value: "estagio", label: "Estágio", description: "Para quem cursa ensino técnico ou superior" },
      { value: "primeiro", label: "Primeiro emprego", description: "Nível operacional ou administrativo" },
      { value: "efetivo", label: "Oportunidade efetiva", description: "Cargo profissional ou técnico" },
      { value: "conhecer", label: "Só quero conhecer as vagas", description: "Ver o que a Moura tem aberto agora" },
    ],
  },
  {
    id: "area",
    kind: "choice",
    field: "area",
    layout: "cards",
    title: "Qual destas áreas mais desperta seu interesse?",
    options: [
      { value: "comercial", icon: "comercial", label: "Comercial & Vendas", description: "Vendedor externo, consultor, atendimento" },
      { value: "logistica", icon: "logistica", label: "Logística & Suprimentos", description: "Estoque, expedição, distribuição" },
      { value: "operacional", icon: "operacional", label: "Operacional & Produção Fabril", description: "Manutenção, operação industrial, qualidade" },
      { value: "admfin", icon: "admfin", label: "Administrativo & Financeiro", description: "Contabilidade, faturamento, planejamento" },
      { value: "tech", icon: "tech", label: "Tecnologia & Inovação", description: "TI, análise de sistemas, software" },
      { value: "engenharia", icon: "engenharia", label: "Engenharia & P&D", description: "Química, elétrica, mecânica, produção" },
      { value: "rh", icon: "rh", label: "Recursos Humanos / Gestão", description: "Atração e seleção, treinamento, DP" },
    ],
  },
];

export const INITIAL_ANSWERS: Answers = {
  escolaridade: "",
  curso: "",
  uf: "",
  cidade: "",
  busca: "",
  area: "",
};
