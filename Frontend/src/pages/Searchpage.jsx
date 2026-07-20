import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FeaturedCard, SkeletonCard } from "../components/ProductCard";
import API from "../services/Api";

const CATEGORIES = ["All", "Headphones", "TWS Earbuds", "Smartphones", "Laptops", "Home Appliances", "Speakers"];

const SORT_OPTIONS = [
  { label: "Most Relevant",     value: "relevant"   },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Top Rated",         value: "rating"     },
  { label: "Most Popular",      value: "popular"    },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [inputVal, setInputVal]           = useState(q);
  const [activeCategory, setActiveCategory] = useState("All");
  const [minRating, setMinRating]         = useState(0);
  const [priceRange, setPriceRange]       = useState([0, 250000]);
  const [sortBy, setSortBy]               = useState("relevant");

  // Fetch whenever q changes
  useEffect(() => {
    setInputVal(q);
    setActiveCategory("All");
    setMinRating(0);
    setSortBy("relevant");
    if (!q.trim()) { setProducts([]); return; }
    setLoading(true);
    API.get(`/products?search=${encodeURIComponent(q)}`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  // Submit search
  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) setSearchParams({ q: inputVal.trim() });
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  let filtered = [...products];
  if (activeCategory !== "All") filtered = filtered.filter(p => p.category === activeCategory);
  filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
  if (minRating > 0) filtered = filtered.filter(p => p.rating >= minRating);

  // ── Sorting ────────────────────────────────────────────────────────────────
  filtered = filtered.sort((a, b) => {
    if (sortBy === "price_asc")  return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating")     return b.rating - a.rating;
    if (sortBy === "popular")    return b.numReviews - a.numReviews;
    return 0;
  });

  // Augment with id for FeaturedCard
  const cards = filtered.map(p => ({ ...p, id: p._id }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-10 pb-20">

      {/* ── Search bar ────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 mb-8 max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="relative mb-4">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Search products, brands and more..."
            className="w-full h-13 pl-12 pr-4 rounded-2xl border border-zinc-700 bg-zinc-900 text-white placeholder-zinc-500 outline-none focus:border-zinc-500 text-[15px] py-3"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 h-8 px-4 rounded-xl bg-cyan-400 text-black text-[13px] font-bold hover:bg-cyan-300 transition-colors">
            Search
          </button>
        </form>

        {q && !loading && (
          <p className="text-center text-zinc-500 text-sm">
            <span className="text-white font-semibold">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""} for <span className="text-white font-semibold">"{q}"</span>
          </p>
        )}
        {loading && <p className="text-center text-zinc-500 text-sm animate-pulse">Searching...</p>}
      </div>

      {/* ── Empty / Initial state ──────────────────────────────────────────── */}
      {!q.trim() ? (
        <div className="text-center py-24">
          <p className="text-7xl mb-5">🔍</p>
          <h2 className="font-['Syne'] text-3xl font-black text-white mb-3">Search Croma</h2>
          <p className="text-zinc-400 text-sm">Find headphones, laptops, phones, speakers & more</p>
        </div>
      ) : (
        <div className="px-4 md:px-8">

          {/* ── Filters ─────────────────────────────────────────────────────── */}
          <div className="mb-8 space-y-3">
            {/* Category chips */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`h-9 px-4 rounded-full border text-[12px] font-semibold whitespace-nowrap transition-all duration-200
                    ${activeCategory === cat
                      ? "bg-cyan-400 text-black border-cyan-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Controls row */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Rating filter */}
              <div className="flex gap-2">
                {[{ label: "All", value: 0 }, { label: "3★+", value: 3 }, { label: "4★+", value: 4 }, { label: "4.5★+", value: 4.5 }].map(r => (
                  <button key={r.value} onClick={() => setMinRating(r.value)}
                    className={`h-9 px-4 rounded-xl border text-[12px] font-semibold transition-all
                      ${minRating === r.value
                        ? "bg-amber-400 text-black border-amber-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}>
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Price range */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-zinc-500">Price ₹</span>
                <input type="number" value={priceRange[0]}
                  onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                  placeholder="Min"
                  className="w-24 h-9 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white outline-none focus:border-zinc-500" />
                <span className="text-zinc-600 text-sm">—</span>
                <input type="number" value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  placeholder="Max"
                  className="w-28 h-9 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white outline-none focus:border-zinc-500" />
              </div>

              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="h-9 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 outline-none cursor-pointer ml-auto">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── Results grid ────────────────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">😕</p>
              <p className="text-xl font-semibold text-zinc-300 mb-2">No results found</p>
              <p className="text-zinc-500 text-sm mb-6">Try different search terms or remove filters</p>
              <button
                onClick={() => { setActiveCategory("All"); setMinRating(0); setPriceRange([0, 250000]); }}
                className="h-10 px-6 rounded-full border border-zinc-700 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
            >
              {cards.map((p, i) => (
                <motion.div key={p._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                  <FeaturedCard p={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
