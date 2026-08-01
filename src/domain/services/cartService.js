export const addToCart = (cart, product) => {
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) return cart.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
  return [...cart, { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, quantity: 1 }];
};

export const changeCartQuantity = (cart, productId, amount) => cart
  .map((item) => item.productId === productId ? { ...item, quantity: item.quantity + amount } : item)
  .filter((item) => item.quantity > 0);

export const cartTotal = (cart) => cart.reduce((total, item) => total + item.price * item.quantity, 0);
export const cartQuantity = (cart) => cart.reduce((total, item) => total + item.quantity, 0);
