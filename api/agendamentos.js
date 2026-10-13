const fs = require('fs');
const path = require('path');

// Senha padrão de acesso da equipe ao CRM (pode ser sobrescrita via variável de ambiente CRM_PASSWORD)
const CRM_PASSWORD = process.env.CRM_PASSWORD || 'guarnieri2026';
const AGENDAMENTOS_FILE = path.join(__dirname, '..', 'agendamentos.json');

// Memória em cache para Vercel Serverless (caso filesystem seja temporário)
let memoryAgendamentos = null;

function loadAgendamentos() {
  if (memoryAgendamentos !== null) {
    return memoryAgendamentos;
  }
  try {
    if (fs.existsSync(AGENDAMENTOS_FILE)) {
      const data = fs.readFileSync(AGENDAMENTOS_FILE, 'utf8');
      memoryAgendamentos = JSON.parse(data);
      return memoryAgendamentos;
    }
  } catch (err) {
    console.error('Erro ao ler agendamentos.json:', err.message);
  }
  memoryAgendamentos = [];
  return memoryAgendamentos;
}

function saveAgendamentos(list) {
  memoryAgendamentos = list;
  try {
    fs.writeFileSync(AGENDAMENTOS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Aviso ao persistir agendamentos.json no disco (esperado em Vercel read-only):', err.message);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-crm-token');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const token = req.headers['x-crm-token'] || req.query.token;

  // 1. GET: Retornar lista de agendamentos
  if (req.method === 'GET') {
    // Verificação de autenticação para leitura de dados de leads no CRM
    if (token !== CRM_PASSWORD && req.query.action !== 'check-auth') {
      return res.status(401).json({ error: 'Acesso não autorizado. Informe a senha de equipe válida.' });
    }

    if (req.query.action === 'check-auth') {
      return res.status(token === CRM_PASSWORD ? 200 : 401).json({ 
        authenticated: token === CRM_PASSWORD 
      });
    }

    const agendamentos = loadAgendamentos();
    return res.status(200).json(agendamentos);
  }

  // 2. POST: Criar novo agendamento (vindo do embed do Cal.com, Webhook ou inserção manual no CRM)
  if (req.method === 'POST') {
    try {
      let body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body) body = {};

      const agendamentos = loadAgendamentos();

      // Tratamento especial para Webhook oficial do Cal.com
      if (body.triggerEvent && body.payload) {
        const p = body.payload;
        const novoWebhookLead = {
          id: 'cal-' + (p.uid || Date.now()),
          origem: 'Cal.com Webhook',
          data_criacao: new Date().toISOString(),
          nome: (p.attendees && p.attendees[0] && p.attendees[0].name) || p.name || 'Lead Cal.com',
          email: (p.attendees && p.attendees[0] && p.attendees[0].email) || p.email || '',
          whatsapp: p.responses?.phone || p.responses?.whatsapp || '',
          data_call: p.startTime ? p.startTime.split('T')[0] : '',
          hora_call: p.startTime ? p.startTime.split('T')[1].substring(0, 5) : '',
          meet_link: p.videoCallUrl || p.metadata?.videoCallUrl || 'https://meet.google.com/',
          tipo_call: p.title || 'Sessão Estratégica (30 min)',
          status: 'agendado',
          tema_livro: p.responses?.notes || p.description || '',
          notas: 'Agendado automaticamente via Cal.com Webhook.',
          cal_uid: p.uid || ''
        };

        // Evita duplicatas pelo uid
        const existe = agendamentos.findIndex(item => item.cal_uid === novoWebhookLead.cal_uid);
        if (existe >= 0) {
          agendamentos[existe] = { ...agendamentos[existe], ...novoWebhookLead };
        } else {
          agendamentos.unshift(novoWebhookLead);
        }

        saveAgendamentos(agendamentos);
        return res.status(200).json({ success: true, lead: novoWebhookLead });
      }

      // Recebimento padrão (via JavaScript listener do embed ou manual do CRM)
      const novoAgendamento = {
        id: body.id || 'lead-' + Date.now(),
        origem: body.origem || 'Cal.com Embed',
        data_criacao: new Date().toISOString(),
        nome: body.nome || 'Visitante',
        email: body.email || '',
        whatsapp: body.whatsapp || '',
        data_call: body.data_call || '',
        hora_call: body.hora_call || '',
        meet_link: body.meet_link || 'https://meet.google.com/',
        tipo_call: body.tipo_call || 'Sessão Estratégica Confidencial (30 min)',
        status: body.status || 'agendado',
        tema_livro: body.tema_livro || '',
        notas: body.notas || '',
        cal_uid: body.cal_uid || ''
      };

      agendamentos.unshift(novoAgendamento);
      saveAgendamentos(agendamentos);

      console.log('📅 Novo agendamento registrado:', novoAgendamento.nome, novoAgendamento.data_call, novoAgendamento.hora_call);

      return res.status(201).json({
        success: true,
        message: 'Agendamento registrado com sucesso no Mini CRM.',
        lead: novoAgendamento
      });
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao processar dados de agendamento: ' + err.message });
    }
  }

  // 3. PUT / PATCH: Atualizar status ou notas de um lead no CRM
  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (token !== CRM_PASSWORD) {
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, status, notas, tema_livro, whatsapp, email, data_call, hora_call } = body;

      if (!id) {
        return res.status(400).json({ error: 'ID do agendamento é obrigatório.' });
      }

      const agendamentos = loadAgendamentos();
      const index = agendamentos.findIndex(item => item.id === id);

      if (index === -1) {
        return res.status(404).json({ error: 'Agendamento não encontrado.' });
      }

      if (status !== undefined) agendamentos[index].status = status;
      if (notas !== undefined) agendamentos[index].notas = notas;
      if (tema_livro !== undefined) agendamentos[index].tema_livro = tema_livro;
      if (whatsapp !== undefined) agendamentos[index].whatsapp = whatsapp;
      if (email !== undefined) agendamentos[index].email = email;
      if (data_call !== undefined) agendamentos[index].data_call = data_call;
      if (hora_call !== undefined) agendamentos[index].hora_call = hora_call;
      agendamentos[index].ultima_atualizacao = new Date().toISOString();

      saveAgendamentos(agendamentos);

      return res.status(200).json({
        success: true,
        message: 'Lead atualizado com sucesso.',
        lead: agendamentos[index]
      });
    } catch (err) {
      return res.status(400).json({ error: 'Erro ao atualizar agendamento: ' + err.message });
    }
  }

  // 4. DELETE: Excluir/arquivar um lead do CRM
  if (req.method === 'DELETE') {
    if (token !== CRM_PASSWORD) {
      return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID do agendamento é obrigatório.' });
    }

    const agendamentos = loadAgendamentos();
    const filtrados = agendamentos.filter(item => item.id !== id);

    if (filtrados.length === agendamentos.length) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    saveAgendamentos(filtrados);
    return res.status(200).json({ success: true, message: 'Agendamento removido com sucesso.' });
  }

  return res.status(405).json({ error: 'Método não permitido.' });
};
