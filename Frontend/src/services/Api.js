import axios from "axios";

const API = axios.create({
  baseURL: "https://croma-backend-g2o0.onrender.com/api",
});

// Har request mein token automatically lagao
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;