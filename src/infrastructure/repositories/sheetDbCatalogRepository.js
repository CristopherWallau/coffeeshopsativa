const API_BASE_URL = 'https://sheetdb.io/api/v1/275gm74y55ago';

const parsePrice = (rawPrice) => {
  if (typeof rawPrice === 'number') return rawPrice;
  const parsed = Number.parseFloat(String(rawPrice || '').trim().replace(',', '.'));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const parseBoolean = (value) => ['true', '1', 'sim', 'yes', 'verdadeiro', 'ativo'].includes(String(value).trim().toLowerCase());

const parseDriveImageUrl = (rawUrl) => {
  const url = String(rawUrl || '').trim();
  let id = url.match(/\/file\/d\/([\w-]+)/)?.[1];
  if (!id) {
    try { id = new URL(url).searchParams.get('id'); } catch (_) { /* mantém a URL original */ }
  }
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
};

const mapCategory = (row) => ({ id: row.id, slug: row.slug, name: row.name });
const mapProduct = (row) => ({
  id: row.id, categoryId: row.categoryid, name: row.name,
  description: String(row.description || '').trim() || null,
  price: parsePrice(row.price), imageUrl: parseDriveImageUrl(row.imageUrl),
  isActive: row.isActive == null || String(row.isActive).trim() === '' ? true : parseBoolean(row.isActive),
});

export const sheetDbCatalogRepository = {
  async getCatalog() {
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}?sheet=Categorias`), fetch(`${API_BASE_URL}?sheet=Catalogo`),
    ]);
    if (!categoriesResponse.ok || !productsResponse.ok) throw new Error('Não foi possível carregar o catálogo.');
    const [categories, products] = await Promise.all([categoriesResponse.json(), productsResponse.json()]);
    return { categories: categories.map(mapCategory), products: products.map(mapProduct) };
  },
};
