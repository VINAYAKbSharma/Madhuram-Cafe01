import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./allfood.css";

const burgers = [
  { id: 1, name: "Cheese Burger", price: 199, preparationTime: "10 mins", available: true },
  { id: 2, name: "Paneer Burger", price: 179, preparationTime: "12 mins", available: true },
  { id: 3, name: "Classic Burger", price: 149, preparationTime: "8 mins", available: true },
];

const chaap = [
  { id: 1, name: "Tandoori Chaap", price: 120, preparationTime: "20 mins", available: true },
  { id: 2, name: "Achari Chaap", price: 130, preparationTime: "20 mins", available: true },
  { id: 3, name: "Afgani Chaap", price: 130, preparationTime: "22 mins", available: true },
];

const biryani = [
  { id: 1, name: "Veg Biryani", price: 140, preparationTime: "20 mins", available: true },
  { id: 2, name: "Paneer Biryani", price: 170, preparationTime: "22 mins", available: true },
  { id: 3, name: "Mushroom Biryani", price: 170, preparationTime: "20 mins", available: true },
];

const sandwiches = [
  { id: 1, name: "Veg Sandwich", price: 80, preparationTime: "10 mins", available: true },
  { id: 2, name: "Veg Cheese Sandwich", price: 90, preparationTime: "12 mins", available: true }
];

const pizza = [
  { id: 1, name: "Margherita", price: 110, preparationTime: "15 mins", available: true },
  { id: 2, name: "Farmhouse", price: 120, preparationTime: "18 mins", available: true }
];

const coffee = [
  { id: 1, name: "Espresso", price: 90, preparationTime: "5 mins", available: true },
  { id: 2, name: "Cappuccino", price: 130, preparationTime: "7 mins", available: true }
];

const drinks = [
  { id: 1, name: "Cold Drink", price: 40, preparationTime: "2 mins", available: true },
  { id: 2, name: "Fresh Lime", price: 50, preparationTime: "3 mins", available: true }
];

const Wraps = [
  { id: 1, name: "veg Wrap", price: 80, preparationTime: "2 mins", available: true },
  { id: 2, name: "Paneer Wrap", price: 100, preparationTime: "3 mins", available: true }
];

const Desserts = [
  { id: 1, name: "Rabdi", price: 40, preparationTime: "2 mins", available: true },
  { id: 2, name: "Rashmalai", price: 50, preparationTime: "3 mins", available: true }
];

const Snacks = [
  { id: 1, name: "Maggi", price: 40, preparationTime: "2 mins", available: true },
  { id: 2, name: "corn", price: 50, preparationTime: "3 mins", available: true }
];

const Chinese = [
  { id: 1, name: "manchurian", price: 40, preparationTime: "2 mins", available: true },
  { id: 2, name: "nudels", price: 50, preparationTime: "3 mins", available: true }
];

function CategorySection({ title, items, onAddToCart }) {
  return (
    <section className="category-container">
      <h2 className="category-title">{title}</h2>
      <div className="cards-grid">
        {items.map((item) => (
          <div className="food-card" key={item.id}>
            <div className="card-body">
              <h3 className="food-name">{item.name || item.title || "Unnamed"}</h3>
              <p className="food-price">₹{item.price}</p>
              <p className="food-prep">Prep: {item.preparationTime || "—"}</p>
              <p className={`food-available ${item.available ? "yes" : "no"}`}>
                {item.available ? "Available" : "Unavailable"}
              </p>
            </div>
            <div className="card-actions">
              <button
                className="add-cart"
                onClick={() => onAddToCart && onAddToCart(item)}
                disabled={!item.available}
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AllFood({ selectedCategory, onAddToCart, onClose }) {
  const allSections = {
    Burgers: burgers,
    Burger: burgers,
    Chaap: chaap,
    Biryani: biryani,
    Sandwich: sandwiches,
    Sandwiches: sandwiches,
    Pizza: pizza,
    Coffee: coffee,
    Drinks: drinks,
    Drink: drinks,
    Wraps: Wraps,
    Desserts: Desserts,
    Snacks: Snacks,
    Chinese: Chinese,
    "Tandoori Grills": chaap,
  };

  const selected = selectedCategory ? allSections[selectedCategory] : null;

  return (
    <div className="allfood full-screen">
      <div className="allfood-header">
        <h2>{selectedCategory ? selectedCategory : "All Food"}</h2>
        <button className="close-allfood" onClick={() => onClose && onClose()}>
          <FaArrowLeft /> Back to Home
        </button>
      </div>

      {selected ? (
        <CategorySection title={selectedCategory} items={selected} onAddToCart={onAddToCart} />
      ) : (
        <>
          <CategorySection title="Burgers" items={burgers} onAddToCart={onAddToCart} />
          <CategorySection title="Chaap" items={chaap} onAddToCart={onAddToCart} />
          <CategorySection title="Biryani" items={biryani} onAddToCart={onAddToCart} />
          <CategorySection title="Sandwich" items={sandwiches} onAddToCart={onAddToCart} />
          <CategorySection title="Pizza" items={pizza} onAddToCart={onAddToCart} />
          <CategorySection title="Coffee" items={coffee} onAddToCart={onAddToCart} />
          <CategorySection title="Drinks" items={drinks} onAddToCart={onAddToCart} />
          <CategorySection title="Wraps" items={Wraps} onAddToCart={onAddToCart} />
          <CategorySection title="Desserts" items={Desserts} onAddToCart={onAddToCart} />
          <CategorySection title="Snacks" items={Snacks} onAddToCart={onAddToCart} />
          <CategorySection title="Chinese" items={Chinese} onAddToCart={onAddToCart} />
        </>
      )}

      <button className="back-floating" onClick={() => onClose && onClose()}>
        <FaArrowLeft /> Home
      </button>
    </div>
  );
}

