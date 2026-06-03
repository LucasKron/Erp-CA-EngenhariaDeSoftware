# Integração ERP ↔ Site público (CA Engenharia de Software)

O **ERP** (este projeto) funciona como **painel/CMS** do **site institucional** do CA
(projeto `FRONT-END-CYBER`, arquivo `ca_esw (3).html`). As seções **Eventos** e
**Diretoria** do site passaram a ser **dinâmicas**: elas buscam os dados da API do
ERP. Ou seja:

> Editou um evento ou um membro **no painel do ERP** → recarregou o site →
> **o site já mostra atualizado.**

## Como funciona

```
   Painel (ERP)            API do ERP             Site público
   membros.html      →   GET /api/membros    →   seção Diretoria (#dir-grid)
   eventos.html      →   GET /api/eventos    →   seção Eventos    (#ev-grid)
        (edita)              (PostgreSQL)            (erp-sync.js)
```

- O site carrega **`erp-sync.js`**, que busca `GET {ERP}/api/eventos` e
  `GET {ERP}/api/membros` e monta os cards com as **mesmas classes CSS** do site.
- A URL do ERP vem de `window.APP_CONFIG.ERP_API_URL` (no `config.js` do site).
  Padrão: `http://localhost:3000`.
- Se a API do ERP **não responder**, o site mantém o conteúdo fixo que já estava
  no HTML (fallback) — nunca quebra.

## O que mudou em cada projeto

**ERP (este repositório)**
- `db/init/01_schema.sql` + API: novo campo **`foto`** em `membros`.
- `membros.html` / `js/membros.js`: upload de foto (com redução automática),
  preview, e exibição da foto na tabela e no perfil. Cargos atualizados para os
  reais do CA (incl. suplentes).
- `server/scripts/import-site-data.js`: importa a diretoria e os eventos reais
  do HTML do site para o banco.
- `server/scripts/patch-site-html.js`: marca o HTML do site (ids + script).

**Site (`FRONT-END-CYBER`)**
- `erp-sync.js` (novo): busca do ERP e renderiza Eventos + Diretoria.
- `config.js` / `config.example.js`: novo `ERP_API_URL`.
- `server/server.js`: a rota `/config.js` agora também envia `ERP_API_URL`.
- `ca_esw (3).html`: `id="ev-grid"`, `id="dir-grid"` e `<script src="erp-sync.js">`.

## Rodar

1. Suba o ERP (banco + API): na raiz deste projeto, `docker compose up -d --build`.
2. Abra o site (`ca_esw (3).html`) no navegador — direto ou pelo servidor dele.
3. Edite membros/eventos no ERP (`membros.html`, `eventos.html`) e recarregue o site.

## Reimportar os dados do site (se precisar recomeçar)

```bash
# (re)carrega diretoria + eventos do HTML para o banco do ERP
node server/scripts/import-site-data.js "C:/MeusProjetos/FRONT-END-CYBER/ca_esw (3).html"

# (re)aplica as marcações no HTML do site (idempotente)
node server/scripts/patch-site-html.js "C:/MeusProjetos/FRONT-END-CYBER/ca_esw (3).html"
```

## Publicar (deploy)

Veja o passo a passo no **[DEPLOY.md](DEPLOY.md)** (Render: painel + banco + site).
Pontos-chave já resolvidos:

- **Login no painel** (e-mail autorizado + senha). A API protege **todas as escritas**
  e a leitura de financeiro/reuniões/tarefas/documentos. Só `eventos` e `membros`
  (sem e-mail/telefone) são públicos — o que o site precisa.
- `ERP_API_URL` precisa ser a URL **pública** do painel (a que o navegador do visitante
  alcança), não `localhost`.
- As fotos são guardadas em base64 no banco (reduzidas no upload). Para muitos
  membros/fotos grandes, considere migrar para arquivos/URLs.

## Próximas fases (ainda não feitas)

- **Notícias**: criar o tipo no ERP + seção dinâmica no site.
- **Textos das páginas** (hero/sobre/contato) editáveis pelo painel.
- **Documentos** públicos no site (já existem no ERP).
