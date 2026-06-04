// "ENV" do front-end (o navegador lê este arquivo; HTML estático não lê .env).
//
// ERP_API_URL = URL pública do painel/ERP. A seção "Nossa Diretoria" busca os
// membros aqui (GET /api/membros) via erp-sync.js: editou no painel -> aparece
// no site. Como o site é servido no mesmo deploy do painel, pode ser a própria
// origem. Em desenvolvimento local, aponte para "http://localhost:3000".
window.APP_CONFIG = {
  ERP_API_URL: "https://erp-ca-engenharia-de-software.vercel.app"
};
