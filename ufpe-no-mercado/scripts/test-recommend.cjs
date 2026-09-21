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
const { recommend, STEPS, ESTADOS_BR, PORTAL_VAGAS, CATALOGO, LISTA_BRUTA } = auditModule.exports;

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

function verificar(respostas, resultado, baseTipo, candidatas) {
  assert.equal(resultado.catalogTotal, CATALOGO.length);
  assert.equal(resultado.tipo, baseTipo, "Cidade ou UF mudaram indevidamente o resultado entre vaga e portal");

  assert.equal(resultado.tipo === "vaga", candidatas.length > 0, "Uma vaga possível foi escondida ou houve falso positivo");

  if (resultado.tipo === "vaga") {
    assert.ok(vagaPermite(resultado.principal, respostas), "A vaga principal não atende ao perfil");
    for (const relacionada of resultado.relacionadas) {
      assert.ok(vagaPermite(relacionada.vaga, respostas), "Uma sugestão relacionada não atende ao perfil");
    }
    if (candidatas.some((vaga) => vaga.cursos.includes(respostas.curso))) {
      assert.ok(resultado.principal.cursos.includes(respostas.curso), "Localização venceu uma vaga do curso escolhido");
    }
  } else {
    assert.equal(resultado.principal.url, PORTAL_VAGAS);
    for (const alternativa of resultado.relacionadas) {
      assert.ok(alternativa.vaga.areas.includes(respostas.area), "Alternativa de outra área");
    }
    if (CATALOGO.some((vaga) => !vaga.pcd && vaga.areas.includes(respostas.area) && vaga.cursos.includes(respostas.curso))) {
      assert.ok(resultado.relacionadas[0]?.vaga.cursos.includes(respostas.curso), "Cidade venceu o curso nas alternativas");
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
            verificar(respostas, resultado, baseResultado.tipo, candidatas);
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
            verificar(respostas, resultado, baseResultado.tipo, candidatas);
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
  assert.equal(resultado.tipo, "vaga", `Psicóloga formada caiu no portal em ${cidade}`);
  assert.ok(resultado.principal.cursos.includes("Psicologia"));
  assert.ok(resultado.principal.areas.includes("rh"));
}

console.log(`Catálogo: ${CATALOGO.length} vagas importadas, sem IDs repetidos.`);
console.log(`Combinações completas: ${combinacoes} (vaga: ${comVaga}; portal: ${portal}).`);
console.log(`Localização: ${variacoesCidade} variações com ${locaisDoCatalogo.length} pares cidade/estado do catálogo.`);
console.log(`Áreas e níveis cobertos: ${cobertura.size} grupos. Caso Psicologia/RH validado em 5 localidades.`);
