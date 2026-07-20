import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  adminGetAllProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetAllOrders, adminUpdateOrderStatus,
  adminGetAllUsers, adminDeleteUser,
} from "../services/AdminService";

// ─── ICONS ────────────────────────────────────────────────────────────────────
function Icon({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const IC = {
  dashboard: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  products:  ["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z", "M7 7h.01"],
  add:       ["M12 5v14", "M5 12h14"],
  orders:    ["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2", "M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z"],
  users:     ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  logout:    ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  edit:      ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  trash:     ["M3 6h18", "M19 6l-1 14H6L5 6", "M10 11v6M14 11v6", "M9 6V4h6v2"],
  search:    ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.35-4.35"],
  check:     "M20 6L9 17l-5-5",
  x:         ["M18 6L6 18", "M6 6l12 12"],
  eye:       ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  revenue:   ["M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  package:   ["M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", "M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"],
  chevron:   "M6 9l6 6 6-9",
};

const MENU = [
  { id: "overview",  label: "Dashboard",   icon: IC.dashboard },
  { id: "products",  label: "Products",    icon: IC.products  },
  { id: "addProduct",label: "Add Product", icon: IC.add       },
  { id: "orders",    label: "Orders",      icon: IC.orders    },
  { id: "users",     label: "Users",       icon: IC.users     },
];

const STATUS_COLORS = {
  Pending:    { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  Processing: { text: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/30"  },
  Shipped:    { text: "text-cyan-400",   bg: "bg-cyan-400/10",   border: "border-cyan-400/30"  },
  Delivered:  { text: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/30" },
  Cancelled:  { text: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/30"   },
};

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const CATEGORIES = ["Headphones", "TWS Earbuds", "Laptops", "Smartphones", "Home Appliances", "Speakers"];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-800/60 ${className}`} />;
}

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 right-5 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold
            ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          <Icon d={toast.type === "success" ? IC.check : IC.x} size={15} />
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
          <Icon d={IC.trash} size={22} />
        </div>
        <h3 className="font-['Syne'] text-lg font-black text-white text-center mb-2">Are you sure?</h3>
        <p className="text-zinc-400 text-sm text-center mb-6">{msg}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-10 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-semibold hover:bg-zinc-800 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, color, icon, loading }) {
  return (
    <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
      {loading ? (
        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" /><Skeleton className="h-3 w-32" /></div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}><Icon d={icon} size={16} /></div>
          </div>
          <p className="font-['Syne'] text-3xl font-black text-white mb-1">{value}</p>
          <p className="text-[12px] text-zinc-500">{sub}</p>
        </>
      )}
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewSection({ products, orders, users, loading }) {
  const revenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const delivered = orders.filter(o => o.status === "Delivered").length;
  const pending = orders.filter(o => o.status === "Pending").length;

  const recentOrders = orders.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Admin Panel</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">Dashboard Overview</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} sub={`Across ${CATEGORIES.length} categories`} color="#00e5ff" icon={IC.products} loading={loading} />
        <StatCard label="Total Orders"   value={orders.length}   sub={`${delivered} delivered · ${pending} pending`} color="#22c55e" icon={IC.orders}   loading={loading} />
        <StatCard label="Total Users"    value={users.length}    sub="Registered customers" color="#a855f7" icon={IC.users}    loading={loading} />
        <StatCard label="Total Revenue"  value={`₹${(revenue/100000).toFixed(1)}L`} sub={`₹${revenue.toLocaleString()} total`} color="#f59e0b" icon={IC.revenue}  loading={loading} />
      </div>

      {/* Order status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
          <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {ORDER_STATUSES.map(status => {
              const count = orders.filter(o => o.status === status).length;
              const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
              const cfg = STATUS_COLORS[status];
              return (
                <div key={status}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className={cfg.text + " font-semibold"}>{status}</span>
                    <span className="text-zinc-400">{count} orders ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${cfg.bg.replace("/10", "")}`}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ background: cfg.text.replace("text-", "").replace("400", "") === "yellow" ? "#facc15" : cfg.text.includes("green") ? "#4ade80" : cfg.text.includes("cyan") ? "#22d3ee" : cfg.text.includes("blue") ? "#60a5fa" : "#f87171" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
          <h3 className="font-['Syne'] text-sm font-bold text-white uppercase tracking-wider mb-4">Recent Orders</h3>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : recentOrders.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(order => {
                const cfg = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
                return (
                  <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900">
                    <div>
                      <p className="text-[13px] font-semibold text-white">{order.user?.name || "Customer"}</p>
                      <p className="text-[11px] text-zinc-500">₹{order.totalPrice?.toLocaleString()}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.text} ${cfg.bg} ${cfg.border}`}>{order.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
function ProductsSection({ products, loading, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Manage</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">Products <span className="text-zinc-600 text-xl font-semibold">({products.length})</span></h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Icon d={IC.search} size={14} /></span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or brand..."
            className="w-full h-10 rounded-xl border border-zinc-700 bg-zinc-900 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-400/50 transition-all" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-cyan-400/50 cursor-pointer">
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Product</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Category</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Price</th>
                <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Stock</th>
                <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-lg" /><Skeleton className="h-4 w-36" /></div></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-10 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-20 mx-auto" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No products found</td></tr>
              ) : (
                paginated.map(p => (
                  <tr key={p._id} className="border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display="none"; }} />
                            : <span className="text-lg">🛍️</span>}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-[13px] line-clamp-1 max-w-[160px]">{p.name}</p>
                          <p className="text-[11px] text-zinc-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-white text-[13px]">₹{p.price?.toLocaleString()}</p>
                      <p className="text-[11px] text-zinc-600 line-through">₹{p.originalPrice?.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[12px] font-bold ${p.stock > 10 ? "text-green-400" : p.stock > 0 ? "text-yellow-400" : "text-red-400"}`}>
                        {p.stock > 0 ? p.stock : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all border border-zinc-700">
                          <Icon d={IC.edit} size={13} />
                        </button>
                        <button onClick={() => onDelete(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all border border-zinc-700">
                          <Icon d={IC.trash} size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-[12px] text-zinc-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${page === i+1 ? "bg-cyan-400 text-black" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────────────────────────
function ProductFormSection({ editProduct, onSave, showToast }) {
  const isEdit = !!editProduct;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", brand: "", category: "Headphones", description: "",
    price: "", originalPrice: "", stock: "", badge: "",
    images: "", specs: "", highlights: "",
  });

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || "",
        brand: editProduct.brand || "",
        category: editProduct.category || "Headphones",
        description: editProduct.description || "",
        price: editProduct.price || "",
        originalPrice: editProduct.originalPrice || "",
        stock: editProduct.stock || "",
        badge: editProduct.badge || "",
        images: editProduct.images?.join(", ") || "",
        specs: editProduct.specs?.join(", ") || "",
        highlights: editProduct.highlights?.join("\n") || "",
      });
    }
  }, [editProduct]);

  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, brand: form.brand, category: form.category,
        description: form.description,
        price: Number(form.price), originalPrice: Number(form.originalPrice),
        stock: Number(form.stock), badge: form.badge,
        images: form.images.split(",").map(s => s.trim()).filter(Boolean),
        specs: form.specs.split(",").map(s => s.trim()).filter(Boolean),
        highlights: form.highlights.split("\n").map(s => s.trim()).filter(Boolean),
      };
      if (isEdit) {
        await adminUpdateProduct(editProduct._id, payload);
        showToast("Product updated!", "success");
      } else {
        await adminCreateProduct(payload);
        showToast("Product added!", "success");
      }
      onSave();
    } catch {
      showToast("Failed to save product", "error");
    } finally { setSaving(false); }
  };

  const fields = [
    { key: "name",          label: "Product Name",           placeholder: "Sony WH-1000XM5", col: 2 },
    { key: "brand",         label: "Brand",                  placeholder: "Sony",            col: 1 },
    { key: "price",         label: "Sale Price (₹)",         placeholder: "24999",           col: 1, type: "number" },
    { key: "originalPrice", label: "Original Price (₹)",     placeholder: "34999",           col: 1, type: "number" },
    { key: "stock",         label: "Stock Quantity",         placeholder: "50",              col: 1, type: "number" },
    { key: "badge",         label: "Badge (optional)",       placeholder: "Best Seller",     col: 2 },
    { key: "images",        label: "Image URLs (comma separated)", placeholder: "https://..., https://...", col: 2 },
    { key: "specs",         label: "Specs (comma separated)", placeholder: "ANC, 30hr Battery, BT 5.3", col: 2 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">{isEdit ? "Edit" : "New"}</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">{isEdit ? "Edit Product" : "Add Product"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ key, label, placeholder, col, type }) => (
            <div key={key} className={col === 2 ? "sm:col-span-2" : ""}>
              <label className="block text-[12px] font-semibold text-zinc-400 mb-1.5">{label}</label>
              <input type={type || "text"} value={form[key]} onChange={upd(key)} placeholder={placeholder} required={["name","brand","price","originalPrice","stock"].includes(key)}
                className="w-full h-10 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-cyan-400/60 transition-all" />
            </div>
          ))}

          {/* Category */}
          <div>
            <label className="block text-[12px] font-semibold text-zinc-400 mb-1.5">Category</label>
            <select value={form.category} onChange={upd("category")}
              className="w-full h-10 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-cyan-400/60 cursor-pointer transition-all">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-[12px] font-semibold text-zinc-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={upd("description")} rows={3} placeholder="Product description..." required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-cyan-400/60 transition-all resize-none" />
          </div>

          {/* Highlights */}
          <div className="sm:col-span-2">
            <label className="block text-[12px] font-semibold text-zinc-400 mb-1.5">Highlights (one per line)</label>
            <textarea value={form.highlights} onChange={upd("highlights")} rows={3} placeholder={"40hr battery life\nActive Noise Cancellation\nBluetooth 5.3"}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-cyan-400/60 transition-all resize-none" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={saving}
            className="flex-1 h-11 rounded-xl bg-cyan-400 text-black font-bold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
          </motion.button>
          <button type="button" onClick={onSave}
            className="px-6 h-11 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-semibold hover:bg-zinc-800 hover:text-white transition-all">
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersSection({ orders, loading, onStatusUpdate }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState(null);
  const PER_PAGE = 8;

  const filtered = orders.filter(o => {
    const matchSearch = o.user?.name?.toLowerCase().includes(search.toLowerCase()) || o._id.includes(search);
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const handleStatus = async (orderId, status) => {
    setUpdating(orderId);
    await onStatusUpdate(orderId, status);
    setUpdating(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Manage</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">Orders <span className="text-zinc-600 text-xl font-semibold">({orders.length})</span></h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Icon d={IC.search} size={14} /></span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by customer or order ID..."
            className="w-full h-10 rounded-xl border border-zinc-700 bg-zinc-900 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-400/50" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none cursor-pointer">
          <option value="All">All Status</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Order ID","Customer","Items","Total","Status","Update Status"].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500 ${h === "Total" || h === "Items" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">No orders found</td></tr>
              ) : (
                paginated.map(order => {
                  const cfg = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
                  return (
                    <tr key={order._id} className="border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white text-[13px]">{order.user?.name || "—"}</p>
                        <p className="text-[11px] text-zinc-500">{order.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400 text-[13px]">{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-right font-bold text-white text-[13px]">₹{order.totalPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${cfg.text} ${cfg.bg} ${cfg.border}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => handleStatus(order._id, e.target.value)}
                          disabled={updating === order._id}
                          className="h-8 rounded-lg border border-zinc-700 bg-zinc-900 px-2 text-[12px] text-white outline-none cursor-pointer disabled:opacity-50 focus:border-cyan-400/50"
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-[12px] text-zinc-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${page === i+1 ? "bg-cyan-400 text-black" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── USERS ────────────────────────────────────────────────────────────────────
function UsersSection({ users, loading, onDelete }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-cyan-400 mb-1">Manage</p>
        <h2 className="font-['Syne'] text-3xl font-black text-white">Users <span className="text-zinc-600 text-xl font-semibold">({users.length})</span></h2>
      </div>

      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Icon d={IC.search} size={14} /></span>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users..."
          className="w-full h-10 rounded-xl border border-zinc-700 bg-zinc-900 pl-9 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-400/50" />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["User","Email","Role","Joined","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    {[1,2,3,4,5].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No users found</td></tr>
              ) : (
                paginated.map(user => (
                  <tr key={user._id} className="border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[11px] font-black text-black flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-white text-[13px]">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-[13px]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${user.isAdmin ? "text-purple-400 bg-purple-400/10 border-purple-400/30" : "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
                        {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-[12px]">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      {!user.isAdmin && (
                        <button onClick={() => onDelete(user)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all border border-zinc-700">
                          <Icon d={IC.trash} size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-[12px] text-zinc-500">Showing {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${page === i+1 ? "bg-cyan-400 text-black" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editProduct, setEditProduct] = useState(null);

  // Guard — admin only
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  useEffect(() => {
    if (!user || !user.isAdmin) navigate("/");
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    (async () => {
      try {
        const [p, o, u] = await Promise.all([adminGetAllProducts(), adminGetAllOrders(), adminGetAllUsers()]);
        setProducts(p); setOrders(o); setUsers(u);
      } catch { showToast("Failed to load data", "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshProducts = async () => {
    const p = await adminGetAllProducts();
    setProducts(p);
  };

  const refreshOrders = async () => {
    const o = await adminGetAllOrders();
    setOrders(o);
  };

  const refreshUsers = async () => {
    const u = await adminGetAllUsers();
    setUsers(u);
  };

  // Product handlers
  const handleEditProduct = (p) => { setEditProduct(p); setActive("addProduct"); };
  const handleDeleteProduct = (p) => {
    setConfirm({
      msg: `Delete "${p.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try { await adminDeleteProduct(p._id); await refreshProducts(); showToast("Product deleted"); }
        catch { showToast("Failed to delete", "error"); }
        setConfirm(null);
      }
    });
  };
  const handleProductSaved = async () => {
    await refreshProducts();
    setEditProduct(null);
    setActive("products");
  };

  // Order handler
  const handleOrderStatus = async (id, status) => {
    try { await adminUpdateOrderStatus(id, status); await refreshOrders(); showToast(`Status updated to ${status}`); }
    catch { showToast("Failed to update status", "error"); }
  };

  // User handler
  const handleDeleteUser = (u) => {
    setConfirm({
      msg: `Delete user "${u.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try { await adminDeleteUser(u._id); await refreshUsers(); showToast("User deleted"); }
        catch { showToast("Failed to delete", "error"); }
        setConfirm(null);
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const renderSection = () => {
    switch (active) {
      case "overview":   return <OverviewSection products={products} orders={orders} users={users} loading={loading} />;
      case "products":   return <ProductsSection products={products} loading={loading} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />;
      case "addProduct": return <ProductFormSection editProduct={editProduct} onSave={handleProductSaved} showToast={showToast} />;
      case "orders":     return <OrdersSection orders={orders} loading={loading} onStatusUpdate={handleOrderStatus} />;
      case "users":      return <UsersSection users={users} loading={loading} onDelete={handleDeleteUser} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Toast toast={toast} />
      <AnimatePresence>{confirm && <ConfirmModal msg={confirm.msg} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}</AnimatePresence>

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-[#0a0a0a]/95 backdrop-blur-xl h-14 flex items-center px-4 gap-4">
        <span className="font-['Syne'] text-xl font-black bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
          Croma
        </span>
        <span className="text-[10px] font-black uppercase tracking-[3px] px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-400">
          Admin
        </span>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[11px] font-black text-black">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-[13px] font-semibold text-zinc-300">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 h-8 rounded-xl border border-zinc-700 text-zinc-400 text-[12px] font-semibold hover:bg-zinc-800 hover:text-white transition-all">
          <Icon d={IC.logout} size={13} /> Logout
        </button>
        {/* Mobile menu toggle */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-8 h-8 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-400">
          <Icon d={mobileMenuOpen ? IC.x : IC.dashboard} size={15} />
        </button>
      </header>

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-zinc-900 pt-4 pb-6 px-3">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[2px] text-zinc-600">Navigation</p>
          <nav className="flex-1 space-y-0.5">
            {MENU.map(m => (
              <button key={m.id}
                onClick={() => { if (m.id !== "addProduct") setEditProduct(null); setActive(m.id); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all border
                  ${active === m.id
                    ? "bg-cyan-400/10 border-cyan-400/20 text-white"
                    : "border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-800"
                  }`}>
                <span className={active === m.id ? "text-cyan-400" : "text-zinc-600"}><Icon d={m.icon} size={15} /></span>
                {m.label}
              </button>
            ))}
          </nav>
          <button onClick={() => navigate("/")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-500 hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800 transition-all mt-2">
            <span className="text-zinc-600"><Icon d={["M19 12H5", "M12 19l-7-7 7-7"]} size={15} /></span>
            Back to Store
          </button>
        </aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ x: -240, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -240, opacity: 0 }}
              className="lg:hidden fixed left-0 top-14 bottom-0 w-56 z-30 border-r border-zinc-800 bg-[#0a0a0a] pt-4 pb-6 px-3">
              <nav className="space-y-0.5">
                {MENU.map(m => (
                  <button key={m.id} onClick={() => { if (m.id !== "addProduct") setEditProduct(null); setActive(m.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all border
                      ${active === m.id ? "bg-cyan-400/10 border-cyan-400/20 text-white" : "border-transparent text-zinc-500 hover:bg-zinc-900 hover:text-white"}`}>
                    <span className={active === m.id ? "text-cyan-400" : "text-zinc-600"}><Icon d={m.icon} size={15} /></span>
                    {m.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 p-5 lg:p-7">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
