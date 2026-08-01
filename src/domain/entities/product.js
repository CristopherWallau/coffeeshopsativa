import { normalizeForSearch } from '../../shared/lib/formatters';

export const isProductVisible = (product, categorySlug, categories, searchQuery) => {
  const category = categories.find(({ id }) => id === product.categoryId);
  return product.isActive
    && (categorySlug === 'all' || category?.slug === categorySlug)
    && (!searchQuery || normalizeForSearch(product.name).includes(normalizeForSearch(searchQuery)));
};
