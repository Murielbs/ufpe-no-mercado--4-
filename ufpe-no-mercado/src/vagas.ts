/**
 * CATÁLOGO DE VAGAS — montado automaticamente a partir de vagas-lista.ts.
 *
 * Só entram vagas com link direto (…/jobs/NÚMERO) copiado da lista oficial do Gupy.
 * Este arquivo lê cada linha, limpa o título e descobre nível, área, cursos e
 * escolaridade por palavras-chave (REGRAS). Casos que a regra não resolve bem
 * ficam em AJUSTES, pelo número da vaga.
 *
 * O motor em recommend.ts usa esses dados para pontuar e ordenar as SUGESTÕES.
 */
import { LISTA_BRUTA } from "./vagas-lista";
import type { AreaKey, Escolaridade, NivelKey, Vaga } from "./types";

// ───────────── vocabulário ─────────────
const JOVEM: NivelKey[] = ["jovem"];
const EST: NivelKey[] = ["estagio"];
const PRIM: NivelKey[] = ["primeiro"];
const EFET: NivelKey[] = ["efetivo"];
const TEC: NivelKey[] = ["primeiro", "efetivo"]; // técnicos e cargos "Jr"

// cursos (iguais aos do formulário)
const ADM = "Administração", MEC = "Engenharia Mecânica", PROD = "Engenharia de Produção";
const ELE = "Engenharia Elétrica", ELN = "Engenharia Eletrônica", QUI = "Engenharia Química";
const AMB = "Engenharia Ambiental", TI = "Tecnologia da Informação", LOG = "Logística";
const CONT = "Ciências Contábeis", ECO = "Economia", PSI = "Psicologia", RH = "Recursos Humanos";
const T_ADM = "Técnico em Administração", T_ELE = "Técnico em Eletrotécnica";
const T_ELN = "Técnico em Eletrônica", T_MEC = "Técnico em Mecânica";
const T_MECAT = "Técnico em Mecatrônica", T_QUI = "Técnico em Química";
const T_LOG = "Técnico em Logística", T_SEG = "Técnico em Segurança do Trabalho";

const UF_NOME: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará",
  DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso",
  MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// ───────────── regras de classificação (a primeira que casar vale) ─────────────
// Texto comparado: título limpo, sem acento e em minúsculas.
type Regra = [RegExp, AreaKey[], string[]];
const REGRAS: Regra[] = [
  [/^estagio.*controladoria$/, ["admfin"], [CONT]],
  // Jovem Aprendiz
  [/jovem aprendiz.*(administrativ|financeiro)/, ["admfin"], []],
  [/jovem aprendiz.*logistica/, ["logistica"], []],
  [/jovem aprendiz.*assistencia tecnica/, ["comercial", "operacional"], []],
  [/jovem aprendiz.*experiencia do cliente/, ["comercial"], []],
  // Técnico / fábrica
  [/seguranca do trabalho/, ["operacional", "engenharia"], [AMB, PROD, T_SEG]],
  [/manutencao eletrica|eletrotecnica|mecatronica/, ["operacional", "engenharia"], [ELE, ELN, MEC, T_ELE, T_ELN, T_MEC, T_MECAT]],
  [/manutencao mecanica/, ["operacional", "engenharia"], [MEC, T_MEC, T_MECAT]],
  [/^estagio tecnico$/, ["operacional"], [MEC, ELE, ELN, QUI, PROD, T_ELE, T_ELN, T_MEC, T_MECAT, T_QUI, T_LOG, T_ADM, T_SEG]],
  [/assistente tecnico|auxiliar tecnico|lider tecnico|assistencia tecnica/, ["comercial", "operacional"], [ELE, ELN, MEC, T_ELE, T_ELN, T_MEC, T_MECAT]],
  [/tecnico de garantia|tecnico em produto/, ["operacional", "engenharia"], [QUI, ELE, MEC, T_QUI, T_ELE, T_MEC]],
  // Engenharia
  [/engenharia de produto/, ["engenharia"], [MEC, ELE, ELN, QUI, PROD]],
  [/engenharia de projetos/, ["engenharia"], [MEC, ELE, ELN, PROD]],
  [/estagio em engenharia/, ["engenharia", "operacional"], [MEC, PROD, ELE, ELN, QUI, AMB]],
  // Tecnologia e dados
  [/inteligencia artificial/, ["tech"], [TI, PROD]],
  [/analise de dados/, ["tech", "comercial"], [TI, ADM, ECO, PROD]],
  [/gestao da informacao/, ["tech", "admfin"], [TI, ADM]],
  [/projetos de ti/, ["tech"], [TI, ADM, PROD]],
  [/sistemas|aplicacao/, ["tech"], [TI]],
  // RH e gestão
  [/responsabilidade social/, ["rh", "operacional"], [AMB, ADM, PSI]],
  [/atracao e selecao|gestao de pessoas|analista de pessoas|desenvolvimento organizacional/, ["rh"], [PSI, RH, ADM]],
  [/^analista de gestao$/, ["admfin", "rh"], [ADM, PROD, ECO]],
  [/pcp/, ["operacional", "logistica"], [PROD, LOG, ADM, MEC, T_LOG, T_ADM, T_MEC]],
  // Administrativo e financeiro
  [/contabil|contabeis/, ["admfin"], [CONT, ADM]],
  [/adm fiscal/, ["admfin"], [CONT, ADM, ECO]],
  [/planejamento financeiro/, ["admfin"], [ADM, CONT, ECO, PROD]],
  [/auditor|gestao financeira|adquirencia/, ["admfin"], [ADM, CONT, ECO]],
  [/administrativo financeiro|adm financeiro|estagio administrativo|estagio em administracao|auxiliar administrativo/, ["admfin"], [ADM, CONT, ECO, T_ADM]],
  [/secretaria/, ["admfin"], [ADM]],
  // Logística (antes do comercial: "Motorista – Atendimento…" é logística)
  [/supervis.*logistica|encarregado|lider de movimentacao/, ["logistica"], [LOG, PROD, ADM]],
  [/assistente de logistica/, ["logistica"], [LOG, ADM, T_LOG, T_ADM]],
  [/logistica|estoque|estoquista/, ["logistica"], [LOG, T_LOG]],
  [/entrega|ajudante|motorista/, ["logistica"], []],
  // Comercial
  [/rentabilidade/, ["comercial", "admfin"], [ADM, ECO, PROD]],
  [/pre-venda/, ["comercial", "engenharia"], [ELE, ELN, QUI, PROD, ADM]],
  [/consultor\(a\) de produtos/, ["comercial", "engenharia"], [ELE, QUI, MEC, PROD]],
  [/executivo/, ["comercial"], [ADM, ELE, PROD]],
  [/trade marketing|performance comercial|negocios corporativos/, ["comercial"], [ADM, ECO, PROD]],
  [/vendas|vendedor|comercial|atendimento/, ["comercial"], [ADM]],
];

function nivelDe(t: string, tipoGupy: string): NivelKey[] {
  if (/jovem aprendiz/.test(t) || tipoGupy === "Aprendiz") return JOVEM; // o título manda mais que o rótulo do Gupy
  if (/estagi/.test(t) || tipoGupy === "Estágio") return EST;
  if (/^(tecnic[oa]|assistente tecnico|auxiliar tecnico|lider tecnico)/.test(t) || /\bjr\b/.test(t)) return TEC;
  if (/^(assistente|auxiliar|ajudante|operador|motorista|estoquista)/.test(t) || /vendedor/.test(t)) return PRIM;
  return EFET;
}

function escolaridadeDe(t: string, niveis: NivelKey[]): Escolaridade {
  if (niveis.includes("jovem")) return "medio";
  if (niveis.includes("estagio")) {
    // Estágios explicitamente técnicos e anúncios genéricos aceitam formação técnica;
    // as demais especialidades são tratadas como estágio de nível superior.
    return /tecnic/.test(t) || /^estagio$/.test(t) ? "tecnico" : "superior";
  }
  if (/^(analista|consultor|executivo|auditor|coordenacao)/.test(t)) return "superior";
  if (/^supervis.*vendas/.test(t)) return "medio";
  if (/^(supervis|lider|encarregado|secretaria|tecnic|assistente tecnico|auxiliar tecnico)/.test(t)) return "tecnico";
  return "medio";
}

// ───────────── leitura da lista ─────────────
const PAL = "(?:[A-ZÀ-Ú][a-zà-ú]+|de|do|da|dos|das|e)";
const RE_CIDADE = new RegExp(`^(.*?)\\s+(${PAL}(?: ${PAL})*) - ([A-Z]{2})$`);
const RE_LINHA = /^(.*)\s(Banco de talentos|Efetivo|Estágio|Aprendiz)\s\|\s(https?:\/\/\S+)$/;
// " - CIDADE/UF", " | CIDADE - UF", " | CIDADE-UF"… no fim do título
const RE_LOCAL_UF =
  /\s*[|\-–_]\s*\(?[A-ZÀ-Ú][A-ZÀ-Ú ,.']*?\s*[-\/|]\s*[A-Z]{2}\)?(?:\s+E\s+REGI[ÃA]O)?\s*$/;

interface Linha {
  bruto: string;
  cidade?: string;
  uf?: string;
  tipoGupy: string;
  url: string;
  ref: number;
}

function lerLinha(l: string): Linha | null {
  const m = l.trim().match(RE_LINHA);
  if (!m) return null;
  const [, resto, tipoGupy, url] = m;
  const ref = Number(url.match(/\/jobs\/(\d+)/)?.[1] ?? 0);
  if (!ref) return null; // só entram links diretos de vaga
  const c = resto.match(RE_CIDADE);
  return c
    ? { bruto: c[1].trim(), cidade: c[2], uf: c[3], tipoGupy, url, ref }
    : { bruto: resto.trim(), tipoGupy, url, ref };
}

const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "e", "em", "ou", "para", "com"]);
const SIGLAS = new Set(["pl", "ti", "pcp", "rsm", "gsb", "bess", "cnh", "rm", "sr", "ii", "es", "sp", "pr", "pe", "rs", "ba", "mg"]);

/** "ANALISTA DE PCP (PLENO)" → "Analista de PCP (Pleno)". Sem lookbehind, para rodar em TVs/navegadores antigos. */
function capitalizar(s: string): string {
  const out = s.toLowerCase().replace(/[\p{L}]+/gu, (w, i: number) => {
    if (SIGLAS.has(w)) return w.toUpperCase();
    if (MINUSCULAS.has(w) && i > 0) return w;
    // não capitaliza depois de hífen (Pré-venda) nem dentro de "(a)"
    const antes = s[i - 1];
    if (antes === "-" || (w === "a" && antes === "(" && s[i + 1] === ")")) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
  return out.charAt(0).toUpperCase() + out.slice(1);
}

interface Limpo {
  titulo: string; // já em "Título Capitalizado", sem prefixo de banco
  nota: string; // ex.: "CNH B"
  banco: boolean;
  regiao: boolean;
}

function limpar(bruto: string, cidade?: string): Limpo {
  let t = bruto.replace(/^\[\s*([^\]]*?)\s*\]\s*(.*)$/, "$2 ($1)"); // [RSM PE] X → X (RSM PE)
  const banco = /^BANCO DE TALENTOS?\b/.test(t);
  t = t.replace(/^BANCO DE TALENTOS?\s*[|\-–]?\s*/, "");
  const regiao = /\bE REGI[ÃA]O\b/.test(t);

  let nota = "";
  t = t.replace(/\s*\(((?:CNH|CATEGORIA)[^)]*)\)/g, (_, n: string) => ((nota = n.replace(/\bOU\b/g, "ou").replace(/^CATEGORIA/, "categoria")), ""));
  t = t.replace(/\s*\(CÓPIA\)/g, "").trim();

  t = t.replace(RE_LOCAL_UF, "");
  t = t.replace(/\s+EM\s+[A-ZÀ-Ú ]+\/[A-Z]{2}$/, "");
  if (cidade) {
    const c = cidade.toUpperCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp(`\\s*[|\\-–(]\\s*${c}\\)?\\s*$`), "");
  }

  t = t
    .replace(/\s+\(A\)/g, "(A)")
    .replace(/\bTECNICO\b/g, "TÉCNICO")
    .replace(/\bESTAGIO\b/g, "ESTÁGIO")
    .replace(/\s+[|_]\s+/g, " – ")
    .replace(/\s+-\s+/g, " – ")
    .replace(/[\s–|_-]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { titulo: capitalizar(t), nota, banco, regiao };
}

// ───────────── ajustes pontuais (por número da vaga) ─────────────
// Use quando o título do Gupy e a cidade cadastrada divergem, ou a regra não acerta.
interface Ajuste {
  titulo?: string;
  local?: string;
  uf?: string;
  cidades?: string[];
}
const AJUSTES: Record<number, Ajuste> = {
  // cidade cadastrada no Gupy difere da cidade escrita no título
  11967180: { local: "Vitória da Conquista, BA", uf: "BA", cidades: ["Vitória da Conquista"] },
  11648387: { local: "Mossoró, RN", cidades: ["Mossoró", "Natal"] },
  12532226: { local: "Mossoró, RN", cidades: ["Mossoró", "Natal"] },
  12374249: { local: "Paracatu, MG", cidades: ["Paracatu", "Montes Claros"] },
  12055346: { local: "Paracatu, MG", cidades: ["Paracatu", "Montes Claros"] },
  11315986: { local: "Região de Ijuí, RS", cidades: ["Ijuí", "Passo Fundo"] },
  11603413: { titulo: "Motorista", local: "Caxias do Sul, RS", cidades: ["Caxias do Sul", "Porto Alegre"] },
  11829594: { local: "Salvador, BA", cidades: ["Salvador", "Lauro de Freitas"] },
  12045720: { local: "Boqueirão, Curitiba, PR" },
  // título sem cidade/UF que a regra consiga separar
  12058146: { titulo: "Vendedor(a) Externo(a) – Juína ou Juara", local: "Juína ou Juara, MT", cidades: ["Juína", "Juara", "Sinop"] },
  11569593: { titulo: "Motorista – Atendimento Linhares e Região", local: "Linhares e região, ES", cidades: ["Linhares", "Sooretama"] },
  10730084: { titulo: "Vendedor(a) Externo(a) – Região Vale do Ivaí", local: "Arapongas, PR (Vale do Ivaí)" },
  11943869: { titulo: "Vendedor(a) Externo(a) Ferista", local: "Umuarama, PR e região" },
  11433903: { titulo: "Motorista Carreteiro" },
  11532320: { titulo: "Supervisor Adm Financeiro" },
  11659424: { titulo: "Banco de Talentos – Motorista Entregador", local: "Cascavel, PR", uf: "PR", cidades: ["Cascavel"] },
  10207420: { titulo: "Banco de Talentos" },
  10450336: { titulo: "Banco de Talentos – Estágio", cidades: ["Lauro de Freitas", "Salvador"] },
  8566171: { titulo: "Banco de Talentos – Supervisor de Vendas" },
  8523272: { titulo: "Banco de Talentos – Vendedor Externo (Zona Leste)", local: "São Paulo, SP (Zona Leste)" },
  8454048: { titulo: "Banco de Talentos – Vendedoras (vaga afirmativa para mulheres)" },
  8454062: { titulo: "Banco de Talentos – Vendedoras (vaga afirmativa para mulheres)" },
  12206353: { titulo: "Vendedora Trainee Externa (vaga afirmativa para mulheres)" },
  12078201: { local: "Jaraguá do Sul, SC (região Norte e Vale do Itajaí)" },
  12078607: { local: "São Bento do Sul, SC (região Norte e Vale do Itajaí)" },
  12078701: { local: "Itapoá, SC (região Norte e Vale do Itajaí)" },
  11887991: { titulo: "Auxiliar Técnico – GSB Casas Bahia (Jundiaí)" },
};

// ───────────── montagem do catálogo ─────────────
function montar(l: Linha): Vaga {
  const aj = AJUSTES[l.ref] ?? {};
  const lp = limpar(l.bruto, l.cidade);
  const ehBanco = lp.banco || l.tipoGupy === "Banco de talentos";

  let cidadeGupy = l.cidade;
  let cidades: string[] = cidadeGupy ? [cidadeGupy] : [];
  let cidadeLocal = cidadeGupy;
  if (cidadeGupy === "Distrito Federal") { cidades = ["Brasília", "Distrito Federal"]; cidadeLocal = "Brasília"; }
  if (cidadeGupy === "Parque Novo Mundo") { cidades = ["São Paulo", "Parque Novo Mundo"]; cidadeLocal = "São Paulo"; }
  if (cidadeGupy === "Lauro de Freitas") cidades = ["Lauro de Freitas", "Salvador"];

  const uf = aj.uf ?? l.uf;
  let local = aj.local ?? (cidadeLocal && uf ? `${cidadeLocal}, ${uf}` : "Diversas localidades");
  if (!aj.local && lp.regiao) local += " e região";
  if (lp.nota) local += ` (exige ${lp.nota})`;

  const base = aj.titulo ?? lp.titulo;
  const titulo = ehBanco && !/^Banco de Talentos/.test(base) ? `Banco de Talentos – ${base || "Geral"}` : base;

  const t = norm(lp.titulo);
  const niveis = nivelDe(t, l.tipoGupy);
  const regra = REGRAS.find(([re]) => re.test(t));
  const areas = regra?.[1] ?? [];
  const cursos = niveis.includes("jovem") ? [] : regra?.[2] ?? [];

  return {
    id: `g${l.ref}`,
    ref: l.ref,
    titulo,
    url: l.url,
    tipo: ehBanco ? "banco" : "vaga",
    niveis,
    areas,
    local,
    ufs: uf && UF_NOME[uf] ? [UF_NOME[uf]] : [],
    cidades: aj.cidades ?? cidades,
    minEscolaridade: escolaridadeDe(t, niveis),
    cursos,
    geral: areas.length === 0,
    pcd: false,
  };
}

export const CATALOGO: Vaga[] = LISTA_BRUTA.split("\n")
  .map(lerLinha)
  .filter((l): l is Linha => l !== null)
  .map(montar);
