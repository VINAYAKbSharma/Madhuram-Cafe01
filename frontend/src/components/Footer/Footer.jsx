import { useState, useEffect } from "react";
import "./Footer.css";

import {
  FaHome,
  FaUtensils,
  FaShoppingBag,
  FaUser
} from "react-icons/fa";

import { GiCoffeeCup } from "react-icons/gi";

const footerItems = [
  { id: "home", icon: FaHome, label: "Home" },
  { id: "menu", icon: FaUtensils, label: "Menu" },
  { id: "orders", icon: FaShoppingBag, label: "Orders" },
  { id: "profile", icon: FaUser, label: "Profile" }
];

function Footer({ visible = true, onNavigate, activeTab = "home" }) {
  const [active, setActive] = useState(activeTab);

  useEffect(() => {
    setActive(activeTab);
  }, [activeTab]);

  const handleFooterClick = (id) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (
    <footer id="contact" className={`footer ${visible ? "footer--visible" : "footer--hidden"}`}>
      {footerItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={`footer-item ${active === item.id ? "active" : ""}`}
            onClick={() => handleFooterClick(item.id)}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div className="footer-logo">
        <div className="logo-circle">
          <GiCoffeeCup />
        </div>
      </div>

      {footerItems.slice(2).map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={`footer-item ${active === item.id ? "active" : ""}`}
            onClick={() => handleFooterClick(item.id)}
          >
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </footer>
  );
}

export default Footer;
