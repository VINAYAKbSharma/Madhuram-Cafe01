import { FaShoppingCart } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar({
  onCartClick,
  onNavigate,
  cartCount = 0,
}) {
  return (
    <header className="navbar">
      {/* Logo */}
      <div className="logo">
        <h2>
          Madhuram
          <span>Cafe</span>
        </h2>
      </div>

      {/* Desktop Navigation */}
      <nav className="nav">
        <a href="#home" onClick={() => onNavigate?.("home")}>
          Home
        </a>

        <a href="#menu" onClick={() => onNavigate?.("menu")}>
          Menu
        </a>

        <a href="#offers" onClick={() => onNavigate?.("offers")}>
          Offers
        </a>

        <a href="#about" onClick={() => onNavigate?.("about")}>
          About
        </a>

        <a href="#contact" onClick={() => onNavigate?.("contact")}>
          Contact
        </a>
      </nav>

      {/* Cart */}
      <div className="nav-icons">
        <button
          className="icon-btn cart-btn"
          type="button"
          onClick={onCartClick}
          aria-label="Cart"
        >
          <FaShoppingCart />
          <span>{cartCount}</span>
        </button>
      </div>
    </header>
  );
}
