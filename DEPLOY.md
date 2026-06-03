# Publicar no Render — Painel (ERP) + Site (separados)

Você vai subir **dois serviços independentes**, cada um com sua URL:

| Serviço | Repositório | O que é |
|---|---|---|
| **Painel** (ERP) | `LucasKron/Erp-CA-EngenhariaDeSoftware` | API + páginas do painel + Postgres |
| **Site** | `kainanAquino12/PROJETO-CYBER-` | Landing pública (lê eventos/membros do painel) |

> **Ordem importa:** publique o **painel primeiro** (pra ter a URL dele) e depois o
> **site**, apontando o site para a URL do painel.

---

## Pré-requisitos
- Conta no [Render](https://render.com) (pode logar com o GitHub).
- Acesso aos dois repositórios no GitHub (quem tem acesso a cada repo publica aquele).

---

## Passo 1 — Subir as mudanças no GitHub

Em **cada** projeto, faça commit e push do que mudamos.

Painel (nesta pasta):
```bash
git add -A
git commit -m "Deploy: login, schema automático, servir painel pela API, render.yaml"
git push
```

Site (`C:/MeusProjetos/FRONT-END-CYBER`):
```bash
git add -A
git commit -m "Integração com o painel (erp-sync) + render.yaml + Dockerfile"
git push
```

---

## Passo 2 — Publicar o PAINEL (com banco)

1. No Render: **New +** → **Blueprint**.
2. Conecte o repositório do **painel**. O Render lê o `render.yaml` e cria **2 coisas**:
   - um **Postgres** (`ca-erp-db`);
   - o **web service** (`ca-erp-painel`) — já com `AUTH_SECRET` gerado, `PANEL_EMAILS`
     definido e a conexão com o banco ligada.
3. Confira se **seu e-mail está em `PANEL_EMAILS`** (no serviço → Environment). Padrão:
   `lucaskronbauer16@gmail.com,kainanneres262@gmail.com`.
4. Clique em **Apply / Deploy** e espere o build terminar. A URL será algo como
   `https://ca-erp-painel.onrender.com`.
5. **Primeiro login:** abra `https://<seu-painel>/login.html`, digite seu e-mail
   (autorizado) e **defina uma senha** (o primeiro acesso já cadastra). Pronto, entrou.

### Carregar a diretoria + eventos reais no banco de produção
O banco de produção começa **vazio**. Para popular com a diretoria/eventos do site
(uma vez só):

```bash
# 1) Pegue um token: faça login pelo site do painel e copie em
#    DevTools (F12) → Application → Local Storage → a chave "ca_erp_token".
#    OU pegue por linha de comando:
curl -X POST https://<seu-painel>/api/auth/login -H "Content-Type: application/json" \
  -d "{\"email\":\"SEU_EMAIL\",\"password\":\"SUA_SENHA\"}"

# 2) Rode o import apontando para a URL de produção + o token (3º argumento):
node server/scripts/import-site-data.js "C:/MeusProjetos/FRONT-END-CYBER/ca_esw (3).html" https://<seu-painel> COLE_O_TOKEN_AQUI
```

Confirme abrindo `https://<seu-painel>/api/eventos` — deve mostrar o JSON dos eventos.

---

## Passo 3 — Publicar o SITE

1. No Render: **New +** → **Blueprint**.
2. Conecte o repositório do **site**. Ele cria o web service `projeto-cyber-site`.
3. No serviço → **Environment**, ajuste **`ERP_API_URL`** para a URL **real** do painel
   (ex.: `https://ca-erp-painel.onrender.com`) e salve (redeploy automático).
4. Abra `https://<seu-site>` — as seções **Eventos** e **Diretoria** carregam do painel.

---

## Pronto! Como fica o fluxo
- Edita membros/eventos no **painel** (logado) → recarrega o **site** → atualizado.
- O site lê só o que é público (`eventos` e `membros` sem dados sensíveis).
- Financeiro, reuniões, tarefas e documentos **só** com login.

---

## ⚠️ Coisas do plano grátis do Render (importante saber)
- **Cold start:** serviços grátis “dormem” após ~15 min sem uso. A 1ª visita depois
  disso demora ~30–60s pra acordar. Se o painel estiver dormindo, o site mostra o
  conteúdo fixo (fallback) até a API responder.
- **Postgres grátis expira em ~90 dias** (dá pra recriar/migrar).
- O **demo de coleta do site** (visits.json) e a senha do dashboard do site são
  **temporários** no grátis (resetam a cada deploy) — pro demo educativo, tudo bem.
- **Segurança:** a leitura de `eventos`/`membros` é pública (o site precisa). Escrita e
  o resto exigem login. Se quiser, dá pra restringir o CORS da API só pra origem do site.

## Rodar tudo local (continua funcionando)
```bash
docker compose up -d --build      # banco + API + painel em http://localhost:3000
```
Abra `http://localhost:3000/` (ou os arquivos `.html`). No 1º acesso, defina sua senha.
O site local (`http://localhost:36724`) lê do painel em `localhost:3000`.
