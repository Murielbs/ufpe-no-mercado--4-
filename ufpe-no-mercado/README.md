# UFPE no Mercado (React + TypeScript)

Totem/quiz que **sugere** vagas do Grupo Moura a partir do perfil do participante.
O resultado é sempre uma sugestão: a tela avisa que não garante seleção e que a vaga
pode ser encerrada.

O projeto funciona como PWA: após a preparação no aparelho, o vídeo, o questionário,
o catálogo de vagas, as recomendações e os QR codes ficam disponíveis sem internet.

## Preparar o totem Android antes do evento

Faça esta preparação **no mesmo Android e no mesmo perfil do navegador** que serão usados
no evento. Use o Chrome em uma sessão normal, sem modo anônimo.

1. Conecte o Android à internet. Se necessário, use temporariamente o roteamento de
   internet de um celular.
2. Abra a versão publicada em HTTPS:
   [UFPE no Mercado](https://murielbs.github.io/ufpe-no-mercado--4-/).
3. Mantenha a página aberta até a tela inicial mostrar **“Pronto para usar sem internet”**.
   Essa confirmação aparece depois de salvar os arquivos necessários, incluindo o vídeo
   e as fontes. Abrir a página por alguns segundos não garante que o download terminou.
4. Toque em **“Instalar no Android”**, quando o botão aparecer. Se ele não estiver
   disponível, abra o menu do Chrome e procure **“Instalar app”** ou
   **“Adicionar à tela inicial”**; o nome varia conforme a versão do navegador.
   Instalar facilita a abertura pelo ícone, mas a confirmação de preparo offline é que
   indica que os arquivos foram salvos.
5. Ative o modo avião e confira que o Wi-Fi também está desligado. Abra o aplicativo,
   reproduza o vídeo e avance por todo o questionário até aparecerem o resultado e os
   QR codes.
6. Ainda sem conexão, feche o aplicativo e suas abas no Chrome e abra-o novamente pelo
   ícone. Repita o teste de abertura antes de levar o totem ao evento.

Depois disso, abra o aplicativo normalmente no evento. Não limpe os dados do site ou
do navegador: isso apaga os arquivos salvos e exige uma nova preparação com internet.
Preparar outro computador ou outro celular não prepara o Android do totem.

**Se o Android nunca foi preparado e já está totalmente sem conexão**, o PWA ainda não
tem os arquivos necessários. Será preciso obter uma conexão temporária para carregá-los
ou disponibilizar o projeto por um servidor local adequado. A instalação não consegue
baixar arquivos sem uma fonte acessível. Um servidor HTTP comum em outro computador da
rede não equivale a HTTPS nem ao `localhost` do próprio Android para instalar o PWA.

## O que continua dependendo de internet

- Os QR codes são gerados no próprio aparelho e aparecem offline. Eles apontam para
  páginas externas do Gupy: o celular do participante precisa de internet para abrir
  os detalhes da vaga e fazer a inscrição. O participante também pode guardar o link
  para abrir depois, quando tiver conexão.
- O catálogo incluído no aplicativo é uma cópia da lista publicada com aquela versão.
  Ele não consulta nem sincroniza a disponibilidade das vagas com o Gupy. A vaga pode
  ter sido encerrada desde a última atualização.
- Novas versões e novos catálogos precisam ser baixados enquanto houver conexão.

## Atualizar um totem já preparado

Depois de publicar uma nova versão, conecte o Android à internet e abra o aplicativo
para que ele baixe a atualização. A versão nova aguarda o fechamento de **todas** as
janelas e abas do site, inclusive o aplicativo instalado; ela não interrompe um
questionário em andamento. Feche tudo quando não houver participante usando o totem,
abra novamente com internet e confirme **“Pronto para usar sem internet”**.
Antes do próximo evento, repita o teste em modo avião, incluindo vídeo, questionário,
resultado e reabertura.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm test         # cruza todas as opções do quiz com estados e cidades do catálogo
npm run build    # gera dist/ com os arquivos do PWA, manifest e service worker
npm run preview  # serve o build localmente para conferir no computador
```

O `npm run dev` não ativa o service worker. Para testar a versão offline no computador,
execute `npm run build` e depois `npm run preview`, abra o endereço `localhost` informado
pelo Vite e aguarde a confirmação de preparo. Para preparar o Android, use a URL HTTPS
publicada; o endereço `localhost` do computador não aponta para ele no Android.

## Deploy no GitHub Pages

O deploy é automático a cada `push` na branch `main`. O workflow fica na raiz do repositório,
em `.github/workflows/deploy-pages.yml`, porque este app está dentro da pasta
`ufpe-no-mercado/`.

Na primeira publicação, abra **Settings > Pages** no GitHub e selecione **GitHub Actions**
em **Source**. Depois que a Action terminar, o site ficará disponível em:
`https://murielbs.github.io/ufpe-no-mercado--4-/`.

O `base: "./"` no Vite mantém os caminhos de arquivos corretos tanto no GitHub Pages quanto
em uma hospedagem local.

## Arquivos na pasta `public/`

- `Imagem2.png` — logo, já incluído no projeto.
- `Novo_video.mp4` — vídeo, já incluído no projeto.

## Como atualizar as vagas

1. Abra `src/vagas-lista.ts`.
2. Apague as linhas entre as crases e cole a lista nova do Gupy (uma vaga por linha):
   `TÍTULO Cidade - UF Tipo | https://…gupy.io/jobs/000000`
3. Execute `npm run build`. O catálogo é remontado sozinho.
4. Publique a versão nova e atualize cada totem seguindo as instruções acima.

Só entram links diretos de vaga (`…/jobs/NÚMERO`). O QR code sempre abre a vaga exata.

O `src/vagas.ts` classifica cada linha (nível, área, cursos, escolaridade) por palavras-chave
do título — veja `REGRAS`. Quando o Gupy traz cidade diferente da do título, ou a regra erra,
corrija em `AJUSTES` pelo número da vaga.

## Onde mexer

- `src/vagas-lista.ts` — lista bruta de vagas (colar aqui a exportação do Gupy)
- `src/vagas.ts` — leitura da lista, `REGRAS` de classificação e `AJUSTES` pontuais
- `src/recommend.ts` — filtra nível, área, formação, curso e localização. Uma cidade exige
  também o estado: a busca fica nessa cidade ou, para os 14 municípios da Grande Recife,
  na região metropolitana de Pernambuco, sempre priorizando a cidade exata. Nunca sugere
  outro estado quando um estado foi escolhido. Apenas estado preenchido busca em todo o
  estado; localização vazia permite busca nacional. Sem vaga local compatível, mostra o
  portal e, separadamente, alternativas da área apenas na localidade escolhida, avisando
  que podem exigir outro nível, curso ou formação.
- `scripts/test-recommend.cjs` — verifica todas as opções fechadas do formulário, todos os
  estados e cada cidade/estado presente na lista de vagas; cidade digitada livremente não tem
  um conjunto finito de respostas possíveis
- `src/data.ts` — perguntas, textos, aviso de sugestão, tempo de inatividade e nº de vagas extras
- `src/styles.css` — cores e tipografia (variáveis no topo)
- `src/components/` — telas (Attract, VideoStep, Quiz, Result…)
