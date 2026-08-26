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
} from "react-icons/fa";
import { ADMIN_CREDENTIALS } from "../../config/adminConfig";
import "./AdminPanel.css";

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

  // Load data from localStorage
  const loadData = () => {
    try {
      const rawOrders = localStorage.getItem("madhuram_orders");
      const parsedOrders = rawOrders ? JSON.parse(rawOrders) : [];
      setOrdersList(parsedOrders);
    } catch {
      setOrdersList([]);
    }

    try {
      const rawClients = localStorage.getItem("madhuram_registered_users");
      const parsedClients = rawClients ? JSON.parse(rawClients) : [];
      setClientsList(parsedClients);
    } catch {
      setClientsList([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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

  // Mark Order as Delivered
  const handleConfirmDelivery = (orderId) => {
    try {
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

      onOrdersUpdated && onOrdersUpdated();
    } catch (err) {
      console.error("Error confirming delivery:", err);
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
                  return (
                    <div
                      className={`admin-order-card ${
                        isDelivered ? "is-delivered" : "is-pending"
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
                            isDelivered ? "status-delivered" : "status-pending"
                          }`}
                        >
                          {isDelivered ? (
                            <>
                              <FaCheckCircle /> Delivered
                            </>
                          ) : (
                            <>
                              <FaClock /> Preparing / Out for Delivery
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

                        {!isDelivered ? (
                          <button
                            type="button"
                            className="confirm-delivery-btn"
                            onClick={() => handleConfirmDelivery(order.id)}
                          >
                            <FaCheckCircle /> Mark as Delivered
                          </button>
                        ) : (
                          <div className="delivered-confirmed-tag">
                            <FaCheckCircle /> Delivery Confirmed
                          </div>
                        )}
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
