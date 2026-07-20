import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("croma_wishlist")) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("croma_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product) => {
    const id = product._id || product.id;
    setWishlist(prev => {
      const exists = prev.find(p => p._id === id);
      if (exists) return prev.filter(p => p._id !== id);
      return [...prev, {
        _id: id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        rating: product.rating,
        numReviews: product.numReviews,
        badge: product.badge,
        category: product.category,
        specs: product.specs,
        stock: product.stock,
      }];
    });
  };

  const isWished = (id) => wishlist.some(p => p._id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWished }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
