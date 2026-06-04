// ── "ENV" do front-end ───────────────────────────────────────────────────────
// Este e o arquivo que o NAVEGADOR le de fato (um HTML estatico nao le .env).
// Defina aqui a URL publica da sua API depois do deploy.
//
//   • Servindo o front pelo proprio servidor Node (mesmo dominio):
//       deixe API_URL vazio ("")  -> usa a mesma origem (sem CORS).
//   • Hospedando o front separado (ex.: GitHub Pages):
//       coloque a URL do Render, ex.: "https://seu-app.onrender.com"
//
// (Quando servido pelo Node, a rota /config.js sobrescreve este arquivo com o
//  valor de ALLOW_ORIGIN do .env do servidor.)
window.APP_CONFIG = {
  API_URL: "http://localhost:3000"
};
