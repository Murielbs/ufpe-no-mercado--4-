# UFPE no Mercado (React + TypeScript)

Totem/quiz que **sugere** vagas do Grupo Moura a partir do perfil do participante.
O resultado é sempre uma sugestão: a tela e o e-mail avisam que não garante seleção
e que a vaga pode ser encerrada.

## Como rodar
```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera a pasta dist/ para publicar no totem
```

## Arquivos que você precisa copiar para a pasta `public/`
- `Imagem2.png` (logo)
- `image_1657a3.jpg` (mascote)
- `A_interprete_deve_estar_faland.mp4` (vídeo)

## E-mail
Copie `.env.example` para `.env` e coloque a URL do Google Apps Script em `VITE_EMAIL_ENDPOINT`.
Deixe vazio para desativar o envio.
O envio inclui o campo `aviso` (texto de "é uma sugestão"). Para que apareça no e-mail,
adicione `body.aviso` ao modelo de e-mail do Apps Script.

## Como atualizar as vagas
1. Abra `src/vagas-lista.ts`.
2. Apague as linhas entre as crases e cole a lista nova do Gupy (uma vaga por linha):
   `TÍTULO Cidade - UF Tipo | https://…gupy.io/jobs/000000`
3. `npm run build`. O catálogo é remontado sozinho.

Só entram links diretos de vaga (`…/jobs/NÚMERO`). O QR code sempre abre a vaga exata.

O `src/vagas.ts` classifica cada linha (nível, área, cursos, escolaridade) por palavras-chave
do título — veja `REGRAS`. Quando o Gupy traz cidade diferente da do título, ou a regra erra,
corrija em `AJUSTES` pelo número da vaga.

## Onde mexer
- `src/vagas-lista.ts` — lista bruta de vagas (colar aqui a exportação do Gupy)
- `src/vagas.ts` — leitura da lista, `REGRAS` de classificação e `AJUSTES` pontuais
- `src/recommend.ts` — pontuação que escolhe a sugestão principal e as 2 seguintes
  (junta postagens repetidas do mesmo cargo; considera a Grande Recife como "sua região")
- `src/data.ts` — perguntas, textos, aviso de sugestão, tempo de inatividade e nº de vagas extras
- `src/styles.css` — cores e tipografia (variáveis no topo)
- `src/components/` — telas (Attract, VideoStep, Quiz, Result…)
