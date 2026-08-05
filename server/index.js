import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || '3001');
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret === 'troque-esta-chave-por-uma-frase-longa-e-aleatoria') {
  throw new Error('Defina uma JWT_SECRET segura no arquivo .env antes de iniciar o servidor.');
}

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '8mb' }));

const publicUser = (user) => ({ id: user.id, fullName: user.full_name, email: user.email, role: user.role });
const issueToken = (user) => jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });

function authenticate(request, response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return response.status(401).json({ error: 'Autenticacao necessaria.' });
  try {
    request.auth = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return response.status(401).json({ error: 'Sessao invalida ou expirada.' });
  }
}

function requireAdmin(request, response, next) {
  if (request.auth.role !== 'admin') return response.status(403).json({ error: 'Acesso restrito a administradores.' });
  return next();
}

app.get('/api/health', async (_request, response) => {
  await pool.query('SELECT 1');
  response.json({ ok: true });
});

app.get('/api/catalog', async (_request, response, next) => {
  try {
    const [categoriesResult, productsResult] = await Promise.all([
      pool.query('SELECT id, slug, name FROM categories ORDER BY name'),
      pool.query(
        `SELECT id, category_id, name, description, price, image_url, image_base64, is_active
         FROM products
         ORDER BY created_at DESC`,
      ),
    ]);
    response.json({
      categories: categoriesResult.rows.map((category) => ({ id: category.id, slug: category.slug, name: category.name })),
      products: productsResult.rows.map((product) => ({
        id: product.id,
        categoryId: product.category_id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        imageUrl: product.image_url,
        imageBase64: product.image_base64,
        isActive: product.is_active,
      })),
    });
  } catch (error) { next(error); }
});

app.post('/api/auth/register', async (request, response, next) => {
  try {
    const fullName = String(request.body.fullName || '').trim();
    const email = String(request.body.email || '').trim().toLowerCase();
    const password = String(request.body.password || '');
    if (fullName.length < 2) return response.status(400).json({ error: 'Informe seu nome completo.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return response.status(400).json({ error: 'Informe um e-mail valido.' });
    if (password.length < 8) return response.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO app_users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, role',
      [fullName, email, passwordHash],
    );
    response.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return response.status(409).json({ error: 'Este e-mail ja esta cadastrado.' });
    return next(error);
  }
});

app.post('/api/auth/login', async (request, response, next) => {
  try {
    const email = String(request.body.email || '').trim().toLowerCase();
    const password = String(request.body.password || '');
    const result = await pool.query('SELECT id, full_name, email, password_hash, role FROM app_users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return response.status(401).json({ error: 'E-mail ou senha incorretos.' });
    response.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', authenticate, async (request, response, next) => {
  try {
    const result = await pool.query('SELECT id, full_name, email, role FROM app_users WHERE id = $1', [request.auth.sub]);
    const user = result.rows[0];
    if (!user) return response.status(401).json({ error: 'Usuario nao encontrado.' });
    return response.json({ user: publicUser(user) });
  } catch (error) { return next(error); }
});

app.post('/api/products', authenticate, requireAdmin, async (request, response, next) => {
  try {
    const name = String(request.body.name || '').trim();
    const categoryId = String(request.body.categoryId || '').trim();
    const description = String(request.body.description || '').trim() || null;
    const price = Number(request.body.price);
    const imageBase64 = String(request.body.imageBase64 || '').trim();
    const isActive = Boolean(request.body.isActive);
    if (!name) return response.status(400).json({ error: 'Informe o nome do produto.' });
    if (!categoryId) return response.status(400).json({ error: 'Selecione uma categoria.' });
    if (!Number.isFinite(price) || price < 0) return response.status(400).json({ error: 'Informe um preco valido.' });
    if (!/^data:image\/[a-zA-Z+.-]+;base64,/.test(imageBase64)) return response.status(400).json({ error: 'Envie uma imagem valida.' });
    if (Buffer.byteLength(imageBase64, 'utf8') > 6 * 1024 * 1024) return response.status(413).json({ error: 'A imagem e muito grande. Use um arquivo de ate 4 MB.' });

    const category = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (!category.rowCount) return response.status(400).json({ error: 'Categoria invalida.' });
    const id = randomUUID();
    const result = await pool.query(
      `INSERT INTO products (id, category_id, name, description, price, image_base64, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, category_id, name, description, price, image_base64, is_active, created_at`,
      [id, categoryId, name, description, price, imageBase64, isActive],
    );
    return response.status(201).json({ product: result.rows[0] });
  } catch (error) { return next(error); }
});

app.get('/api/admin/products', authenticate, requireAdmin, async (_request, response, next) => {
  try {
    const result = await pool.query(
      `SELECT id, category_id, name, description, price, image_url, is_active,
              image_base64 IS NOT NULL AS has_image_base64
       FROM products ORDER BY name`,
    );
    response.json({ products: result.rows.map((product) => ({
      id: product.id, categoryId: product.category_id, name: product.name,
      description: product.description, price: Number(product.price), imageUrl: product.image_url,
      isActive: product.is_active, hasImageBase64: product.has_image_base64,
    })) });
  } catch (error) { next(error); }
});

app.patch('/api/products/:id', authenticate, requireAdmin, async (request, response, next) => {
  try {
    const id = String(request.params.id || '').trim();
    const name = String(request.body.name || '').trim();
    const categoryId = String(request.body.categoryId || '').trim();
    const description = String(request.body.description || '').trim() || null;
    const price = Number(request.body.price);
    const isActive = Boolean(request.body.isActive);
    const imageBase64 = request.body.imageBase64 ? String(request.body.imageBase64).trim() : null;
    if (!name || !categoryId || !Number.isFinite(price) || price < 0) return response.status(400).json({ error: 'Preencha os dados obrigatorios corretamente.' });
    if (imageBase64 && (!/^data:image\/[a-zA-Z+.-]+;base64,/.test(imageBase64) || Buffer.byteLength(imageBase64, 'utf8') > 6 * 1024 * 1024)) return response.status(400).json({ error: 'A imagem enviada e invalida ou muito grande.' });
    const category = await pool.query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (!category.rowCount) return response.status(400).json({ error: 'Categoria invalida.' });
    const result = await pool.query(
      `UPDATE products
       SET category_id = $2, name = $3, description = $4, price = $5, is_active = $6,
           image_base64 = COALESCE($7, image_base64)
       WHERE id = $1
       RETURNING id, name`,
      [id, categoryId, name, description, price, isActive, imageBase64],
    );
    if (!result.rowCount) return response.status(404).json({ error: 'Produto nao encontrado.' });
    return response.json({ product: result.rows[0] });
  } catch (error) { return next(error); }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(port, () => console.log(`API de autenticacao em http://localhost:${port}`));
