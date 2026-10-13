/**
 * Editora Guarnieri - Servidor Web & API Nativo (Zero Dependências)
 * Roda diretamente com Node.js nativo (http, fs, path, url)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;
const POSTS_FILE = path.join(__dirname, 'posts.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getPosts() {
  try {
    if (fs.existsSync(POSTS_FILE)) {
      return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Erro ao ler posts.json:', err.message);
  }
  return [];
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: GET /api/posts
  if (pathname === '/api/posts' && req.method === 'GET') {
    const posts = getPosts();
    const { category, search } = parsedUrl.query;
    let result = posts;

    if (category && category !== 'Todas') {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.summary.toLowerCase().includes(q)
      );
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result));
    return;
  }

  // API: POST /api/contato
  if (pathname === '/api/contato' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const LEADS_FILE = path.join(__dirname, 'leads.json');
        let leads = [];
        try {
          if (fs.existsSync(LEADS_FILE)) {
            leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
          }
        } catch (e) { leads = []; }

        const novoLead = {
          id: 'lead-' + Date.now(),
          data_recebimento: new Date().toISOString(),
          ...data,
          destinatario: 'editoraguarnieri@gmail.com'
        };

        leads.unshift(novoLead);
        fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');

        console.log('\n======================================================');
        console.log('📩 NOVO LEAD RECEBIDO PARA: editoraguarnieri@gmail.com');
        console.log('======================================================');
        console.log(`👤 Nome:     ${novoLead.nome}`);
        console.log(`✉️  E-mail:   ${novoLead.email}`);
        console.log(`📱 WhatsApp: ${novoLead.whatsapp}`);
        console.log(`🏢 Área:     ${novoLead.area_atuacao}`);
        console.log(`📄 Material: ${novoLead.material_escrito}`);
        console.log(`📦 Formatos: ${novoLead.formatos_interesse}`);
        console.log(`📖 Tema:     ${novoLead.tema}`);
        console.log('💾 Gravado em leads.json com sucesso!');
        console.log('======================================================\n');

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          message: 'Recebemos seus dados. Responderemos em até 24 horas úteis.',
          destinatario: 'editoraguarnieri@gmail.com',
          leadId: novoLead.id
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Payload JSON inválido: ' + e.message }));
      }
    });
    return;
  }

  // API: /api/agendamentos (Mini CRM & Webhook Cal.com)
  if (pathname === '/api/agendamentos') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = body;
      }
      req.query = parsedUrl.query || {};
      res.status = function(code) {
        this.statusCode = code;
        return this;
      };
      res.json = function(data) {
        this.setHeader('Content-Type', 'application/json; charset=utf-8');
        this.end(JSON.stringify(data));
      };

      try {
        const agendamentosHandler = require('./api/agendamentos');
        agendamentosHandler(req, res);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Roteamento de Arquivos Estáticos & Páginas Limpas
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  } else if (pathname === '/agendar') {
    pathname = '/agendar.html';
  } else if (pathname === '/crm') {
    pathname = '/crm.html';
  } else if (pathname === '/blog') {
    pathname = '/blog.html';
  } else if (pathname === '/post') {
    pathname = '/post.html';
  }

  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  const rootDir = path.resolve(__dirname);
  const filePath = path.resolve(rootDir, '.' + safePath);

  // Segurança: previne directory traversal
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acesso proibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Não Encontrado</h1><p>O arquivo ${pathname} não existe.</p><a href="/">Voltar ao Início</a>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`[Editora Guarnieri] Servidor ativo em http://localhost:${portToTry}`);
    console.log(`Páginas disponíveis:`);
    console.log(` - Landing Page: http://localhost:${portToTry}/index.html`);
    console.log(` - Agendar Call: http://localhost:${portToTry}/agendar`);
    console.log(` - Mini CRM:     http://localhost:${portToTry}/crm`);
    console.log(` - Blog:         http://localhost:${portToTry}/blog.html`);
    console.log(` - Artigo:       http://localhost:${portToTry}/post.html`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = 8081;
    console.warn(`Porta ${PORT} ocupada, migrando para porta ${nextPort}...`);
    startServer(nextPort);
  } else {
    console.error('Erro no servidor:', err);
  }
});

startServer(PORT);
