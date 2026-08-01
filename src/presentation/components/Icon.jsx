export function Icon({ children, className = 'w-5 h-5', fill = 'none' }) {
  return <svg className={className} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

export const CartIcon = ({ className }) => <Icon className={className}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></Icon>;
export const PlusIcon = () => <Icon className="w-4 h-4"><path d="M12 5v14M5 12h14" /></Icon>;
export const CloseIcon = () => <Icon><path d="m6 6 12 12M18 6 6 18" /></Icon>;
export const SunIcon = () => <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></Icon>;
export const MoonIcon = () => <Icon><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Icon>;
export const WhatsAppIcon = () => <span className="font-black text-lg" aria-hidden="true">◔</span>;
