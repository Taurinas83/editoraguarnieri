const fs = require('fs');
const path = require('path');
const agendamentosHandler = require('./api/agendamentos');

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
console.log('🧪 TESTES AUTOMATIZADOS: AGENDADOR & MINI CRM');
console.log('======================================================\n');

// 1. Arquivos criados
console.log('📁 1. Arquivos do Sistema:');
assert(fs.existsSync(path.join(__dirname, 'agendar.html')), 'agendar.html existe');
assert(fs.existsSync(path.join(__dirname, 'crm.html')), 'crm.html existe');
assert(fs.existsSync(path.join(__dirname, 'api/agendamentos.js')), 'api/agendamentos.js existe');
assert(fs.existsSync(path.join(__dirname, 'agendamentos.json')), 'agendamentos.json existe');

// 2. Conteúdo de agendar.html
console.log('\n📅 2. Validação da Página de Agendamento (agendar.html):');
const agendarHtml = fs.readFileSync(path.join(__dirname, 'agendar.html'), 'utf8');
assert(agendarHtml.includes('tiago-taurian/calleditora30min'), 'Contém o calLink da agenda oficial (tiago-taurian/calleditora30min)');
assert(agendarHtml.includes('my-cal-inline-calleditora30min'), 'Contém o container do Cal embed inline');
assert(agendarHtml.includes('Google Meet'), 'Destaca a integração com o Google Meet');
assert(agendarHtml.includes('bookingSuccessful'), 'Possui interceptador de evento para alimentar o Mini CRM');
assert(agendarHtml.includes('/api/agendamentos'), 'Chama o endpoint /api/agendamentos ao agendar');

// 3. Conteúdo de crm.html
console.log('\n📊 3. Validação do Mini CRM (crm.html):');
const crmHtml = fs.readFileSync(path.join(__dirname, 'crm.html'), 'utf8');
assert(crmHtml.includes('Portal da Equipe'), 'Possui tela de autenticação da equipe');
assert(crmHtml.includes('guarnieri2026'), 'Possui referência da senha da equipe');
assert(crmHtml.includes('exportarCSV'), 'Possui função para exportar leads para CSV/Excel');
assert(crmHtml.includes('formatarLinkWhatsApp'), 'Possui atalho de WhatsApp com 1-clique');
assert(crmHtml.includes('Entrar Meet'), 'Possui botão direto para entrar na sala do Google Meet');
assert(crmHtml.includes('openModalNovoLead'), 'Possui modal de cadastro manual de agendamentos');

// 4. Teste de lógica do Handler api/agendamentos.js
console.log('\n⚙️ 4. Validação da API de Agendamentos (api/agendamentos.js):');

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    bodyData: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.bodyData = data; return this; },
    end(data) { if (data) this.bodyData = data; return this; }
  };
}

// 4.1 Teste de autenticação negada
(async () => {
  const reqUnauth = {
    method: 'GET',
    headers: {},
    query: {}
  };
  const resUnauth = mockRes();
  await agendamentosHandler(reqUnauth, resUnauth);
  assert(resUnauth.statusCode === 401, 'Bloqueia acesso sem a senha da equipe (401)');

  // 4.2 Teste com autenticação
  const reqAuth = {
    method: 'GET',
    headers: { 'x-crm-token': 'guarnieri2026' },
    query: {}
  };
  const resAuth = mockRes();
  await agendamentosHandler(reqAuth, resAuth);
  assert(resAuth.statusCode === 200 && Array.isArray(resAuth.bodyData), `Lista leads autorizados com sucesso (${resAuth.bodyData.length} leads)`);

  // 4.3 Teste de inserção de novo agendamento
  const reqPost = {
    method: 'POST',
    headers: {},
    query: {},
    body: {
      origem: 'Teste Unitário',
      nome: 'Executivo de Tecnologia Teste',
      email: 'executivo@tech.com',
      whatsapp: '+55 11 98888-2222',
      data_call: '2026-10-25',
      hora_call: '16:00',
      meet_link: 'https://meet.google.com/test-meet',
      tipo_call: 'Sessão Estratégica (30 min)',
      status: 'agendado',
      tema_livro: 'Inteligência Artificial Aplicada a Negócios'
    }
  };
  const resPost = mockRes();
  await agendamentosHandler(reqPost, resPost);
  assert(resPost.statusCode === 201 && resPost.bodyData.success === true, 'Cria novo agendamento com sucesso via POST');

  // 4.4 Teste de atualização de status
  const idCriado = resPost.bodyData.lead.id;
  const reqPut = {
    method: 'PUT',
    headers: { 'x-crm-token': 'guarnieri2026' },
    query: {},
    body: {
      id: idCriado,
      status: 'fechado',
      notas: 'Contrato fechado com sucesso!'
    }
  };
  const resPut = mockRes();
  await agendamentosHandler(reqPut, resPut);
  assert(resPut.statusCode === 200 && resPut.bodyData.lead.status === 'fechado', 'Atualiza status e anotações via PUT/PATCH');

  // 4.5 Teste de Horário Alternativo Solicitado
  const reqHorarioAlt = {
    method: 'POST',
    headers: {},
    query: {},
    body: {
      origem: 'Solicitação de Horário Alternativo',
      nome: 'Diretor Roberto Mendonça',
      email: 'roberto@mendonca.com',
      whatsapp: '+55 21 97777-6666',
      observacao_horario: 'Disponível apenas terças-feiras após as 18h30',
      tema_livro: 'Governança Corporativa'
    }
  };
  const resHorarioAlt = mockRes();
  await agendamentosHandler(reqHorarioAlt, resHorarioAlt);
  assert(resHorarioAlt.statusCode === 201 && 
         resHorarioAlt.bodyData.lead.status === 'horario_alternativo' && 
         resHorarioAlt.bodyData.lead.observacao_horario.includes('18h30'), 
         'Cria lead com status horario_alternativo e preserva observacao_horario');

  // 4.6 Teste de remoção
  const reqDel = {
    method: 'DELETE',
    headers: { 'x-crm-token': 'guarnieri2026' },
    query: { id: idCriado }
  };
  const resDel = mockRes();
  await agendamentosHandler(reqDel, resDel);
  assert(resDel.statusCode === 200, 'Exclui agendamento via DELETE com sucesso');

  console.log('\n======================================================');
  console.log(`🏁 RESULTADO: ${passed} passaram, ${errors} falhas.`);
  console.log('======================================================\n');
  process.exit(errors > 0 ? 1 : 0);
})();
