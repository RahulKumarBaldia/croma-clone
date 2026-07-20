import { useState, useRef, useEffect, Children } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FeaturedCard, DealCard, SkeletonCard } from "../components/ProductCard";
import { getProducts } from "../services/Productservice";

const brands = ["All", "boAt", "Sony", "Apple", "JBL", "Noise", "Bose", "Sennheiser", "Skullcandy", "OnePlus"];

function HSlider({ children, title, subtitle, accentColor = "#00e5ff", loading, viewAllPath }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  return (
    <div className="mb-14">
      <div className="flex items-end justify-between mb-5 px-4 md:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[2.5px] mb-1" style={{ color: accentColor }}>{subtitle}</p>
          <h2 className="font-['Syne'] text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={() => scroll(1)} className="w-9 h-9 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button onClick={() => navigate(viewAllPath)} className="ml-1 text-[12px] font-semibold px-4 h-9 rounded-full border transition-all hover:-translate-y-0.5"
            style={{ borderColor: `${accentColor}40`, color: accentColor, background: `${accentColor}10` }}>
            View All →
          </button>
        </div>
      </div>
      <div className="relative overflow-y-visible">
        <div ref={ref} className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-4 pt-4" style={{ scrollbarWidth: "none" }}>
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : Children.map(children, (child, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                  {child}
                </motion.div>
              ))
          }
        </div>
        <div className="absolute right-0 top-0 bottom-2 w-16 pointer-events-none"
          style={{ background: "linear-gradient(to left, #0a0a0a, transparent)" }} />
      </div>
    </div>
  );
}

function FilterBar({ sortBy, onSort, minRating, onRating, priceRange, onPrice }) {
  return (
    <div className="px-4 md:px-8 mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <select value={sortBy} onChange={e => onSort(e.target.value)}
          className="h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 outline-none cursor-pointer">
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
        <div className="flex gap-2">
          {[{ label: "All Ratings", value: 0 }, { label: "3★+", value: 3 }, { label: "4★+", value: 4 }, { label: "4.5★+", value: 4.5 }].map(r => (
            <button key={r.value} onClick={() => onRating(r.value)}
              className={`h-10 px-4 rounded-xl border text-[12px] font-semibold transition-all
                ${minRating === r.value ? "bg-amber-400 text-black border-amber-400" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[12px] text-zinc-500">₹</span>
          <input type="number" value={priceRange[0]} onChange={e => onPrice([Number(e.target.value), priceRange[1]])}
            placeholder="Min" className="w-24 h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white outline-none focus:border-zinc-500" />
          <span className="text-zinc-600 text-sm">—</span>
          <input type="number" value={priceRange[1]} onChange={e => onPrice([priceRange[0], Number(e.target.value)])}
            placeholder="Max" className="w-28 h-10 px-3 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-white outline-none focus:border-zinc-500" />
        </div>
      </div>
    </div>
  );
}

function BrandsSection({ onBrandSelect, activeBrand }) {
  return (
    <div className="px-4 md:px-8 mb-14">
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-zinc-500 mb-1">Filter by</p>
        <h2 className="font-['Syne'] text-2xl font-bold text-white">Shop by Brand</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {brands.map((brand) => (
          <button key={brand} onClick={() => onBrandSelect(brand)}
            className={`h-10 px-5 rounded-full border text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5
              ${activeBrand === brand ? "bg-white text-black border-white" : "bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}>
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HeadphonesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBrand, setActiveBrand] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 200000]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts("Headphones");
        setProducts(data);
      } catch (err) {
        setError("Failed to load products!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Brand + rating + price filter
  let filteredProducts = products
    .filter(p => activeBrand === "All" || p.brand === activeBrand)
    .filter(p => p.rating >= minRating)
    .filter(p => p.price >= priceRange[0] && (priceRange[1] === 0 || p.price <= priceRange[1]));

  // Sort
  if (sortBy === "price_asc") filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  else if (sortBy === "price_desc") filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
  else if (sortBy === "rating") filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);

  // Featured — rating 4.5+
  const featuredProducts = filteredProducts.filter(p => p.rating >= 4.5);

  // Deals — discount 20%+
  const dealProducts = filteredProducts
    .filter(p => ((p.originalPrice - p.price) / p.originalPrice) * 100 >= 20)
    .map(p => ({ ...p, discount: Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-10 pb-20">
      <motion.div
        className="px-4 md:px-8 mb-12 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-3">Category</p>
        <h1 className="font-['Syne'] text-5xl font-black text-white mb-3">Headphones</h1>
        <p className="text-zinc-400 text-base max-w-md mx-auto">Explore top-quality headphones from leading brands</p>
        <div className="mt-6 mx-auto w-16 h-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" />
      </motion.div>

      {error && (
        <div className="text-center text-red-400 mb-8">{error}</div>
      )}

      <FilterBar sortBy={sortBy} onSort={setSortBy} minRating={minRating} onRating={setMinRating} priceRange={priceRange} onPrice={setPriceRange} />

      <HSlider title="Featured Headphones" subtitle="Top Picks" accentColor="#00e5ff" loading={loading} viewAllPath="/products/headphones/featured">
        {featuredProducts.map((p) => <FeaturedCard key={p._id} p={{ ...p, id: p._id }} />)}
      </HSlider>

      <HSlider title="Best Deals & Offers" subtitle="Limited Time" accentColor="#f97316" loading={loading} viewAllPath="/products/headphones/deals">
        {dealProducts.map((p) => <DealCard key={p._id} p={{ ...p, id: p._id }} />)}
      </HSlider>

      <BrandsSection onBrandSelect={setActiveBrand} activeBrand={activeBrand} />
    </div>
  );
}