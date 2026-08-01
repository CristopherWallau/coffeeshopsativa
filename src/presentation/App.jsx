import { useEffect, useState } from 'react';
import { createWhatsAppOrder } from '../application/use-cases/createWhatsAppOrder';
import { storeInfo } from '../config/store';
import { formatCurrency } from '../shared/lib/formatters';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { CartIcon, WhatsAppIcon } from './components/Icon';
import { ProductGrid, SkeletonGrid } from './components/ProductGrid';
import { useCart } from './hooks/useCart';
import { useCatalog } from './hooks/useCatalog';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const catalog = useCatalog();
  const cart = useCart();
  const theme = useTheme();
  const [isCartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!toast) return undefined; const id = setTimeout(() => setToast(''), 1600); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { document.body.style.overflow = isCartOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isCartOpen]);

  const addProduct = (product) => { cart.add(product); setToast(`${product.name} adicionado!`); };
  const checkout = () => window.open(`https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(createWhatsAppOrder(cart.cart))}`, '_blank', 'noopener,noreferrer');
  const contactUrl = `https://wa.me/${storeInfo.whatsappNumber}?text=${encodeURIComponent(`Olá! Vim pelo catálogo digital da ${storeInfo.name} e gostaria de tirar uma dúvida.`)}`;

  return <div className="min-h-screen bg-brand-50 pb-24 text-brand-900 transition-colors dark:bg-brand-900 dark:text-brand-50">
    <Header categories={catalog.categories} activeCategory={catalog.activeCategory} onCategoryChange={catalog.setActiveCategory} query={catalog.searchQuery} onQueryChange={catalog.setSearchQuery} cartQuantity={cart.quantity} onOpenCart={() => setCartOpen(true)} isDark={theme.isDark} onToggleTheme={theme.toggle} />
    <main className="mx-auto max-w-7xl px-4 pt-4 md:px-8">{catalog.status === 'loading' && <SkeletonGrid />}{catalog.status === 'error' && <p className="py-24 text-center font-medium text-red-500">Não foi possível carregar o catálogo. Verifique sua conexão e tente novamente.</p>}{catalog.status === 'success' && <ProductGrid products={catalog.products} cart={cart.cart} onAdd={addProduct} searchQuery={catalog.searchQuery} />}</main>
    <Footer />
    <CartDrawer open={isCartOpen} cart={cart.cart} total={cart.total} onClose={() => setCartOpen(false)} onChangeQuantity={cart.changeQuantity} onRemove={cart.remove} onCheckout={checkout} />
    <a href={contactUrl} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp" className={`fixed right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-xl hover:bg-accent-600 ${cart.quantity ? 'bottom-24' : 'bottom-5'}`}><WhatsAppIcon /></a>
    {cart.quantity > 0 && <button onClick={() => setCartOpen(true)} className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 bg-brand-800 px-4 py-3.5 text-white shadow-lg"><span className="flex items-center gap-2 text-sm font-medium"><CartIcon />{cart.quantity === 1 ? '1 item' : `${cart.quantity} itens`}</span><span className="font-bold text-accent-500">Ver carrinho · {formatCurrency(cart.total)}</span></button>}
    <div className={`fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-brand-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all ${toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-5 opacity-0'}`}>{toast}</div>
  </div>;
}
