import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeFromCart, clearCart } from "../services/Cartservice";
import { createOrder } from "../services/Orderservice";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/Paymentservice";
import { useCart } from "../context/Cartcontext";


const COUPONS = { "CROMA10": 10, "SAVE20": 20, "FIRST15": 15 };

function AddressModal({ onConfirm, onClose }) {
  const [form, setForm] = useState({ fullName: "", address: "", city: "", pincode: "", phone: "" });
  const [errors, setErrors] = useState({});

  const update = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = "Enter a valid 6-digit pincode";
    if (!/^\d{10}$/.test(form.phone)) errs.phone = "Enter a valid 10-digit number";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onConfirm(form);
  };

  const fields = [
    { key: "fullName", label: "Full Name", placeholder: "Rahul Kumar", col: 2 },
    { key: "address", label: "Address", placeholder: "123 MG Road, Apt 4B", col: 2 },
    { key: "city", label: "City", placeholder: "Delhi", col: 1 },
    { key: "pincode", label: "Pincode", placeholder: "110001", col: 1 },
    { key: "phone", label: "Phone Number", placeholder: "9876543210", col: 2 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-['Syne'] text-xl font-black text-white">Shipping Address</h2>
            <p className="text-[12px] text-zinc-500 mt-0.5">Where should we deliver your order?</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {fields.map(({ key, label, placeholder, col }) => (
            <div key={key} className={col === 2 ? "col-span-2" : "col-span-1"}>
              <label className="block text-[12px] font-semibold text-zinc-400 mb-1">{label}</label>
              <input value={form[key]} onChange={update(key)} placeholder={placeholder}
                className={`w-full h-10 rounded-xl border px-3 text-sm text-white placeholder-zinc-600 bg-zinc-900 outline-none transition-all
                  ${errors[key] ? "border-red-500/60 focus:border-red-500" : "border-zinc-700 focus:border-cyan-400/60"}`} />
              {errors[key] && <p className="text-[11px] text-red-400 mt-1">{errors[key]}</p>}
            </div>
          ))}
          <div className="col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-semibold hover:bg-zinc-800 hover:text-white transition-all">
              Cancel
            </button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="flex-1 h-11 rounded-xl bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-colors">
              Confirm & Place Order →
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function FreeShippingBar({ subtotal }) {
  const threshold = 50000;
  const progress = Math.min((subtotal / threshold) * 100, 100);
  const remaining = threshold - subtotal;
  return (
    <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="flex justify-between mb-2">
        <span className="text-[12px] text-zinc-400">
          {progress >= 100 ? "🎉 You get FREE delivery!" : `Add ₹${remaining.toLocaleString()} more for FREE delivery`}
        </span>
        <span className="text-[12px] text-green-400 font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-green-400"
          initial={{ width: 0 }} animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
    </div>
  );
}

function CartItem({ item, onQtyChange, onRemove }) {
  const product = item.product;
  const itemTotal = product.price * item.quantity;
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
      className="flex gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors">

      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <span className="text-4xl" style={{ display: product.images?.[0] ? "none" : "flex" }}>🛍️</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-semibold text-white leading-snug mb-1">{product.name}</p>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{product.category}</span>
          </div>
          <button onClick={() => onRemove(product._id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-white">₹{product.price.toLocaleString()}</span>
          <span className="text-[12px] text-zinc-600 line-through">₹{product.originalPrice.toLocaleString()}</span>
          <span className="text-[11px] text-green-400 font-semibold">{discount}% off</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button onClick={() => onQtyChange(product._id, item.quantity - 1)}
              className="w-8 h-8 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition-all disabled:opacity-40"
              disabled={item.quantity <= 1}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
            <button onClick={() => onQtyChange(product._id, item.quantity + 1)}
              className="w-8 h-8 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-white hover:bg-zinc-800 transition-all">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
          <span className="text-sm font-bold text-white">₹{itemTotal.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyCart() {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-8xl mb-6">🛒</div>
      <h2 className="font-['Syne'] text-3xl font-black text-white mb-3">Your cart is empty</h2>
      <p className="text-zinc-400 mb-8 max-w-sm">Start exploring our products!</p>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/")}
        className="bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl hover:bg-cyan-300 transition-colors">
        Start Shopping →
      </motion.button>
    </motion.div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(productId, quantity);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      fetchCart();
      fetchCartCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon({ code, discount: COUPONS[code] });
      setCouponSuccess(`${COUPONS[code]}% discount applied!`);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setCouponSuccess("");
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setShowAddressModal(true);
  };

 const handleConfirmOrder = async (shippingAddress) => {
  setShowAddressModal(false)
  try {
    setOrderLoading(true)

    // Step 1 — Backend se Razorpay order banao
    const { order } = await createRazorpayOrder(total)

    // Step 2 — Razorpay popup kholo
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "Croma Clone",
      description: "Order Payment",
      order_id: order.id,

      // Step 3 — Payment successful
      handler: async (response) => {
        const verified = await verifyRazorpayPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })

        if(verified.success) {
          // Order save karo
          const items = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images?.[0] || "",
            price: item.product.price,
            quantity: item.quantity,
          }))

          await createOrder({
            items,
            shippingAddress,
            paymentMethod: "Razorpay",
            itemsPrice: subtotal,
            discountPrice: couponDiscount,
            deliveryPrice: delivery,
            totalPrice: total,
          })

          await clearCart()
          fetchCartCount()
          setOrderSuccess(true)
          setTimeout(() => navigate("/"), 2500)
        }
      },
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
      },
      theme: { color: "#22d3ee" }  // cyan color
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()

  } catch (err) {
    console.error(err)
  } finally {
    setOrderLoading(false)
  }
}

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const originalTotal = items.reduce((sum, i) => sum + i.product.originalPrice * i.quantity, 0);
  const itemDiscount = originalTotal - subtotal;
  const couponDiscount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount / 100) : 0;
  const delivery = subtotal >= 50000 ? 0 : 99;
  const total = subtotal - couponDiscount + delivery;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400 text-lg">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-8 pb-20">
      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            onConfirm={handleConfirmOrder}
            onClose={() => setShowAddressModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500 text-white shadow-2xl shadow-green-500/30"
          >
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">Order Placed Successfully!</p>
              <p className="text-[12px] text-green-100">We'll deliver it to your address shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-2">Shopping</p>
          <h1 className="font-['Syne'] text-4xl font-black text-white">
            Your Cart
            <span className="ml-3 text-lg font-semibold text-zinc-500">({items.length} items)</span>
          </h1>
        </motion.div>

        {items.length === 0 ? <EmptyCart /> : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left — Cart Items */}
            <div className="flex-1 space-y-4">
              <FreeShippingBar subtotal={subtotal} />
              <AnimatePresence>
                {items.map((item) => (
                  <CartItem key={item._id} item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove} />
                ))}
              </AnimatePresence>
            </div>

            {/* Right — Summary */}
            <div className="w-full lg:w-96 lg:sticky lg:top-24 h-fit space-y-4">

              {/* Coupon */}
              <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950">
                <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider mb-3">Apply Coupon</h3>
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    placeholder="Enter coupon code"
                    className="flex-1 h-10 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-400/50" />
                  <button onClick={handleApplyCoupon}
                    className="px-4 h-10 rounded-xl bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-colors">
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[12px] text-red-400 mt-2">{couponError}</p>}
                {couponSuccess && <p className="text-[12px] text-green-400 mt-2">✓ {couponSuccess}</p>}
                <p className="text-[11px] text-zinc-600 mt-2">Try: CROMA10, SAVE20, FIRST15</p>
              </div>

              {/* Price Summary */}
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
                <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider mb-4">Price Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Price ({items.length} items)</span>
                    <span className="text-white">₹{originalTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>− ₹{itemDiscount.toLocaleString()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>− ₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? "text-green-400" : "text-white"}>
                      {delivery === 0 ? "FREE" : `₹${delivery}`}
                    </span>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 flex justify-between">
                    <span className="font-bold text-white text-base">Total</span>
                    <span className="font-black text-white text-lg">₹{total.toLocaleString()}</span>
                  </div>
                  {(itemDiscount + couponDiscount) > 0 && (
                    <p className="text-[12px] text-green-400 font-semibold bg-green-400/10 rounded-lg px-3 py-2 text-center">
                      🎉 You save ₹{(itemDiscount + couponDiscount).toLocaleString()}!
                    </p>
                  )}
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={orderLoading}
                  className="w-full mt-4 h-12 rounded-xl bg-cyan-400 text-black font-bold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {orderLoading
                    ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Placing Order...</>
                    : "Proceed to Checkout →"
                  }
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full mt-3 h-11 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 hover:text-white transition-colors">
                  ← Continue Shopping
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}