module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Verificação de Honeypot anti-spam
    if (data && data._gotcha) {
      return res.status(200).json({ success: true, message: 'Processado com sucesso' });
    }

    console.log('📩 Lead recebido no Vercel para editoraguarnieri@gmail.com:', data);

    return res.status(200).json({
      success: true,
      message: 'Recebemos seus dados. Responderemos em até 24 horas úteis.',
      destinatario: 'editoraguarnieri@gmail.com'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no processamento', details: error.message });
  }
};
