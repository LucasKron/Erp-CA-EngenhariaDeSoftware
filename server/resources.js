// ===== CA ERP — Descrição dos recursos (mapeamento front <-> banco) =====
//
// Para cada recurso definimos:
//   table   -> nome da tabela no Postgres
//   order   -> ORDER BY usado na listagem
//   columns -> lista de [campoJSON, colunaBanco, tipo]
//
// O campoJSON é o nome usado pelo front-end (camelCase). A colunaBanco é o
// nome no Postgres (snake_case). O tipo controla a conversão de leitura/escrita:
//   text | bool | num | date | time | ts (timestamp)

const RESOURCES = {
  membros: {
    table: 'membros',
    order: 'nome ASC',
    columns: [
      ['id', 'id', 'text'],
      ['nome', 'nome', 'text'],
      ['cargo', 'cargo', 'text'],
      ['email', 'email', 'text'],
      ['periodo', 'periodo', 'text'],
      ['telefone', 'telefone', 'text'],
      ['ativo', 'ativo', 'bool'],
      ['dataEntrada', 'data_entrada', 'date'],
      ['observacao', 'observacao', 'text'],
      ['foto', 'foto', 'text'],
      ['criadoEm', 'criado_em', 'ts'],
    ],
  },

  financeiro: {
    table: 'financeiro',
    order: 'data DESC NULLS LAST, criado_em DESC',
    columns: [
      ['id', 'id', 'text'],
      ['tipo', 'tipo', 'text'],
      ['descricao', 'descricao', 'text'],
      ['valor', 'valor', 'num'],
      ['categoria', 'categoria', 'text'],
      ['data', 'data', 'date'],
      ['observacao', 'observacao', 'text'],
      ['comprovante', 'comprovante', 'text'],
      ['criadoEm', 'criado_em', 'ts'],
    ],
  },

  eventos: {
    table: 'eventos',
    order: 'data DESC NULLS LAST',
    columns: [
      ['id', 'id', 'text'],
      ['titulo', 'titulo', 'text'],
      ['data', 'data', 'date'],
      ['horaInicio', 'hora_inicio', 'time'],
      ['horaFim', 'hora_fim', 'time'],
      ['local', 'local', 'text'],
      ['descricao', 'descricao', 'text'],
      ['status', 'status', 'text'],
      ['responsavel', 'responsavel', 'text'],
      ['publico', 'publico', 'text'],
      ['observacao', 'observacao', 'text'],
      ['criadoEm', 'criado_em', 'ts'],
    ],
  },

  reunioes: {
    table: 'reunioes',
    order: 'data DESC NULLS LAST',
    columns: [
      ['id', 'id', 'text'],
      ['titulo', 'titulo', 'text'],
      ['data', 'data', 'date'],
      ['hora', 'hora', 'time'],
      ['local', 'local', 'text'],
      ['tipo', 'tipo', 'text'],
      ['participantes', 'participantes', 'text'],
      ['pauta', 'pauta', 'text'],
      ['ata', 'ata', 'text'],
      ['status', 'status', 'text'],
      ['criadoEm', 'criado_em', 'ts'],
    ],
  },

  tarefas: {
    table: 'tarefas',
    order: 'criado_em DESC NULLS LAST',
    columns: [
      ['id', 'id', 'text'],
      ['titulo', 'titulo', 'text'],
      ['descricao', 'descricao', 'text'],
      ['responsavel', 'responsavel', 'text'],
      ['prazo', 'prazo', 'date'],
      ['prioridade', 'prioridade', 'text'],
      ['status', 'status', 'text'],
      ['criadoEm', 'criado_em', 'ts'],
    ],
  },

  noticias: {
    table: 'noticias',
    order: 'data DESC NULLS LAST, criado_em DESC',
    columns: [
      ['id', 'id', 'text'],
      ['titulo', 'titulo', 'text'],
      ['categoria', 'categoria', 'text'],
      ['data', 'data', 'date'],
      ['descricao', 'descricao', 'text'],
      ['chamada', 'chamada', 'text'],
      ['link', 'link', 'text'],
      ['criadoEm', 'criado_em', 'ts'],
    ],
  },

  documentos: {
    table: 'documentos',
    order: 'upload_em DESC NULLS LAST',
    columns: [
      ['id', 'id', 'text'],
      ['nome', 'nome', 'text'],
      ['categoria', 'categoria', 'text'],
      ['descricao', 'descricao', 'text'],
      ['data', 'data', 'date'],
      ['tamanho', 'tamanho', 'text'],
      ['tipo', 'tipo', 'text'],
      ['uploadEm', 'upload_em', 'ts'],
      ['fileData', 'file_data', 'text'],
    ],
  },
};

module.exports = { RESOURCES };
