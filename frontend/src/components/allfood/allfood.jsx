import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./allfood.css";

const burgers = [
  { id: 1, name: "Aloo Cheese Burger", price: 40, preparationTime: "10 mins", available: true },
  { id: 2, name: "Veg Cheese Burger", price: 50, preparationTime: "12 mins", available: true },
  { id: 3, name: "Paneer Burger", price: 60, preparationTime: "8 mins", available: true },
  { id: 4, name: "Mexican Cheese Burger", price: 60, preparationTime: "8 mins", available: true },
  { id: 5, name: "Madhuram Special Burger", price: 60, preparationTime: "8 mins", available: true },
];

const chaap = [
  { id: 1, name: "Tandoori Chaap", price: 120, preparationTime: "20 mins", available: true },
  { id: 2, name: "Achari Chaap", price: 130, preparationTime: "20 mins", available: true },
  { id: 3, name: "Afgani Chaap", price: 130, preparationTime: "22 mins", available: true },
   { id: 4, name: "Paneer Tikka", price: 130, preparationTime: "22 mins", available: true },
    { id: 5, name: "Malai Chaap", price: 140, preparationTime: "22 mins", available: true },
    { id: 6, name: "Mushroom Chaap", price: 140, preparationTime: "20 mins", available: true },
  { id: 7, name: "Paneer Malai Tikka", price: 150, preparationTime: "20 mins", available: true },
  { id: 8, name: "Madhuram Special Chaap", price: 160, preparationTime: "22 mins", available: true },
   { id: 9, name: "Madhuram Special Tikka", price: 160, preparationTime: "22 mins", available: true },
    
];

const biryani = [
  { id: 1, name: "Veg Biryani", price: 120, preparationTime: "20 mins", available: true },
  { id: 2, name: "Shahi Biryani", price: 150, preparationTime: "22 mins", available: true },
  { id: 3, name: "Fried Rice", price: 90, preparationTime: "20 mins", available: true },
  { id: 4, name: "Fried Rice", price: 100, preparationTime: "20 mins", available: true },
];

const sandwiches = [
  { id: 1, name: "Veg Sandwich", price: 80, preparationTime: "10 mins", available: true },
  { id: 2, name: "Veg Cheese Sandwich", price: 90, preparationTime: "12 mins", available: true },
  { id: 1, name: "Corn Sandwich", price: 90, preparationTime: "10 mins", available: true },
  { id: 2, name: "Paneer Cheese Sandwich", price: 100, preparationTime: "12 mins", available: true },
  { id: 1, name: "Madhuram Special Sandwich", price: 120, preparationTime: "10 mins", available: true }
  
];

const pizza = [
  { id: 1, name: "Margherita", price: 110, preparationTime: "15 mins", available: true },
  { id: 2, name: "Farmhouse", price: 120, preparationTime: "18 mins", available: true },
  { id: 3, name: "Paneer Pizza", price: 130, preparationTime: "15 mins", available: true },
  { id: 4, name: "Corn Mushroom Pizza", price: 130, preparationTime: "18 mins", available: true },
  { id: 5, name: "Cheese Burst Pizza", price: 150, preparationTime: "15 mins", available: true },
  { id: 6, name: "Madhuram Special Pizza", price: 120, preparationTime: "18 mins", available: true },
  { id: 7, name: "Kulhad Pizza", price: 110, preparationTime: "15 mins", available: true },
  { id: 8, name: "Cheese Kulhad Pizza", price: 120, preparationTime: "18 mins", available: true },
  { id: 9, name: "Paneer Kulhad Pizza", price: 110, preparationTime: "15 mins", available: true },
  { id: 210, name: "Madhuram Special Kulhad Pizza", price: 120, preparationTime: "18 mins", available: true }
];

const coffee = [
  { id: 1, name: "Hot Coffee", price: 30, preparationTime: "5 mins", available: true },
  { id: 2, name: "Black Coffee", price: 30, preparationTime: "7 mins", available: true },
  { id: 3, name: "Cold Coffee", price: 100, preparationTime: "7 mins", available: true }
];

const drinks = [
  { id: 1, name: "Classic Vanilla Shake", price: 70, preparationTime: "2 mins", available: true },
  { id: 2, name: "Strawberry Shake", price: 90, preparationTime: "3 mins", available: true },
   { id: 3, name: "ButterScotch Shske", price: 90, preparationTime: "2 mins", available: true },
  { id: 4, name: "Chocolate Shake", price: 80, preparationTime: "3 mins", available: true },
   { id: 5, name: "Double Chocolate Shake ", price: 90, preparationTime: "2 mins", available: true },
  { id: 6, name: "Oreo Milk Shake ", price: 100, preparationTime: "3 mins", available: true },
   { id: 7, name: "KitKat Shake", price: 100, preparationTime: "2 mins", available: true },
  { id: 8, name: "Dry Fruit & Nut Shake", price: 110, preparationTime: "3 mins", available: true },
   { id: 9, name: "Blueberry Mojito", price: 90, preparationTime: "2 mins", available: true },
  { id: 10, name: "Mint Mojito", price: 90, preparationTime: "3 mins", available: true },
   { id: 11, name: "Fruit Infusion", price: 90, preparationTime: "2 mins", available: true },
  { id: 12, name: "Strawberry Mojito", price: 90, preparationTime: "3 mins", available: true },
   { id: 13, name: "Watermelon Mojito", price: 90, preparationTime: "2 mins", available: true },
  { id: 14, name: "Blue Moon Drink", price: 90, preparationTime: "3 mins", available: true },
   { id: 15, name: "Litchi Mojito", price: 90, preparationTime: "2 mins", available: true },
  { id: 16, name: "Kiwi Mojito", price: 90, preparationTime: "3 mins", available: true }

];

const Wraps = [
  { id: 1, name: "veg Wrap", price: 80, preparationTime: "2 mins", available: true },
  { id: 2, name: "Paneer Wrap", price: 90, preparationTime: "3 mins", available: true },
    { id: 2, name: "Malai Chaap Wrap", price: 100, preparationTime: "3 mins", available: true }
];

const Desserts = [
  { id: 1, name: "Rabdi Shahi Tukda ", price: 80, preparationTime: "2 mins", available: true }
  
];

const Snacks = [
  { id: 1, name: "Veg Maggi", price: 40, preparationTime: "2 mins", available: true },
  { id: 2, name: "Kulhad Maggi", price: 50, preparationTime: "3 mins", available: true },
   { id: 1, name: "Butter Cheese Maggi", price: 60, preparationTime: "2 mins", available: true },
  { id: 2, name: "Matchstick Fries", price: 60, preparationTime: "3 mins", available: true },
   { id: 1, name: "French Fries", price: 60, preparationTime: "2 mins", available: true },
  { id: 2, name: "Peri Peri French Fries", price: 70, preparationTime: "3 mins", available: true },
   { id: 1, name: "Masala Fries", price: 80, preparationTime: "2 mins", available: true },
  { id: 2, name: "Masala Potato Twister", price: 90, preparationTime: "3 mins", available: true },
   { id: 1, name: "Smokey Sweet Corn", price: 80, preparationTime: "2 mins", available: true },
  { id: 2, name: "Honey Chilli Potato ", price: 100, preparationTime: "3 mins", available: true },
   { id: 1, name: "Sweet Corn Chat", price: 90, preparationTime: "2 mins", available: true },
  { id: 2, name: "Crispy Corn", price: 110, preparationTime: "3 mins", available: true }

];

const Chinese = [
  { id: 1, name: "Dry Manchurian", price: 80, preparationTime: "2 mins", available: true },
  { id: 2, name: "Veg Hakka Noodels", price: 90, preparationTime: "3 mins", available: true },
  { id: 3, name: "Schezwan Rice", price: 90, preparationTime: "2 mins", available: true },
  { id: 4, name: "Gravy Manchurian", price: 90, preparationTime: " 3 mins", available: true },
  { id: 5, name: "Red Sauce Pasta", price: 90, preparationTime: "2 mins", available: true },
  { id: 6, name: "White Shauce Pasta", price: 110, preparationTime: "3 mins", available: true },
  { id: 7, name: "Schezwan Noodels", price: 110, preparationTime: "2 mins", available: true },
  { id: 8, name: "Singapore Noodels", price: 110, preparationTime: "3 mins", available: true },
  { id: 9, name: "Chilli Paneer", price: 140, preparationTime: "2 mins", available: true },
  { id: 10, name: "Paneer 65", price: 150, preparationTime: "3 mins", available: true }
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

