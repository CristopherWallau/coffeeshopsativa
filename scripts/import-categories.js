import 'dotenv/config';
import { pool } from '../server/db.js';

const response = await fetch('https://sheetdb.io/api/v1/275gm74y55ago?sheet=Categorias');
if (!response.ok) throw new Error('Nao foi possivel carregar as categorias da planilha.');
const categories = await response.json();

for (const category of categories) {
  const id = String(category.id || '').trim();
  const slug = String(category.slug || '').trim();
  const name = String(category.name || '').trim();
  if (!id || !slug || !name) continue;
  await pool.query(
    `INSERT INTO categories (id, slug, name) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name`,
    [id, slug, name],
  );
}

console.log(`${categories.length} categorias importadas/atualizadas.`);
await pool.end();
