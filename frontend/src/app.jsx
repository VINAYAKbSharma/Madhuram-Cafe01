import { useState } from "react";

import SplashScreen from "./components/SplashScreen/SplashScreen";
import Navbar from "./components/Navbar/Navbar";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import initialCartItems from "./components/CartDrawer/cartData";
import Hero from "./components/Hero/Hero";
import CategoryCard from "./components/CategoryCard/CategoryCard";
import AllFood from "./components/allfood/allfood";
import PopularProducts from "./components/PopularProducts/PopularProducts";
import OfferBanner from "./components/OfferBanner/OfferBanner";
import ReviewCard from "./components/ReviewCard/ReviewCard";
import Footer from "./components/Footer/Footer";
import Register from "./pages/Register/Register";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout/Checkout";
import BookTable from "./pages/BookTable/BookTable";
import Profile from "./pages/Profile/Profile";

function App() {
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState(
    initialCartItems.map((item) => ({ ...item }))
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(true);

  const [authMode, setAuthMode] = useState(null); // null | "login" | "register"
  const [showCheckout, setShowCheckout] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const [showAllFood, setShowAllFood] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookTable, setShowBookTable] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // ===========================
  // Cart
  // ===========================

  const handleCartOpen = () => {
    setIsCartOpen(true);
    setShowFooter(false);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
    setShowFooter(true);
  };

  // ===========================
  // Auth
  // ===========================

  const openLogin = () => {
    setAuthMode("login");
    setShowFooter(false);
    setIsCartOpen(false);
    setShowAllFood(false);
    setSelectedCategory(null);
  };

  const openRegister = () => {
    setAuthMode("register");
    setShowFooter(false);
    setIsCartOpen(false);
    setShowAllFood(false);
    setSelectedCategory(null);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthMode(null);
    setShowProfile(true);
    setShowFooter(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowProfile(false);
    localStorage.removeItem("token");
    setShowFooter(true);
  };

  // ===========================
  // Navigation
  // ===========================

  const handleNavigate = (id) => {
    setIsCartOpen(false);
    setCouponMessage("");
    setCouponApplied(false);

    if (id === "profile") {
      if (currentUser) {
        setShowProfile(true);
        setAuthMode(null);
        setShowFooter(false);
      } else {
        openRegister();
      }
      return;
    }

    setAuthMode(null);
    setShowProfile(false);
    setShowFooter(true);
  };

  // ===========================
  // Category
  // ===========================

  const handleViewAll = (category) => {
    setSelectedCategory(category || null);
    setShowAllFood(true);
    setShowFooter(false);
  };

  // ===========================
  // Checkout
  // ===========================

  const handleCheckout = () => {
    setIsCartOpen(false);
    setShowProfile(false);
    setShowBookTable(false);
    setShowCheckout(true);
    setShowFooter(false);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
    setShowFooter(true);
  };

  // ===========================
  // Book a Table
  // ===========================

  const handleBookTable = () => {
    setIsCartOpen(false);
    setShowProfile(false);
    setShowCheckout(false);
    setAuthMode(null);
    setShowBookTable(true);
    setShowFooter(false);
  };

  const handleBackFromBookTable = () => {
    setShowBookTable(false);
    setShowFooter(true);
  };

  // ===========================
  // Cart Helpers
  // ===========================

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(item.qty + delta, 0) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const deleteCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ===========================
  // Coupon
  // ===========================

  const handleApplyCoupon = () => {
    const trimmed = couponCode.trim().toLowerCase();
    if (trimmed === "same") {
      setCouponApplied(true);
      setCouponMessage("Coupon applied: 20% discount unlocked!");
    } else {
      setCouponApplied(false);
      setCouponMessage("Invalid coupon code.");
    }
  };

  // ===========================
  // Render
  // ===========================

  return (
    <>
      {loading ? (
        <SplashScreen onFinish={() => setLoading(false)} />
      ) : (
        <>
          <Navbar
            onCartClick={handleCartOpen}
            onNavigate={handleNavigate}
            cartCount={cartCount}
          />

          {isCartOpen && (
            <CartDrawer
              onClose={handleCartClose}
              onCheckout={handleCheckout}
              onBookTable={handleBookTable}
              cartItems={cartItems}
              onQuantityChange={updateCartQty}
              onDelete={deleteCartItem}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              onApplyCoupon={handleApplyCoupon}
              couponApplied={couponApplied}
              couponMessage={couponMessage}
            />
          )}

          {/* HOME */}
          {!authMode && !showCheckout && !showProfile && !showBookTable && (
            <>
              <Hero />

              <CategoryCard
                onViewAll={handleViewAll}
                onBackHome={() => {
                  setShowAllFood(false);
                  setSelectedCategory(null);
                  setShowFooter(true);
                }}
                showBackHome={showAllFood}
              />

              {showAllFood && (
                <AllFood
                  selectedCategory={selectedCategory}
                  onAddToCart={addToCart}
                  onClose={() => {
                    setShowAllFood(false);
                    setSelectedCategory(null);
                    setShowFooter(true);
                  }}
                />
              )}

              <PopularProducts onAddToCart={addToCart} />

              <OfferBanner />

              <ReviewCard />
            </>
          )}

          {/* LOGIN */}
          {authMode === "login" && (
            <Login
              onClose={() => {
                setAuthMode(null);
                setShowFooter(true);
              }}
              onRegister={() => setAuthMode("register")}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {/* REGISTER */}
          {authMode === "register" && (
            <Register
              onClose={() => {
                setAuthMode(null);
                setShowFooter(true);
              }}
              onLogin={() => setAuthMode("login")}
            />
          )}

          {/* PROFILE */}
          {showProfile && currentUser && (
            <Profile
              user={currentUser}
              onLogout={handleLogout}
              onBackHome={() => {
                setShowProfile(false);
                setShowFooter(true);
              }}
            />
          )}

          {/* CHECKOUT */}
          {showCheckout && (
            <Checkout
              cartItems={cartItems}
              onBack={handleBackFromCheckout}
            />
          )}

          {/* BOOK A TABLE */}
          {showBookTable && (
            <BookTable onBack={handleBackFromBookTable} cartItems={cartItems} />
          )}

          <Footer
            visible={!authMode && !showCheckout && !showProfile && !showBookTable && showFooter}
            onNavigate={handleNavigate}
          />
        </>
      )}
    </>
  );
}

export default App;
