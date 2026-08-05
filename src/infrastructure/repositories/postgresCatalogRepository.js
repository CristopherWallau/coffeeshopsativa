const mapCategory = (row) => ({ id: row.id, slug: row.slug, name: row.name });
const parseDriveImageUrl = (rawUrl) => {
  const url = String(rawUrl || '').trim();
  let id = url.match(/\/file\/d\/([\w-]+)/)?.[1];
  if (!id) {
    try { id = new URL(url).searchParams.get('id'); } catch { /* Mantem a URL original. */ }
  }
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
};

const mapProduct = (row) => ({
  id: row.id,
  categoryId: row.categoryId,
  name: row.name,
  description: row.description || null,
  price: Number(row.price),
  imageUrl: row.imageBase64 || parseDriveImageUrl(row.imageUrl),
  isActive: row.isActive,
});

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

export const postgresCatalogRepository = {
  async getCatalog() {
    const response = await fetch(`${apiBaseUrl}/catalog`);
    if (!response.ok) throw new Error('Nao foi possivel carregar o catalogo.');
    const catalog = await response.json();
    return {
      categories: catalog.categories.map(mapCategory),
      products: catalog.products.map(mapProduct),
    };
  },
};
