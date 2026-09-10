import { useState, useEffect, useRef } from "react";
import {
  FaLock,
  FaUserShield,
  FaShoppingBag,
  FaUsers,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaSignOutAlt,
  FaArrowLeft,
  FaSearch,
  FaTrash,
  FaTicketAlt,
  FaPlus,
  FaGift,
  FaWhatsapp,
  FaVolumeUp,
  FaVolumeMute,
  FaBell,
} from "react-icons/fa";
import { ADMIN_CREDENTIALS } from "../../config/adminConfig";
import { API_BASE_URL } from "../../config/api";
import buzzerAudio from "../../assets/buzzer.mp3";
import "./AdminPanel.css";

const filterDeletedOrders = (orders) => {
  if (!Array.isArray(orders)) return [];

  if (localStorage.getItem("madhuram_all_orders_deleted") === "true") {
    const deletedTimestamp = Number(localStorage.getItem("madhuram_all_deleted_timestamp") || 0);
    return orders.filter((o) => {
      const orderTime = Number(o.createdAtTimestamp || o.timestamp || o.id || 0);
      return orderTime > deletedTimestamp;
    });
  }

  let deletedIds = new Set();
  try {
    const rawIds = localStorage.getItem("madhuram_deleted_order_ids");
    if (rawIds) {
      const parsed = JSON.parse(rawIds);
      if (Array.isArray(parsed)) {
        deletedIds = new Set(parsed.map(String));
      }
    }
  } catch {}

  if (deletedIds.size === 0) return orders;

  return orders.filter(
    (o) => !deletedIds.has(String(o.id)) && !deletedIds.has(String(o.orderId))
  );
};

const getWhatsAppLinks = (order) => {
  if (!order) return { clientUrl: "#", customerUrl: null, message: "" };

  const itemsFormatted = Array.isArray(order.items)
    ? order.items.map((it) => `• ${it.name} x ${it.qty} (₹${it.price * it.qty})`).join("\n")
    : "No items";

  const message = `🍽 *MADHURAM CAFE - ORDER CONFIRMED!*

🆔 *Order ID:* #${order.id || order.orderId}
📅 *Date:* ${order.date || ""}

👤 *Customer Details:*
• Name: ${order.customer?.fullName || "Guest Customer"}
• Mobile: ${order.customer?.mobile || order.userMobile || "N/A"}

📍 *Delivery Address:*
${order.address || "N/A"}

🛒 *Order Items:*
${itemsFormatted}

--------------------------------
💰 *Grand Total:* ₹${order.total || 0}
💳 *Payment:* ${order.payment || "Cash on Delivery"}${order.transactionId ? ` (Txn: ${order.transactionId})` : ""}
--------------------------------
✨ Order status updated in Admin Panel!`;

  const encoded = encodeURIComponent(message);
  const custMobile = (order.customer?.mobile || order.userMobile || "").replace(/\D/g, "");

  return {
    clientUrl: `https://wa.me/919691634045?text=${encoded}`,
    customerUrl: custMobile ? `https://wa.me/91${custMobile}?text=${encoded}` : null,
    message,
  };
};

function AdminPanel({ onBackHome, onOrdersUpdated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("madhuram_admin_session") === "true";
  });

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "clients" | "vouchers"
  const [orderFilter, setOrderFilter] = useState("all"); // "all" | "pending" | "delivered"
  const [searchTerm, setSearchTerm] = useState("");

  const [ordersList, setOrdersList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [isSoundMuted, setIsSoundMuted] = useState(() => localStorage.getItem("madhuram_admin_muted") === "true");

  const audioRef = useRef(null);

  // Initialize continuous buzzer audio object
  useEffect(() => {
    try {
      const audio = new Audio(buzzerAudio);
      audio.loop = true; // Continuous playing until admin confirms order
      audioRef.current = audio;
    } catch (e) {
      console.warn("Failed to initialize audio:", e);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const playOrderBuzzerSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(buzzerAudio);
        audioRef.current.loop = true;
      }
      audioRef.current.loop = true;
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay blocked by browser. User interaction needed:", err);
        });
      }
    } catch (err) {
      console.warn("Buzzer audio play error:", err);
    }
  };

  const stopBuzzerSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (err) {}
  };

  const toggleSound = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      localStorage.setItem("madhuram_admin_muted", String(next));
      if (!next && newOrderAlert) {
        playOrderBuzzerSound();
      } else {
        stopBuzzerSound();
      }
      return next;
    });
  };

  const [newCouponForm, setNewCouponForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "200",
    targetType: "ALL",
    targetMobile: "",
    description: "",
  });
  const [couponCreating, setCouponCreating] = useState(false);

  // Load data from central API & localStorage fallback
  const loadData = async () => {
    let apiSuccess = false;
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          apiSuccess = true;
          const validOrders = filterDeletedOrders(data.orders);
          setOrdersList(validOrders);
          try {
            localStorage.setItem("madhuram_orders", JSON.stringify(validOrders));
          } catch {}
        }
      }
    } catch {}

    if (!apiSuccess) {
      try {
        const rawOrders = localStorage.getItem("madhuram_orders");
        const parsed = rawOrders ? JSON.parse(rawOrders) : [];
        setOrdersList(filterDeletedOrders(parsed));
      } catch {
        setOrdersList([]);
      }
    }

    try {
      const userRes = await fetch(`${API_BASE_URL}/api/auth/users`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success && Array.isArray(userData.users)) {
          setClientsList(userData.users);
          try {
            localStorage.setItem("madhuram_registered_users", JSON.stringify(userData.users));
          } catch {}
        } else {
          const rawClients = localStorage.getItem("madhuram_registered_users");
          setClientsList(rawClients ? JSON.parse(rawClients) : []);
        }
      } else {
        const rawClients = localStorage.getItem("madhuram_registered_users");
        setClientsList(rawClients ? JSON.parse(rawClients) : []);
      }
    } catch {
      try {
        const rawClients = localStorage.getItem("madhuram_registered_users");
        setClientsList(rawClients ? JSON.parse(rawClients) : []);
      } catch {
        setClientsList([]);
      }
    }

    // Load Coupons
    try {
      const coupRes = await fetch(`${API_BASE_URL}/api/coupons`);
      if (coupRes.ok) {
        const coupData = await coupRes.json();
        if (coupData.success && Array.isArray(coupData.coupons)) {
          setCouponsList(coupData.coupons);
          try {
            localStorage.setItem("madhuram_coupons", JSON.stringify(coupData.coupons));
          } catch {}
        }
      }
    } catch {
      try {
        const raw = localStorage.getItem("madhuram_coupons");
        setCouponsList(raw ? JSON.parse(raw) : []);
      } catch {
        setCouponsList([]);
      }
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponForm.code || !newCouponForm.discountValue) {
      alert("Please enter Coupon Code and Discount Value.");
      return;
    }

    setCouponCreating(true);

    const targetUser =
      newCouponForm.targetType === "ALL" ? "ALL" : newCouponForm.targetMobile.trim();

    const payload = {
      code: newCouponForm.code.trim().toUpperCase(),
      discountType: newCouponForm.discountType,
      discountValue: Number(newCouponForm.discountValue),
      minOrderAmount: Number(newCouponForm.minOrderAmount || 0),
      targetUser: targetUser || "ALL",
      description:
        newCouponForm.description.trim() ||
        `${newCouponForm.discountType === "fixed" ? "₹" + newCouponForm.discountValue : newCouponForm.discountValue + "%"} Off Discount Coupon`,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        const updatedList = data.coupons || [payload, ...couponsList];
        setCouponsList(updatedList);
        try {
          localStorage.setItem("madhuram_coupons", JSON.stringify(updatedList));
        } catch {}
        alert(`🎉 Coupon '${payload.code}' issued successfully for ${targetUser === "ALL" ? "ALL users" : "User " + targetUser}!`);
        setNewCouponForm({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "200",
          targetType: "ALL",
          targetMobile: "",
          description: "",
        });
      } else {
        alert(data.message || "Failed to create coupon.");
      }
    } catch (err) {
      console.error("Coupon creation error:", err);
      const fallbackCoupon = {
        id: `coup_${Date.now()}`,
        ...payload,
        active: true,
        createdAt: new Date().toISOString(),
      };
      const updated = [fallbackCoupon, ...couponsList];
      setCouponsList(updated);
      try {
        localStorage.setItem("madhuram_coupons", JSON.stringify(updated));
      } catch {}
      alert(`🎉 Coupon '${payload.code}' issued!`);
    } finally {
      setCouponCreating(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    const confirmDel = window.confirm("Are you sure you want to delete this voucher?");
    if (!confirmDel) return;

    try {
      await fetch(`${API_BASE_URL}/api/coupons/${couponId}`, {
        method: "DELETE",
      });
    } catch {}

    const updated = couponsList.filter((c) => c.id !== couponId && c.code !== couponId);
    setCouponsList(updated);
    try {
      localStorage.setItem("madhuram_coupons", JSON.stringify(updated));
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Real-time listener for incoming new orders across all devices
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkNewOrders = async () => {
      try {
        let currentOrders = null;
        try {
          const res = await fetch(`${API_BASE_URL}/api/orders`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
              currentOrders = filterDeletedOrders(data.orders);
            }
          }
        } catch {}

        if (currentOrders === null) {
          const rawOrders = localStorage.getItem("madhuram_orders");
          const parsed = rawOrders ? JSON.parse(rawOrders) : [];
          currentOrders = filterDeletedOrders(parsed);
        }

        setOrdersList((prevList) => {
          const prevPending = prevList.filter((o) => o.status === "Pending").length;
          const currentPending = currentOrders.filter((o) => o.status === "Pending").length;

          if (currentOrders.length > prevList.length || currentPending > prevPending) {
            const latestPending = currentOrders.find((o) => o.status === "Pending");
            if (latestPending && String(latestPending.id) !== String(newOrderAlert?.id)) {
              setNewOrderAlert(latestPending);
              if (!isSoundMuted) playOrderBuzzerSound();
            }
          }
          return currentOrders;
        });
      } catch (err) {
        console.error(err);
      }
    };

    const handleStorageChange = (e) => {
      if (!e.key || e.key === "madhuram_orders") {
        checkNewOrders();
      }
    };

    const handleNewOrderEvent = (e) => {
      if (e.detail) {
        setNewOrderAlert(e.detail);
        if (!isSoundMuted) playOrderBuzzerSound();
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("madhuram_new_order", handleNewOrderEvent);
    const interval = setInterval(checkNewOrders, 3000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("madhuram_new_order", handleNewOrderEvent);
      clearInterval(interval);
    };
  }, [isAuthenticated, newOrderAlert, isSoundMuted]);

  // Continuous audio buzzer loop until admin confirms the order
  useEffect(() => {
    if (newOrderAlert && !isSoundMuted) {
      playOrderBuzzerSound();
    } else {
      stopBuzzerSound();
    }
  }, [newOrderAlert, isSoundMuted]);

  // Handle Admin Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (
      loginForm.username === ADMIN_CREDENTIALS.username &&
      loginForm.password === ADMIN_CREDENTIALS.password
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem("madhuram_admin_session", "true");
      setLoginError("");
      loadData();
    } else {
      setLoginError("Invalid User ID or Password. Please try again.");
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("madhuram_admin_session");
  };

  // Confirm/Accept Order (Stops continuous buzzer audio & updates status to Confirmed)
  const handleAcceptOrder = async (orderId) => {
    try {
      stopBuzzerSound();

      // 1. Update central backend API
      fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Confirmed",
          deliveryMessage: "Order Confirmed by Admin! Food is being prepared.",
        }),
      }).catch((err) => console.warn("Backend status sync warning:", err));

      // 2. Update local storage & state
      const rawOrders = localStorage.getItem("madhuram_orders");
      const allOrders = rawOrders ? JSON.parse(rawOrders) : [];
      const targetOrder = allOrders.find((o) => String(o.id) === String(orderId) || String(o.orderId) === String(orderId));

      const updatedAllOrders = allOrders.map((o) =>
        String(o.id) === String(orderId) || String(o.orderId) === String(orderId)
          ? { ...o, status: "Confirmed", deliveryMessage: "Order Confirmed by Admin! Food is being prepared." }
          : o
      );
      localStorage.setItem("madhuram_orders", JSON.stringify(updatedAllOrders));
      setOrdersList(updatedAllOrders);

      // Update user specific orders list if mobile is available
      const mobile = targetOrder?.userMobile || targetOrder?.customer?.mobile;
      if (mobile) {
        const rawUserOrders = localStorage.getItem(`madhuram_orders_${mobile}`);
        if (rawUserOrders) {
          const userOrders = JSON.parse(rawUserOrders);
          const updatedUserOrders = userOrders.map((o) =>
            String(o.id) === String(orderId) || String(o.orderId) === String(orderId)
              ? { ...o, status: "Confirmed", deliveryMessage: "Order Confirmed by Admin! Food is being prepared." }
              : o
          );
          localStorage.setItem(`madhuram_orders_${mobile}`, JSON.stringify(updatedUserOrders));
        }
      }

      if (newOrderAlert && (String(newOrderAlert.id) === String(orderId) || String(newOrderAlert.orderId) === String(orderId))) {
        setNewOrderAlert(null);
      }

      onOrdersUpdated && onOrdersUpdated();
    } catch (err) {
      console.error("Error confirming order:", err);
    }
  };



  // Mark Order as Delivered
  const handleConfirmDelivery = async (orderId) => {
    try {
      // 1. Update central backend database/API
      fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Delivered",
          deliveryMessage: "Order Delivered Successfully!",
        }),
      }).catch((err) => console.warn("Backend status sync warning:", err));

      // Update global orders list
      const rawOrders = localStorage.getItem("madhuram_orders");
      const allOrders = rawOrders ? JSON.parse(rawOrders) : [];

      const targetOrder = allOrders.find((o) => o.id === orderId);

      const updatedAllOrders = allOrders.map((o) =>
        o.id === orderId ? { ...o, status: "Delivered" } : o
      );

      localStorage.setItem("madhuram_orders", JSON.stringify(updatedAllOrders));
      setOrdersList(updatedAllOrders);

      // Update user specific orders list if mobile is available
      const mobile = targetOrder?.userMobile || targetOrder?.customer?.mobile;
      if (mobile) {
        const rawUserOrders = localStorage.getItem(`madhuram_orders_${mobile}`);
        if (rawUserOrders) {
          const userOrders = JSON.parse(rawUserOrders);
          const updatedUserOrders = userOrders.map((o) =>
            o.id === orderId ? { ...o, status: "Delivered" } : o
          );
          localStorage.setItem(
            `madhuram_orders_${mobile}`,
            JSON.stringify(updatedUserOrders)
          );
        }
      }

      if (newOrderAlert?.id === orderId) {
        setNewOrderAlert(null);
      }

      onOrdersUpdated && onOrdersUpdated();
    } catch (err) {
      console.error("Error confirming delivery:", err);
    }
  };

  // Delete Single Order
  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete Order #${orderId}?`);
    if (!confirmDelete) return;

    const orderIdStr = String(orderId).trim();

    try {
      // 1. Delete from central backend API
      await fetch(`${API_BASE_URL}/api/orders/${orderIdStr}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Backend order delete warning:", err));

      // 2. Remove from local storage orders list
      const rawOrders = localStorage.getItem("madhuram_orders");
      const allOrders = rawOrders ? JSON.parse(rawOrders) : [];
      const targetOrder = allOrders.find(
        (o) => String(o.id) === orderIdStr || String(o.orderId) === orderIdStr
      );

      const updatedAllOrders = allOrders.filter(
        (o) => String(o.id) !== orderIdStr && String(o.orderId) !== orderIdStr
      );

      localStorage.setItem("madhuram_orders", JSON.stringify(updatedAllOrders));
      setOrdersList(updatedAllOrders);

      // 3. Remove from user specific orders list if mobile exists
      const mobile = targetOrder?.userMobile || targetOrder?.customer?.mobile;
      if (mobile) {
        const rawUserOrders = localStorage.getItem(`madhuram_orders_${mobile}`);
        if (rawUserOrders) {
          const userOrders = JSON.parse(rawUserOrders);
          const updatedUserOrders = userOrders.filter(
            (o) => String(o.id) !== orderIdStr && String(o.orderId) !== orderIdStr
          );
          localStorage.setItem(
            `madhuram_orders_${mobile}`,
            JSON.stringify(updatedUserOrders)
          );
        }
      }

      if (newOrderAlert && (String(newOrderAlert.id) === orderIdStr || String(newOrderAlert.orderId) === orderIdStr)) {
        setNewOrderAlert(null);
      }

      onOrdersUpdated && onOrdersUpdated();
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  // Delete All Orders
  const handleDeleteAllOrders = async () => {
    if (ordersList.length === 0) return;
    const confirmDeleteAll = window.confirm("⚠️ Are you sure you want to DELETE ALL ORDERS? This action cannot be undone!");
    if (!confirmDeleteAll) return;

    try {
      // 1. Delete all from central backend API
      await fetch(`${API_BASE_URL}/api/orders`, {
        method: "DELETE",
      }).catch((err) => console.warn("Backend clear orders warning:", err));

      // 2. Set deletion flags & clear global orders list in localStorage
      localStorage.setItem("madhuram_all_orders_deleted", "true");
      localStorage.setItem("madhuram_all_deleted_timestamp", String(Date.now()));
      localStorage.setItem("madhuram_orders", JSON.stringify([]));
      setOrdersList([]);

      // 3. Clear user specific order keys in localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("madhuram_orders_") || key.includes("deleted_order"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // 4. Dispatch custom event for real-time UI updates across all components
      try {
        window.dispatchEvent(new CustomEvent("madhuram_all_orders_deleted"));
      } catch (e) {}

      setNewOrderAlert(null);
      onOrdersUpdated && onOrdersUpdated();
    } catch (err) {
      console.error("Error deleting all orders:", err);
    }
  };

  // Calculations
  const totalOrders = ordersList.length;
  const deliveredOrders = ordersList.filter((o) => o.status === "Delivered").length;
  const pendingOrders = totalOrders - deliveredOrders;
  const totalClients = clientsList.length;
  const totalRevenue = ordersList.reduce(
    (sum, o) => sum + (Number(o.total) || 0),
    0
  );

  // Filtered orders
  const filteredOrders = ordersList.filter((order) => {
    const matchesFilter =
      orderFilter === "all"
        ? true
        : orderFilter === "delivered"
        ? order.status === "Delivered"
        : order.status !== "Delivered";

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      order.id?.toString().toLowerCase().includes(searchLower) ||
      order.customer?.fullName?.toLowerCase().includes(searchLower) ||
      order.customer?.mobile?.toLowerCase().includes(searchLower) ||
      order.address?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  // Filtered clients
  const filteredClients = clientsList.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      !searchTerm ||
      client.fullName?.toLowerCase().includes(searchLower) ||
      client.mobile?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower)
    );
  });

  // Render Admin Login Form
  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <div className="admin-card-header">
            <div className="admin-icon-circle">
              <FaUserShield />
            </div>
            <h2>Admin Login</h2>
            <p>Enter User ID & Password to access the Admin Panel</p>
          </div>

          {loginError && <div className="admin-error-alert">{loginError}</div>}

          <form onSubmit={handleLoginSubmit}>
            <div className="admin-form-group">
              <label>Admin User ID</label>
              <div className="input-with-icon">
                <FaUserShield className="field-icon" />
                <input
                  type="text"
                  placeholder="Enter User ID"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <FaLock className="field-icon" />
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button type="submit" className="admin-submit-btn">
              Login to Admin Panel
            </button>

            <button
              type="button"
              className="admin-back-btn"
              onClick={onBackHome}
            >
              <FaArrowLeft /> Back to Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className="admin-dashboard-page">
      {/* Top Header */}
      <header className="admin-top-header">
        <div className="admin-brand">
          <div className="admin-badge">
            <FaUserShield /> ADMIN PANEL
          </div>
          <h2>Madhuram Cafe Dashboard</h2>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-nav-action-btn"
            onClick={playOrderBuzzerSound}
            title="Click to test order alert buzzer sound"
            style={{ background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", border: "1px solid #f59e0b", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FaBell /> Test Buzzer 🔊
          </button>

          <button
            type="button"
            className="admin-nav-action-btn"
            onClick={toggleSound}
            title={isSoundMuted ? "Click to turn ON order buzzer sound" : "Click to Mute order buzzer sound"}
            style={{
              background: isSoundMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
              color: isSoundMuted ? "#f87171" : "#4ade80",
              border: isSoundMuted ? "1px solid #f87171" : "1px solid #4ade80",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isSoundMuted ? <><FaVolumeMute /> Buzzer OFF</> : <><FaVolumeUp /> Buzzer ON</>}
          </button>

          <button
            type="button"
            className="admin-nav-action-btn"
            onClick={onBackHome}
          >
            <FaArrowLeft /> Back to Website
          </button>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <div className="admin-content-container">
        {/* Real-time New Order Notification Banner */}
        {newOrderAlert && (
          <div className="new-order-alert-banner">
            <div className="alert-text">
              <span className="alert-pulse">🔔 🔊</span>
              <div>
                <strong style={{ fontSize: "16px", color: "#f59e0b" }}>🔔 BUZZER ALERT: New Order Received! Order #{newOrderAlert.id}</strong>
                <p>
                  Customer: {newOrderAlert.customer?.fullName || "Valued Customer"} (
                  {newOrderAlert.customer?.mobile || "No Mobile"}) — Total: ₹
                  {newOrderAlert.total}
                </p>
              </div>
            </div>
            <div className="alert-actions" style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="confirm-order-alert-btn"
                onClick={() => handleAcceptOrder(newOrderAlert.id)}
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontWeight: "800",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  boxShadow: "0 0 10px rgba(34, 197, 94, 0.4)",
                }}
              >
                <FaCheckCircle /> Confirm Order (Stop Buzzer)
              </button>
              <a
                href={getWhatsAppLinks(newOrderAlert).clientUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#25D366",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FaWhatsapp /> Send WhatsApp Alert
              </a>
              <button
                type="button"
                className="dismiss-alert-btn"
                onClick={() => {
                  setNewOrderAlert(null);
                  stopBuzzerSound();
                }}
              >
                Dismiss / Stop Sound
              </button>
            </div>

          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="metrics-grid">
          <div className="metric-card revenue">
            <div className="metric-icon">
              <FaRupeeSign />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Revenue</span>
              <h3 className="metric-value">₹{totalRevenue}</h3>
            </div>
          </div>

          <div className="metric-card orders">
            <div className="metric-icon">
              <FaShoppingBag />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Orders</span>
              <h3 className="metric-value">{totalOrders}</h3>
            </div>
          </div>

          <div className="metric-card delivered">
            <div className="metric-icon">
              <FaCheckCircle />
            </div>
            <div className="metric-info">
              <span className="metric-label">Delivered Orders</span>
              <h3 className="metric-value">{deliveredOrders}</h3>
            </div>
          </div>

          <div className="metric-card clients">
            <div className="metric-icon">
              <FaUsers />
            </div>
            <div className="metric-info">
              <span className="metric-label">Registered Clients</span>
              <h3 className="metric-value">{totalClients}</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <FaShoppingBag /> Orders Management ({totalOrders})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "clients" ? "active" : ""}`}
            onClick={() => setActiveTab("clients")}
          >
            <FaUsers /> Registered Clients ({totalClients})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "vouchers" ? "active" : ""}`}
            onClick={() => setActiveTab("vouchers")}
          >
            <FaTicketAlt /> Vouchers & Coupons ({couponsList.length})
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="admin-toolbar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={
                activeTab === "clients"
                  ? "Search clients by name, mobile, email..."
                  : "Search orders by ID, name, mobile, address..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === "dashboard" && (
            <div className="filter-pills-container">
              <div className="filter-pills">
                <button
                  type="button"
                  className={`filter-pill ${orderFilter === "all" ? "active" : ""}`}
                  onClick={() => setOrderFilter("all")}
                >
                  All Orders ({totalOrders})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${orderFilter === "pending" ? "active" : ""}`}
                  onClick={() => setOrderFilter("pending")}
                >
                  Preparing ({pendingOrders})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${orderFilter === "delivered" ? "active" : ""}`}
                  onClick={() => setOrderFilter("delivered")}
                >
                  Delivered ({deliveredOrders})
                </button>
              </div>

              {totalOrders > 0 && (
                <button
                  type="button"
                  className="delete-all-orders-btn"
                  onClick={handleDeleteAllOrders}
                >
                  <FaTrash /> Delete All Orders
                </button>
              )}
            </div>
          )}
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === "dashboard" && (
          <div className="orders-management-section">
            {filteredOrders.length === 0 ? (
              <div className="empty-admin-card">
                <FaShoppingBag className="empty-icon" />
                <h3>No Orders Found</h3>
                <p>No orders match the selected filter or search term.</p>
              </div>
            ) : (
              <div className="admin-orders-list">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === "Delivered";
                  const isConfirmed = order.status === "Confirmed";
                  const isPending = !isDelivered && !isConfirmed;

                  return (
                    <div
                      className={`admin-order-card ${
                        isDelivered
                          ? "is-delivered"
                          : isConfirmed
                          ? "is-confirmed"
                          : "is-pending"
                      }`}
                      key={order.id}
                    >
                      <div className="admin-order-header">
                        <div>
                          <span className="admin-order-id">
                            Order #{order.id}
                          </span>
                          <span className="admin-order-date">
                            {order.date}
                          </span>
                        </div>

                        <span
                          className={`admin-status-badge ${
                            isDelivered
                              ? "status-delivered"
                              : isConfirmed
                              ? "status-confirmed"
                              : "status-pending"
                          }`}
                        >
                          {isDelivered ? (
                            <>
                              <FaCheckCircle /> Delivered
                            </>
                          ) : isConfirmed ? (
                            <>
                              <FaCheckCircle /> Confirmed - Food Preparing
                            </>
                          ) : (
                            <>
                              <FaClock /> Pending Admin Confirmation
                            </>
                          )}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="customer-info-box">
                        <div className="info-row">
                          <span className="info-label">Customer:</span>
                          <strong className="info-val">
                            {order.customer?.fullName || "Guest Customer"}
                          </strong>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Mobile:</span>
                          <span className="info-val">
                            📞 {order.customer?.mobile || "—"}
                          </span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Address:</span>
                          <span className="info-val">{order.address}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Payment:</span>
                          <span className="info-val">
                            {order.payment || "Cash on Delivery"}
                            {order.transactionId ? ` (UTR: ${order.transactionId})` : ""}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="items-summary-box">
                        <span className="summary-title">Items Ordered:</span>
                        <div className="items-tags">
                          {order.items &&
                            order.items.map((item, idx) => (
                              <span className="item-tag" key={idx}>
                                {item.name} × {item.qty} (₹
                                {item.price * item.qty})
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* WhatsApp Notifications */}
                      <div className="whatsapp-actions-box" style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed rgba(255,255,255,0.1)", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#25D366", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px", width: "100%" }}>
                          <FaWhatsapp /> Send WhatsApp Order Alert:
                        </span>
                        <a
                          href={getWhatsAppLinks(order).clientUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "rgba(37, 211, 102, 0.15)",
                            color: "#25D366",
                            border: "1px solid #25D366",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                          title="Send order details to 9691634045"
                        >
                          <FaWhatsapp /> Send WhatsApp Alert
                        </a>
                        {getWhatsAppLinks(order).customerUrl && (
                          <a
                            href={getWhatsAppLinks(order).customerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: "rgba(59, 130, 246, 0.15)",
                              color: "#60a5fa",
                              border: "1px solid #60a5fa",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                            title={`Send confirmation to customer (${order.customer?.mobile || order.userMobile})`}
                          >
                            <FaWhatsapp /> Customer ({order.customer?.mobile || order.userMobile})
                          </a>
                        )}
                      </div>

                      {/* Card Footer & Action */}
                      <div className="admin-order-footer">
                        <div className="amount-display">
                          <span>Total Amount</span>
                          <strong>₹{order.total}</strong>
                        </div>

                        <div className="admin-actions-group">
                          {isPending && (
                            <button
                              type="button"
                              className="confirm-delivery-btn"
                              onClick={() => handleAcceptOrder(order.id)}
                              style={{ background: "#22c55e", color: "#fff" }}
                            >
                              <FaCheckCircle /> Confirm Order
                            </button>
                          )}

                          {isConfirmed && (
                            <button
                              type="button"
                              className="confirm-delivery-btn"
                              onClick={() => handleConfirmDelivery(order.id)}
                            >
                              <FaCheckCircle /> Mark as Delivered
                            </button>
                          )}

                          {isDelivered && (
                            <div className="delivered-confirmed-tag">
                              <FaCheckCircle /> Delivery Confirmed
                            </div>
                          )}

                          <button
                            type="button"
                            className="delete-single-order-btn"
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Delete Order"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REGISTERED CLIENTS */}
        {activeTab === "clients" && (
          <div className="clients-management-section">
            {filteredClients.length === 0 ? (
              <div className="empty-admin-card">
                <FaUsers className="empty-icon" />
                <h3>No Registered Clients</h3>
                <p>No registered client accounts found in system.</p>
              </div>
            ) : (
              <div className="clients-grid">
                {filteredClients.map((client, index) => {
                  const clientOrdersCount = ordersList.filter(
                    (o) =>
                      o.customer?.mobile === client.mobile ||
                      o.userMobile === client.mobile
                  ).length;

                  return (
                    <div className="client-card" key={index}>
                      <div className="client-avatar">👤</div>
                      <div className="client-details">
                        <h4>{client.fullName || "Valued Client"}</h4>
                        <p className="client-mobile">📞 {client.mobile}</p>
                        {client.email && (
                          <p className="client-email">✉️ {client.email}</p>
                        )}
                        <span className="client-orders-badge">
                          📦 {clientOrdersCount} Orders Placed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* TAB 3: VOUCHERS & COUPONS MANAGEMENT */}
        {activeTab === "vouchers" && (
          <div className="vouchers-management-section" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Create Coupon Form Card */}
            <div className="admin-order-card" style={{ textAlign: "left" }}>
              <h3 style={{ margin: "0 0 6px 0", color: "#d4a762", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaTicketAlt /> Create & Issue Voucher / Coupon
              </h3>
              <p style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 20px 0" }}>
                Issue discount coupons for <strong>ALL Users</strong> or target a <strong>Specific Registered Client</strong>.
              </p>

              <form onSubmit={handleCreateCoupon} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#d4a762", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME50, SUMMER20"
                      value={newCouponForm.code}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "#1c1c21", color: "#fff" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#d4a762", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      Discount Type
                    </label>
                    <select
                      value={newCouponForm.discountType}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, discountType: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "#1c1c21", color: "#fff" }}
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="fixed">Fixed Amount Discount (₹)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#d4a762", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      Discount Value ({newCouponForm.discountType === "fixed" ? "₹" : "%"}) *
                    </label>
                    <input
                      type="number"
                      placeholder={newCouponForm.discountType === "fixed" ? "e.g. 50 (for ₹50 OFF)" : "e.g. 20 (for 20% OFF)"}
                      value={newCouponForm.discountValue}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, discountValue: e.target.value })}
                      required
                      min="1"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "#1c1c21", color: "#fff" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", color: "#d4a762", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                      Min Order Value (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      value={newCouponForm.minOrderAmount}
                      onChange={(e) => setNewCouponForm({ ...newCouponForm, minOrderAmount: e.target.value })}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "#1c1c21", color: "#fff" }}
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label style={{ fontSize: "12px", color: "#d4a762", fontWeight: "700", display: "block", marginBottom: "6px" }}>
                    Target Audience (Who can use this coupon?)
                  </label>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                      <input
                        type="radio"
                        name="targetType"
                        value="ALL"
                        checked={newCouponForm.targetType === "ALL"}
                        onChange={() => setNewCouponForm({ ...newCouponForm, targetType: "ALL" })}
                      />
                      🌐 All Users (Public Coupon)
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", color: "#fff", fontSize: "13px" }}>
                      <input
                        type="radio"
                        name="targetType"
                        value="SPECIFIC"
                        checked={newCouponForm.targetType === "SPECIFIC"}
                        onChange={() => setNewCouponForm({ ...newCouponForm, targetType: "SPECIFIC" })}
                      />
                      👤 Specific Registered User
                    </label>
                  </div>

                  {newCouponForm.targetType === "SPECIFIC" && (
                    <div style={{ marginTop: "8px" }}>
                      <input
                        type="tel"
                        placeholder="Enter Target User Mobile (e.g. 7000623626)"
                        value={newCouponForm.targetMobile}
                        onChange={(e) => setNewCouponForm({ ...newCouponForm, targetMobile: e.target.value })}
                        required
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d4a762", background: "#1c1c21", color: "#fff" }}
                      />
                      {clientsList.length > 0 && (
                        <div style={{ marginTop: "6px", fontSize: "12px", color: "#a1a1aa" }}>
                          Quick pick from registered clients:{" "}
                          {clientsList.map((cl) => (
                            <button
                              key={cl.mobile}
                              type="button"
                              onClick={() => setNewCouponForm({ ...newCouponForm, targetMobile: cl.mobile })}
                              style={{ background: "rgba(212,167,98,0.2)", color: "#d4a762", border: "none", padding: "2px 6px", borderRadius: "4px", margin: "2px", cursor: "pointer", fontSize: "11px" }}
                            >
                              {cl.fullName || cl.mobile} ({cl.mobile})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "#d4a762", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                    Voucher Description / Banner Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 20% OFF on all delicious meals!"
                    value={newCouponForm.description}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, description: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "#1c1c21", color: "#fff" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={couponCreating}
                  style={{
                    background: "linear-gradient(135deg, #d4a762, #b8860b)",
                    color: "#000",
                    border: "none",
                    padding: "12px",
                    borderRadius: "10px",
                    fontWeight: "800",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <FaPlus /> {couponCreating ? "Creating Voucher..." : "Issue Voucher / Coupon"}
                </button>
              </form>
            </div>

            {/* Issued Coupons List */}
            <div style={{ textAlign: "left" }}>
              <h3 style={{ margin: "0 0 14px 0", color: "#d4a762", fontSize: "16px", letterSpacing: "0.5px" }}>
                ACTIVE ISSUED COUPONS ({couponsList.length})
              </h3>

              {couponsList.length === 0 ? (
                <div className="empty-admin-card">
                  <FaTicketAlt className="empty-icon" />
                  <h3>No Active Vouchers</h3>
                  <p>Use the form above to issue coupons for your users.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {couponsList.map((c) => (
                    <div key={c.id || c.code} className="admin-order-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <code style={{ background: "rgba(212,167,98,0.2)", color: "#d4a762", fontSize: "16px", fontWeight: "800", padding: "4px 10px", borderRadius: "6px" }}>
                            {c.code}
                          </code>
                          <span className="status-badge-pill confirmed">
                            {c.discountType === "fixed" ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#fff", fontWeight: "600" }}>
                          {c.description || "Discount Coupon"}
                        </p>
                        <div style={{ fontSize: "12px", color: "#a1a1aa" }}>
                          <p style={{ margin: "2px 0" }}>
                            🎯 Target: <strong>{c.targetUser === "ALL" ? "🌐 All Users" : `👤 User ${c.targetUser}`}</strong>
                          </p>
                          <p style={{ margin: "2px 0" }}>
                            📦 Min Order: <strong>₹{c.minOrderAmount || 0}</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id || c.code)}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        <FaTrash /> Delete Voucher
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
