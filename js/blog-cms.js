/**
 * Editora Guarnieri - Sistema de CMS do Blog
 * Gerenciador reativo e dinâmico de artigos, categorias, paginação e persistência
 */

const STORAGE_KEY = 'guarnieri_blog_posts';

// Função para formatar data brasileira
function formatDateBR(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const dia = parseInt(parts[2], 10);
    const mesIdx = parseInt(parts[1], 10) - 1;
    const ano = parts[0];
    return `${dia} de ${meses[mesIdx] || ''}. de ${ano}`;
  }
  return dateString;
}

// Inicializador e repositório do CMS
const BlogCMS = {
  posts: [],
  categories: [
    "Todas",
    "Mercado Editorial",
    "Autoridade e Liderança",
    "Bastidores da Escrita",
    "Direitos Autorais e Royalties",
    "Publicação Profissional"
  ],

  async init() {
    // 1. Tenta carregar do localStorage primeiro (permite modificações imediatas no CMS admin)
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        this.posts = JSON.parse(localData);
        if (Array.isArray(this.posts) && this.posts.length > 0) {
          return this.posts;
        }
      } catch (e) {
        console.warn('Erro ao decodificar posts do localStorage:', e);
      }
    }

    // 2. Se não houver no localStorage, busca do arquivo posts.json ou backend
    try {
      const response = await fetch('posts.json');
      if (response.ok) {
        this.posts = await response.json();
        this.persist();
        return this.posts;
      }
    } catch (e) {
      console.warn('Não foi possível carregar posts.json via fetch, utilizando fallback embutido:', e);
    }

    // 3. Fallback embutido com os 5 artigos oficiais
    this.posts = [
      {
        id: "artigo-1",
        slug: "o-poder-do-livro-fisico-na-era-da-inteligencia-artificial",
        title: "O Poder do Livro Físico na Era da Inteligência Artificial",
        category: "Publicação Profissional",
        author: "Erika Guarnieri",
        authorRole: "Diretora Editorial",
        date: "2026-09-15",
        readTime: "5 min de leitura",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
        summary: "Em um mundo saturado de conteúdos instantâneos gerados por algoritmos, o livro impresso com chancela editorial tornou-se o mais supremo filtro de autoridade, permanência e credibilidade para conselheiros e líderes executivos.",
        content: "<p class=\"lead mb-6 text-lg text-warm-gray leading-relaxed font-medium\">Em um ecossistema digital saturado por conteúdos automatizados gerados em milissegundos por inteligências artificiais generativas, o mercado corporativo começou a aplicar um filtro rigoroso e implacável: <strong>o que realmente custou tempo, intelecto profundo e refinamento para ser concebido?</strong></p><p class=\"mb-6 text-charcoal-ink leading-relaxed\">O livro físico não concorre com publicações rápidas de redes sociais, carrosséis ou newsletters descartáveis; ele habita outra esfera de relevância. Trata-se de um artefato tátil, com espessura, peso, textura e permanência. Quando um conselheiro, investidor ou cliente de alto valor recebe em sua mesa uma obra de capa dura com o seu nome gravado em tipografia nobre, a percepção de prestígio e autoridade atinge o padrão mais elevado instantaneamente.</p><h3 class=\"text-2xl font-bold text-bordeaux-wine mt-8 mb-4\">A Tangibilidade Como Filtro de Excelência</h3><p class=\"mb-6 text-charcoal-ink leading-relaxed\">Textos virtuais são facilmente esquecidos na linha do tempo. Por outro lado, um livro de alta densidade editorial permanece na estante, na mesa de centro de salas executivas e nas bibliotecas pessoais dos tomadores de decisão por décadas.</p>"
      },
      {
        id: "artigo-2",
        slug: "bastidores-do-ghostwriting-como-manter-a-sua-voz-autentica",
        title: "Bastidores do Ghostwriting: Como Manter a Sua Voz Autêntica Sem Perder o Rigor Executivo",
        category: "Bastidores da Escrita",
        author: "Ateliê Guarnieri",
        authorRole: "Corpo de Ghostwriters Seniores",
        date: "2026-08-28",
        readTime: "6 min de leitura",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
        summary: "O maior receio de um C-Level ao contratar um ghostwriter é não se reconhecer nas páginas. Conheça a metodologia de entrevistas dialógicas que preserva cadência, humor e terminologia individual do líder.",
        content: "<p class=\"lead mb-6 text-lg text-warm-gray leading-relaxed font-medium\">O maior receio de um C-Level ao contratar um ghostwriter é receber um manuscrito padronizado, frio ou desprovido de sua personalidade oral. Na Editora Guarnieri, tratamos a voz autoral como uma impressão digital única e intransferível.</p><p class=\"mb-6 text-charcoal-ink leading-relaxed\">Nosso método não se baseia em questionários burocráticos ou transcrições robóticas. Ele parte de entrevistas dialógicas guiadas e gravadas, nas quais não registramos apenas fatos e métricas corporativas, mas a cadência rítmica e as nuances de raciocínio.</p>"
      },
      {
        id: "artigo-3",
        slug: "100-por-cento-direitos-royalties-mercado-editorial",
        title: "100% de Royalties e Direitos Autorais: Por Que Líderes Devem Evitar Editoras Tradicionais",
        category: "Direitos Autorais e Royalties",
        author: "Tiago Taurian",
        authorRole: "Conselheiro Editorial",
        date: "2026-08-10",
        readTime: "4 min de leitura",
        image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
        summary: "Entenda as armadilhas dos contratos convencionais que retêm 90% dos ganhos e prendem a propriedade intelectual do autor por anos, e por que o modelo de publicação independente de alto luxo é superior.",
        content: "<p class=\"lead mb-6 text-lg text-warm-gray leading-relaxed font-medium\">Nas editoras do modelo tradicional, o autor cede de 85% a 92% do faturamento da sua obra e ainda fica preso a cláusulas que o impedem de criar cursos ou licenciamentos sem autorização prévia.</p><p class=\"mb-6 text-charcoal-ink leading-relaxed\">Na Editora Guarnieri, operamos sob a premissa de que o livro é 100% seu. Você retém todos os direitos patrimoniais e 100% dos lucros da comercialização.</p>"
      }
    ];
    this.persist();
    return this.posts;
  },

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts));
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }
  },

  getAll() {
    return this.posts;
  },

  getByCategory(category) {
    if (!category || category === 'Todas') {
      return this.posts;
    }
    return this.posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  },

  getBySlug(slug) {
    return this.posts.find(p => p.slug === slug || p.id === slug);
  },

  getById(id) {
    return this.posts.find(p => p.id === id);
  },

  create(postData) {
    const slug = postData.slug || postData.title
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newPost = {
      id: 'artigo-' + Date.now(),
      slug: slug,
      title: postData.title,
      category: postData.category || "Publicação Profissional",
      author: postData.author || "Equipe Guarnieri",
      authorRole: postData.authorRole || "Corpo Editorial",
      date: postData.date || new Date().toISOString().split('T')[0],
      readTime: postData.readTime || "5 min de leitura",
      image: postData.image || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
      summary: postData.summary || "",
      content: postData.content || ""
    };

    this.posts.unshift(newPost);
    this.persist();
    return newPost;
  },

  update(id, updatedData) {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...updatedData };
      this.persist();
      return this.posts[index];
    }
    return null;
  },

  delete(id) {
    const index = this.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      const removed = this.posts.splice(index, 1);
      this.persist();
      return removed[0];
    }
    return null;
  },

  resetDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    return this.init();
  }
};

window.BlogCMS = BlogCMS;
window.formatDateBR = formatDateBR;
