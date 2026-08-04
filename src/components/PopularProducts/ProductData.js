import coffee from "../../assets/products/coffee1.jpg";
import burger from "../../assets/products/burger1.jpg";
import pizza from "../../assets/products/pizza1.jpg";
import pasta from "../../assets/products/pasta1.jpg";
import brownie from "../../assets/products/brownie1.jpg";
import sandwich from "../../assets/products/sandwich1.jpg";

const products = [
  {
    id: 1,
    name: "Cappuccino",
    image: coffee,
    price: 199,
    rating: 4.9,
    time: "15 min",
    offer: "20% OFF"
  },
  {
    id: 2,
    name: "Cheese Burger",
    image: burger,
    price: 249,
    rating: 4.8,
    time: "20 min",
    offer: "15% OFF"
  },
  {
    id: 3,
    name: "Margherita Pizza",
    image: pizza,
    price: 399,
    rating: 4.9,
    time: "25 min",
    offer: "25% OFF"
  },
  {
    id: 4,
    name: "White Sauce Pasta",
    image: pasta,
    price: 299,
    rating: 4.7,
    time: "18 min",
    offer: "10% OFF"
  },
  {
    id: 5,
    name: "Chocolate Brownie",
    image: brownie,
    price: 179,
    rating: 4.9,
    time: "12 min",
    offer: "NEW"
  },
  {
    id: 6,
    name: "Club Sandwich",
    image: sandwich,
    price: 229,
    rating: 4.8,
    time: "15 min",
    offer: "BEST SELLER"
  }
];

export default products;