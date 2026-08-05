import { useEffect, useState } from 'react';
import { formatCurrency } from '../../shared/lib/formatters';
import { MoonIcon, SunIcon } from './Icon';

const fallbackImage = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360"><rect width="300" height="360" fill="#e1ede5"/><path d="M58 238l58-58 44 42 35-30 50 46" fill="none" stroke="#759f84" stroke-width="8"/><circle cx="108" cy="115" r="22" fill="none" stroke="#759f84" stroke-width="8"/></svg>')}`;
const emptyForm = { name: '', description: '', categoryId: '', price: '', isActive: true };
const maxImagePayload = 5.5 * 1024 * 1024;

async function compressImage(file) {
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = reader.result; };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
  let scale = Math.min(1, 1600 / Math.max(source.width, source.height));
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
    for (let quality = 0.86; quality >= 0.5; quality -= 0.12) {
      const imageBase64 = canvas.toDataURL('image/jpeg', quality);
      if (imageBase64.length <= maxImagePayload) return imageBase64;
    }
    scale *= 0.72;
  }
  throw new Error('Nao foi possivel reduzir esta imagem. Escolha outra foto menor.');
}

export function AdminProductPage({ categories, isDark, onToggleTheme, user, onCreateProduct, onLoadProducts, onUpdateProduct, onLogout }) {
  const [form, setForm] = useState(emptyForm);
  const [imageBase64, setImageBase64] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState('');

  useEffect(() => {
    onLoadProducts?.().then(setProducts).catch((requestError) => setError(requestError.message));
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const preview = { name: form.name || 'Nome do produto', description: form.description || 'A descricao aparecera aqui.', price: Number(String(form.price).replace(',', '.')) || 0, imageUrl: imageBase64 || fallbackImage };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(''); setNotice('');
    try { setImageBase64(await compressImage(file)); } catch (uploadError) { setImageBase64(''); setError(uploadError.message); }
  };
  const startEditing = (id) => {
    const product = products.find((item) => item.id === id);
    setEditingProductId(id); setImageBase64(''); setNotice(''); setError('');
    if (!id) { setForm(emptyForm); return; }
    if (product) setForm({ name: product.name, description: product.description || '', categoryId: product.categoryId, price: String(product.price).replace('.', ','), isActive: product.isActive });
  };
  const submit = async (event) => {
    event.preventDefault(); setNotice(''); setError('');
    if (!editingProductId && !imageBase64) { setError('Selecione uma imagem para o produto.'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(String(form.price).replace(',', '.')), ...(imageBase64 ? { imageBase64 } : {}) };
      if (editingProductId) {
        await onUpdateProduct(editingProductId, payload);
        setProducts((current) => current.map((product) => product.id === editingProductId ? { ...product, ...form, price: payload.price } : product));
        setNotice('Produto atualizado com sucesso.');
      } else {
        await onCreateProduct(payload);
        setNotice('Produto salvo com sucesso.'); setForm(emptyForm);
      }
      setImageBase64('');
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const clear = () => { setForm(emptyForm); setImageBase64(''); setNotice(''); setError(''); setEditingProductId(''); };

  return <div className="min-h-screen bg-brand-50 text-brand-900 dark:bg-brand-900 dark:text-brand-50">
    <header className="border-b border-brand-700/70 bg-brand-900 text-white shadow-sm"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8"><div className="flex min-w-0 items-center gap-3"><img src="/logo.jpg" alt="Logo Sativa" className="h-11 w-11 rounded-full border-2 border-accent-500 object-cover" /><div><p className="font-brand text-xl font-bold text-accent-500">Sativa Coffee Shop</p><p className="text-xs text-brand-100/75">Painel administrativo{user?.fullName ? ` · ${user.fullName}` : ''}</p></div></div><div className="flex items-center gap-2"><a href="#" className="rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold hover:bg-brand-700">Ver catalogo</a>{onLogout && <button onClick={onLogout} className="rounded-full border border-brand-600 px-4 py-2 text-sm font-semibold hover:bg-brand-700">Sair</button>}<button onClick={onToggleTheme} aria-label="Alternar tema" className="icon-button">{isDark ? <SunIcon /> : <MoonIcon />}</button></div></div></header>
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12"><div className="mb-8"><span className="inline-flex rounded-full bg-accent-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-500">Area restrita</span><h1 className="mt-3 font-brand text-3xl font-bold md:text-4xl">Adicionar produto</h1><p className="mt-2 max-w-2xl text-brand-600 dark:text-brand-200">Cadastre as informacoes e confira a previa antes de salvar.</p></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"><form onSubmit={submit} className="rounded-[28px] border border-brand-100 bg-white p-5 shadow-sm dark:border-brand-700 dark:bg-brand-800 md:p-7"><div className="mb-6 rounded-2xl bg-brand-50 p-4 dark:bg-brand-900/50"><label className="block text-sm font-semibold">Editar produto existente</label><select value={editingProductId} onChange={(event) => startEditing(event.target.value)} className="field-input mt-2"><option value="">Novo produto</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select><p className="mt-2 text-xs text-brand-500 dark:text-brand-300">Selecione “Pega rato”, envie a nova imagem e salve para substituir somente a foto.</p></div><div className="grid gap-5 md:grid-cols-2">
        <Field label="Nome do produto" required className="md:col-span-2"><input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: Cafe gelado especial" className="field-input" /></Field>
        <Field label="Categoria" required><select required value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)} className="field-input"><option value="">Selecione uma categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{!categories.length && <p className="mt-1 text-xs text-brand-500">As categorias ainda estao carregando.</p>}</Field>
        <Field label="Preco (R$)" required><input required inputMode="decimal" value={form.price} onChange={(event) => update('price', event.target.value)} placeholder="12,50" className="field-input" /></Field>
        <Field label="Descricao" className="md:col-span-2"><textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Descreva ingredientes, sabor ou tamanho..." rows="4" className="field-input resize-y" /></Field>
        <div className="md:col-span-2"><label className="mb-2 block text-sm font-semibold">Imagem do produto</label><input type="file" accept="image/*" onChange={uploadImage} className="block w-full cursor-pointer rounded-xl border border-dashed border-brand-300 bg-brand-50 px-3 py-3 text-sm text-brand-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600 dark:border-brand-600 dark:bg-brand-900/40 dark:text-brand-200" /><p className="mt-2 text-xs text-brand-500 dark:text-brand-300">A imagem selecionada e convertida para Base64 no navegador.</p>{imageBase64 && <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-brand-100 px-3 py-2 text-xs font-medium text-brand-800 dark:bg-brand-700 dark:text-brand-50"><span>Imagem convertida para Base64 e pronta para salvar.</span><button type="button" onClick={() => setImageBase64('')} className="shrink-0 underline">Remover</button></div>}</div>
        <label className="md:col-span-2 flex cursor-pointer items-center justify-between rounded-2xl bg-brand-50 px-4 py-3 dark:bg-brand-900/50"><span><span className="block text-sm font-semibold">Produto ativo</span><span className="text-xs text-brand-500 dark:text-brand-300">Exibir produto no catalogo.</span></span><input checked={form.isActive} onChange={(event) => update('isActive', event.target.checked)} type="checkbox" className="h-5 w-5 accent-brand-700" /></label>
      </div>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}{notice && <p role="status" className="mt-5 rounded-xl bg-brand-100 px-4 py-3 text-sm font-medium text-brand-800 dark:bg-brand-700 dark:text-brand-50">{notice}</p>}<div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={clear} className="rounded-full px-5 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:text-brand-100 dark:hover:bg-brand-700">Limpar campos</button><button disabled={isSaving} type="submit" className="rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-accent-600 disabled:cursor-wait disabled:opacity-70">{isSaving ? 'Salvando...' : editingProductId ? 'Atualizar produto' : 'Salvar produto'}</button></div></form>
        <aside className="lg:sticky lg:top-6"><p className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-500 dark:text-brand-300">Previa no catalogo</p><article className="overflow-hidden rounded-[24px] border border-brand-100 bg-white shadow-sm dark:border-brand-700 dark:bg-brand-800"><div className="aspect-[4/5] bg-brand-100 dark:bg-brand-700"><img src={preview.imageUrl} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }} alt="Previa do produto" className="h-full w-full object-cover" /></div><div className="min-h-32 p-4"><h2 className="text-base font-semibold leading-tight">{preview.name}</h2><p className="mt-1 line-clamp-2 text-sm text-brand-500 dark:text-brand-300">{preview.description}</p><div className="mt-4 flex items-center justify-between"><span className="font-extrabold text-brand-700 dark:text-brand-100">{formatCurrency(preview.price)}</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-lg text-white">+</span></div></div></article></aside>
      </div></main>
  </div>;
}

function Field({ label, required, className = '', children }) { return <label className={className}><span className="mb-2 block text-sm font-semibold">{label}{required && <span className="ml-1 text-accent-500">*</span>}</span>{children}</label>; }
