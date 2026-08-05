import { useState } from 'react';

export function AuthPage({ mode, onLogin, onRegister, message = '' }) {
  const isRegister = mode === 'register';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (isRegister && password !== confirmPassword) { setError('As senhas nao coincidem.'); return; }
    setBusy(true);
    try {
      if (isRegister) { await onRegister(fullName, email, password); setSuccess('Conta criada. Agora entre com seu e-mail e senha.'); }
      else await onLogin(email, password);
    } catch (requestError) { setError(requestError.message); } finally { setBusy(false); }
  };

  return <main className="flex min-h-screen items-center justify-center bg-brand-50 p-4 dark:bg-brand-900"><section className="w-full max-w-md rounded-[28px] border border-brand-100 bg-white p-6 shadow-xl dark:border-brand-700 dark:bg-brand-800 sm:p-8"><a href="#" className="font-brand text-2xl font-bold text-accent-500">Sativa Coffee Shop</a><p className="mt-1 text-sm text-brand-500 dark:text-brand-300">Painel administrativo</p><h1 className="mt-7 font-brand text-3xl font-bold text-brand-900 dark:text-white">{isRegister ? 'Criar conta' : 'Entrar'}</h1><p className="mt-2 text-sm text-brand-600 dark:text-brand-200">{isRegister ? 'Crie seu acesso para acompanhar as novidades da loja.' : 'Entre com sua conta de administrador.'}</p>{message && <p className="mt-4 rounded-xl bg-accent-500/15 px-3 py-2 text-sm font-medium text-accent-600">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}{success && <p role="status" className="mt-4 rounded-xl bg-brand-100 px-3 py-2 text-sm font-medium text-brand-800">{success}</p>}
    <form onSubmit={submit} className="mt-6 space-y-4">{isRegister && <AuthField label="Nome completo"><input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="field-input" autoComplete="name" /></AuthField>}<AuthField label="E-mail"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-input" autoComplete="email" /></AuthField><AuthField label="Senha"><input required type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} className="field-input" autoComplete={isRegister ? 'new-password' : 'current-password'} />{isRegister && <span className="mt-1 block text-xs text-brand-500">Use pelo menos 8 caracteres.</span>}</AuthField>{isRegister && <AuthField label="Confirmar senha"><input required type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="field-input" autoComplete="new-password" /></AuthField>}<button disabled={busy} type="submit" className="w-full rounded-full bg-accent-500 px-5 py-3 font-bold text-white transition-colors hover:bg-accent-600 disabled:cursor-wait disabled:opacity-70">{busy ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar no painel'}</button></form>
    <p className="mt-6 text-center text-sm text-brand-600 dark:text-brand-200">{isRegister ? 'Ja tem uma conta?' : 'Ainda nao tem uma conta?'} <a href={isRegister ? '#login' : '#register'} className="font-bold text-brand-700 underline dark:text-brand-100">{isRegister ? 'Entrar' : 'Criar conta'}</a></p></section></main>;
}

function AuthField({ label, children }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-brand-800 dark:text-brand-100">{label}</span>{children}</label>; }
