/**
 * MOTOR DE RECOMENDAÇÃO
 * Primeiro remove toda vaga incompatível com nível, área, formação e curso.
 * A localização serve como desempate entre as vagas que passaram por esses filtros.
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
    medioConcluido: [
      "Ensino Médio concluído", "Curso Técnico em andamento", "Curso Técnico concluído",
      "Ensino Superior em andamento", "Ensino Superior concluído",
    ].includes(e),
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

  const cidadeOk =
    p.cidade.length >= 3 &&
    v.cidades.some((c) => norm(c).includes(p.cidade) || p.cidade.includes(norm(c)));
  const regiaoOk = !cidadeOk && naRmr(p.cidade) && v.cidades.some((c) => naRmr(norm(c)));
  const ufOk = !!a.uf && v.ufs.includes(a.uf);

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

  // Localização serve como desempate: nunca esconde uma vaga adequada à formação.
  if (cidadeOk && (!a.uf || ufOk)) { s += 5; motivos.push("Na sua cidade"); }
  else if (regiaoOk && (!a.uf || ufOk)) { s += 4; motivos.push("Na sua região (Grande Recife)"); }
  else if (ufOk) { s += 2; motivos.push("No seu estado"); }

  motivos.push("Compatível com sua escolaridade");

  // ── Precisão do link ──
  if (v.tipo === "vaga") s += 6;
  else if (v.tipo === "banco") s -= 4;

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

  const cidadeOk =
    p.cidade.length >= 3 &&
    v.cidades.some((c) => norm(c).includes(p.cidade) || p.cidade.includes(norm(c)));
  const regiaoOk = !cidadeOk && naRmr(p.cidade) && v.cidades.some((c) => naRmr(norm(c)));
  if (cidadeOk) {
    s += 5;
    motivos.push("Na sua cidade");
  } else if (regiaoOk) {
    s += 4;
    motivos.push("Na sua região (Grande Recife)");
  } else if (a.uf && v.ufs.includes(a.uf)) {
    s += 2;
    motivos.push("No seu estado");
  }

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
      ? ` Há ${alternativasDaArea.length} ${alternativasDaArea.length === 1 ? "vaga cadastrada" : "vagas cadastradas"} em ${areaFiltroLabel}; veja as mais próximas abaixo.`
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
        ? `Estágio exige matrícula ativa em curso técnico ou superior.${resumoArea} A lista usada neste teste tem ${CATALOGO.length} vagas; confira a disponibilidade no portal.`
        : `Não encontramos vaga indicada para esta combinação de formação, curso, área e objetivo.${resumoArea} A lista usada neste teste tem ${CATALOGO.length} vagas; confira a disponibilidade no portal.`,
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
