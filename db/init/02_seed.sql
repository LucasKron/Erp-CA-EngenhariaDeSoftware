-- ============================================================
--  CA ERP — Dados-semente (PostgreSQL)
--
--  Mesmos dados de exemplo que hoje o front-end grava no
--  localStorage (função seedInitialData em js/app.js).
--  Os IDs são gerados pelo banco (gen_random_uuid()).
--
--  Roda automaticamente logo após 01_schema.sql, na primeira
--  criação do banco.
-- ============================================================

-- ----- Membros -----
INSERT INTO membros (nome, cargo, email, periodo, telefone, ativo, data_entrada) VALUES
    ('Maria Silva',   'Presidente',           'maria@pucpr.edu.br',   '5° período', '(45) 99901-0001', true, '2024-03-01'),
    ('João Santos',   'Vice-Presidente',      'joao@pucpr.edu.br',    '4° período', '(45) 99901-0002', true, '2024-03-01'),
    ('Ana Costa',     'Tesoureiro(a)',        'ana@pucpr.edu.br',     '5° período', '(45) 99901-0003', true, '2024-03-01'),
    ('Lucas Mendes',  'Secretário(a)',        'lucas@pucpr.edu.br',   '3° período', '(45) 99901-0004', true, '2024-03-01'),
    ('Beatriz Lima',  'Diretor(a) de Eventos','beatriz@pucpr.edu.br', '4° período', '(45) 99901-0005', true, '2024-03-01');

-- ----- Financeiro -----
INSERT INTO financeiro (tipo, descricao, valor, categoria, data, observacao) VALUES
    ('receita', 'Mensalidade membros - Março/2024',          250.00, 'Mensalidade',          '2024-03-05', ''),
    ('receita', 'Venda de canecas CA',                       180.00, 'Venda',                '2024-03-12', '18 unidades x R$10'),
    ('despesa', 'Impressão material para boas-vindas',         94.50, 'Material',             '2024-03-10', 'Gráfica Central'),
    ('despesa', 'Lanche para reunião geral',                   67.00, 'Alimentação',          '2024-03-18', ''),
    ('receita', 'Apoio institucional PUC - Semestre 1',       500.00, 'Apoio Institucional',  '2024-03-20', '');

-- ----- Eventos -----
INSERT INTO eventos (titulo, data, hora_inicio, local, descricao, status, responsavel) VALUES
    ('Semana de Boas-Vindas',                  '2024-03-25', '14:00', 'Hall Principal - Bloco A', 'Recepção aos calouros do curso de Engenharia de Software.', 'concluido', 'Beatriz Lima'),
    ('Hackathon CA 2024',                      '2024-04-20', '08:00', 'Lab de Informática 1 e 2', '24h de desenvolvimento de projetos sociais com tecnologia.', 'planejado', 'João Santos'),
    ('Workshop: Git e GitHub para Iniciantes', '2024-04-05', '19:00', 'Sala 204 - Bloco B',       'Workshop prático para alunos do 1° e 2° período.',          'planejado', 'Lucas Mendes');

-- ----- Reuniões -----
INSERT INTO reunioes (titulo, data, hora, local, tipo, participantes, pauta, ata, status) VALUES
    ('Reunião Ordinária - Março 2024',
     '2024-03-18', '19:30', 'Sala do CA', 'ordinaria',
     'Maria Silva, João Santos, Ana Costa, Lucas Mendes, Beatriz Lima',
     E'1. Aprovação da ata anterior\n2. Planejamento do Hackathon\n3. Prestação de contas\n4. Assuntos gerais',
     E'Reunião iniciada às 19h35 com quórum de 5 membros.\n\n1. Ata anterior aprovada por unanimidade.\n\n2. Hackathon: definida a data para 20/04. Beatriz ficou responsável pela divulgação.\n\n3. Saldo atual: R$ 768,50. Ana apresentou planilha de gastos.\n\n4. Proposta de criar grupo no WhatsApp para comunicação com alunos aprovada.',
     'realizada');

-- ----- Tarefas -----
INSERT INTO tarefas (titulo, descricao, responsavel, prazo, prioridade, status) VALUES
    ('Divulgar Hackathon nas redes sociais',     '',                                       'Beatriz Lima', '2024-04-10', 'alta',  'pendente'),
    ('Confirmar local para o Workshop de Git',   'Verificar disponibilidade da Sala 204',  'Lucas Mendes', '2024-03-30', 'media', 'pendente'),
    ('Atualizar lista de membros 2024',          '',                                       'Ana Costa',    '2024-03-28', 'baixa', 'concluida');

-- ----- Documentos -----
INSERT INTO documentos (nome, categoria, descricao, tamanho, tipo) VALUES
    ('Estatuto do CA - 2024.pdf',     'Regulamento', 'Estatuto atualizado do Centro Acadêmico', '245 KB', 'pdf'),
    ('Ata Reunião Março 2024.docx',   'Ata',         'Ata da reunião ordinária de março',       '38 KB',  'docx');
