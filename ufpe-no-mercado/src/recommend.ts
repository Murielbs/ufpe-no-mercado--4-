/**
 * MOTOR DE RECOMENDAÇÃO
 * Primeiro remove toda vaga incompatível com nível, área, formação, curso e local.
 * Na Grande Recife, a cidade exata vem antes das outras cidades da região.
 * Assim, uma pontuação alta nunca compensa uma resposta incompatível.
 */
import { AREA_LABEL, MAX_RELACIONADAS, NIVEL_LABEL, PORTAL_VAGAS } from "./data";
import type { Answers, Match, NivelKey, Recommendation, Vaga } from "./types";
import { CATALOGO } from "./vagas";

const FRASE: Record<NivelKey, string> = {
  jovem: "vaga de Jovem Aprendiz",
  estagio: "vaga de estágio",
  primeiro: "vaga de primeiro emprego",
  efetivo: "oportunidade efetiva",
};

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, " ");

// Fonte: Grande Recife, Anuário Estatístico do STPP/RMR 2024 (14 municípios).
// https://www.granderecife.pe.gov.br/wp-content/uploads/2026/03/Anuario_Estatistico_do_STPP_RMR_2024_V1.0.pdf
const RMR = new Set([
  "recife", "jaboatao dos guararapes", "olinda", "cabo de santo agostinho", "paulista", "camaragibe",
  "sao lourenco da mata", "igarassu", "abreu e lima", "ipojuca", "moreno", "itapissuma", "aracoiaba", "ilha de itamaraca",
]);
function cidadeNormalizada(cidade: string): string {
  const nome = norm(cidade);
  if (nome === "jaboatao") return "jaboatao dos guararapes";
  if (nome === "itamaraca") return "ilha de itamaraca";
  return nome;
}

/** Chave para juntar a mesma vaga publicada várias vezes (ex.: 6 postagens de "Auxiliar Técnico – RSM PR"). */
const chaveCargo = (v: Vaga) => norm(v.titulo).replace(/[^a-z0-9]/g, "");

interface Perfil {
  ensinoMedio: boolean;
  medioConcluido: boolean;
  tecnicoMatriculado: boolean;
  tecnicoConcluido: boolean;
  superiorMatriculado: boolean;
  superiorConcluido: boolean;
  cidade: string;
  uf: string;
}

function perfilDe(a: Answers): Perfil {
  const e = a.escolaridade;
  return {
    ensinoMedio: e.startsWith("Ensino Médio"),
    medioConcluido: [
      "Ensino Médio concluído", "Curso Técnico em andamento", "Curso Técnico concluído",
      "Ensino Superior em andamento", "Ensino Superior concluído",
    ].includes(e),
    tecnicoMatriculado: e === "Curso Técnico em andamento",
    tecnicoConcluido: e === "Curso Técnico concluído",
    superiorMatriculado: e === "Ensino Superior em andamento",
    superiorConcluido: e === "Ensino Superior concluído",
    cidade: cidadeNormalizada(a.cidade),
    uf: norm(a.uf),
  };
}

/** -1 exclui a vaga; cidade exata precede região, estado e busca nacional. */
function prioridadeLocal(v: Vaga, p: Perfil): number {
  if (p.cidade && !p.uf) return -1; // sem UF, não é possível distinguir cidades homônimas
  if (p.uf && !v.ufs.some((uf) => norm(uf) === p.uf)) return -1;
  if (!p.cidade) return p.uf ? 1 : 0;
  const cidades = v.cidades.map(cidadeNormalizada);
  if (cidades.includes(p.cidade)) return 3;
  if (p.uf === "pernambuco" && RMR.has(p.cidade) && cidades.some((cidade) => RMR.has(cidade))) return 2;
  return -1;
}

function motivoLocal(prioridade: number): string | undefined {
  if (prioridade === 3) return "Na sua cidade";
  if (prioridade === 2) return "Na sua região (Grande Recife)";
  if (prioridade === 1) return "No seu estado";
}

/** Estágio exige matrícula ativa; os demais níveis exigem a formação mínima concluída. */
function escolaridadeCompativel(v: Vaga, p: Perfil): boolean {
  if (v.niveis.includes("estagio")) {
    if (v.minEscolaridade === "superior") return p.superiorMatriculado;
    return p.tecnicoMatriculado || p.superiorMatriculado;
  }
  if (v.niveis.includes("jovem")) return true;
  if (v.minEscolaridade === "superior") return p.superiorConcluido;
  if (v.minEscolaridade === "tecnico") return p.tecnicoConcluido || p.superiorConcluido;
  return p.medioConcluido;
}

function nivelExibido(v: Vaga, nivel?: NivelKey): NivelKey {
  return nivel && v.niveis.includes(nivel) ? nivel : v.niveis[v.niveis.length - 1];
}

function avaliar(v: Vaga, a: Answers, p: Perfil, nivel?: NivelKey): Match | null {
  if (v.pcd) return null; // sem pergunta de PCD no formulário
  const motivos: string[] = [];
  let s = 0;

  // ── Filtros obrigatórios ──
  if (nivel && !v.niveis.includes(nivel)) return null;
  if (!nivel && v.niveis.includes("jovem") && !p.ensinoMedio) return null;
  if (!escolaridadeCompativel(v, p)) return null;
  if (a.area && !v.areas.includes(a.area)) return null;
  if (v.cursos.length > 0 && !v.cursos.includes(a.curso)) return null;

  const local = prioridadeLocal(v, p);
  if (local < 0) return null;

  // ── Ordenação das vagas já compatíveis ──
  if (nivel) { s += 40; motivos.push("No nível que você busca"); }

  if (a.area) {
    if (v.areas[0] === a.area) { s += 25; motivos.push("Na sua área de interesse"); }
    else if (v.areas.includes(a.area)) { s += 15; motivos.push("Na sua área de interesse"); }
  }

  if (a.curso && v.cursos.includes(a.curso)) {
    s += 50;
    motivos.push("Combina com seu curso");
  }

  const localLabel = motivoLocal(local);
  if (localLabel) motivos.push(localLabel);

  motivos.push("Compatível com sua escolaridade");

  // ── Precisão do link ──
  if (v.tipo === "vaga") s += 6;
  else if (v.tipo === "banco") s -= 4;

  return { vaga: v, score: s, motivos, tag: NIVEL_LABEL[nivelExibido(v, nivel)] };
}

/**
 * Quando não existe combinação exata, recupera vagas da área escolhida sem
 * chamá-las de compatíveis. A localização continua obrigatória; nível, curso
 * e formação servem para ordenar as alternativas dentro da mesma localidade.
 */
function avaliarAlternativaDaArea(v: Vaga, a: Answers, p: Perfil, nivel?: NivelKey): Match | null {
  if (v.pcd || !a.area || !v.areas.includes(a.area)) return null;
  const local = prioridadeLocal(v, p);
  if (local < 0) return null;

  const motivos = ["Na área que você escolheu"];
  let s = v.areas[0] === a.area ? 25 : 15;

  if (nivel && v.niveis.includes(nivel)) {
    s += 20;
    motivos.push("No nível que você busca");
  }
  if (a.curso && v.cursos.includes(a.curso)) {
    s += 100;
    motivos.push("Combina com seu curso");
  }
  if (escolaridadeCompativel(v, p)) s += 35;

  const localLabel = motivoLocal(local);
  if (localLabel) motivos.push(localLabel);

  if (v.tipo === "vaga") s += 6;
  return { vaga: v, score: s, motivos, tag: NIVEL_LABEL[nivelExibido(v, nivel)] };
}

const PORTAL: Vaga = {
  id: "portal", ref: 0, titulo: "Portal de vagas: Grupo Moura", url: PORTAL_VAGAS, tipo: "busca",
  niveis: [], areas: [], local: "Todas as localidades", ufs: [], cidades: [],
  minEscolaridade: "medio", cursos: [], geral: true, pcd: false,
};

export function recommend(a: Answers): Recommendation {
  const nivel: NivelKey | undefined = a.busca && a.busca !== "conhecer" ? a.busca : undefined;
  const p = perfilDe(a);
  const ordenar = (x: Match, y: Match) =>
    prioridadeLocal(y.vaga, p) - prioridadeLocal(x.vaga, p) || y.score - x.score || y.vaga.ref - x.vaga.ref;
  const localDescricao = p.cidade
    ? p.uf === "pernambuco" && RMR.has(p.cidade)
      ? `em ${a.cidade.trim()} ou na Grande Recife (Pernambuco)`
      : `em ${a.cidade.trim()}${p.uf ? ` (${a.uf})` : ""}`
    : p.uf ? `em ${a.uf}` : "";

  const ranquear = (n?: NivelKey) =>
    CATALOGO
      .map((v) => avaliar(v, a, p, n))
      .filter((m): m is Match => m !== null)
      .sort(ordenar); // mesma localidade e pontuação: a mais recente

  const ranking = ranquear(nivel);

  // a mesma vaga aparece publicada várias vezes / em várias cidades: fica só a melhor de cada cargo
  const deduplicar = (itens: Match[]) => {
    const vistos = new Set<string>();
    return itens.filter((m) => {
      const k = `${chaveCargo(m.vaga)}|${m.vaga.niveis.join()}`;
      return !vistos.has(k) && vistos.add(k);
    });
  };
  const unicos = deduplicar(ranking);

  const areaFiltroLabel = a.area ? AREA_LABEL[a.area] : undefined;

  if (unicos.length === 0) {
    const estagioSemMatricula = nivel === "estagio" && !p.tecnicoMatriculado && !p.superiorMatriculado;
    const alternativasDaArea = deduplicar(
      CATALOGO
        .map((v) => avaliarAlternativaDaArea(v, a, p, nivel))
        .filter((m): m is Match => m !== null)
        .sort(ordenar),
    );
    const resumoArea = alternativasDaArea.length > 0
      ? ` Há ${alternativasDaArea.length} ${alternativasDaArea.length === 1 ? "vaga cadastrada" : "vagas cadastradas"} em ${areaFiltroLabel}${localDescricao ? ` ${localDescricao}` : ""}; as alternativas abaixo podem exigir outro nível, curso ou formação.`
      : "";
    return {
      tipo: "portal",
      principal: PORTAL,
      motivos: [],
      relacionadas: alternativasDaArea.slice(0, MAX_RELACIONADAS),
      total: alternativasDaArea.length,
      catalogTotal: CATALOGO.length,
      areaLabel: areaFiltroLabel,
      descricao: `Não encontramos vaga compatível com seu perfil${localDescricao ? ` ${localDescricao}` : ""}.${estagioSemMatricula ? " Estágio exige matrícula ativa em curso técnico ou superior." : ""}${p.cidade && !p.uf ? " Informe também o estado para identificar a localidade." : ""}${resumoArea} A lista usada neste teste tem ${CATALOGO.length} vagas; confira a disponibilidade no portal.`,
    };
  }

  const [top, ...resto] = unicos;

  return {
    tipo: "vaga",
    principal: top.vaga,
    motivos: top.motivos,
    descricao: nivel
      ? `Encontramos esta ${FRASE[nivel]} compatível com sua formação, curso e área. Confira a localidade e os requisitos da vaga.`
      : "Encontramos esta vaga compatível com sua formação, curso e área. Confira a localidade e os requisitos da vaga.",
    areaLabel: top.vaga.geral ? "Atuação geral" : AREA_LABEL[top.vaga.areas[0]],
    nivelLabel: top.tag,
    relacionadas: resto.slice(0, MAX_RELACIONADAS),
    total: unicos.length,
    catalogTotal: CATALOGO.length,
  };
}
