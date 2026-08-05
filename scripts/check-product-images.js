import 'dotenv/config';
import { pool } from '../server/db.js';

const result = await pool.query('SELECT name, image_url, image_base64 FROM products ORDER BY name');
const toDirectDriveUrl = (url) => {
  let id = String(url || '').match(/\/file\/d\/([\w-]+)/)?.[1];
  if (!id) { try { id = new URL(url).searchParams.get('id'); } catch { /* URL externa sem alteracao. */ } }
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
};

const failures = [];
for (const product of result.rows) {
  if (product.image_base64) continue;
  const url = toDirectDriveUrl(product.image_url);
  if (!url) { failures.push({ name: product.name, reason: 'Sem imagem' }); continue; }
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) failures.push({ name: product.name, reason: `HTTP ${response.status}` });
  } catch { failures.push({ name: product.name, reason: 'Falha de conexao' }); }
}

console.table(failures);
console.log(failures.length ? `${failures.length} imagem(ns) precisam de ajuste.` : 'Todas as imagens estao acessiveis.');
await pool.end();
