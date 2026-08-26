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
import Orders from "./components/Orders/Orders";
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
  const [showOrders, setShowOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [pendingTarget, setPendingTarget] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  const [showAllFood, setShowAllFood] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("madhuram_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem("madhuram_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    try {
      localStorage.setItem("madhuram_user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setAuthMode(null);

    if (pendingTarget === "orders") {
      setPendingTarget(null);
      setShowOrders(true);
      setShowProfile(false);
      setShowCheckout(false);
      setShowBookTable(false);
      setShowAllFood(false);
      setActiveTab("orders");
      setShowFooter(true);
    } else {
      setShowProfile(true);
      setActiveTab("profile");
      setShowFooter(false);
    }
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("madhuram_user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setAuthMode(null);

    if (pendingTarget === "orders") {
      setPendingTarget(null);
      setShowOrders(true);
      setShowProfile(false);
      setShowCheckout(false);
      setShowBookTable(false);
      setShowAllFood(false);
      setActiveTab("orders");
      setShowFooter(true);
    } else {
      setShowProfile(true);
      setActiveTab("profile");
      setShowFooter(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowProfile(false);
    setShowOrders(false);
    localStorage.removeItem("token");
    localStorage.removeItem("madhuram_user");
    setActiveTab("home");
    setShowFooter(true);
  };

  // ===========================
  // Navigation
  // ===========================

  const handleNavigate = (id) => {
    setIsCartOpen(false);
    setCouponMessage("");
    setCouponApplied(false);
    setActiveTab(id);

    if (id === "orders") {
      if (currentUser) {
        setShowOrders(true);
        setShowProfile(false);
        setShowCheckout(false);
        setShowBookTable(false);
        setShowAllFood(false);
        setAuthMode(null);
        setShowFooter(true);
      } else {
        setPendingTarget("orders");
        alert("Please register first to open the Orders section!");
        openRegister();
      }
      return;
    }

    if (id === "profile") {
      if (currentUser) {
        setShowOrders(false);
        setShowProfile(true);
        setAuthMode(null);
        setShowFooter(false);
      } else {
        setPendingTarget("profile");
        openRegister();
      }
      return;
    }

    if (id === "menu") {
      setAuthMode(null);
      setShowOrders(false);
      setShowProfile(false);
      setShowCheckout(false);
      setShowBookTable(false);
      handleViewAll();
      return;
    }

    // Home
    setShowOrders(false);
    setShowAllFood(false);
    setSelectedCategory(null);
    setAuthMode(null);
    setShowProfile(false);
    setShowCheckout(false);
    setShowBookTable(false);
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
  // Checkout & Orders
  // ===========================

  const handleCheckout = () => {
    setIsCartOpen(false);
    setShowProfile(false);
    setShowBookTable(false);
    setShowOrders(false);
    setShowCheckout(true);
    setShowFooter(false);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
    setShowFooter(true);
  };

  const handlePlaceOrder = (newOrder, whatsappURL) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    try {
      localStorage.setItem("madhuram_orders", JSON.stringify(updatedOrders));
    } catch (e) {
      console.error(e);
    }

    // Ensure currentUser is updated if guest user provided details
    if (!currentUser && newOrder.customer) {
      const userObj = {
        fullName: newOrder.customer.fullName || "Valued Customer",
        mobile: newOrder.customer.mobile,
      };
      setCurrentUser(userObj);
      try {
        localStorage.setItem("madhuram_user", JSON.stringify(userObj));
      } catch (e) {
        console.error(e);
      }
    }

    // Reset cart
    setCartItems([]);

    // Open WhatsApp URL
    window.open(whatsappURL, "_blank");

    // Navigate user directly to Orders Section
    setShowCheckout(false);
    setShowOrders(true);
    setActiveTab("orders");
    setShowFooter(true);
  };

  // ===========================
  // Book a Table
  // ===========================

  const handleBookTable = () => {
    setIsCartOpen(false);
    setShowProfile(false);
    setShowCheckout(false);
    setShowOrders(false);
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
          {!authMode &&
            !showCheckout &&
            !showProfile &&
            !showBookTable &&
            !showOrders && (
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

          {/* ORDERS */}
          {showOrders && (
            <Orders
              orders={orders}
              user={currentUser}
              onBackHome={() => {
                setShowOrders(false);
                setActiveTab("home");
                setShowFooter(true);
              }}
              onBrowseMenu={() => {
                setShowOrders(false);
                setShowAllFood(true);
                setActiveTab("menu");
                setShowFooter(true);
              }}
            />
          )}

          {/* LOGIN */}
          {authMode === "login" && (
            <Login
              onClose={() => {
                setAuthMode(null);
                setPendingTarget(null);
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
                setPendingTarget(null);
                setShowFooter(true);
              }}
              onLogin={() => setAuthMode("login")}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {/* PROFILE */}
          {showProfile && currentUser && (
            <Profile
              user={currentUser}
              onLogout={handleLogout}
              onBackHome={() => {
                setShowProfile(false);
                setActiveTab("home");
                setShowFooter(true);
              }}
            />
          )}

          {/* CHECKOUT */}
          {showCheckout && (
            <Checkout
              cartItems={cartItems}
              onBack={handleBackFromCheckout}
              onPlaceOrder={handlePlaceOrder}
            />
          )}

          {/* BOOK A TABLE */}
          {showBookTable && (
            <BookTable
              onBack={handleBackFromBookTable}
              cartItems={cartItems}
            />
          )}

          <Footer
            visible={
              !authMode &&
              !showCheckout &&
              !showProfile &&
              !showBookTable &&
              showFooter
            }
            onNavigate={handleNavigate}
            activeTab={activeTab}
          />
        </>
      )}
    </>
  );
}

export default App;
