import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getProductById, getProducts, addReview } from "../services/Productservice";
import { addToCart } from "../services/Cartservice";
import { getMyOrders } from "../services/Orderservice";
import { useCart } from "../context/Cartcontext";
import { useWishlist } from "../context/WishlistContext";

const RV_KEY = "croma_recently_viewed";
const saveRecentlyViewed = (product) => {
  try {
    const prev = JSON.parse(localStorage.getItem(RV_KEY) || "[]");
    const slim = { _id: product._id, name: product.name, price: product.price, originalPrice: product.originalPrice, images: product.images, rating: product.rating, badge: product.badge, category: product.category };
    localStorage.setItem(RV_KEY, JSON.stringify([slim, ...prev.filter(p => p._id !== product._id)].slice(0, 8)));
  } catch {}
};
const loadRecentlyViewed = (excludeId) => {
  try { return JSON.parse(localStorage.getItem(RV_KEY) || "[]").filter(p => p._id !== excludeId); }
  catch { return []; }
};

function Stars({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function RatingBar({ label, value, total }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="flex items-center gap-3 text-[13px]">
      <span className="text-zinc-400 w-6">{label}★</span>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div className="h-full bg-amber-400 rounded-full"
          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
          transition={{ duration: 0.8 }} viewport={{ once: true }} />
      </div>
      <span className="text-zinc-500 w-8">{value}</span>
    </div>
  );
}

function RelatedCard({ p }) {
  const navigate = useNavigate();
  const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  return (
    <motion.div whileHover={{ y: -6 }}
      onClick={() => { navigate(`/product/${p._id}`); window.scrollTo(0,0); }}
      className="flex-shrink-0 w-52 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden cursor-pointer hover:border-zinc-700 transition-colors">
      <div className="h-36 flex items-center justify-center bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden">
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.name}
            className="w-full h-full object-contain p-3"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=Product"; }} />
        ) : (
          <span className="text-6xl">🛍️</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-semibold text-white leading-snug mb-1 line-clamp-2">{p.name}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-white">₹{p.price.toLocaleString()}</span>
          <span className="text-[11px] text-green-400">{discount}% off</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  const { isWished, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [cartAnim, setCartAnim] = useState(false);
  const [cartToast, setCartToast] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState("highlights");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setSelectedImg(0);
        saveRecentlyViewed(data);
        setRecentlyViewed(loadRecentlyViewed(id));
        const allProducts = await getProducts(data.category);
        setRelated(allProducts.filter(p => p._id !== id).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkVerifiedPurchase = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      if (!token || !product) return;
      try {
        const orders = await getMyOrders();
        const verified = orders.some(
          o => o.status === "Delivered" && o.items.some(item => item.product === product._id || item.product?._id === product._id)
        );
        setIsVerifiedBuyer(verified);
        if (userId) {
          setHasReviewed(product.reviews?.some(r => r.user === userId || r.user?._id === userId));
        }
      } catch {}
    };
    checkVerifiedPurchase();
  }, [product]);

  const showCartToast = (msg, type = "error") => {
    setCartToast({ msg, type });
    setTimeout(() => setCartToast(null), 2500);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showCartToast("Please login first! 🔒");
      return;
    }
    try {
      await addToCart(product._id, qty);
      setCartAnim(true);
      await fetchCartCount();
      setTimeout(() => setCartAnim(false), 1500);
    } catch (err) {
      showCartToast("Failed to add to cart!");
      console.error(err);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      setReviewLoading(true);
      await addReview(product._id, reviewForm);
      const updated = await getProductById(id);
      setProduct(updated);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-zinc-400 text-lg animate-pulse">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <div className="text-7xl mb-4">😕</div>
        <h2 className="font-['Syne'] text-3xl font-black text-white mb-3">Product not found</h2>
        <button onClick={() => navigate("/")} className="bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl">Go Home</button>
      </div>
    );
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const images = product.images?.length > 0 ? product.images : [""];

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 pb-24">
      <div className="max-w-7xl mx-auto px-4">

        {/* Toast */}
        <AnimatePresence>
          {cartToast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl
                ${cartToast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
              {cartToast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-zinc-500 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-cyan-400 transition-colors">Home</button>
          <span>/</span>
          <span className="text-zinc-300">{product.category}</span>
          <span>/</span>
          <span className="text-zinc-400 line-clamp-1">{product.name}</span>
        </div>

        {/* TOP SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* LEFT — Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Main Image */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 h-96 flex items-center justify-center cursor-zoom-in overflow-hidden mb-4 group"
              onClick={() => setZoomed(true)}>
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                  style={{ background: "#00e5ff20", color: "#00e5ff", border: "1px solid #00e5ff40" }}>
                  {product.badge}
                </span>
              </div>
              {product.stock <= 5 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                    Only {product.stock} left!
                  </span>
                </div>
              )}
              {images[selectedImg] ? (
                <motion.img
                  key={selectedImg}
                  src={images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=Product"; }}
                />
              ) : (
                <span className="text-9xl">🛍️</span>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {images.map((img, i) => (
                <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden transition-all
                    ${selectedImg === i ? "border-cyan-400 bg-zinc-900" : "border-zinc-800 bg-zinc-950"}`}>
                  {img ? (
                    <img src={img} alt={`${product.name} ${i+1}`}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=Product"; }} />
                  ) : (
                    <span className="text-2xl">🛍️</span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-2">{product.category}</p>
              <h1 className="font-['Syne'] text-2xl font-black text-white leading-snug mb-3">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5">
                  <Stars rating={product.rating} size={13} />
                  <span className="text-sm font-bold text-amber-400">{product.rating}</span>
                </div>
                <span className="text-[13px] text-zinc-400">{product.numReviews.toLocaleString()} ratings</span>
              </div>
            </div>

            {/* Price */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-['Syne'] text-3xl font-black text-white">₹{product.price.toLocaleString()}</span>
                <span className="text-base text-zinc-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                <span className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-lg">{discount}% OFF</span>
              </div>
              <p className="text-[13px] text-green-400">You save ₹{(product.originalPrice - product.price).toLocaleString()}</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-400" : "bg-red-400"}`} />
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            {/* Qty + Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-zinc-400 font-semibold">Qty:</span>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl p-1">
                  <button onClick={() => setQty(q => Math.max(1, q-1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 transition-all" disabled={qty <= 1}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q+1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-zinc-800 transition-all">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                    ${cartAnim ? "bg-green-500 text-white" : "bg-cyan-400 text-black hover:bg-cyan-300"}`}>
                  {cartAnim
                    ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> Added!</>
                    : "Add to Cart"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/cart")}
                  className="flex-1 h-12 rounded-xl font-bold text-sm bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 transition-all">
                  ⚡ Buy Now
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => toggleWishlist(product)}
                  className="w-12 h-12 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center hover:border-red-400 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24"
                    fill={isWished(product._id) ? "#ef4444" : "none"} stroke={isWished(product._id) ? "#ef4444" : "#71717a"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[{ icon: "🔒", label: "Secure Payment" }, { icon: "🔄", label: "Easy Returns" }, { icon: "🛡️", label: "1 Year Warranty" }].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-[11px] text-zinc-400 font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* TABS */}
        <div className="mb-12">
          <div className="flex gap-1 mb-6 bg-zinc-900 rounded-xl p-1 border border-zinc-800 w-fit">
            {["highlights", "specs", "description", "reviews"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all
                  ${activeTab === tab ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white"}`}>
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {activeTab === "highlights" && (
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950">
                  <h3 className="font-['Syne'] text-lg font-bold text-white mb-4">Key Highlights</h3>
                  <ul className="space-y-3">
                    {product.highlights?.map((h, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-3 text-[14px] text-zinc-300">
                        <span className="w-5 h-5 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {h}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {product.specs?.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/50"}>
                          <td className="px-5 py-3.5 text-[13px] font-semibold text-zinc-400 w-1/3">Spec {i+1}</td>
                          <td className="px-5 py-3.5 text-[13px] text-white">{spec}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "description" && (
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950">
                  <h3 className="font-['Syne'] text-lg font-bold text-white mb-4">About this product</h3>
                  <p className={`text-[14px] text-zinc-300 leading-relaxed ${!expanded ? "line-clamp-4" : ""}`}>
                    {product.description}
                  </p>
                  <button onClick={() => setExpanded(!expanded)} className="mt-3 text-[13px] text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    {expanded ? "Show less ↑" : "Read more ↓"}
                  </button>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950">
                    <div className="flex gap-8 items-center mb-6">
                      <div className="text-center">
                        <div className="font-['Syne'] text-5xl font-black text-white">{product.rating}</div>
                        <Stars rating={product.rating} size={16} />
                        <div className="text-[12px] text-zinc-500 mt-1">{product.numReviews} ratings</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <RatingBar label="5" value={Math.round(product.numReviews * 0.65)} total={product.numReviews} />
                        <RatingBar label="4" value={Math.round(product.numReviews * 0.20)} total={product.numReviews} />
                        <RatingBar label="3" value={Math.round(product.numReviews * 0.10)} total={product.numReviews} />
                        <RatingBar label="2" value={Math.round(product.numReviews * 0.03)} total={product.numReviews} />
                        <RatingBar label="1" value={Math.round(product.numReviews * 0.02)} total={product.numReviews} />
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                      {!localStorage.getItem("token") ? (
                        <p className="text-zinc-500 text-sm">Please <button onClick={() => navigate("/login")} className="text-cyan-400 underline">login</button> to write a review.</p>
                      ) : hasReviewed ? (
                        <p className="text-green-400 text-sm font-semibold">✓ You have already reviewed this product.</p>
                      ) : !isVerifiedBuyer ? (
                        <div className="flex items-center gap-2 p-3 rounded-xl border border-zinc-700 bg-zinc-900/50">
                          <span className="text-zinc-400 text-sm">Only verified buyers can review this product.</span>
                        </div>
                      ) : (
                        <form onSubmit={handleAddReview}>
                          <h4 className="font-semibold text-white mb-3">Write a Review</h4>
                          <div className="flex gap-2 mb-3">
                            {[1,2,3,4,5].map(r => (
                              <button key={r} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: r }))}
                                className={`text-2xl transition-all ${r <= reviewForm.rating ? "opacity-100" : "opacity-30"}`}>⭐</button>
                            ))}
                          </div>
                          <textarea value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                            placeholder="Write your review..."
                            className="w-full h-24 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-400/50 resize-none mb-3" />
                          <button type="submit" disabled={reviewLoading}
                            className="px-6 h-10 rounded-xl bg-cyan-400 text-black font-bold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-70">
                            {reviewLoading ? "Submitting..." : "Submit Review"}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {product.reviews?.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-sm font-bold text-cyan-400">
                            {r.name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-white">{r.name}</p>
                            {r.verifiedPurchase && (
                              <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">✓ Verified Purchase</span>
                            )}
                          </div>
                        </div>
                        <Stars rating={r.rating} size={12} />
                      </div>
                      <p className="text-[13px] text-zinc-300">{r.comment}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mb-12">
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-zinc-500 mb-1">History</p>
              <h2 className="font-['Syne'] text-2xl font-bold text-white">Recently Viewed</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {recentlyViewed.map((p) => <RelatedCard key={p._id} p={p} />)}
            </div>
          </div>
        )}

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mb-12">
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-cyan-400 mb-1">Discover</p>
              <h2 className="font-['Syne'] text-2xl font-bold text-white">You May Also Like</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {related.map((p) => <RelatedCard key={p._id} p={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-zoom-out p-8">
            <motion.img
              src={images[selectedImg]}
              alt={product.name}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-2xl max-h-[80vh] object-contain"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=Product"; }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}