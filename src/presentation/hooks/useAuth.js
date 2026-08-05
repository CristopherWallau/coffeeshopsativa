import { useEffect, useState } from 'react';

const tokenKey = 'sativa_auth_token';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  } catch {
    throw new Error('Nao foi possivel conectar ao servidor. Confirme que "npm run server" esta em execucao.');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Nao foi possivel concluir a operacao.');
  return payload;
}

export function useAuth() {
  const [state, setState] = useState({ status: 'loading', user: null });

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);
    if (!token) { setState({ status: 'anonymous', user: null }); return; }
    request('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(({ user }) => setState({ status: 'authenticated', user }))
      .catch(() => { localStorage.removeItem(tokenKey); setState({ status: 'anonymous', user: null }); });
  }, []);

  const login = async (email, password) => {
    const { token, user } = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem(tokenKey, token); setState({ status: 'authenticated', user }); return user;
  };
  const register = (fullName, email, password) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) });
  const createProduct = (product) => {
    const token = localStorage.getItem(tokenKey);
    return request('/api/products', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(product) });
  };
  const authorizedRequest = (path, options = {}) => request(path, { ...options, headers: { Authorization: `Bearer ${localStorage.getItem(tokenKey)}`, ...options.headers } });
  const loadAdminProducts = () => authorizedRequest('/api/admin/products').then(({ products }) => products);
  const updateProduct = (id, product) => authorizedRequest(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(product) });
  const logout = () => { localStorage.removeItem(tokenKey); setState({ status: 'anonymous', user: null }); };
  return { ...state, login, register, createProduct, loadAdminProducts, updateProduct, logout };
}
