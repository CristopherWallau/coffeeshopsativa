import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../server/db.js';

const [fullName, emailInput, password] = process.argv.slice(2);
const email = String(emailInput || '').trim().toLowerCase();
if (!fullName || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8) {
  console.error('Uso: npm run create-admin -- "Nome" email@exemplo.com senha-com-8-ou-mais-caracteres');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);
await pool.query(
  `INSERT INTO app_users (full_name, email, password_hash, role)
   VALUES ($1, $2, $3, 'admin')
   ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, role = 'admin'`,
  [fullName, email, passwordHash],
);
console.log(`Administrador ${email} criado/atualizado com sucesso.`);
await pool.end();
