import API from "./Api";

// Register
export const registerUser = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

// Login
export const loginUser = async (userData) => {
  const { data } = await API.post("/auth/login", userData);
  return data;
};

// Get Profile
export const getUserProfile = async () => {
  const { data } = await API.get("/auth/profile");
  return data;
};

// Update Profile
export const updateUserProfile = async (userData) => {
  const { data } = await API.put("/auth/profile", userData);
  return data;
};