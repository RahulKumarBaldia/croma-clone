import API from "./Api";

// ─── Products ─────────────────────────────────────────────────────────────────
export const adminGetAllProducts = async () => {
  const { data } = await API.get("/products");
  return data;
};

export const adminCreateProduct = async (productData) => {
  const { data } = await API.post("/products/create", productData);
  return data;
};

export const adminUpdateProduct = async (id, productData) => {
  const { data } = await API.put(`/products/update/${id}`, productData);
  return data;
};

export const adminDeleteProduct = async (id) => {
  const { data } = await API.delete(`/products/delete/${id}`);
  return data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const adminGetAllOrders = async () => {
  const { data } = await API.get("/orders");
  return data;
};

export const adminUpdateOrderStatus = async (id, status) => {
  const { data } = await API.put(`/orders/${id}/status`, { status });
  return data;
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const adminGetAllUsers = async () => {
  const { data } = await API.get("/auth/users");
  return data;
};

export const adminDeleteUser = async (id) => {
  const { data } = await API.delete(`/auth/users/${id}`);
  return data;
};
