/**
 * MOTOR DE RECOMENDAÇÃO
 * Primeiro remove toda vaga incompatível com nível, área, formação e local.
 * A pontuação serve apenas para ordenar as vagas que passaram por todos os filtros.
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
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Cidades da Região Metropolitana do Recife: vaga em uma delas é "na sua região" para quem mora em outra. */
const RMR = [
  "recife", "jaboatao dos guararapes", "olinda", "cabo de santo agostinho", "paulista", "camaragibe",
  "sao lourenco da mata", "igarassu", "abreu e lima", "ipojuca", "moreno", "itapissuma",
];
const naRmr = (c: string) => c.length >= 3 && RMR.some((r) => r === c || r.includes(c));

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
}

function perfilDe(a: Answers): Perfil {
  const e = a.escolaridade;
  return {
    ensinoMedio: e.startsWith("Ensino Médio"),
    medioConcluido: e !== "Ensino Médio em andamento",
    tecnicoMatriculado: e === "Curso Técnico em andamento",
    tecnicoConcluido: e === "Curso Técnico concluído",
    superiorMatriculado: e === "Ensino Superior em andamento",
    superiorConcluido: e === "Ensino Superior concluído",
    cidade: norm(a.cidade),
  };
}

/** Estágio exige matrícula ativa; os demais níveis exigem a formação mínima concluída. */
function escolaridadeCompativel(v: Vaga, p: Perfil): boolean {
  if (v.niveis.includes("estagio")) {
    if (v.minEscolaridade === "superior") return p.superiorMatriculado;
    return p.tecnicoMatriculado || p.superiorMatriculado;
  }
  if (v.niveis.includes("jovem")) return true;
  if (v.minEscolaridade === "superior") return p.superiorConcluido;
  if (v.minEscolaridade === "tecnico") return p.tecnicoConcluido;
  return p.medioConcluido;
}

/**
 * Curso é requisito eliminatório quando a vaga é de estágio, técnica/superior
 * ou pertence a uma área especializada. Em cargos gerais de ensino médio,
 * ele só ajuda a ordenar porque normalmente não é requisito formal.
 */
function exigeCursoCompativel(v: Vaga): boolean {
  return v.cursos.length > 0 && (
    v.niveis.includes("estagio") ||
    v.minEscolaridade !== "medio" ||
    v.areas.includes("tech") ||
    v.areas.includes("engenharia")
  );
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
  if (a.area && !v.geral && !v.areas.includes(a.area)) return null;
  if (exigeCursoCompativel(v) && !v.cursos.includes(a.curso)) return null;
  if (a.uf && v.ufs.length > 0 && !v.ufs.includes(a.uf)) return null;

  const cidadeOk =
    p.cidade.length >= 3 &&
    v.cidades.some((c) => norm(c).includes(p.cidade) || p.cidade.includes(norm(c)));
  const regiaoOk = !cidadeOk && naRmr(p.cidade) && v.cidades.some((c) => naRmr(norm(c)));
  if (p.cidade && !cidadeOk && !regiaoOk) return null;

  // ── Ordenação das vagas já compatíveis ──
  if (nivel) { s += 50; motivos.push("No nível que você busca"); }

  if (a.area) {
    if (v.areas[0] === a.area) { s += 35; motivos.push("Na sua área de interesse"); }
    else if (v.areas.includes(a.area)) { s += 25; motivos.push("Na sua área de interesse"); }
    else if (v.geral) s += 8;
  }

  if (a.curso && v.cursos.includes(a.curso)) {
    s += 25;
    motivos.push("Combina com seu curso");
  }

  if (cidadeOk) { s += 45; motivos.push("Na sua cidade"); }
  else if (regiaoOk) { s += 35; motivos.push("Na sua região (Grande Recife)"); }
  else if (a.uf && v.ufs.includes(a.uf)) { s += 15; motivos.push("No seu estado"); }

  motivos.push("Compatível com sua escolaridade");

  // ── Precisão do link ──
  if (v.tipo === "vaga") s += 15;
  else if (v.tipo === "banco") s -= 5;

  return { vaga: v, score: s, motivos, tag: NIVEL_LABEL[nivelExibido(v, nivel)] };
}

/**
 * Quando não existe combinação exata, recupera vagas da área escolhida sem
 * chamá-las de compatíveis. Nível, curso, formação e local servem somente
 * para colocar as alternativas mais próximas primeiro.
 */
function avaliarAlternativaDaArea(v: Vaga, a: Answers, p: Perfil, nivel?: NivelKey): Match | null {
  if (v.pcd || !a.area || !v.areas.includes(a.area)) return null;

  const motivos = ["Na área que você escolheu"];
  let s = v.areas[0] === a.area ? 60 : 50;

  if (nivel && v.niveis.includes(nivel)) {
    s += 45;
    motivos.push("No nível que você busca");
  }
  if (a.curso && v.cursos.includes(a.curso)) {
    s += 35;
    motivos.push("Combina com seu curso");
  }
  if (escolaridadeCompativel(v, p)) s += 20;

  const cidadeOk =
    p.cidade.length >= 3 &&
    v.cidades.some((c) => norm(c).includes(p.cidade) || p.cidade.includes(norm(c)));
  const regiaoOk = !cidadeOk && naRmr(p.cidade) && v.cidades.some((c) => naRmr(norm(c)));
  if (cidadeOk) {
    s += 45;
    motivos.push("Na sua cidade");
  } else if (regiaoOk) {
    s += 35;
    motivos.push("Na sua região (Grande Recife)");
  } else if (a.uf && v.ufs.includes(a.uf)) {
    s += 20;
    motivos.push("No seu estado");
  } else if (a.uf && v.ufs.length > 0) {
    s -= 15;
  }

  if (v.tipo === "vaga") s += 10;
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

  const ranquear = (n?: NivelKey) =>
    CATALOGO
      .map((v) => avaliar(v, a, p, n))
      .filter((m): m is Match => m !== null)
      .sort((x, y) => y.score - x.score || y.vaga.ref - x.vaga.ref); // empate: a mais recente

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
        .sort((x, y) => y.score - x.score || y.vaga.ref - x.vaga.ref),
    );
    const resumoArea = alternativasDaArea.length > 0
      ? ` Há ${alternativasDaArea.length} ${alternativasDaArea.length === 1 ? "vaga aberta" : "vagas abertas"} em ${areaFiltroLabel}; veja as mais próximas abaixo.`
      : "";
    return {
      tipo: "portal",
      principal: PORTAL,
      motivos: [],
      relacionadas: alternativasDaArea.slice(0, MAX_RELACIONADAS),
      total: alternativasDaArea.length,
      catalogTotal: CATALOGO.length,
      areaLabel: areaFiltroLabel,
      descricao: estagioSemMatricula
        ? `Estágio exige matrícula ativa em curso técnico ou superior.${resumoArea} O catálogo carregado tem ${CATALOGO.length} vagas no total.`
        : `Não encontramos uma combinação exata para todos os filtros.${resumoArea} O catálogo carregado tem ${CATALOGO.length} vagas no total; use o QR code para consultar todas.`,
    };
  }

  const [top, ...resto] = unicos;

  return {
    tipo: "vaga",
    principal: top.vaga,
    motivos: top.motivos,
    descricao: nivel
      ? `Encontramos esta ${FRASE[nivel]} compatível com as suas respostas.`
      : "Com base nas suas respostas, esta é a nossa sugestão de vaga para você.",
    areaLabel: top.vaga.geral ? "Atuação geral" : AREA_LABEL[top.vaga.areas[0]],
    nivelLabel: top.tag,
    relacionadas: resto.slice(0, MAX_RELACIONADAS),
    total: unicos.length,
    catalogTotal: CATALOGO.length,
  };
}
