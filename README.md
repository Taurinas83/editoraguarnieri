# Editora Guarnieri: Site de Alta Conversão & Blog Dinâmico com CMS

Projeto editorial executivo desenvolvido para posicionamento premium e captação de autores C-Level, fundadores e conselheiros de empresas.

---

## 🏛️ 1. Sistema de Design & Branding
- **Fundo Principal:** Branco Off-White (`#FAF7F2`)
- **Cor de Destaque / Identidade:** Bordô Profundo (`#6B1F2E`)
- **Cor de Rodapé / Header:** Bordô Vinho (`#4A1520`)
- **Texto Principal:** Cinza Carvão (`#2B2424`)
- **Texto Secundário:** Cinza Quente (`#6B5E5E`)
- **Acento Metálico:** Ouro Envelhecido (`#B8935A`)
- **Fundo Secundário (Cards):** Creme Suave (`#F2ECE2`)
- **Borda Sutil / Hover:** Bordô Claro (`#8B3A47`)
- **Tipografia:** Sem serifa rigorosa (Montserrat para títulos com peso e sofisticação; Plus Jakarta Sans para leitura confortável de corpo).
- **Iconografia:** Flat, traço fino (1.25px / 1.5px), stroke-only, cores Bordô Profundo e Ouro Envelhecido, sem sombras.
- **Espaçamento:** Generoso (80px a 112px entre seções).

---

## 🧭 2. Arquitetura e Âncoras de Navegação (Smooth Scroll)
O menu sticky superior e mobile conecta diretamente às 9 âncoras obrigatórias:
1. `#inicio`: Seção Hero com selos de confiança, edição executiva e métricas.
2. `#problema`: Identificação e diagnóstico de por que grandes trajetórias ficam sem registro.
3. `#solucao`: Método em 3 fases (Você Fala, Nós Escrevemos, Seu Livro no Mundo) e 5 pilares estratégicos.
4. `#metodologia`: A jornada em 4 fases ao longo de 12 semanas.
5. `#produtos`: Audiolivro Studio Master e Aplicativo White-Label do Livro.
6. `#autores`: Portfólio de honra com as 8 capas reais de autores publicados.
7. `#depoimentos`: Prova social e chancela de mercado com depoimentos de C-Levels.
8. `#blog`: Destaques do blog dinâmico integrado ao CMS.
9. `#contato`: Formulário de captura validado com envio prioritário.

---

## 📝 3. Formulário de Captura & Validação
- **Campos:**
  - Nome Completo
  - E-mail Corporativo (validação via regex)
  - WhatsApp com DDD (máscara automática brasileira `(XX) XXXXX-XXXX` e validação de dígitos)
  - Área de Atuação (seleção executiva)
  - Possui material escrito? (estágio do manuscrito)
  - Formato de interesse (checkboxes obrigatórios)
  - Tema do Livro (textarea)
  - Campo invisível Honeypot anti-spam (`_gotcha`)
- **Validação no Front-end:**
  - Mensagens de erro em Cinza Quente (`#6B5E5E`) com borda em Bordô Claro (`#8B3A47`).
- **Envio:**
  - Configurado com envio assíncrono (AJAX/Fetch) para `editoraguarnieri@gmail.com`.
  - Feedback imediato de sucesso: *"Recebemos seus dados. Responderemos em até 24 horas úteis."*

---

## 📰 4. Blog Funcional com CMS Integrado
- **Arquivo de Dados Central:** `posts.json`
- **Motor JavaScript:** `js/blog-cms.js` com persistência em `localStorage` e suporte a API REST.
- **5 Categorias Funcionais:**
  1. *Mercado Editorial*
  2. *Autoridade e Liderança*
  3. *Bastidores da Escrita*
  4. *Direitos Autorais e Royalties*
  5. *Publicação Profissional*
- **Páginas do Blog:**
  - `blog.html`: Listagem dinâmica com busca instantânea, filtro por categorias e paginação.
  - `post.html?slug=...`: Leitor de post individual com breadcrumbs, autor, tempo de leitura, metatags Open Graph dinâmicas, Schema `BlogPosting`, botão de CTA para agendamento e artigos relacionados.
  - O conteúdo é gerenciado de forma limpa e direta através do arquivo `posts.json` estruturado.

---

## 🚀 5. Como Executar

### Opção A: Como Site Estático (Vercel, Netlify, GitHub Pages, Apache ou Hospedagem Compartilhada)
Basta abrir o arquivo `index.html` em qualquer navegador web ou fazer upload dos arquivos para a raiz do seu servidor de hospedagem. O formulário e o blog funcionam de forma 100% autônoma no front-end.

### Opção B: Com Servidor Node.js (Opcional)
```bash
npm install
npm start
```
O servidor estará rodando em `http://localhost:3000`.

### Executar Testes Automatizados
```bash
node test-validation.js
node test-form-submit.js
```
