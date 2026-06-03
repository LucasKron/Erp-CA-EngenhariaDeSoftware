-- ============================================================
--  CA ERP — Schema idempotente (rodado pela API no boot).
--  Usa CREATE TABLE IF NOT EXISTS para funcionar tanto num banco
--  novo (ex.: Postgres gerenciado do Render) quanto num já criado.
--  NÃO insere dados-semente (a carga inicial é feita à parte).
-- ============================================================

CREATE TABLE IF NOT EXISTS membros (
    id            text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome          text        NOT NULL,
    cargo         text,
    email         text,
    periodo       text,
    telefone      text,
    ativo         boolean     NOT NULL DEFAULT true,
    data_entrada  date,
    observacao    text        DEFAULT '',
    foto          text,
    criado_em     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financeiro (
    id          text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tipo        text        NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao   text        NOT NULL,
    valor       numeric(12, 2) NOT NULL DEFAULT 0,
    categoria   text,
    data        date,
    observacao  text        DEFAULT '',
    comprovante text,
    criado_em   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eventos (
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

CREATE TABLE IF NOT EXISTS reunioes (
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

CREATE TABLE IF NOT EXISTS tarefas (
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

CREATE TABLE IF NOT EXISTS documentos (
    id         text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome       text        NOT NULL,
    categoria  text,
    descricao  text        DEFAULT '',
    data       date,
    tamanho    text,
    tipo       text,
    upload_em  timestamptz NOT NULL DEFAULT now(),
    file_data  text
);

-- Usuários do painel (login por e-mail autorizado + senha).
CREATE TABLE IF NOT EXISTS app_users (
    email      text PRIMARY KEY,
    salt       text NOT NULL,
    hash       text NOT NULL,
    criado_em  timestamptz NOT NULL DEFAULT now()
);

-- Caso a tabela membros já exista de uma versão antiga, garante a coluna foto.
ALTER TABLE membros ADD COLUMN IF NOT EXISTS foto text;
