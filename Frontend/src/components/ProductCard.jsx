import { useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { addToCart } from "../services/Cartservice";
import { useCart } from "../context/Cartcontext";
import { useWishlist } from "../context/WishlistContext";

const Stars = memo(function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
});

const SpecPill = memo(function SpecPill({ label }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
      {label}
    </span>
  );
});

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-72 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden animate-pulse">
      <div className="h-14" />
      <div className="h-60 bg-zinc-900 mx-3 rounded-xl" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-zinc-800 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-800 rounded-lg w-1/2" />
        <div className="h-5 bg-zinc-800 rounded-lg w-1/3" />
        <div className="h-10 bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
}

// ─── FEATURED CARD ────────────────────────────────────────────────────────────
export const FeaturedCard = memo(function FeaturedCard({ p }) {
  const navigate = useNavigate();
  const [cartAnim, setCartAnim] = useState(false);
  const [toast, setToast] = useState(null);
  const { fetchCartCount } = useCart();
  const { isWished, toggleWishlist } = useWishlist();
  const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  const productId = p.id || p._id;
  const wished = isWished(productId);

  const handleCardClick = useCallback((e) => {
    if (e.target.closest("button")) return;
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate, productId]);

  const showToast = useCallback((msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { showToast("Please login first! 🔒"); return; }
    try {
      await addToCart(productId, 1);
      setCartAnim(true);
      await fetchCartCount();
      setTimeout(() => setCartAnim(false), 1500);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-change"));
        showToast("Session expired! Please login again 🔒");
      } else {
        showToast("Failed to add to cart!");
      }
      console.error(err);
    }
  }, [productId, fetchCartCount, showToast]);

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="group relative flex-shrink-0 w-72 rounded-2xl border border-zinc-800 bg-zinc-950 cursor-pointer hover:border-zinc-600 hover:shadow-2xl transition-all duration-300 pb-2"
    >
      {/* ── Image area ── */}
      <div className="relative h-60 bg-white mx-3 mt-3 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 60%, ${p.badgeColor}20, transparent 65%)` }} />

        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.name}
            loading="lazy"
            className="relative z-10 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=Product"; }} />
        ) : (
          <span className="relative z-10 text-7xl transition-transform duration-300 group-hover:scale-105">🛍️</span>
        )}

        {/* Badge */}
        {p.badge && (
          <div className="absolute top-3 left-3 z-20">
            <span className="text-[11px] font-black px-2.5 py-1 rounded-full shadow-md"
              style={{ background: p.badgeColor || "#00bcd4", color: "#fff" }}>
              {p.badge}
            </span>
          </div>
        )}

        {/* Low stock warning */}
        {p.stock > 0 && p.stock <= 5 && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
              Only {p.stock} left!
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {p.stock === 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-xl">
            <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-zinc-900/90 text-zinc-300 border border-zinc-700">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Heart button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "#a1a1aa"} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* ── Toast ── */}
      {toast && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-xl
          ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Info ── */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[15px] font-semibold text-white leading-snug mb-2.5 line-clamp-2 min-h-[46px]">{p.name}</p>

        <div className="flex flex-wrap gap-1 mb-3 h-[28px] overflow-hidden">
          {(p.specs || []).slice(0, 3).map((s) => <SpecPill key={s} label={s} />)}
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={p.rating} />
          <span className="text-[12px] text-zinc-500">({p.numReviews?.toLocaleString()})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-white">₹{p.price?.toLocaleString()}</span>
          <span className="text-[13px] text-zinc-600 line-through">₹{p.originalPrice?.toLocaleString()}</span>
          <span className="text-[12px] text-green-400 font-bold">{discount}% off</span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={p.stock === 0}
          className={`w-full h-11 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2
            ${p.stock === 0
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              : cartAnim
                ? "bg-green-500 text-white"
                : "bg-zinc-900 border border-zinc-700 text-zinc-300 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 hover:text-white"
            }`}
        >
          {cartAnim
            ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> Added to Cart</>
            : p.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
});

// ─── DEAL CARD ────────────────────────────────────────────────────────────────
export const DealCard = memo(function DealCard({ p }) {
  const navigate = useNavigate();
  const [cartAnim, setCartAnim] = useState(false);
  const [toast, setToast] = useState(null);
  const { fetchCartCount } = useCart();
  const { isWished, toggleWishlist } = useWishlist();
  const productId = p.id || p._id;
  const wished = isWished(productId);

  const handleCardClick = useCallback((e) => {
    if (e.target.closest("button")) return;
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate, productId]);

  const showToast = useCallback((msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) { showToast("Please login first! 🔒"); return; }
    try {
      await addToCart(productId, 1);
      setCartAnim(true);
      await fetchCartCount();
      setTimeout(() => setCartAnim(false), 1500);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-change"));
        showToast("Session expired! Please login again 🔒");
      } else {
        showToast("Failed to add to cart!");
      }
      console.error(err);
    }
  }, [productId, fetchCartCount, showToast]);

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      className="group relative flex-shrink-0 w-72 rounded-2xl border border-zinc-800 bg-[#0f0f0f] cursor-pointer hover:border-orange-500/40 hover:shadow-2xl transition-all duration-300 pb-2"
    >
      {/* ── Image area ── */}
      <div className="relative h-60 bg-white mx-3 mt-3 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "radial-gradient(circle at 50% 60%, rgba(249,115,22,0.14), transparent 65%)" }} />

        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.name}
            loading="lazy"
            className="relative z-10 w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=Product"; }} />
        ) : (
          <span className="relative z-10 text-7xl transition-transform duration-300 group-hover:scale-105">🛍️</span>
        )}

        {/* Discount badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="text-[12px] font-black px-3 py-1 rounded-full bg-orange-500 text-white shadow-md">
            {p.discount}% OFF
          </span>
        </div>

        {/* Low stock warning */}
        {p.stock > 0 && p.stock <= 5 && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
              Only {p.stock} left!
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {p.stock === 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-xl">
            <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-zinc-900/90 text-zinc-300 border border-zinc-700">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* ── Heart button ── */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      >
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "#a1a1aa"} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* ── Toast ── */}
      {toast && (
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-xl
          ${toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Info ── */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[15px] font-semibold text-white leading-snug mb-2.5 line-clamp-2 min-h-[46px]">{p.name}</p>

        <div className="flex flex-wrap gap-1 mb-3 h-[28px] overflow-hidden">
          {(p.specs || []).slice(0, 3).map((s) => <SpecPill key={s} label={s} />)}
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={p.rating} />
          <span className="text-[12px] text-zinc-500">({p.numReviews?.toLocaleString()})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl font-bold text-orange-400">₹{p.price?.toLocaleString()}</span>
          <span className="text-[13px] text-zinc-600 line-through">₹{p.originalPrice?.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="text-[13px] text-green-400 font-semibold">Save ₹{(p.originalPrice - p.price)?.toLocaleString()}</span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={p.stock === 0}
          className={`w-full h-11 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2
            ${p.stock === 0
              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
              : cartAnim
                ? "bg-green-500 text-white"
                : "bg-orange-500/10 border border-orange-500/30 text-orange-400 opacity-0 group-hover:opacity-100 hover:bg-orange-500 hover:text-white"
            }`}
        >
          {cartAnim
            ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> Added to Cart</>
            : p.stock === 0 ? "Out of Stock" : "Grab Deal →"}
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
});
