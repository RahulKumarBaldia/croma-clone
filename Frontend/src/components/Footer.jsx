import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const footerLinks = {
  quickLinks: [
    { name: "Home", path: "/" },
    { name: "Headphones", path: "/headphones" },
    { name: "Deals", path: "/products/headphones/deals" },
    { name: "Cart", path: "/cart" },
    { name: "Wishlist", path: "/account" },
  ],
  categories: [
    { name: "Headphones", path: "/headphones" },
    { name: "TWS Earbuds", path: "/tws" },
    { name: "Smartphones", path: "/smartphones" },
    { name: "Laptops", path: "/laptops" },
    { name: "Home Appliances", path: "/appliances" },
    { name: "Speakers", path: "/speakers" },
  ],
  support: [
    { name: "Help Center", path: "/account" },
    { name: "Contact Us", path: "/account" },
    { name: "Return & Refund Policy", path: "/account" },
    { name: "Shipping Information", path: "/account" },
    { name: "FAQs", path: "/account" },
  ],
  account: [
    { name: "Login / Register", path: "/login" },
    { name: "My Orders", path: "/account" },
    { name: "My Profile", path: "/account" },
    { name: "Admin Dashboard", path: "/admin" },
  ],
};

// ─── SOCIAL ICONS ─────────────────────────────────────────────────────────────

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0a0a0a" />
    </svg>
  );
}

// ─── PAYMENT ICONS ────────────────────────────────────────────────────────────

function PaymentBadge({ label, color }) {
  return (
    <div className="flex items-center justify-center h-8 px-3 rounded-lg border border-zinc-700 bg-zinc-900 min-w-[56px]">
      <span className="text-[11px] font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── FOOTER LINK ──────────────────────────────────────────────────────────────

function FooterLink({ name, path }) {
  const navigate = useNavigate();
  return (
    <li>
      <button
        onClick={() => navigate(path)}
        className="text-zinc-400 text-sm text-left transition-all duration-200 hover:text-white hover:translate-x-1 inline-flex items-center gap-1 group"
      >
        <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-200 text-cyan-400 text-xs">›</span>
        {name}
      </button>
    </li>
  );
}

// ─── MAIN FOOTER ──────────────────────────────────────────────────────────────

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const socials = [
    { icon: <FacebookIcon />, color: "#1877f2", label: "Facebook" },
    { icon: <InstagramIcon />, color: "#e1306c", label: "Instagram" },
    { icon: <TwitterIcon />, color: "#ffffff", label: "Twitter" },
    { icon: <YouTubeIcon />, color: "#ff0000", label: "YouTube" },
  ];

  return (
    <footer className="relative bg-[#080808] border-t border-zinc-800 mt-0">

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold px-5 py-2 rounded-full transition-all hover:bg-zinc-700 hover:text-white hover:-translate-x-1/2 hover:-translate-y-0.5"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
        Back to Top
      </button>

      {/* Main Footer Grid */}
      <motion.div className="mx-auto max-w-7xl px-4 pt-16 pb-10" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">

          {/* Col 1 — Brand Info */}
          <div className="lg:col-span-1">
            <span
              onClick={() => navigate("/")}
              className="font-['Syne'] text-2xl font-black bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent cursor-pointer"
            >
              Croma
            </span>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-[200px]">
              Your one-stop destination for electronics and gadgets.
            </p>
            <p className="mt-3 text-[12px] text-zinc-600 leading-relaxed">
              📍 123, Tech Park, Sector 44,<br />Gurugram, Haryana - 122003
            </p>
            <p className="mt-2 text-[12px] text-zinc-600">📞 1800-572-2666</p>
            <p className="mt-1 text-[12px] text-zinc-600">✉️ support@croma.com</p>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <button
                  key={s.label}
                  title={s.label}
                  className="w-9 h-9 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500"
                  style={{ "--hover-color": s.color }}
                  onMouseEnter={(e) => e.currentTarget.style.color = s.color}
                  onMouseLeave={(e) => e.currentTarget.style.color = ""}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-[2px] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((l) => <FooterLink key={l.name} {...l} />)}
            </ul>
          </div>

          {/* Col 3 — Categories */}
          <div>
            <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-[2px] mb-5">
              Categories
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((l) => <FooterLink key={l.name} {...l} />)}
            </ul>
          </div>

          {/* Col 4 — Support */}
          <div>
            <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-[2px] mb-5">
              Customer Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((l) => <FooterLink key={l.name} {...l} />)}
            </ul>

            <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-[2px] mt-8 mb-5">
              Account
            </h3>
            <ul className="space-y-3">
              {footerLinks.account.map((l) => <FooterLink key={l.name} {...l} />)}
            </ul>
          </div>

          {/* Col 5 — Newsletter */}
          <div>
            <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-[2px] mb-2">
              Newsletter
            </h3>
            <p className="text-[13px] text-zinc-400 mb-4 leading-relaxed">
              Get updates on latest deals and offers
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="Enter your email"
                className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-400/50 focus:bg-zinc-800"
              />
              <button
                onClick={handleSubscribe}
                className={`h-10 w-full rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  subscribed
                    ? "bg-green-500 text-white"
                    : "bg-cyan-400 text-black hover:bg-cyan-300 hover:-translate-y-0.5"
                }`}
              >
                {subscribed ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> Subscribed!</>
                ) : (
                  "Subscribe →"
                )}
              </button>
            </div>

            {/* Payment Methods */}
            <div className="mt-8">
              <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-[2px] mb-4">
                Payment Methods
              </h3>
              <div className="flex flex-wrap gap-2">
                <PaymentBadge label="VISA" color="#1a73e8" />
                <PaymentBadge label="MC" color="#eb001b" />
                <PaymentBadge label="UPI" color="#5f259f" />
                <PaymentBadge label="PayPal" color="#003087" />
                <PaymentBadge label="NetBanking" color="#22c55e" />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-zinc-800" />

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-[13px] text-zinc-500">
            © 2026 Croma Clone. All rights reserved.
          </p>
          <p className="text-[13px] text-zinc-600">
            Designed with ❤️ by{" "}
            <span className="text-cyan-400 font-semibold">Rahul Baldia</span>
          </p>
          <div className="flex items-center gap-4">
            <button className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</button>
            <span className="text-zinc-700">·</span>
            <button className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Use</button>
            <span className="text-zinc-700">·</span>
            <button className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">Sitemap</button>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}