import API from "./Api";

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = (key) => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
  return null;
};

// Sab products
export const getProducts = async (category = "") => {
  const key = `products_${category}`;
  const cached = getCached(key);
  if (cached) return cached;
  const { data } = await API.get(`/products${category ? `?category=${category}` : ""}`);
  cache.set(key, { data, time: Date.now() });
  return data;
};

// Single product
export const getProductById = async (id) => {
  const key = `product_${id}`;
  const cached = getCached(key);
  if (cached) return cached;
  const { data } = await API.get(`/products/${id}`);
  cache.set(key, { data, time: Date.now() });
  return data;
};

// Review add karo
export const addReview = async (productId, reviewData) => {
  const { data } = await API.post(`/products/${productId}/reviews`, reviewData);
  return data;
};