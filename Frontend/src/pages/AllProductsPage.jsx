import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FeaturedCard, DealCard, SkeletonCard } from "../components/ProductCard";
import { getProducts } from "../services/Productservice";

const CATEGORY_CONFIG = {
  headphones:  { label: "Headphones",      api: "Headphones",       backPath: "/headphones",  color: "#00e5ff" },
  tws:         { label: "TWS Earbuds",     api: "TWS Earbuds",      backPath: "/tws",         color: "#a855f7" },
  smartphones: { label: "Smartphones",     api: "Smartphones",      backPath: "/smartphones", color: "#22c55e" },
  laptops:     { label: "Laptops",         api: "Laptops",          backPath: "/laptops",     color: "#3b82f6" },
  appliances:  { label: "Home Appliances", api: "Home Appliances",  backPath: "/appliances",  color: "#f59e0b" },
  speakers:    { label: "Speakers",        api: "Speakers",         backPath: "/speakers",    color: "#ef4444" },
};

const SORT_OPTIONS = [
  { label: "Most Popular",      value: "popular"    },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated",         value: "rating"     },
  { label: "Best Discount",     value: "discount"   },
];

export default function AllProductsPage() {
  const { category, type } = useParams();
  const navigate = useNavigate();
  const config = CATEGORY_CONFIG[category];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [activeBrand, setActiveBrand] = useState("All");

  useEffect(() => {
    if (!config) { navigate("/"); return; }
    setLoading(true);
    setActiveBrand("All");
    setSearch("");
    getProducts(config.api)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [category, type]);

  if (!config) return null;

  const isDeals = type === "deals";
  const accentColor = isDeals ? "#f97316" : config.color;
  const typeLabel = isDeals ? "Best Deals & Offers" : "Featured Products";

  // Filter by type
  let filtered = isDeals
    ? products.filter(p => ((p.originalPrice - p.price) / p.originalPrice) * 100 >= 20)
    : products.filter(p => p.rating >= 4.5);

  // Augment with discount + id
  filtered = filtered.map(p => ({
    ...p,
    id: p._id,
    discount: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100),
  }));

  // Dynamic brands from filtered set
  const allBrands = ["All", ...new Set(filtered.map(p => p.brand))];

  // Brand filter
  if (activeBrand !== "All") filtered = filtered.filter(p => p.brand === activeBrand);

  // Search
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc")  return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating")     return b.rating - a.rating;
    if (sortBy === "discount")   return b.discount - a.discount;
    return b.numReviews - a.numReviews; // popular
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-10 pb-20">

      {/* ── Header ── */}
      <motion.div
        className="px-4 md:px-8 mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={() => navigate(config.backPath)}
          className="inline-flex items-center gap-2 mb-6 text-sm text-zinc-500 hover:text-white transition-colors group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-0.5 transition-transform">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to {config.label}
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[3px] mb-2" style={{ color: accentColor }}>
          {config.label}
        </p>
        <h1 className="font-['Syne'] text-4xl md:text-5xl font-black text-white mb-3">{typeLabel}</h1>
        <p className="text-zinc-500 text-sm">
          {loading ? "Loading products..." : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}
        </p>
        <div className="mt-5 mx-auto w-16 h-0.5 rounded-full" style={{ background: `linear-gradient(to right, ${accentColor}, #a855f7)` }} />
      </motion.div>

      {/* ── Controls ── */}
      <div className="px-4 md:px-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search in results..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Result count */}
          {!loading && (
            <p className="text-[13px] text-zinc-500 sm:ml-auto">
              Showing <span className="text-white font-semibold">{filtered.length}</span> results
            </p>
          )}
        </div>

        {/* Brand chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {allBrands.map(b => (
            <button
              key={b}
              onClick={() => setActiveBrand(b)}
              className={`h-9 px-4 rounded-full border text-[12px] font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5
                ${activeBrand === b
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="px-4 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-500">
            <p className="text-6xl mb-5">🔍</p>
            <p className="text-lg font-semibold text-zinc-300">No products found</p>
            <p className="text-sm mt-2">Try adjusting the brand filter or search term</p>
            <button
              onClick={() => { setActiveBrand("All"); setSearch(""); }}
              className="mt-6 h-10 px-6 rounded-full border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                {isDeals ? <DealCard p={p} /> : <FeaturedCard p={p} />}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
