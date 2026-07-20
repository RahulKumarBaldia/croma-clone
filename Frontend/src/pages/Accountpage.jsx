import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../services/Authservice";
import { getMyOrders } from "../services/Orderservice";
import { useWishlist } from "../context/WishlistContext";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, stroke = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  profile: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  orders: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
  wishlist: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  addresses: ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  settings: ["M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  help: ["M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", "M12 17h.01"],
  logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  edit: ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  plus: ["M12 5v14", "M5 12h14"],
  trash: ["M3 6h18", "M19 6l-1 14H6L5 6", "M10 11v6M14 11v6", "M9 6V4h6v2"],
  check: "M20 6L9 17l-5-5",
  eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  eyeOff: ["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M1 1l22 22"],
  package: ["M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", "M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"],
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.05 3.4 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z",
  mail: ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  info: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 8h.01M12 12v4"],
  arrow: "M15 18l-6-6 6-6",
};

const MENU = [
  { id: "profile", label: "Profile" },
  { id: "orders", label: "My Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "addresses", label: "Addresses" },
  { id: "settings", label: "Account Settings" },
  { id: "help", label: "Help & Support" },
];

const STATUS_CONFIG = {
  Delivered:  { color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/30",  dot: "bg-green-400" },
  Pending:    { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", dot: "bg-yellow-400" },
  Processing: { color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30",   dot: "bg-blue-400" },
  Shipped:    { color: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/30",   dot: "bg-cyan-400" },
  Cancelled:  { color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30",    dot: "bg-red-400" },
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-800/60 ${className}`} />;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl
            ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── PROFILE SECTION ──────────────────────────────────────────────────────────
function ProfileSection({ showToast }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserProfile();
        setUser(data);
        setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
      } catch { /* show cached */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateUserProfile({ name: form.name, email: form.email });
      localStorage.setItem("user", JSON.stringify({ ...updated }));
      window.dispatchEvent(new Event("auth-change"));
      setUser(updated);
      setEditing(false);
      showToast("Profile updated!", "success");
    } catch {
      showToast("Failed to update profile", "error");
    } finally { setSaving(false); }
  };

  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex items-center gap-5"><Skeleton className="w-20 h-20 rounded-full" /><div className="space-y-2"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-52" /></div></div>
      <Skeleton className="h-40 w-full" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Account</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">My Profile</h2>
      </div>

      {/* Avatar + summary */}
      <div className="flex items-center gap-5 p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-2xl font-black text-black flex-shrink-0 shadow-lg">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white truncate">{user?.name}</h3>
          <p className="text-sm text-zinc-400 truncate">{user?.email}</p>
          <p className="text-[11px] text-zinc-600 mt-1">Member since {new Date(user?.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 h-9 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 hover:text-white transition-all flex-shrink-0">
            <Icon d={icons.edit} size={14} /> Edit
          </button>
        )}
      </div>

      {/* Info / Edit form */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
        <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider">Personal Information</h3>
        {editing ? (
          <>
            {[
              { label: "Full Name", key: "name", placeholder: "Your name" },
              { label: "Email Address", key: "email", placeholder: "your@email.com" },
              { label: "Phone Number", key: "phone", placeholder: "9876543210" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[12px] font-semibold text-zinc-500 mb-1">{label}</label>
                <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full h-10 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-cyan-400/60 transition-all" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSave} disabled={saving}
                className="flex-1 h-10 rounded-xl bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-colors disabled:opacity-60">
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
              <button onClick={() => setEditing(false)}
                className="px-5 h-10 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-semibold hover:bg-zinc-800 hover:text-white transition-all">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: icons.profile, label: "Full Name", value: user?.name },
              { icon: icons.mail, label: "Email", value: user?.email },
              { icon: icons.phone, label: "Phone", value: user?.phone || "Not added" },
              { icon: icons.shield, label: "Account Type", value: user?.isAdmin ? "Admin" : "Customer" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-cyan-400"><Icon d={icon} size={16} /></span>
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-500">{label}</p>
                  <p className="text-[14px] text-white font-medium truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── ORDERS SECTION ───────────────────────────────────────────────────────────
function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      try { setOrders(await getMyOrders()); }
      catch { setOrders([]); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">History</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">My Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 text-zinc-700">
            <Icon d={icons.package} size={36} />
          </div>
          <h3 className="font-['Syne'] text-xl font-bold text-white mb-2">No orders yet</h3>
          <p className="text-zinc-500 text-sm">Your orders will appear here once you shop.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const isOpen = expanded === order._id;
            return (
              <div key={order._id} className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                {/* Order header */}
                <button onClick={() => setExpanded(isOpen ? null : order._id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-zinc-900/50 transition-colors text-left">
                  {/* First product image */}
                  <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {order.items[0]?.image ? (
                      <img src={order.items[0].image} alt={order.items[0].name} className="w-full h-full object-contain p-1" />
                    ) : <span className="text-2xl">🛍️</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      &nbsp;·&nbsp;₹{order.totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {order.status}
                    </span>
                    <span className={`text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-zinc-800">
                      <div className="p-4 space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" /> : <span>🛍️</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-white font-medium truncate">{item.name}</p>
                              <p className="text-[11px] text-zinc-500">Qty: {item.quantity} · ₹{item.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-zinc-800 pt-3 grid grid-cols-2 gap-2 text-[12px]">
                          <div><p className="text-zinc-500">Payment</p><p className="text-white font-medium">{order.paymentMethod}</p></div>
                          <div><p className="text-zinc-500">Total</p><p className="text-white font-bold">₹{order.totalPrice.toLocaleString()}</p></div>
                          <div><p className="text-zinc-500">Deliver to</p><p className="text-white font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.pincode}</p></div>
                          <div><p className="text-zinc-500">Order ID</p><p className="text-zinc-400 font-mono text-[10px]">{order._id.slice(-10).toUpperCase()}</p></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── WISHLIST SECTION ─────────────────────────────────────────────────────────
function WishlistSection() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Saved</p>
          <h2 className="font-['Syne'] text-3xl font-black text-white">Wishlist</h2>
        </div>
        {wishlist.length > 0 && (
          <span className="text-[13px] text-zinc-500">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 text-zinc-700">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="font-['Syne'] text-xl font-bold text-white mb-2">Your wishlist is empty</h3>
          <p className="text-zinc-500 text-sm max-w-xs">Tap the heart icon on any product to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((p) => (
            <div key={p._id}
              className="flex gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950 group/witem hover:border-zinc-700 transition-colors">
              {/* Image */}
              <div onClick={() => navigate(`/product/${p._id}`)}
                className="w-20 h-20 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer">
                <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-contain p-1.5" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p onClick={() => navigate(`/product/${p._id}`)}
                  className="text-[13px] font-semibold text-white leading-snug line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors">
                  {p.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] font-bold text-white">₹{p.price?.toLocaleString()}</span>
                  {p.originalPrice > p.price && (
                    <span className="text-[11px] text-zinc-500 line-through">₹{p.originalPrice?.toLocaleString()}</span>
                  )}
                </div>
                {p.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="text-[11px] text-zinc-400">{p.rating}</span>
                  </div>
                )}
              </div>
              {/* Remove button */}
              <button onClick={() => toggleWishlist(p)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0 self-start">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#ef4444" stroke="#ef4444" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── ADDRESSES SECTION ────────────────────────────────────────────────────────
function AddressesSection({ showToast }) {
  const [addresses, setAddresses] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savedAddresses")) || []; } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", address: "", city: "", pincode: "", phone: "" });
  const [errors, setErrors] = useState({});

  const save = (list) => { setAddresses(list); localStorage.setItem("savedAddresses", JSON.stringify(list)); };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "6-digit pincode";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "10-digit number";
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    save([...addresses, { ...form, id: Date.now() }]);
    setForm({ fullName: "", address: "", city: "", pincode: "", phone: "" });
    setErrors({});
    setShowForm(false);
    showToast("Address saved!", "success");
  };

  const handleDelete = (id) => { save(addresses.filter(a => a.id !== id)); showToast("Address removed", "success"); };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Saved</p>
          <h2 className="font-['Syne'] text-3xl font-black text-white">Addresses</h2>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 h-9 rounded-xl bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-colors">
            <Icon d={icons.plus} size={14} /> Add New
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="p-5 rounded-2xl border border-cyan-400/30 bg-zinc-950 space-y-3">
            <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider">New Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "fullName", label: "Full Name", placeholder: "Rahul Kumar", col: 2 },
                { key: "address", label: "Address", placeholder: "Street, Apt, Area", col: 2 },
                { key: "city", label: "City", placeholder: "Delhi" },
                { key: "pincode", label: "Pincode", placeholder: "110001" },
                { key: "phone", label: "Phone", placeholder: "9876543210", col: 2 },
              ].map(({ key, label, placeholder, col }) => (
                <div key={key} className={col === 2 ? "sm:col-span-2" : ""}>
                  <label className="block text-[12px] font-semibold text-zinc-500 mb-1">{label}</label>
                  <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={`w-full h-10 rounded-xl border px-3 text-sm text-white placeholder-zinc-600 bg-zinc-900 outline-none transition-all
                      ${errors[key] ? "border-red-500/60" : "border-zinc-700 focus:border-cyan-400/60"}`} />
                  {errors[key] && <p className="text-[11px] text-red-400 mt-1">{errors[key]}</p>}
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={handleAdd} className="flex-1 h-10 rounded-xl bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-colors">Save Address</button>
              <button onClick={() => { setShowForm(false); setErrors({}); }} className="px-5 h-10 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-all">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 text-zinc-700">
            <Icon d={icons.addresses} size={36} />
          </div>
          <h3 className="font-['Syne'] text-xl font-bold text-white mb-2">No addresses saved</h3>
          <p className="text-zinc-500 text-sm">Add a delivery address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 relative group/addr">
              <p className="text-[14px] font-bold text-white mb-1">{addr.fullName}</p>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{addr.address}</p>
              <p className="text-[13px] text-zinc-400">{addr.city} — {addr.pincode}</p>
              <p className="text-[13px] text-zinc-500 mt-1">{addr.phone}</p>
              <button onClick={() => handleDelete(addr.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover/addr:opacity-100">
                <Icon d={icons.trash} size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── SETTINGS SECTION ─────────────────────────────────────────────────────────
function SettingsSection({ showToast, onLogout }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Required";
    if (!form.newPassword || form.newPassword.length < 6) e.newPassword = "Minimum 6 characters";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    return e;
  };

  const handleChangePassword = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await updateUserProfile({ password: form.newPassword });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      showToast("Password changed!", "success");
    } catch {
      showToast("Failed to change password", "error");
    } finally { setSaving(false); }
  };

  const pwFields = [
    { key: "currentPassword", label: "Current Password", show: "current" },
    { key: "newPassword", label: "New Password", show: "new" },
    { key: "confirmPassword", label: "Confirm New Password", show: "confirm" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Preferences</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">Account Settings</h2>
      </div>

      {/* Change Password */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
        <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider">Change Password</h3>
        {pwFields.map(({ key, label, show }) => (
          <div key={key}>
            <label className="block text-[12px] font-semibold text-zinc-500 mb-1">{label}</label>
            <div className="relative">
              <input
                type={showPwd[show] ? "text" : "password"}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder="••••••••"
                className={`w-full h-10 rounded-xl border px-3 pr-10 text-sm text-white placeholder-zinc-600 bg-zinc-900 outline-none transition-all
                  ${errors[key] ? "border-red-500/60" : "border-zinc-700 focus:border-cyan-400/60"}`}
              />
              <button type="button" onClick={() => setShowPwd(p => ({ ...p, [show]: !p[show] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                <Icon d={showPwd[show] ? icons.eyeOff : icons.eye} size={15} />
              </button>
            </div>
            {errors[key] && <p className="text-[11px] text-red-400 mt-1">{errors[key]}</p>}
          </div>
        ))}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleChangePassword} disabled={saving}
          className="w-full h-10 rounded-xl bg-cyan-400 text-black text-sm font-bold hover:bg-cyan-300 transition-colors disabled:opacity-60">
          {saving ? "Saving..." : "Update Password"}
        </motion.button>
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-2xl border border-red-500/20 bg-zinc-950 space-y-3">
        <h3 className="font-['Syne'] text-sm font-bold text-red-400 uppercase tracking-wider">Danger Zone</h3>
        <p className="text-[13px] text-zinc-500">Logging out will clear your session. You'll need to sign in again.</p>
        <button onClick={onLogout}
          className="flex items-center gap-2 px-5 h-10 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all">
          <Icon d={icons.logout} size={15} /> Logout
        </button>
      </div>
    </motion.div>
  );
}

// ─── HELP SECTION ─────────────────────────────────────────────────────────────
function HelpSection() {
  const faqs = [
    { q: "How do I track my order?", a: "Go to My Orders and tap on any order to see the full delivery status and details." },
    { q: "What is the return policy?", a: "Most products are eligible for a 10-day return window from the delivery date, subject to product condition." },
    { q: "How do I cancel an order?", a: "Orders can be cancelled before they are shipped. Contact support if the order is already in transit." },
    { q: "Are my payments secure?", a: "Yes. All transactions are encrypted and processed through certified payment gateways." },
  ];
  const [open, setOpen] = useState(null);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Support</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">Help & Support</h2>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: icons.mail, label: "Email Support", value: "support@cromaclone.com", sub: "Reply within 24 hours" },
          { icon: icons.phone, label: "Call Us", value: "1800-123-4567", sub: "Mon–Sat, 9am–7pm" },
        ].map(({ icon, label, value, sub }) => (
          <div key={label} className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Icon d={icon} size={16} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">{label}</p>
              <p className="text-[12px] text-zinc-400">{value}</p>
              <p className="text-[11px] text-zinc-600">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-2">
        <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider mb-3">FAQs</h3>
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-zinc-900/50 transition-colors">
              <span className="text-[14px] font-semibold text-white">{faq.q}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`flex-shrink-0 text-zinc-500 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-zinc-800">
                  <p className="px-4 py-3 text-[13px] text-zinc-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── MAIN ACCOUNT PAGE ────────────────────────────────────────────────────────
export default function AccountPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const activeLabel = MENU.find(m => m.id === active)?.label || "Profile";

  const renderSection = () => {
    switch (active) {
      case "profile":   return <ProfileSection showToast={showToast} />;
      case "orders":    return <OrdersSection />;
      case "wishlist":  return <WishlistSection />;
      case "addresses": return <AddressesSection showToast={showToast} />;
      case "settings":  return <SettingsSection showToast={showToast} onLogout={handleLogout} />;
      case "help":      return <HelpSection />;
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-6 pb-20">
      <Toast toast={toast} />
      <div className="max-w-7xl mx-auto px-4">

        {/* Mobile tab bar */}
        <div className="lg:hidden mb-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 h-12 rounded-2xl border border-zinc-800 bg-zinc-950 text-white">
            <span className="flex items-center gap-2 text-[14px] font-semibold">
              <span className="text-cyan-400"><Icon d={icons[active]} size={16} /></span>
              {activeLabel}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mt-2 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                {MENU.map(m => (
                  <button key={m.id} onClick={() => { setActive(m.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold transition-colors
                      ${active === m.id ? "bg-cyan-400/10 text-cyan-400" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}>
                    <span className={active === m.id ? "text-cyan-400" : "text-zinc-600"}><Icon d={icons[m.id]} size={16} /></span>
                    {m.label}
                  </button>
                ))}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-red-400 hover:bg-red-400/10 transition-colors border-t border-zinc-800">
                  <span className="text-red-400"><Icon d={icons.logout} size={16} /></span>
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-6">
          {/* ── Sidebar (desktop) ── */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
            {/* User card */}
            <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950 mb-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-black text-black flex-shrink-0">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Menu */}
            <nav className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[2px] text-zinc-600">Menu</p>
              {MENU.map((m) => (
                <button key={m.id} onClick={() => setActive(m.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold transition-all border-l-2
                    ${active === m.id
                      ? "border-cyan-400 bg-cyan-400/8 text-white"
                      : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-600"
                    }`}>
                  <span className={active === m.id ? "text-cyan-400" : "text-zinc-600"}><Icon d={icons[m.id]} size={16} /></span>
                  {m.label}
                </button>
              ))}
              <div className="border-t border-zinc-800 mt-1">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-zinc-400 hover:bg-red-500/8 hover:text-red-400 transition-all border-l-2 border-transparent hover:border-red-400">
                  <span className="text-zinc-600"><Icon d={icons.logout} size={16} /></span>
                  Logout
                </button>
              </div>
            </nav>
          </aside>

          {/* ── Content Area ── */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}>
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
