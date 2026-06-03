# ============================================================
#  Painel do CA (ERP) — imagem de deploy: API Express + páginas
#  do painel num único serviço. Usada no Render (e localmente).
# ============================================================
FROM node:20-alpine

WORKDIR /app

# 1) Dependências da API primeiro (melhor cache).
COPY server/package.json ./server/
RUN cd server && npm install --omit=dev

# 2) Código do servidor.
COPY server/ ./server/

# 3) Páginas do painel + assets (servidos pela API a partir da raiz /app).
COPY css/ ./css/
COPY js/ ./js/
COPY assets/ ./assets/
COPY home.html membros.html financeiro.html eventos.html reunioes.html tarefas.html documentos.html login.html ./

ENV NODE_ENV=production
# O host (ex.: Render) injeta PORT; 3000 é só o padrão local.
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/server.js"]
