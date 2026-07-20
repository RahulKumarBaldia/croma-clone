import API from "./Api";

// Cart dekho
export const getCart = async () => {
  const { data } = await API.get("/cart/get");
  return data;
};

// Cart mein add karo
export const addToCart = async (productId, quantity) => {
  const { data } = await API.post("/cart/add", { productId, quantity });
  return data;
};

// Quantity update karo
export const updateCartItem = async (productId, quantity) => {
  const { data } = await API.put(`/cart/update/${productId}`, { quantity });
  return data;
};

// Item remove karo
export const removeFromCart = async (productId) => {
  const { data } = await API.delete(`/cart/remove/${productId}`);
  return data;
};

// Cart clear karo
export const clearCart = async () => {
  const { data } = await API.delete("/cart/delete");
  return data;
};