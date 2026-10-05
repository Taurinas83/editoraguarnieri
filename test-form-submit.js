/**
 * Teste de validação funcional do formulário de captura
 */

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLead(lead) {
  const errors = [];

  if (!lead.nome || lead.nome.trim().length < 3) {
    errors.push('Nome inválido ou menor que 3 caracteres');
  }

  if (!regexEmail.test(lead.email || '')) {
    errors.push('E-mail com formato inválido');
  }

  const digits = (lead.whatsapp || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    errors.push('Telefone/WhatsApp brasileiro deve ter 10 ou 11 dígitos');
  }

  if (!lead.area_atuacao) {
    errors.push('Área de atuação é obrigatória');
  }

  if (!lead.material_escrito) {
    errors.push('Estágio do material escrito é obrigatório');
  }

  if (!lead.formatos_interesse || lead.formatos_interesse.length === 0) {
    errors.push('Ao menos um formato de interesse deve ser selecionado');
  }

  if (!lead.tema || lead.tema.trim().length < 5) {
    errors.push('Tema do livro deve ter pelo menos 5 caracteres');
  }

  if (lead._gotcha && lead._gotcha.trim() !== '') {
    errors.push('Bot detectado pelo campo honeypot');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

console.log('🧪 Testando validação de formulário...\n');

// Caso 1: Válido
const validLead = {
  nome: 'Dra. Helena Silveira',
  email: 'helena@consultoriaexecutiva.com.br',
  whatsapp: '(11) 98765-4321',
  area_atuacao: 'Liderança Executiva / C-Level',
  material_escrito: 'Rascunhos e tópicos estruturados',
  formatos_interesse: ['Livro Físico (Capa Dura / Luxo)', 'E-book Digital'],
  tema: 'Estratégias de Governança e Sucessão Familiar em Grupos Multinacionais',
  _gotcha: '',
  destino_obrigatorio: 'editoraguarnieri@gmail.com'
};

const res1 = validateLead(validLead);
console.log('Caso 1 (Lead Válido):', res1.valid ? '✅ SUCESSO' : '❌ ERRO', res1.errors);

// Caso 2: Inválido (sem telefone e email errado)
const invalidLead = {
  nome: 'Jo',
  email: 'email-errado',
  whatsapp: '123',
  area_atuacao: '',
  material_escrito: '',
  formatos_interesse: [],
  tema: '',
  _gotcha: ''
};

const res2 = validateLead(invalidLead);
console.log('Caso 2 (Campos Inválidos):', !res2.valid ? '✅ SUCESSO (Detectou erros corretamente)' : '❌ FALHOU', res2.errors);

// Caso 3: Honeypot detectado
const botLead = {
  ...validLead,
  _gotcha: 'sou_um_robo_spam'
};

const res3 = validateLead(botLead);
console.log('Caso 3 (Honeypot Bloqueado):', !res3.valid ? '✅ SUCESSO (Bot bloqueado)' : '❌ FALHOU', res3.errors);

if (res1.valid && !res2.valid && !res3.valid) {
  console.log('\n🎉 TODOS OS TESTES DO FORMULÁRIO PASSARAM!\n');
} else {
  process.exit(1);
}
