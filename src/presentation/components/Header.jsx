import { CartIcon, CloseIcon, MoonIcon, SunIcon } from './Icon';

export function Header({ categories, activeCategory, onCategoryChange, query, onQueryChange, cartQuantity, onOpenCart, isDark, onToggleTheme }) {
  return <header className="sticky top-0 z-30 bg-brand-900/95 text-white shadow-sm backdrop-blur-md">
    <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2"><img src="/logo.jpg" alt="Logo Sativa" className="h-10 w-10 rounded-full border-2 border-accent-500 object-cover" /><div><h1 className="font-brand truncate text-xl font-bold tracking-wide text-accent-500">Sativa Coffee Shop</h1><p className="text-[11px] text-brand-100/80">Catálogo digital</p></div></div>
        <div className="flex gap-2"><button onClick={onToggleTheme} aria-label="Alternar tema" className="icon-button">{isDark ? <SunIcon /> : <MoonIcon />}</button><button onClick={onOpenCart} aria-label="Abrir carrinho" className="icon-button relative"><CartIcon />{cartQuantity > 0 && <span className="absolute -right-1.5 -top-1.5 min-w-[18px] rounded-full bg-accent-500 px-1 text-[10px] font-bold">{cartQuantity}</span>}</button></div>
      </div>
      <div className="relative mt-3"><input value={query} onChange={(event) => onQueryChange(event.target.value)} type="search" placeholder="Buscar produto..." className="w-full rounded-full bg-brand-700/60 py-2 pl-4 pr-10 text-sm outline-none ring-accent-500 focus:ring-2" />{query && <button onClick={() => onQueryChange('')} aria-label="Limpar busca" className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-100"><CloseIcon /></button>}</div>
    </div>
    <nav className="border-t border-brand-700/60" aria-label="Categorias"><div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 md:px-8"><CategoryButton active={activeCategory === 'all'} onClick={() => onCategoryChange('all')}>Todos</CategoryButton>{categories.map((category) => <CategoryButton key={category.id} active={activeCategory === category.slug} onClick={() => onCategoryChange(category.slug)}>{category.name}</CategoryButton>)}</div></nav>
  </header>;
}

function CategoryButton({ active, children, onClick }) { return <button onClick={onClick} className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${active ? 'border-brand-500 bg-brand-500 text-white' : 'border-brand-600 text-brand-100 hover:bg-brand-700'}`}>{children}</button>; }
