import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { CartProvider } from "./context/Cartcontext";
import { WishlistProvider } from "./context/WishlistContext";
import useScrollToTop from "./hooks/useScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroSlider from "./components/HeroSlider";
import Categories from "./components/Categories";

const HeadphonesPage     = lazy(() => import("./pages/Headphonespage"));
const TWSPage            = lazy(() => import("./pages/TWSPage"));
const SmartphonesPage    = lazy(() => import("./pages/Smartphonespage"));
const LaptopsPage        = lazy(() => import("./pages/Laptopspage"));
const HomeAppliancesPage = lazy(() => import("./pages/HomeAppliancespage"));
const SpeakersPage       = lazy(() => import("./pages/Speakerspage"));
const CartPage           = lazy(() => import("./pages/Cartpage"));
const AuthPage           = lazy(() => import("./pages/Authpage"));
const ProductDetailPage  = lazy(() => import("./pages/Productdetailpage"));
const AccountPage        = lazy(() => import("./pages/Accountpage"));
const AdminPage          = lazy(() => import("./pages/Adminpage"));
const AllProductsPage    = lazy(() => import("./pages/AllProductsPage"));
const SearchPage         = lazy(() => import("./pages/Searchpage"));
const NotFoundPage       = lazy(() => import("./pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-cyan-400 animate-spin" />
    </div>
  );
}

const PAGE_TITLES = {
  "/": "Croma — Premium Electronics",
  "/headphones": "Headphones | Croma",
  "/tws": "TWS Earbuds | Croma",
  "/smartphones": "Smartphones | Croma",
  "/laptops": "Laptops | Croma",
  "/appliances": "Home Appliances | Croma",
  "/speakers": "Speakers | Croma",
  "/cart": "Your Cart | Croma",
  "/login": "Login | Croma",
  "/signup": "Sign Up | Croma",
  "/account": "My Account | Croma",
  "/admin": "Admin Dashboard | Croma",
  "/search": "Search | Croma",
};

function TitleUpdater() {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = pathname.startsWith("/product/")
      ? "Product Details | Croma"
      : PAGE_TITLES[pathname] ?? "Croma — Premium Electronics";
    document.title = title;
  }, [pathname]);
  return null;
}

function ScrollToTop() {
  useScrollToTop();
  return null;
}

function Home() {
  return (
    <>
      <HeroSlider />
      <Categories />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WishlistProvider>
      <CartProvider>
        <ScrollToTop />
        <TitleUpdater />
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/headphones" element={<HeadphonesPage />} />
                <Route path="/tws" element={<TWSPage />} />
                <Route path="/smartphones" element={<SmartphonesPage />} />
                <Route path="/laptops" element={<LaptopsPage />} />
                <Route path="/appliances" element={<HomeAppliancesPage />} />
                <Route path="/speakers" element={<SpeakersPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/products/:category/:type" element={<AllProductsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </CartProvider>
      </WishlistProvider>
    </BrowserRouter>
  );
}