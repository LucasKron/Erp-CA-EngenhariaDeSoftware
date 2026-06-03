# Backend do CA ERP — PostgreSQL + API + Adminer (Docker)

O site estático da raiz agora lê e grava num **banco PostgreSQL** através de uma
**API REST** (Express). Tudo roda em Docker. O **Adminer** dá uma interface web
para inspecionar o banco.

> O app Angular em `ca-erp/` **não** foi alterado — ele continua usando
> `localStorage`. Este backend serve o **site estático** (páginas `*.html` da raiz).

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **aberto**.

## Como subir

Na **raiz do projeto** (onde está o `docker-compose.yml`):

```bash
# 1. (primeira vez) crie seu .env a partir do exemplo
cp .env.example .env        # Windows PowerShell: copy .env.example .env

# 2. suba banco + api + adminer
docker compose up -d --build

# 3. veja se está tudo de pé
docker compose ps
```

O schema (`db/init/01_schema.sql`) e os dados-semente (`db/init/02_seed.sql`)
rodam **automaticamente** na primeira vez.

Depois, **abra o site** (`home.html` na raiz) no navegador. As páginas chamam a
API em `http://localhost:3000` para carregar e salvar os dados.

## Serviços e acessos

| Serviço     | Endereço                     | Observações                                  |
|-------------|------------------------------|----------------------------------------------|
| API REST    | http://localhost:3000/api    | Usada pelo site. Teste: `/api/health`        |
| Adminer     | http://localhost:8080        | Sistema **PostgreSQL** · Servidor `db`       |
| PostgreSQL  | `localhost:5432`             | usuário/senha/banco vêm do `.env`            |

Login no Adminer: Sistema **PostgreSQL**, Servidor `db`, Usuário/Senha/Base
conforme o `.env` (padrão `ca_erp` / `ca_erp_dev` / `ca_erp`).

## A API

Para cada recurso (`membros`, `financeiro`, `eventos`, `reunioes`, `tarefas`,
`documentos`):

| Método | Rota              | O que faz                                            |
|--------|-------------------|------------------------------------------------------|
| GET    | `/api/:recurso`   | Lista todos os registros                             |
| PUT    | `/api/:recurso`   | Substitui a coleção inteira pelo array enviado       |
| GET    | `/api/health`     | Verifica se a API e o banco estão de pé              |

O `PUT` substitui tudo de uma vez porque é assim que o front trabalha: lê a
coleção, altera em memória e grava de volta. O servidor traduz os nomes de
campo (camelCase do front ↔ snake_case do banco) e formata datas/horas.

## Comandos úteis

```bash
docker compose logs -f api     # logs da API
docker compose logs -f db      # logs do banco
docker compose restart api     # reinicia só a API (após mexer no server/)
docker compose down            # parar (os dados ficam salvos no volume)
docker compose down -v         # parar e APAGAR o banco (recria do zero ao subir)
```

Terminal SQL direto no banco:

```bash
docker exec -it ca_erp_db psql -U ca_erp -d ca_erp
```

## Estrutura

```
docker-compose.yml      # serviços db (postgres) + api (express) + adminer
.env / .env.example     # credenciais e portas
server/                 # API REST (Node/Express)
  server.js             #   rotas GET/PUT por recurso
  resources.js          #   mapa campo-do-front <-> coluna-do-banco
  db.js                 #   conexão com o PostgreSQL
  Dockerfile
db/
  init/
    01_schema.sql       # CREATE TABLE (membros, financeiro, eventos, ...)
    02_seed.sql         # INSERTs com os dados de exemplo
```

> Os scripts em `db/init/` só rodam quando o volume está **vazio** (primeira
> criação). Se editar o schema, recrie com `docker compose down -v` e
> `docker compose up -d --build`.

## Apontar o site para outro host da API

Por padrão o front usa `http://localhost:3000`. Para mudar, defina uma variável
global **antes** de carregar `js/app.js` na página:

```html
<script>window.CA_API_BASE = 'http://192.168.0.10:3000';</script>
<script src="js/app.js"></script>
```
