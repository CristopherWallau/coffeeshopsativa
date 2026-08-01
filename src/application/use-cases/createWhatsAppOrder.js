import { formatCurrency } from '../../shared/lib/formatters';
import { cartTotal } from '../../domain/services/cartService';

export const createWhatsAppOrder = (cart) => {
  const lines = cart.map((item) => `${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}`);
  return `Olá! Gostaria de fazer o seguinte pedido:\n\n${lines.join('\n')}\n\nTotal: ${formatCurrency(cartTotal(cart))}`;
};
