import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pool } from '../server/db.js';

const sql = await readFile(new URL('../database/product-schema.sql', import.meta.url), 'utf8');
await pool.query(sql);
console.log('Estrutura de categorias e produtos atualizada com sucesso.');
await pool.end();
