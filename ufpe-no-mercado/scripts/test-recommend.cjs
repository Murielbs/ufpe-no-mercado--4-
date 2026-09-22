const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const { buildSync } = require("esbuild");

// Carrega o mesmo código TypeScript do site sem criar arquivos de build no repositório.
const root = path.resolve(__dirname, "..");
const bundle = buildSync({
  stdin: {
    contents: `
      export { recommend } from "./src/recommend.ts";
      export { STEPS, ESTADOS_BR, PORTAL_VAGAS } from "./src/data.ts";
      export { CATALOGO } from "./src/vagas.ts";
      export { LISTA_BRUTA } from "./src/vagas-lista.ts";
      export { isStepValid } from "./src/utils.ts";
    `,
    resolveDir: root,
    sourcefile: "audit-entry.ts",
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "cjs",
  write: false,
  logLevel: "silent",
});
const auditFilename = path.join(root, "audit-bundle.cjs");
const auditModule = new Module(auditFilename, module);
auditModule.filename = auditFilename;
auditModule.paths = module.paths;
auditModule._compile(bundle.outputFiles[0].text, auditFilename);
const { recommend, STEPS, ESTADOS_BR, PORTAL_VAGAS, CATALOGO, LISTA_BRUTA, isStepValid } = auditModule.exports;

const options = (field) => {
  const step = STEPS.find((item) => item.kind === "choice" && item.field === field);
  assert.ok(step, `Pergunta ${field} não encontrada`);
  return step.options.map((option) => option.value);
};

const escolaridades = options("escolaridade");
const cursos = options("curso");
const buscas = options("busca");
const areas = options("area");

function escolaridadePermite(vaga, escolaridade) {
  const tecnicoMatriculado = escolaridade === "Curso Técnico em andamento";
  const tecnicoConcluido = escolaridade === "Curso Técnico concluído";
  const superiorMatriculado = escolaridade === "Ensino Superior em andamento";
  const superiorConcluido = escolaridade === "Ensino Superior concluído";
  const medioConcluido = escolaridade !== "Ensino Médio em andamento";

  if (vaga.niveis.includes("estagio")) {
    return vaga.minEscolaridade === "superior"
      ? superiorMatriculado
      : tecnicoMatriculado || superiorMatriculado;
  }
  if (vaga.niveis.includes("jovem")) return true;
  if (vaga.minEscolaridade === "superior") return superiorConcluido;
  if (vaga.minEscolaridade === "tecnico") return tecnicoConcluido || superiorConcluido;
  return medioConcluido;
}

function vagaPermite(vaga, respostas) {
  if (vaga.pcd) return false;
  if (respostas.busca !== "conhecer" && !vaga.niveis.includes(respostas.busca)) return false;
  if (respostas.busca === "conhecer" && vaga.niveis.includes("jovem") && !respostas.escolaridade.startsWith("Ensino Médio")) return false;
  if (!escolaridadePermite(vaga, respostas.escolaridade)) return false;
  if (!vaga.areas.includes(respostas.area)) return false;
  if (vaga.cursos.length && !vaga.cursos.includes(respostas.curso)) return false;
  return true;
}

const normalizar = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
const nomeCidade = (value) => {
  const cidade = normalizar(value);
  return { jaboatao: "jaboatao dos guararapes", itamaraca: "ilha de itamaraca" }[cidade] ?? cidade;
};
const cidadesRmr = new Set([
  "Recife", "Jaboatão dos Guararapes", "Olinda", "Cabo de Santo Agostinho", "Paulista", "Camaragibe",
  "São Lourenço da Mata", "Igarassu", "Abreu e Lima", "Ipojuca", "Moreno", "Itapissuma", "Araçoiaba", "Ilha de Itamaracá",
].map(nomeCidade));

function localPermitido(vaga, respostas) {
  const cidade = nomeCidade(respostas.cidade);
  const uf = normalizar(respostas.uf);
  if (cidade && !uf) return false;
  if (uf && !vaga.ufs.some((estado) => normalizar(estado) === uf)) return false;
  if (!cidade) return true;
  return vaga.cidades.some((local) => nomeCidade(local) === cidade || (
    uf === "pernambuco" && cidadesRmr.has(cidade) && cidadesRmr.has(nomeCidade(local))
  ));
}

function naCidadeExata(vaga, respostas) {
  return Boolean(respostas.cidade.trim()) && vaga.cidades.some((cidade) => nomeCidade(cidade) === nomeCidade(respostas.cidade));
}

function verificar(respostas, resultado, candidatasDoPerfil) {
  assert.equal(resultado.catalogTotal, CATALOGO.length);
  const candidatas = candidatasDoPerfil.filter((vaga) => localPermitido(vaga, respostas));
  assert.equal(resultado.tipo === "vaga", candidatas.length > 0, "O resultado deve respeitar perfil e localização juntos");

  if (resultado.tipo === "vaga") {
    assert.ok(vagaPermite(resultado.principal, respostas), "A vaga principal não atende ao perfil");
    assert.ok(localPermitido(resultado.principal, respostas), "A vaga principal saiu da cidade/região/UF permitida");
    for (const relacionada of resultado.relacionadas) {
      assert.ok(vagaPermite(relacionada.vaga, respostas), "Uma sugestão relacionada não atende ao perfil");
      assert.ok(localPermitido(relacionada.vaga, respostas), "Uma sugestão relacionada saiu da localidade permitida");
    }
    const exatas = candidatas.filter((vaga) => naCidadeExata(vaga, respostas));
    if (exatas.length) assert.ok(naCidadeExata(resultado.principal, respostas), "Uma vaga regional venceu uma vaga compatível da cidade exata");
    const maisProximas = exatas.length ? exatas : candidatas;
    if (maisProximas.some((vaga) => vaga.cursos.includes(respostas.curso))) {
      assert.ok(resultado.principal.cursos.includes(respostas.curso), "O curso deve ter prioridade entre vagas de igual proximidade");
    }
  } else {
    assert.equal(resultado.principal.url, PORTAL_VAGAS);
    for (const alternativa of resultado.relacionadas) {
      assert.ok(alternativa.vaga.areas.includes(respostas.area), "Alternativa de outra área");
      assert.ok(localPermitido(alternativa.vaga, respostas), "Alternativa saiu da cidade/região/UF permitida");
    }
    const alternativas = CATALOGO.filter((vaga) => !vaga.pcd && vaga.areas.includes(respostas.area) && localPermitido(vaga, respostas));
    const exatas = alternativas.filter((vaga) => naCidadeExata(vaga, respostas));
    if (exatas.length) assert.ok(naCidadeExata(resultado.relacionadas[0].vaga, respostas), "Alternativas da cidade devem aparecer antes da região");
    const maisProximas = exatas.length ? exatas : alternativas;
    if (maisProximas.some((vaga) => vaga.cursos.includes(respostas.curso))) {
      assert.ok(resultado.relacionadas[0]?.vaga.cursos.includes(respostas.curso), "O curso deve ordenar alternativas da mesma localidade");
    }
  }
}

const referencias = [...LISTA_BRUTA.matchAll(/\/jobs\/(\d+)/g)].map((item) => item[1]);
assert.equal(CATALOGO.length, referencias.length, "Há vagas perdidas na leitura da lista");
assert.equal(new Set(CATALOGO.map((vaga) => vaga.ref)).size, CATALOGO.length, "IDs duplicados no catálogo");
assert.equal(new Set(referencias).size, referencias.length, "IDs duplicados na lista bruta");

let combinacoes = 0;
let comVaga = 0;
let portal = 0;
const cobertura = new Map();
const locaisDoCatalogo = [...new Map(
  CATALOGO.flatMap((vaga) => vaga.cidades.map((cidade) => {
    const local = { uf: vaga.ufs[0] ?? "", cidade };
    return [`${local.uf}|${local.cidade}`, local];
  })),
).values()];
let variacoesCidade = 0;

// Todas as opções fechadas do formulário × todos os estados × todos os locais da lista.
for (const escolaridade of escolaridades) {
  for (const curso of cursos) {
    for (const busca of buscas) {
      for (const area of areas) {
        const base = { escolaridade, curso, busca, area, uf: "", cidade: "" };
        const baseResultado = recommend(base);
        const candidatas = CATALOGO.filter((vaga) => vagaPermite(vaga, base));
        for (const uf of ["", ...ESTADOS_BR]) {
          const respostas = { ...base, uf };
          const resultado = uf ? recommend(respostas) : baseResultado;
          try {
            verificar(respostas, resultado, candidatas);
          } catch (error) {
            error.message += `\nRespostas: ${JSON.stringify(respostas)}\nPrincipal: ${resultado.principal.titulo}`;
            throw error;
          }

          combinacoes++;
          if (resultado.tipo === "vaga") comVaga++;
          else portal++;
          const chave = `${busca}/${area}`;
          cobertura.set(chave, (cobertura.get(chave) ?? 0) + Number(resultado.tipo === "vaga"));
        }
        for (const local of locaisDoCatalogo) {
          const respostas = { ...base, ...local };
          const resultado = recommend(respostas);
          try {
            verificar(respostas, resultado, candidatas);
          } catch (error) {
            error.message += `\nRespostas: ${JSON.stringify(respostas)}\nPrincipal: ${resultado.principal.titulo}`;
            throw error;
          }
          combinacoes++;
          variacoesCidade++;
          if (resultado.tipo === "vaga") comVaga++;
          else portal++;
        }
      }
    }
  }
}

for (const cidade of ["Recife", "Petrolina", "São Paulo", "Manaus", ""]) {
  const uf = cidade === "São Paulo" ? "São Paulo" : cidade === "Manaus" ? "Amazonas" : cidade ? "Pernambuco" : "";
  const respostas = { escolaridade: "Ensino Superior concluído", curso: "Psicologia", busca: "efetivo", area: "rh", uf, cidade };
  const resultado = recommend(respostas);
  verificar(respostas, resultado, CATALOGO.filter((vaga) => vagaPermite(vaga, respostas)));
}

// Regressão com o catálogo real: a vaga comercial de Canoas não pode aparecer para Recife.
const perfilRecife = { escolaridade: "Ensino Superior em andamento", curso: "Administração", busca: "estagio", area: "comercial", uf: "Pernambuco", cidade: "Recife" };
const resultadoRecife = recommend(perfilRecife);
verificar(perfilRecife, resultadoRecife, CATALOGO.filter((vaga) => vagaPermite(vaga, perfilRecife)));
assert.notEqual(resultadoRecife.principal.ref, 12281612, "Recife recebeu a vaga de Canoas");
assert.ok(resultadoRecife.relacionadas.every((item) => item.vaga.ref !== 12281612), "Canoas apareceu nas alternativas de Recife");

// Catálogo pequeno controlado: testa prioridade geográfica sem depender de vagas que mudam.
const catalogoOriginal = CATALOGO.slice();
const perfilLocal = { escolaridade: "Ensino Superior concluído", curso: "Administração", busca: "efetivo", area: "admfin", uf: "Pernambuco", cidade: "Recife" };
function vagaLocal(ref, cidade, uf = "Pernambuco", extra = {}) {
  return {
    id: String(ref), ref, titulo: `Cargo ${ref}`, url: `https://grupomoura.gupy.io/jobs/${ref}`, tipo: "vaga",
    niveis: ["efetivo"], areas: ["admfin"], local: `${cidade}, ${uf}`, ufs: [uf], cidades: [cidade],
    minEscolaridade: "medio", cursos: [], geral: false, pcd: false, ...extra,
  };
}
function usarCatalogo(vagas) { CATALOGO.splice(0, CATALOGO.length, ...vagas); }
try {
  usarCatalogo([
    vagaLocal(1, "Recife"),
    vagaLocal(2, "Olinda", "Pernambuco", { cursos: ["Administração"] }),
    vagaLocal(3, "Canoas", "Rio Grande do Sul", { cursos: ["Administração"] }),
  ]);
  let resultado = recommend(perfilLocal);
  assert.equal(resultado.principal.ref, 1, "Cidade exata deve vencer bônus de curso da região");
  assert.deepEqual(resultado.relacionadas.map((item) => item.vaga.ref), [2]);
  assert.ok(resultado.motivos.includes("Na sua cidade"));

  usarCatalogo([
    vagaLocal(1, "Recife", "Pernambuco", { cursos: ["Psicologia"] }),
    vagaLocal(2, "Olinda", "Pernambuco", { cursos: ["Administração"] }),
    vagaLocal(3, "Canoas", "Rio Grande do Sul", { cursos: ["Administração"] }),
  ]);
  resultado = recommend(perfilLocal);
  assert.equal(resultado.principal.ref, 2, "Proximidade não pode sobrepor o filtro obrigatório de curso");
  assert.ok(resultado.motivos.includes("Na sua região (Grande Recife)"));

  usarCatalogo([
    vagaLocal(1, "Recife", "Pernambuco", { cursos: ["Psicologia"] }),
    vagaLocal(3, "Canoas", "Rio Grande do Sul", { cursos: ["Administração"] }),
  ]);
  resultado = recommend(perfilLocal);
  assert.equal(resultado.tipo, "portal", "Sem opção local compatível deve mostrar o portal");
  assert.match(resultado.descricao, /Recife.*Grande Recife/);
  assert.match(resultado.descricao, /podem exigir outro nível, curso ou formação/);
  assert.deepEqual(resultado.relacionadas.map((item) => item.vaga.ref), [1], "Alternativas também precisam ser locais");

  usarCatalogo([vagaLocal(3, "Canoas", "Rio Grande do Sul")]);
  resultado = recommend(perfilLocal);
  assert.equal(resultado.tipo, "portal");
  assert.equal(resultado.relacionadas.length, 0);
  assert.equal(recommend({ ...perfilLocal, cidade: "", uf: "" }).principal.ref, 3, "Sem local a busca continua nacional");
  assert.equal(recommend({ ...perfilLocal, cidade: "", uf: "Rio Grande do Sul" }).principal.ref, 3, "Somente estado busca nesse estado");

  usarCatalogo([vagaLocal(1, "Recife"), vagaLocal(2, "Natal", "Rio Grande do Norte")]);
  assert.equal(recommend({ ...perfilLocal, cidade: "Reci" }).tipo, "portal", "Trecho de nome não pode virar Recife/RMR");
  assert.equal(recommend({ ...perfilLocal, cidade: "Recife", uf: "Rio Grande do Sul" }).tipo, "portal", "Mesmo nome em outro estado não pode passar");
  assert.equal(recommend({ ...perfilLocal, cidade: "Recife", uf: "" }).tipo, "portal", "Cidade sem estado não pode produzir correspondência ambígua");
  assert.equal(recommend({ ...perfilLocal, cidade: "Petrolina" }).tipo, "portal", "Fora da RMR não pode sugerir outra cidade de Pernambuco");
  assert.equal(recommend({ ...perfilLocal, cidade: "Natal", uf: "Rio Grande do Norte" }).principal.ref, 2);
  assert.equal(recommend({ ...perfilLocal, cidade: "Rio Grande", uf: "Rio Grande do Norte" }).tipo, "portal", "Nome do estado não é correspondência de cidade");
  for (const cidade of ["  rÉcife  ", "Jaboatão", "Itamaracá", "Araçoiaba", "Ilha de Itamaracá"]) {
    assert.equal(recommend({ ...perfilLocal, cidade }).principal.ref, 1, `Cidade/alias da RMR ignorado: ${cidade}`);
  }

  const etapaLocal = STEPS.find((step) => step.kind === "local");
  assert.ok(etapaLocal);
  assert.equal(isStepValid(etapaLocal, perfilLocal), true);
  assert.equal(isStepValid(etapaLocal, { ...perfilLocal, uf: "" }), false);
  assert.equal(isStepValid(etapaLocal, { ...perfilLocal, cidade: "" }), true);
  assert.equal(isStepValid(etapaLocal, { ...perfilLocal, cidade: "  ", uf: "" }), true);
} finally {
  usarCatalogo(catalogoOriginal);
}

console.log(`Catálogo: ${CATALOGO.length} vagas importadas, sem IDs repetidos.`);
console.log(`Combinações completas: ${combinacoes} (vaga: ${comVaga}; portal: ${portal}).`);
console.log(`Localização: ${variacoesCidade} variações com ${locaisDoCatalogo.length} pares cidade/estado do catálogo.`);
console.log(`Áreas e níveis cobertos: ${cobertura.size} grupos. Psicologia/RH em 5 localidades e regressões cidade/RMR/UF validadas.`);
