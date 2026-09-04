import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { ADMIN_CREDENTIALS } from "../../config/adminConfig";
import { API_BASE_URL } from "../../config/api";
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

function AdminPanel({ onBackHome, onOrdersUpdated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("madhuram_admin_session") === "true";
  });

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "orders" | "clients"
  const [orderFilter, setOrderFilter] = useState("all"); // "all" | "pending" | "delivered"
  const [searchTerm, setSearchTerm] = useState("");

  const [ordersList, setOrdersList] = useState([]);
  const [clientsList, setClientsList] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

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
  }, [isAuthenticated, newOrderAlert]);

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

  // Confirm Order (Pending -> Confirmed)
  const handleConfirmOrder = async (orderId) => {
    try {
      // 1. Update central backend database/API
      fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Confirmed",
          deliveryMessage: "Deliver in 15 to 20 minute",
        }),
      }).catch((err) => console.warn("Backend status sync warning:", err));

      const rawOrders = localStorage.getItem("madhuram_orders");
      const allOrders = rawOrders ? JSON.parse(rawOrders) : [];
      const targetOrder = allOrders.find((o) => o.id === orderId);

      const updatedAllOrders = allOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: "Confirmed", deliveryMessage: "Deliver in 15 to 20 minute" }
          : o
      );

      localStorage.setItem("madhuram_orders", JSON.stringify(updatedAllOrders));
      setOrdersList(updatedAllOrders);

      // Update user specific orders list
      const mobile = targetOrder?.userMobile || targetOrder?.customer?.mobile;
      if (mobile) {
        const rawUserOrders = localStorage.getItem(`madhuram_orders_${mobile}`);
        if (rawUserOrders) {
          const userOrders = JSON.parse(rawUserOrders);
          const updatedUserOrders = userOrders.map((o) =>
            o.id === orderId
              ? { ...o, status: "Confirmed", deliveryMessage: "Deliver in 15 to 20 minute" }
              : o
          );
          localStorage.setItem(
            `madhuram_orders_${mobile}`,
            JSON.stringify(updatedUserOrders)
          );
        }

        // Save User Notification
        const userNotifsRaw = localStorage.getItem(`madhuram_notifs_${mobile}`);
        const userNotifs = userNotifsRaw ? JSON.parse(userNotifsRaw) : [];
        const newNotif = {
          id: Date.now().toString(),
          orderId,
          title: "Order Confirmed! 🎉",
          message: `Your Order #${orderId} has been confirmed by Madhuram Cafe! Food is being prepared.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          read: false,
        };
        localStorage.setItem(`madhuram_notifs_${mobile}`, JSON.stringify([newNotif, ...userNotifs]));
      }

      // Dispatch global window event for real-time notification to user
      window.dispatchEvent(
        new CustomEvent("madhuram_order_confirmed", {
          detail: {
            orderId,
            mobile,
            title: "Order Confirmed! 🎉",
            message: `Your Order #${orderId} has been confirmed by Madhuram Cafe!`,
          },
        })
      );

      if (newOrderAlert?.id === orderId) {
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

      // 2. Clear global orders list in localStorage
      localStorage.setItem("madhuram_orders", JSON.stringify([]));
      setOrdersList([]);

      // 3. Clear user specific order keys in localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("madhuram_orders_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

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
              <span className="alert-pulse">🔔</span>
              <div>
                <strong>New Order Received! Order #{newOrderAlert.id}</strong>
                <p>
                  Customer: {newOrderAlert.customer?.fullName || "Valued Customer"} (
                  {newOrderAlert.customer?.mobile || "No Mobile"}) — Total: ₹
                  {newOrderAlert.total}
                </p>
              </div>
            </div>
            <div className="alert-actions">
              <button
                type="button"
                className="confirm-order-btn-fast"
                onClick={() => handleConfirmOrder(newOrderAlert.id)}
              >
                <FaCheckCircle /> Confirm Order Now
              </button>
              <button
                type="button"
                className="dismiss-alert-btn"
                onClick={() => setNewOrderAlert(null)}
              >
                Dismiss
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
                              className="confirm-order-action-btn"
                              onClick={() => handleConfirmOrder(order.id)}
                            >
                              <FaCheckCircle /> Confirm Order
                            </button>
                          )}

                          {!isDelivered && (
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
      </div>
    </div>
  );
}

export default AdminPanel;
