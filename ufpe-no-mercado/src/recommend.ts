/**
 * MOTOR DE RECOMENDAÇÃO
 * Cada vaga do catálogo recebe uma pontuação a partir das respostas:
 *   nível buscado · área · curso · escolaridade/período · cidade/estado · tipo do link.
 * Vagas para as quais a pessoa não é elegível (ex.: estágio sem estar matriculado)
 * são removidas. As demais são ordenadas: a melhor vira a principal e as
 * seguintes aparecem em "Outras sugestões". O resultado é sempre uma SUGESTÃO.
 */
import { AREA_LABEL, MAX_RELACIONADAS, NIVEL_LABEL, PORTAL_VAGAS } from "./data";
import type { Answers, Escolaridade, Match, NivelKey, Recommendation, Vaga } from "./types";
import { CATALOGO } from "./vagas";

const MIN_SCORE = 15;
const RANK: Record<Escolaridade, number> = { medio: 0, tecnico: 1, superior: 2 };
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
  /** 0 = ensino médio · 1 = técnico concluído ou superior em curso · 2 = superior concluído/reta final */
  atingido: number;
  matriculado: boolean;
  matriculaRank: number; // 1 técnico · 2 superior
  cidade: string;
}

function perfilDe(a: Answers): Perfil {
  const e = a.escolaridade;
  const superior = e.includes("Superior");
  const tecnico = e.includes("Técnico");
  const concluido = e.includes("concluído");
  let atingido = 0;
  if (superior) atingido = concluido || a.periodo.startsWith("7º") ? 2 : 1;
  else if (tecnico) atingido = concluido ? 1 : 0;
  return {
    atingido,
    matriculado: (superior || tecnico) && !concluido,
    matriculaRank: superior ? 2 : tecnico ? 1 : 0,
    cidade: norm(a.cidade),
  };
}

function nivelExibido(v: Vaga, nivel?: NivelKey): NivelKey {
  return nivel && v.niveis.includes(nivel) ? nivel : v.niveis[v.niveis.length - 1];
}

function avaliar(v: Vaga, a: Answers, p: Perfil, nivel?: NivelKey): Match | null {
  if (v.pcd) return null; // sem pergunta de PCD no formulário
  const motivos: string[] = [];
  let s = 0;

  // ── Elegibilidade ──
  if (v.niveis.includes("estagio")) {
    if (!p.matriculado || p.matriculaRank < RANK[v.minEscolaridade]) return null;
  } else if (v.niveis.includes("jovem")) {
    if (p.atingido >= 1) s -= 20; // Jovem Aprendiz é para quem ainda está no ensino médio
  } else {
    const falta = RANK[v.minEscolaridade] - p.atingido;
    if (falta >= 2) return null;
    if (falta === 1) s -= 30;
  }

  // ── Nível buscado ──
  if (nivel) {
    if (v.niveis.includes(nivel)) { s += 40; motivos.push("No nível que você busca"); }
    else s -= 45;
  }

  // ── Área de interesse ──
  if (a.area) {
    if (v.areas[0] === a.area) { s += 30; motivos.push("Na sua área de interesse"); }
    else if (v.areas.includes(a.area)) { s += 20; motivos.push("Na sua área de interesse"); }
    else if (v.geral) s += 16;
    else s -= 25;
  }

  // ── Curso ──
  if (a.curso && v.cursos.includes(a.curso)) {
    s += 18;
    motivos.push("Combina com seu curso");
  } else if (
    v.minEscolaridade === "superior" && v.cursos.length > 0 &&
    a.curso && a.curso !== "Outros" && a.curso !== "Nenhum" &&
    (v.niveis.includes("efetivo") || v.niveis.includes("estagio"))
  ) {
    s -= 12; // vaga técnica de outro curso
  }

  // ── Localização ──
  const cidadeOk =
    p.cidade.length >= 3 &&
    v.cidades.some((c) => norm(c).includes(p.cidade) || p.cidade.includes(norm(c)));
  const ufOk = !!a.uf && v.ufs.includes(a.uf);
  const regiaoOk = !cidadeOk && naRmr(p.cidade) && v.cidades.some((c) => naRmr(norm(c)));
  if (cidadeOk) { s += 25; motivos.push("Na sua cidade"); }
  else if (regiaoOk) { s += 15; motivos.push("Na sua região (Grande Recife)"); }
  if (ufOk) {
    s += 14;
    if (!cidadeOk && !regiaoOk) motivos.push("No seu estado");
  } else if (v.ufs.length === 0) s += 8;
  else if (a.uf && !cidadeOk) s -= 15;

  // ── Precisão do link ──
  if (v.tipo === "vaga") s += 8;
  else if (v.tipo === "banco") s -= 12;

  if (s < MIN_SCORE) return null;
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

  let ranking = ranquear(nivel);
  // Nada compatível no nível pedido (ex.: estágio sem estar matriculado):
  // mostra as vagas mais próximas do perfil em qualquer nível.
  const semNivel = nivel !== undefined && ranking.length === 0;
  if (semNivel) ranking = ranquear(undefined);

  // a mesma vaga aparece publicada várias vezes / em várias cidades: fica só a melhor de cada cargo
  const vistos = new Set<string>();
  const unicos = ranking.filter((m) => {
    const k = `${chaveCargo(m.vaga)}|${m.vaga.niveis.join()}`;
    return !vistos.has(k) && vistos.add(k);
  });

  const areaLabel = a.area ? AREA_LABEL[a.area] : undefined;

  if (unicos.length === 0) {
    return {
      tipo: "portal", principal: PORTAL, motivos: [], relacionadas: [], total: 0, areaLabel,
      descricao: "Não encontramos uma vaga aberta para o seu perfil agora. Escaneie o QR code para ver todas as vagas do Grupo Moura.",
    };
  }

  const [top, ...resto] = unicos;
  const foraDoNivel = nivel !== undefined && (semNivel || !top.vaga.niveis.includes(nivel));

  return {
    tipo: "vaga",
    principal: top.vaga,
    motivos: top.motivos,
    descricao: foraDoNivel
      ? `Não encontramos ${FRASE[nivel!]} compatível com o seu perfil agora. Sugerimos esta, que pode se aproximar do que você procura.`
      : "Com base nas suas respostas, esta é a nossa sugestão de vaga para você.",
    areaLabel: areaLabel ?? AREA_LABEL[top.vaga.areas[0]],
    nivelLabel: top.tag,
    relacionadas: resto.slice(0, MAX_RELACIONADAS),
    total: unicos.length,
  };
}
