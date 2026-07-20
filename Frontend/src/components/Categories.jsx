import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { icon: "🎧", name: "Headphones", accent: "#00e5ff", count: "120+ Products", path: "/headphones" },
  { icon: "🎵", name: "TWS Earbuds", accent: "#a855f7", count: "80+ Products", path: "/tws" },
  { icon: "💻", name: "Laptops", accent: "#3b82f6", count: "200+ Products", path: "/laptops" },
  { icon: "📱", name: "Smartphones", accent: "#22c55e", count: "150+ Products", path: "/smartphones" },
  { icon: "🏠", name: "Home Appliances", accent: "#f59e0b", count: "300+ Products", path: "/appliances" },
  { icon: "🔊", name: "Speakers", accent: "#ef4444", count: "90+ Products", path: "/speakers" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Categories() {
  return (
    <section className="bg-[#0a0a0a] px-4 py-16 border-b border-zinc-900">
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400">Browse</p>
        <h2 className="font-['Syne'] text-3xl font-bold text-white">Shop by Category</h2>
        <p className="mt-2 text-sm text-zinc-500">Explore our wide range of premium electronics</p>
      </motion.div>

      <motion.div
        className="mx-auto max-w-5xl grid grid-cols-3 gap-4 md:gap-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {categories.map((cat) => (
          <CategoryCard key={cat.name} cat={cat} />
        ))}
      </motion.div>
    </section>
  );
}

function CategoryCard({ cat }) {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={cardVariants}
      onClick={() => navigate(cat.path)}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${cat.accent}18, transparent 60%)` }} />
      <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${cat.accent}, 0 0 30px ${cat.accent}15` }} />

      <motion.div
        className="relative z-10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border bg-zinc-900 text-4xl"
        whileHover={{ scale: 1.12, rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
        style={{ borderColor: `${cat.accent}44` }}
      >
        {cat.icon}
      </motion.div>

      <p className="relative z-10 mb-1 text-base font-bold text-zinc-200 transition-colors group-hover:text-white">{cat.name}</p>
      <p className="relative z-10 text-[13px] text-zinc-500 transition-colors group-hover:text-zinc-400">{cat.count}</p>
      <p className="relative z-10 mt-2 text-[12px] font-semibold opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
        style={{ color: cat.accent }}>
        Explore →
      </p>
    </motion.div>
  );
}