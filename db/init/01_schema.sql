-- ============================================================
--  CA ERP — Schema (PostgreSQL)
--  Centro Acadêmico de Engenharia de Software
--
--  Gerado a partir dos modelos do front-end (js/app.js e
--  ca-erp/src/app/core/models.ts). Os campos em camelCase do
--  front viram snake_case no banco (ex.: dataEntrada -> data_entrada).
--
--  Roda automaticamente na PRIMEIRA criação do banco.
-- ============================================================

-- gen_random_uuid() é nativo do PostgreSQL 13+ (não precisa de extensão).
-- Os IDs são TEXT: o front-end gera o próprio id ao criar registros; quando o
-- id não vem (ex.: dados-semente), o banco gera um uuid em texto por padrão.

-- ------------------------------------------------------------
--  Membros
-- ------------------------------------------------------------
CREATE TABLE membros (
    id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome          text        NOT NULL,
    cargo         text,
    email         text,
    periodo       text,
    telefone      text,
    ativo         boolean     NOT NULL DEFAULT true,
    data_entrada  date,
    observacao    text        DEFAULT '',
    foto          text,                      -- foto do membro em base64 (opcional; usada no site público)
    criado_em     timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  Financeiro (lançamentos: receitas e despesas)
-- ------------------------------------------------------------
CREATE TABLE financeiro (
    id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tipo        text        NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao   text        NOT NULL,
    valor       numeric(12, 2) NOT NULL DEFAULT 0,
    categoria   text,
    data        date,
    observacao  text        DEFAULT '',
    comprovante text,                     -- base64/URL do comprovante (opcional)
    criado_em   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  Eventos
-- ------------------------------------------------------------
CREATE TABLE eventos (
    id           text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo       text        NOT NULL,
    data         date,
    hora_inicio  time,
    hora_fim     time,
    local        text,
    descricao    text        DEFAULT '',
    status       text        NOT NULL DEFAULT 'planejado'
                 CHECK (status IN ('planejado', 'andamento', 'concluido', 'cancelado')),
    responsavel  text,
    publico      text,
    observacao   text        DEFAULT '',
    criado_em    timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  Reuniões
-- ------------------------------------------------------------
CREATE TABLE reunioes (
    id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo        text        NOT NULL,
    data          date,
    hora          time,
    local         text,
    tipo          text        NOT NULL DEFAULT 'ordinaria'
                  CHECK (tipo IN ('ordinaria', 'extraordinaria', 'planejamento', 'outros')),
    participantes text        DEFAULT '',
    pauta         text        DEFAULT '',
    ata           text        DEFAULT '',
    status        text        NOT NULL DEFAULT 'agendada'
                  CHECK (status IN ('agendada', 'realizada', 'cancelada')),
    criado_em     timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  Tarefas
-- ------------------------------------------------------------
CREATE TABLE tarefas (
    id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    titulo      text        NOT NULL,
    descricao   text        DEFAULT '',
    responsavel text,
    prazo       date,
    prioridade  text        NOT NULL DEFAULT 'media'
                CHECK (prioridade IN ('alta', 'media', 'baixa')),
    status      text        NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'andamento', 'concluida', 'cancelada')),
    criado_em   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  Documentos
-- ------------------------------------------------------------
CREATE TABLE documentos (
    id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome       text        NOT NULL,
    categoria  text,
    descricao  text        DEFAULT '',
    data       date,
    tamanho    text,
    tipo       text,
    upload_em  timestamptz NOT NULL DEFAULT now(),
    file_data  text                       -- conteúdo em base64 (opcional)
);

-- ------------------------------------------------------------
--  Índices úteis para consultas/ordenação frequentes
-- ------------------------------------------------------------
CREATE INDEX idx_financeiro_data  ON financeiro (data);
CREATE INDEX idx_financeiro_tipo  ON financeiro (tipo);
CREATE INDEX idx_eventos_data     ON eventos (data);
CREATE INDEX idx_reunioes_data    ON reunioes (data);
CREATE INDEX idx_tarefas_status   ON tarefas (status);
CREATE INDEX idx_tarefas_prazo    ON tarefas (prazo);
CREATE INDEX idx_membros_ativo    ON membros (ativo);
