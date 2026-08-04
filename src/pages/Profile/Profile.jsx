import { FaUserCircle } from "react-icons/fa";
import "./profile.css";

function Profile({ user, onLogout, onBackHome }) {
  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Top bar */}
        <div className="profile-top-bar">
          <button className="back-home-btn" onClick={onBackHome}>
            ← Back to Home
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        {/* Avatar */}
        <div className="profile-image">
          <FaUserCircle />
        </div>

        <h2>Welcome Back!</h2>

        <p className="profile-name">
          {user?.fullName || "Guest User"}
        </p>

        {/* Account details */}
        <div className="user-details">
          <div className="detail-row">
            <span className="detail-label">Mobile</span>
            <span className="detail-value">{user?.mobile || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">User ID</span>
            <span className="detail-value">#{user?.id || "—"}</span>
          </div>
        </div>

        {/* Info cards */}
        <div className="message-box">
          <h3>🍽️ Every Meal is a Memory</h3>
          <p>
            Fresh ingredients, delicious flavors, and quick delivery —
            crafted with love just for you.
          </p>
        </div>

        <div className="message-box">
          <h3>❤️ Thank You for Choosing Us</h3>
          <p>
            Your happiness is our priority. We hope every order brings
            a smile to your face.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Profile;
