export const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL',
}).format(value);

export const normalizeForSearch = (text) => String(text || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
