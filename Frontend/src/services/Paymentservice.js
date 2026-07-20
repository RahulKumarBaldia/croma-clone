import axios from "axios"

const API = "https://croma-backend-g2o0.onrender.com/api"

// Backend se order create karo
export const createRazorpayOrder = async (amount) => {
  const token = localStorage.getItem("token")
  const { data } = await axios.post(`${API}/payment/create-order`, 
    { amount },
    { headers: { Authorization: `Bearer ${token}` }}
  )
  return data
}

// Payment verify karo
export const verifyRazorpayPayment = async (paymentData) => {
  const token = localStorage.getItem("token")
  const { data } = await axios.post(`${API}/payment/verify-payment`,
    paymentData,
    { headers: { Authorization: `Bearer ${token}` }}
  )
  return data
}