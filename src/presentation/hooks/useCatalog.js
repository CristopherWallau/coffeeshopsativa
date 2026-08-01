import { useEffect, useMemo, useState } from 'react';
import { loadCatalog } from '../../application/use-cases/loadCatalog';
import { isProductVisible } from '../../domain/entities/product';
import { sheetDbCatalogRepository } from '../../infrastructure/repositories/sheetDbCatalogRepository';

export function useCatalog() {
  const [status, setStatus] = useState('loading');
  const [catalog, setCatalog] = useState({ categories: [], products: [] });
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCatalog(sheetDbCatalogRepository).then((data) => {
      setCatalog(data); setStatus('success');
    }).catch(() => setStatus('error'));
  }, []);

  const products = useMemo(() => catalog.products.filter((product) => isProductVisible(
    product, activeCategory, catalog.categories, searchQuery,
  )), [catalog, activeCategory, searchQuery]);

  return { ...catalog, products, status, activeCategory, setActiveCategory, searchQuery, setSearchQuery };
}
