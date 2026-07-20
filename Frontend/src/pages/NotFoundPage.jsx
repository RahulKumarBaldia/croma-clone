import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] bg-[#0a0a0a] flex items-center justify-center px-4">

      {/* Dot grid background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Glow blob */}
      <div className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #00e5ff, transparent)", top: "20%", left: "30%" }} />

      <motion.div
        className="relative z-10 text-center max-w-lg"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* 404 number */}
        <motion.h1
          className="font-['Syne'] font-black text-[120px] leading-none"
          style={{
            backgroundImage: "linear-gradient(90deg, #fff 20%, #00e5ff 50%, #fff 80%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3.5s linear infinite",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          404
        </motion.h1>

        {/* Divider line */}
        <motion.div
          className="mx-auto mb-6 h-px w-24 rounded-full"
          style={{ background: "linear-gradient(to right, transparent, #00e5ff, transparent)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        />

        <motion.p
          className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Page Not Found
        </motion.p>

        <motion.h2
          className="font-['Syne'] text-2xl font-black text-white mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Looks like you're lost!
        </motion.h2>

        <motion.p
          className="text-zinc-400 text-sm mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="w-48 h-11 rounded-xl bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-colors"
            style={{ boxShadow: "0 0 24px rgba(0,229,255,0.35)" }}
          >
            Go Home →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="w-48 h-11 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 hover:text-white transition-colors"
          >
            ← Go Back
          </motion.button>
        </motion.div>

        {/* Quick category links */}
        <motion.div
          className="mt-12 pt-8 border-t border-zinc-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <p className="text-[11px] uppercase tracking-[2px] text-zinc-600 mb-4">Or browse categories</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { name: "Headphones", path: "/headphones" },
              { name: "TWS Earbuds", path: "/tws" },
              { name: "Laptops", path: "/laptops" },
              { name: "Smartphones", path: "/smartphones" },
              { name: "Speakers", path: "/speakers" },
            ].map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(cat.path)}
                className="h-8 px-4 rounded-full border border-zinc-700 text-zinc-400 text-xs font-semibold hover:border-cyan-400/50 hover:text-cyan-400 transition-all hover:-translate-y-0.5"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
