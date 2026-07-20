import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/Authservice";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function PasswordStrength({ password }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
    if (score === 2) return { level: 2, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { level: 3, label: "Good", color: "#3b82f6" };
    return { level: 4, label: "Strong", color: "#22c55e" };
  };
  const { level, label, color } = getStrength();
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= level ? color : "#27272a" }} />
        ))}
      </div>
      <p className="text-[11px] font-semibold" style={{ color }}>{label} password</p>
    </div>
  );
}

function InputField({ label, type, value, onChange, placeholder, error, showToggle, onToggle, showPassword }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-zinc-300 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showToggle ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-11 rounded-xl border px-4 text-sm text-white placeholder-zinc-500 bg-zinc-900 outline-none transition-all
            ${error ? "border-red-500/60 focus:border-red-500" : "border-zinc-700 focus:border-cyan-400/60"}`}
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
            {showPassword
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        )}
      </div>
      {error && <p className="text-[12px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email address";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters";
    if (!isLogin && form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginUser({ email: form.email, password: form.password });
      } else {
        data = await registerUser({ name: form.name, email: form.email, password: form.password });
      }

      // Token save karo localStorage mein
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("auth-change"));

      showToast(isLogin ? "Welcome back! 🎉" : "Account created! 🎉");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      showToast(error.response?.data?.message || "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-sm font-semibold shadow-2xl
              ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl flex rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">

        {/* Left — Branding */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-10 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(0,229,255,0.08), transparent 60%)" }} />
          <div className="relative z-10">
            <span onClick={() => navigate("/")} className="font-['Syne'] text-3xl font-black bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent cursor-pointer">
              Croma
            </span>
            <p className="mt-3 text-zinc-400 text-sm leading-relaxed">Your one-stop destination for premium electronics.</p>
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative z-10 space-y-4">
            {["🎧 10,000+ Premium Products", "🚚 Fast & Free Delivery", "🔒 100% Secure Payments", "⭐ 50 Lakh+ Happy Customers"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">{item}</div>
            ))}
          </motion.div>
          <div className="relative z-10 text-[11px] text-zinc-600">© 2026 Croma Clone. All rights reserved.</div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 bg-zinc-950 p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>

              <h2 className="font-['Syne'] text-2xl font-black text-white mb-1">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-zinc-400 text-sm mb-6">
                {isLogin ? "Sign in to your Croma account" : "Join millions of happy customers"}
              </p>

              <div className="flex gap-3 mb-6 relative group/google">
                <button
                  type="button"
                  disabled
                  className="flex-1 h-11 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center gap-2 text-sm text-zinc-600 cursor-not-allowed select-none"
                >
                  <GoogleIcon /> Google
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-500 border border-zinc-700">Soon</span>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[12px] text-zinc-600">or continue with email</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <InputField label="Full Name" type="text" value={form.name}
                    onChange={update("name")} placeholder="John Doe" error={errors.name} />
                )}
                <InputField label="Email Address" type="email" value={form.email}
                  onChange={update("email")} placeholder="john@example.com" error={errors.email} />
                <div>
                  <InputField label="Password" type="password" value={form.password}
                    onChange={update("password")} placeholder="••••••••" error={errors.password}
                    showToggle showPassword={showPass} onToggle={() => setShowPass(!showPass)} />
                  {!isLogin && <PasswordStrength password={form.password} />}
                </div>
                {!isLogin && (
                  <InputField label="Confirm Password" type="password" value={form.confirmPassword}
                    onChange={update("confirmPassword")} placeholder="••••••••" error={errors.confirmPassword}
                    showToggle showPassword={showConfirmPass} onToggle={() => setShowConfirmPass(!showConfirmPass)} />
                )}

                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-cyan-400 text-black font-bold text-sm hover:bg-cyan-300 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {loading
                    ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Please wait...</>
                    : isLogin ? "Sign In →" : "Create Account →"
                  }
                </motion.button>
              </form>

              <p className="text-center text-[13px] text-zinc-500 mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setIsLogin(!isLogin); setErrors({}); setForm({ name: "", email: "", password: "", confirmPassword: "" }); }}
                  className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}