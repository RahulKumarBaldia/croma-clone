import API from "./Api";

// Order banao
export const createOrder = async (orderData) => {
  const { data } = await API.post("/orders", orderData);
  return data;
};

// Mere orders
export const getMyOrders = async () => {
  const { data } = await API.get("/orders/myorders");
  return data;
};

// Single order
export const getOrderById = async (id) => {
  const { data } = await API.get(`/orders/${id}`);
  return data;
};