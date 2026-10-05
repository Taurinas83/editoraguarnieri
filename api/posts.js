const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const postsPath = path.join(process.cwd(), 'posts.json');
    let posts = [];
    if (fs.existsSync(postsPath)) {
      posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    }

    const { category, search } = req.query || {};
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

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar artigos', details: error.message });
  }
};
