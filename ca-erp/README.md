# CA · Engenharia de Software — ERP (Angular)

Sistema de gestão do Centro Acadêmico de Engenharia de Software (PUC · Toledo),
migrado de HTML/CSS/JS puro para **Angular 21** (standalone components + signals),
com o tema escuro **navy / azul / dourado** e o emblema circular "CA".

## Como rodar

```bash
cd ca-erp
npm install      # apenas na primeira vez
npm start        # ng serve → http://localhost:4200
```

Build de produção:

```bash
npm run build    # artefatos em dist/ca-erp
```

## Funcionalidades

7 módulos, todos com CRUD completo e persistência local (`localStorage`):

| Rota          | Módulo     | Destaques                                            |
| ------------- | ---------- | ---------------------------------------------------- |
| `/dashboard`  | Dashboard  | indicadores, próximos eventos, tarefas, financeiro   |
| `/documentos` | Documentos | upload (drag & drop), filtros, download              |
| `/financeiro` | Financeiro | receitas/despesas, saldo, comprovantes               |
| `/membros`    | Membros    | cargos, status, perfil                               |
| `/eventos`    | Eventos    | agenda por status                                    |
| `/reunioes`   | Reuniões   | pauta, ata e **impressão da ata**                    |
| `/tarefas`    | Tarefas    | prioridade, prazo (atraso), conclusão por checkbox   |

## Arquitetura

```
src/
  styles.css                 → design system (tema escuro, variáveis CSS)
  index.html                 → fonte Inter + favicon (logo.svg)
  public/logo.svg            → emblema circular CA
  app/
    app.ts                   → shell (sidebar + router-outlet + toasts)
    app.routes.ts            → rotas (lazy loadComponent)
    core/
      models.ts              → interfaces de domínio
      data.service.ts        → coleções reativas (signals) + seed + localStorage
      toast.service.ts       → notificações
      layout.service.ts      → estado da sidebar (mobile)
      utils.ts               → datas, moeda, arquivos
    shared/
      logo.component.ts       sidebar.component.ts   page-header.component.ts
      modal.component.ts      toast-container.component.ts
    pages/                   → um componente por módulo
```

### Substituir o `localStorage` por um backend

A camada de dados está isolada em `core/data.service.ts` (classe `Collection`).
Para integrar uma API, basta trocar `readLS`/`writeLS` por chamadas `fetch`/`HttpClient`
nos métodos `commit`/`set`/`add`/`update`/`remove` — os componentes não mudam.

> Os arquivos HTML/CSS/JS originais permanecem na raiz do repositório como referência.
