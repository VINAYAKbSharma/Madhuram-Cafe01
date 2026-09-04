import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./allfood.css";

const coffee = [
  { id: "coffee_1", name: "Hot Coffee", price: 30, preparationTime: "5 mins", available: true },
  { id: "coffee_2", name: "Black Coffee", price: 30, preparationTime: "5 mins", available: true },
  { id: "coffee_3", name: "Cold Coffee", price: 80, preparationTime: "7 mins", available: true },
  { id: "coffee_4", name: "Cold Coffee with Icecream", price: 100, preparationTime: "10 mins", available: true },
];

const shakes = [
  { id: "shake_1", name: "Classic Vanilla Shake", price: 70, preparationTime: "5 mins", available: true },
  { id: "shake_2", name: "Strawberry Shake", price: 90, preparationTime: "5 mins", available: true },
  { id: "shake_3", name: "Butterscotch Shake", price: 90, preparationTime: "5 mins", available: true },
  { id: "shake_4", name: "Chocolate Shake", price: 80, preparationTime: "5 mins", available: true },
  { id: "shake_5", name: "Double Chocolate Shake", price: 90, preparationTime: "5 mins", available: true },
  { id: "shake_6", name: "Oreo Milk Shake", price: 100, preparationTime: "7 mins", available: true },
  { id: "shake_7", name: "Kitkat Shake", price: 100, preparationTime: "7 mins", available: true },
];

const mocktails = [
  { id: "mocktail_1", name: "Blueberry Mojito", price: 90, preparationTime: "5 mins", available: true },
  { id: "mocktail_2", name: "Mint Mojito", price: 90, preparationTime: "5 mins", available: true },
  { id: "mocktail_3", name: "Fruit Infusion", price: 90, preparationTime: "5 mins", available: true },
  { id: "mocktail_4", name: "Strawberry Mojito", price: 90, preparationTime: "5 mins", available: true },
  { id: "mocktail_5", name: "Watermelon Mojito", price: 90, preparationTime: "5 mins", available: true },
  { id: "mocktail_6", name: "Kiwi Mojito", price: 90, preparationTime: "5 mins", available: true },
  { id: "mocktail_7", name: "Blue Moon Drink", price: 90, preparationTime: "5 mins", available: true },
  { id: "mocktail_8", name: "Litchi Mojito", price: 90, preparationTime: "5 mins", available: true },
];

const beverages = [
  { id: "bev_1", name: "Mineral Water Bottle", price: 20, preparationTime: "1 min", available: true },
  { id: "bev_2", name: "Fresh Lime Soda", price: 30, preparationTime: "3 mins", available: true },
];

const cornItems = [
  { id: "corn_1", name: "Smokey Sweet Corn", price: 80, preparationTime: "7 mins", available: true },
  { id: "corn_2", name: "Sweet Corn Chat", price: 90, preparationTime: "7 mins", available: true },
  { id: "corn_3", name: "Crispy Corn", price: 110, preparationTime: "10 mins", available: true },
];

const chinese = [
  { id: "chinese_1", name: "Fried Rice", price: 90, preparationTime: "12 mins", available: true },
  { id: "chinese_2", name: "Dry Manchurian", price: 90, preparationTime: "15 mins", available: true },
  { id: "chinese_3", name: "Veg Hakka Noodles", price: 100, preparationTime: "12 mins", available: true },
  { id: "chinese_4", name: "Schezwan Rice", price: 100, preparationTime: "12 mins", available: true },
  { id: "chinese_5", name: "Gravy Manchurian", price: 110, preparationTime: "15 mins", available: true },
  { id: "chinese_6", name: "Red Sauce Pasta", price: 90, preparationTime: "15 mins", available: true },
  { id: "chinese_7", name: "White Sauce Pasta", price: 120, preparationTime: "15 mins", available: true },
  { id: "chinese_8", name: "Schezwan Noodles", price: 110, preparationTime: "12 mins", available: true },
  { id: "chinese_9", name: "Singapore Noodles", price: 120, preparationTime: "15 mins", available: true },
  { id: "chinese_10", name: "Chilli Paneer", price: 140, preparationTime: "18 mins", available: true },
  { id: "chinese_11", name: "Paneer 65", price: 150, preparationTime: "18 mins", available: true },
];

const burgers = [
  { id: "burger_1", name: "Aloo Cheese Burger", price: 70, preparationTime: "10 mins", available: true },
  { id: "burger_2", name: "Veg Cheese Burger", price: 70, preparationTime: "12 mins", available: true },
  { id: "burger_3", name: "Paneer Cheese Burger", price: 80, preparationTime: "12 mins", available: true },
  { id: "burger_4", name: "Madhuram Special Burger", price: 100, preparationTime: "15 mins", available: true },
  { id: "burger_add_1", name: "Mayo Dip (Add On)", price: 15, preparationTime: "1 min", available: true },
  { id: "burger_add_2", name: "Schezwan Dip (Add On)", price: 15, preparationTime: "1 min", available: true },
  { id: "burger_add_3", name: "Extra Cheese (Add On)", price: 20, preparationTime: "1 min", available: true },
];

const sandwiches = [
  { id: "sandwich_1", name: "Veg Sandwich", price: 80, preparationTime: "10 mins", available: true },
  { id: "sandwich_2", name: "Veg Cheese Sandwich", price: 90, preparationTime: "12 mins", available: true },
  { id: "sandwich_3", name: "Corn Cheese Sandwich", price: 90, preparationTime: "12 mins", available: true },
  { id: "sandwich_4", name: "Paneer Cheese Sandwich", price: 100, preparationTime: "12 mins", available: true },
  { id: "sandwich_5", name: "Madhuram Special Sandwich", price: 120, preparationTime: "15 mins", available: true },
];

const wraps = [
  { id: "wrap_1", name: "Veg Wrap", price: 80, preparationTime: "10 mins", available: true },
  { id: "wrap_2", name: "Paneer Wrap", price: 100, preparationTime: "12 mins", available: true },
];

const combos = [
  { id: "combo_1", name: "Veg Biryani Platter (Veg Biryani + Raita + Salad + Mint Chutni)", price: 120, preparationTime: "20 mins", available: true },
  { id: "combo_2", name: "Shahi Veg Biryani Platter (Shahi Veg Biryani + Raita + Salad + Mint Chutni)", price: 150, preparationTime: "22 mins", available: true },
  { id: "combo_3", name: "Fried Rice", price: 90, preparationTime: "12 mins", available: true },
  { id: "combo_4", name: "Schezwan Rice", price: 100, preparationTime: "12 mins", available: true },
];

const regularPizza = [
  { id: "pizza_1", name: "Margherita Pizza", price: 120, preparationTime: "15 mins", available: true },
  { id: "pizza_2", name: "Farmhouse Pizza", price: 130, preparationTime: "18 mins", available: true },
  { id: "pizza_3", name: "Paneer Pizza", price: 150, preparationTime: "18 mins", available: true },
  { id: "pizza_4", name: "Corn Mushroom Pizza", price: 150, preparationTime: "18 mins", available: true },
  { id: "pizza_5", name: "Cheese Burst Pizza", price: 170, preparationTime: "20 mins", available: true },
  { id: "pizza_6", name: "Madhuram Special Pizza", price: 180, preparationTime: "20 mins", available: true },
];

const kulhadPizza = [
  { id: "kpizza_1", name: "Kulhad Pizza", price: 80, preparationTime: "15 mins", available: true },
  { id: "kpizza_2", name: "Cheese Kulhad Pizza", price: 90, preparationTime: "15 mins", available: true },
  { id: "kpizza_3", name: "Paneer Cheese Kulhad Pizza", price: 100, preparationTime: "18 mins", available: true },
  { id: "kpizza_4", name: "Madhuram Special Kulhad Pizza", price: 110, preparationTime: "18 mins", available: true },
];

const snacks = [
  { id: "snack_1", name: "Veg Meggi", price: 60, preparationTime: "8 mins", available: true },
  { id: "snack_2", name: "Kulhad Meggi", price: 70, preparationTime: "10 mins", available: true },
  { id: "snack_3", name: "Butter Cheese Meggi", price: 80, preparationTime: "10 mins", available: true },
  { id: "snack_4", name: "French Fries", price: 80, preparationTime: "10 mins", available: true },
  { id: "snack_5", name: "Peri Peri French Fries", price: 90, preparationTime: "10 mins", available: true },
  { id: "snack_6", name: "Honey Chilli Potato", price: 120, preparationTime: "15 mins", available: true },
  { id: "snack_7", name: "Pav Bhaji", price: 100, preparationTime: "15 mins", available: true },
  { id: "snack_8", name: "Butter Cheese Pav Bhaji", price: 120, preparationTime: "15 mins", available: true },
  { id: "snack_9", name: "Extra Pav (2 Pcs)", price: 30, preparationTime: "5 mins", available: true },
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
    Coffee: coffee,
    Shakes: shakes,
    Mocktails: mocktails,
    Beverages: beverages,
    "Corn Items": cornItems,
    Chinese: chinese,
    Burgers: burgers,
    Burger: burgers,
    Sandwich: sandwiches,
    Sandwiches: sandwiches,
    Wraps: wraps,
    "Afternoon Special & Combos": combos,
    "Biryani & Combos": combos,
    Biryani: combos,
    Pizza: regularPizza,
    "Regular Pizza": regularPizza,
    "Kulhad Pizza": kulhadPizza,
    Snacks: snacks,
  };

  const selected = selectedCategory ? allSections[selectedCategory] : null;

  return (
    <div className="allfood full-screen">
      <div className="allfood-header">
        <h2>{selectedCategory ? selectedCategory : "All Food & Menu"}</h2>
        <button className="close-allfood" onClick={() => onClose && onClose()}>
          <FaArrowLeft /> Back to Home
        </button>
      </div>

      {selected ? (
        <CategorySection title={selectedCategory} items={selected} onAddToCart={onAddToCart} />
      ) : (
        <>
          <CategorySection title="Coffee" items={coffee} onAddToCart={onAddToCart} />
          <CategorySection title="Shakes" items={shakes} onAddToCart={onAddToCart} />
          <CategorySection title="Mocktails" items={mocktails} onAddToCart={onAddToCart} />
          <CategorySection title="Beverages" items={beverages} onAddToCart={onAddToCart} />
          <CategorySection title="Corn Items" items={cornItems} onAddToCart={onAddToCart} />
          <CategorySection title="Chinese" items={chinese} onAddToCart={onAddToCart} />
          <CategorySection title="Burgers & Add Ons" items={burgers} onAddToCart={onAddToCart} />
          <CategorySection title="Sandwiches" items={sandwiches} onAddToCart={onAddToCart} />
          <CategorySection title="Wraps" items={wraps} onAddToCart={onAddToCart} />
          <CategorySection title="Afternoon Special & Delicious Combo" items={combos} onAddToCart={onAddToCart} />
          <CategorySection title="Regular Pizza" items={regularPizza} onAddToCart={onAddToCart} />
          <CategorySection title="Kulhad Pizza" items={kulhadPizza} onAddToCart={onAddToCart} />
          <CategorySection title="Snacks" items={snacks} onAddToCart={onAddToCart} />
        </>
      )}

      <button className="back-floating" onClick={() => onClose && onClose()}>
        <FaArrowLeft /> Home
      </button>
    </div>
  );
}
