import { useEffect, useState } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);
  const toggle = () => setIsDark((value) => {
    const next = !value;
    try { localStorage.setItem('sativa-theme', next ? 'dark' : 'light'); } catch (_) {}
    return next;
  });
  return { isDark, toggle };
}
