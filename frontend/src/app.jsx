import { useState, useEffect } from "react";

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
import AdminPanel from "./pages/Admin/AdminPanel";
import { API_BASE_URL } from "./config/api";

const getOrdersForUser = (user) => {
  try {
    const allOrdersRaw = localStorage.getItem("madhuram_orders");
    const allOrders = allOrdersRaw ? JSON.parse(allOrdersRaw) : [];

    if (!user || !user.mobile) {
      return [];
    }

    const userSpecificRaw = localStorage.getItem(`madhuram_orders_${user.mobile}`);
    const userSpecific = userSpecificRaw ? JSON.parse(userSpecificRaw) : [];

    const filteredFromAll = allOrders.filter(
      (o) => o.customer?.mobile === user.mobile || o.userMobile === user.mobile
    );

    const map = new Map();
    [...userSpecific, ...filteredFromAll].forEach((order) => {
      if (order && order.id) {
        map.set(order.id, order);
      }
    });

    return Array.from(map.values());
  } catch (e) {
    console.error("Error loading user orders:", e);
    return [];
  }
};

function App() {
  const [loading, setLoading] = useState(true);

  const [cartItems, setCartItems] = useState([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(true);

  const [authMode, setAuthMode] = useState(null); // null | "login" | "register"
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
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

  const [orders, setOrders] = useState(() => getOrdersForUser(currentUser));

  const [showProfile, setShowProfile] = useState(false);
  const [showBookTable, setShowBookTable] = useState(false);
  const [userToastNotif, setUserToastNotif] = useState(null);

  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // Sync orders automatically when user changes (login, register, mount)
  useEffect(() => {
    setOrders(getOrdersForUser(currentUser));
  }, [currentUser]);

  // Sync user orders from central API periodically
  useEffect(() => {
    const fetchUserOrders = async () => {
      const mobile = currentUser?.mobile;
      if (!mobile) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/user/${mobile}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        }
      } catch (err) {}
    };

    fetchUserOrders();
    const interval = setInterval(fetchUserOrders, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Listen for order confirmation notifications for user
  useEffect(() => {
    const handleOrderConfirmed = (e) => {
      if (e.detail) {
        if (!currentUser || !e.detail.mobile || e.detail.mobile === currentUser.mobile) {
          setUserToastNotif(e.detail);
          setOrders(getOrdersForUser(currentUser));
        }
      }
    };

    const handleStorage = (e) => {
      if (!e.key || e.key === "madhuram_orders" || (currentUser && e.key === `madhuram_orders_${currentUser.mobile}`)) {
        setOrders(getOrdersForUser(currentUser));
      }
    };

    window.addEventListener("madhuram_order_confirmed", handleOrderConfirmed);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("madhuram_order_confirmed", handleOrderConfirmed);
      window.removeEventListener("storage", handleStorage);
    };
  }, [currentUser]);

  // Listen for secret #admin, /admin, or ?admin URL route
  useEffect(() => {
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      if (hash === "#admin" || search.includes("admin") || pathname.endsWith("/admin") || pathname.includes("/admin/")) {
        setShowAdmin(true);
        setShowOrders(false);
        setShowProfile(false);
        setShowCheckout(false);
        setShowBookTable(false);
        setShowAllFood(false);
        setAuthMode(null);
        setShowFooter(false);
      }
    };

    checkAdminRoute();
    window.addEventListener("hashchange", checkAdminRoute);
    window.addEventListener("popstate", checkAdminRoute);
    return () => {
      window.removeEventListener("hashchange", checkAdminRoute);
      window.removeEventListener("popstate", checkAdminRoute);
    };
  }, []);

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
      setShowAdmin(false);
      setShowProfile(false);
      setShowCheckout(false);
      setShowBookTable(false);
      setShowAllFood(false);
      setActiveTab("orders");
      setShowFooter(true);
    } else {
      setShowProfile(true);
      setShowAdmin(false);
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
      setShowAdmin(false);
      setShowProfile(false);
      setShowCheckout(false);
      setShowBookTable(false);
      setShowAllFood(false);
      setActiveTab("orders");
      setShowFooter(true);
    } else {
      setShowProfile(true);
      setShowAdmin(false);
      setActiveTab("profile");
      setShowFooter(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOrders([]);
    setShowProfile(false);
    setShowOrders(false);
    setShowAdmin(false);
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

    if (id === "admin") {
      setShowAdmin(true);
      setShowOrders(false);
      setShowProfile(false);
      setShowCheckout(false);
      setShowBookTable(false);
      setShowAllFood(false);
      setAuthMode(null);
      setShowFooter(false);
      return;
    }

    setShowAdmin(false);

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
    setShowAdmin(false);
    setShowCheckout(true);
    setShowFooter(false);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
    setShowFooter(true);
  };

  const handlePlaceOrder = async (newOrder, whatsappURL) => {
    const mobile = currentUser?.mobile || newOrder.customer?.mobile;

    const orderWithMobile = {
      ...newOrder,
      userMobile: mobile,
    };

    // 1. Send Order to Central Backend Database/API (await request & use keepalive to prevent mobile OS cancellation)
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderWithMobile),
        keepalive: true,
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Order successfully saved to central backend:", data);
      } else {
        console.warn("Backend order sync returned status:", res.status);
      }
    } catch (err) {
      console.warn("Backend order sync error:", err);
    }

    // 2. Save to global local list
    let allOrders = [];
    try {
      const savedAll = localStorage.getItem("madhuram_orders");
      allOrders = savedAll ? JSON.parse(savedAll) : [];
    } catch {
      allOrders = [];
    }
    const updatedAll = [
      orderWithMobile,
      ...allOrders.filter((o) => o.id !== orderWithMobile.id),
    ];
    try {
      localStorage.setItem("madhuram_orders", JSON.stringify(updatedAll));
    } catch (e) {
      console.error(e);
    }

    // 3. Save to user-specific list if mobile exists
    if (mobile) {
      let userOrders = [];
      try {
        const savedUser = localStorage.getItem(`madhuram_orders_${mobile}`);
        userOrders = savedUser ? JSON.parse(savedUser) : [];
      } catch {
        userOrders = [];
      }
      const updatedUser = [
        orderWithMobile,
        ...userOrders.filter((o) => o.id !== orderWithMobile.id),
      ];
      try {
        localStorage.setItem(
          `madhuram_orders_${mobile}`,
          JSON.stringify(updatedUser)
        );
      } catch (e) {
        console.error(e);
      }
    }

    // Ensure user is created and permanently logged in if guest checkout
    let activeUser = currentUser;
    if (!activeUser && newOrder.customer) {
      activeUser = {
        fullName: newOrder.customer.fullName || "Valued Customer",
        mobile: newOrder.customer.mobile,
      };
      setCurrentUser(activeUser);
      try {
        localStorage.setItem("madhuram_user", JSON.stringify(activeUser));
      } catch (e) {
        console.error(e);
      }
    }

    // Update state
    setOrders(getOrdersForUser(activeUser));

    // Reset cart
    setCartItems([]);

    // Open WhatsApp URL after network request completes
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
    setShowAdmin(false);
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
    if (couponApplied) {
      setCouponApplied(false);
      setCouponCode("");
      setCouponMessage("");
      return;
    }

    const trimmed = couponCode.trim().toLowerCase();
    if (!trimmed) {
      setCouponApplied(false);
      setCouponMessage("Please enter a coupon code.");
      return;
    }

    const validCodes = ["same", "madhuram", "welcome", "off20", "discount", "same20", "madhuram20"];
    if (validCodes.includes(trimmed) || trimmed.length >= 3) {
      setCouponApplied(true);
      setCouponMessage("🎉 Coupon Applied! 20% Discount Unlocked.");
    } else {
      setCouponApplied(false);
      setCouponMessage("❌ Invalid Coupon Code.");
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
            !showOrders &&
            !showAdmin && (
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

          {/* ADMIN PANEL */}
          {showAdmin && (
            <AdminPanel
              onBackHome={() => {
                if (window.location.hash.toLowerCase() === "#admin") {
                  window.location.hash = "";
                }
                setShowAdmin(false);
                setActiveTab("home");
                setShowFooter(true);
              }}
              onOrdersUpdated={() => {
                setOrders(getOrdersForUser(currentUser));
              }}
            />
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
              currentUser={currentUser}
            />
          )}

          {/* BOOK A TABLE */}
          {showBookTable && (
            <BookTable
              onBack={handleBackFromBookTable}
              cartItems={cartItems}
            />
          )}

          {/* Real-time User Order Confirmed Toast Notification */}
          {userToastNotif && (
            <div
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                zIndex: 9999,
                background: "linear-gradient(135deg, #1e293b, #0f172a)",
                color: "#ffffff",
                border: "2px solid #22c55e",
                borderRadius: "16px",
                padding: "16px 20px",
                boxShadow: "0 12px 35px rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                maxWidth: "380px",
              }}
            >
              <div style={{ fontSize: "32px" }}>🎉</div>
              <div>
                <strong style={{ fontSize: "15px", color: "#4ade80", display: "block" }}>
                  {userToastNotif.title || "Order Confirmed!"}
                </strong>
                <p style={{ margin: "4px 0 10px 0", fontSize: "13px", color: "#e2e8f0", lineHeight: "1.4" }}>
                  {userToastNotif.message}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserToastNotif(null);
                      handleNavigate("orders");
                    }}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    View Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserToastNotif(null)}
                    style={{
                      background: "transparent",
                      color: "#94a3b8",
                      border: "1px solid #475569",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <Footer
            visible={
              !authMode &&
              !showCheckout &&
              !showProfile &&
              !showBookTable &&
              !showAdmin &&
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
