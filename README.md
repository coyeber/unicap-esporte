# UNICAP Esporte

Portal de inscrições esportivas da UNICAP.

## Estrutura
- `index.html` — página inicial
- `aluno.html` — inscrição de equipes independentes
- `coordenador.html` — login das atléticas
- `cadastro-coordenador.html` — cadastro de equipes oficiais
- `style.css` — estilos
- `config.js` — URL do backend Apps Script
- `api.js` — comunicação com o backend
- `assets/` — imagens e identidade visual

## Backend
O backend Google Apps Script fica separado do repositório público porque contém
configurações administrativas. Após publicar o Apps Script como Aplicativo da Web,
adicione a URL que termina em `/exec` no arquivo `config.js`.

## Deploy
O projeto é estático e pode ser publicado diretamente no Vercel sem comando de build.

Desenvolvido por Coyeber.
