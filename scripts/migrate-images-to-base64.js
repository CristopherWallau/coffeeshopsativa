import 'dotenv/config';
import { pool } from '../server/db.js';

const result = await pool.query('SELECT id, name, image_url FROM products WHERE image_base64 IS NULL AND image_url IS NOT NULL');
const toDirectDriveUrl = (url) => {
  let id = String(url || '').match(/\/file\/d\/([\w-]+)/)?.[1];
  if (!id) { try { id = new URL(url).searchParams.get('id'); } catch { /* URL externa sem alteracao. */ } }
  return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
};

const failures = [];
let migrated = 0;
for (const product of result.rows) {
  try {
    const response = await fetch(toDirectDriveUrl(product.image_url));
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.startsWith('image/')) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 4 * 1024 * 1024) throw new Error('Imagem maior que 4 MB');
    const base64 = `data:${contentType.split(';')[0]};base64,${buffer.toString('base64')}`;
    await pool.query('UPDATE products SET image_base64 = $1 WHERE id = $2', [base64, product.id]);
    migrated += 1;
  } catch (error) { failures.push({ name: product.name, reason: error.message }); }
}

console.log(`${migrated} imagem(ns) convertida(s) para Base64.`);
console.table(failures);
await pool.end();
