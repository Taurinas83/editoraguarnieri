/**
 * Testes Automatizados de Validação do Site Editora Guarnieri
 * Verifica Design System, Âncoras, Formulário, CMS e Schemas JSON-LD
 */

const fs = require('fs');
const path = require('path');

let errors = 0;
let passed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    errors++;
  }
}

console.log('\n======================================================');
console.log('🔍 INICIANDO BATERIA DE TESTES - EDITORA GUARNIERI');
console.log('======================================================\n');

// 1. Teste de Arquivos Essenciais
console.log('📁 1. Verificação de Arquivos Entregáveis:');
const requiredFiles = [
  'index.html',
  'blog.html',
  'post.html',
  'posts.json',
  'js/blog-cms.js',
  'server.js'
];
requiredFiles.forEach(file => {
  assert(fs.existsSync(path.join(__dirname, file)), `Arquivo ${file} existe`);
});

// 2. Teste do posts.json e Categorias
console.log('\n📚 2. Verificação do Banco de Dados do Blog (posts.json):');
const postsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'posts.json'), 'utf8'));
assert(Array.isArray(postsData) && postsData.length >= 3, `Existem pelo menos 3 posts cadastrados (atual: ${postsData.length})`);

const expectedCategories = [
  "Mercado Editorial",
  "Autoridade e Liderança",
  "Bastidores da Escrita",
  "Direitos Autorais e Royalties",
  "Publicação Profissional"
];
const foundCategories = new Set(postsData.map(p => p.category));
expectedCategories.forEach(cat => {
  assert(foundCategories.has(cat), `Categoria '${cat}' está contemplada nos posts`);
});

postsData.forEach(p => {
  assert(p.title && p.slug && p.summary && p.content && p.image && p.author, `Post "${p.title.substring(0, 30)}..." possui todos os campos`);
});

// 3. Teste das Âncoras Obrigatórias no index.html
console.log('\n⚓ 3. Verificação das Âncoras Obrigatórias (#inicio, #problema, #solucao, #metodologia, #produtos, #autores, #depoimentos, #blog, #contato):');
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

const requiredAnchors = [
  '#inicio',
  '#problema',
  '#solucao',
  '#metodologia',
  '#produtos',
  '#autores',
  '#depoimentos',
  '#blog',
  '#contato'
];

requiredAnchors.forEach(anchor => {
  const id = anchor.replace('#', '');
  const idRegex = new RegExp(`id=["']${id}["']`);
  const linkRegex = new RegExp(`href=["']${anchor}["']`);
  assert(idRegex.test(indexHtml), `Seção com id="${id}" existe`);
  assert(linkRegex.test(indexHtml), `Link de navegação para href="${anchor}" existe`);
});

// 4. Teste do Sistema de Design e Paleta Rigorosa
console.log('\n🎨 4. Verificação de Cores e Tipografia Rigorosas:');
const requiredColors = [
  '#FAF7F2', // Branco Off-White
  '#6B1F2E', // Bordô Profundo
  '#4A1520', // Bordô Vinho
  '#2B2424', // Cinza Carvão
  '#6B5E5E', // Cinza Quente
  '#B8935A', // Ouro Envelhecido
  '#F2ECE2', // Creme Suave
  '#8B3A47'  // Bordô Claro
];
requiredColors.forEach(hex => {
  assert(indexHtml.includes(hex), `Cor ${hex} está presente no código de estilo`);
});

// 5. Teste do Formulário de Captura
console.log('\n📝 5. Verificação do Formulário de Captura & Validação:');
assert(indexHtml.includes('id="nome"') && indexHtml.includes('name="nome"'), 'Campo Nome Completo existe');
assert(indexHtml.includes('id="email"') && indexHtml.includes('name="email"'), 'Campo E-mail existe');
assert(indexHtml.includes('id="whatsapp"') && indexHtml.includes('name="whatsapp"'), 'Campo WhatsApp com máscara existe');
assert(indexHtml.includes('id="area_atuacao"') && indexHtml.includes('name="area_atuacao"'), 'Campo Área de Atuação existe');
assert(indexHtml.includes('id="material_escrito"') && indexHtml.includes('name="material_escrito"'), 'Campo Possui material escrito existe');
assert(indexHtml.includes('name="formato_interesse"'), 'Campos Checkbox de Formato de interesse existem');
assert(indexHtml.includes('id="tema"') && indexHtml.includes('name="tema"'), 'Campo Tema do Livro existe');
assert(indexHtml.includes('id="_gotcha"'), 'Campo Honeypot anti-spam existe');
assert(indexHtml.includes('editoraguarnieri@gmail.com'), 'Destino obrigatório editoraguarnieri@gmail.com configurado');
assert(indexHtml.includes('Recebemos seus dados. Responderemos em até 24 horas úteis.'), 'Mensagem de sucesso exata configurada');
assert(indexHtml.includes('border: 1px solid #8B3A47') && indexHtml.includes('color: #6B5E5E'), 'Estilos de mensagem de erro em Cinza Quente com borda Bordô Claro');

// 6. Teste de Schemas JSON-LD
console.log('\n🏷️ 6. Verificação dos Schemas Schema.org JSON-LD:');
const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert(jsonLdMatch !== null, 'Tag de script application/ld+json encontrada no index.html');

if (jsonLdMatch) {
  try {
    const parsedSchema = JSON.parse(jsonLdMatch[1]);
    assert(parsedSchema['@context'] === 'https://schema.org', 'Schema context é https://schema.org');
    const graph = parsedSchema['@graph'] || [parsedSchema];
    const types = graph.map(g => g['@type']);
    assert(types.includes('ProfessionalService'), 'Schema ProfessionalService presente');
    assert(types.includes('FAQPage'), 'Schema FAQPage presente');
    assert(types.includes('Book'), 'Schema Book presente');
    console.log(`    ℹ️ Schemas validados com sucesso no JSON-LD!`);
  } catch (e) {
    assert(false, `Falha ao interpretar JSON-LD: ${e.message}`);
  }
}

// 7. Teste de Conformidade de Chamadas nos Botões
console.log('\n📞 7. Verificação dos Canais de Contato e Telefones:');
assert(indexHtml.includes('+55 21 99820-0620') || indexHtml.includes('5521998200620'), 'Telefone Oficial 01 configurado');
assert(indexHtml.includes('+55 21 97081-5569') || indexHtml.includes('5521970815569'), 'Telefone Oficial 02 configurado');
assert(indexHtml.includes('instagram.com/editoraguarnieri'), 'Instagram Oficial configurado');

console.log('\n======================================================');
console.log(`📊 RESULTADO FINAL DOS TESTES: ${passed} PASSOU | ${errors} FALHOU`);
console.log('======================================================\n');

if (errors > 0) {
  process.exit(1);
} else {
  console.log('🎉 TODOS OS REQUISITOS FORAM CUMPRIDOS COM SUCESSO!\n');
}
