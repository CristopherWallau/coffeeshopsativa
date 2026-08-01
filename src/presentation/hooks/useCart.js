import { useState } from 'react';
import { addToCart, cartQuantity, cartTotal, changeCartQuantity } from '../../domain/services/cartService';

export function useCart() {
  const [cart, setCart] = useState([]);
  const add = (product) => setCart((current) => addToCart(current, product));
  const changeQuantity = (productId, amount) => setCart((current) => changeCartQuantity(current, productId, amount));
  const remove = (productId) => setCart((current) => current.filter((item) => item.productId !== productId));
  return { cart, add, changeQuantity, remove, total: cartTotal(cart), quantity: cartQuantity(cart) };
}
