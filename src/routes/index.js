import express from "express";
import homePage from "../pages/Home/index.js";
import menuPage from "../pages/Menu/index.js";
import productPage from "../pages/Product/index.js";
import cartPage from "../pages/Cart/index.js";
import checkoutPage from "../pages/Checkout/index.js";
import ordersPage from "../pages/Orders/index.js";
import profilePage from "../pages/Profile/index.js";
import loginPage from "../pages/Login/index.js";
import registerPage from "../pages/Register/index.js";

const router = express.Router();

router.get(["/", "/home"], (req, res) => res.send(homePage()));
router.get("/menu", (req, res) => res.send(menuPage()));
router.get("/product", (req, res) => res.send(productPage()));
router.get("/cart", (req, res) => res.send(cartPage()));
router.get("/checkout", (req, res) => res.send(checkoutPage()));
router.get("/orders", (req, res) => res.send(ordersPage()));
router.get("/profile", (req, res) => res.send(profilePage()));
router.get("/login", (req, res) => res.send(loginPage()));
router.get("/register", (req, res) => res.send(registerPage()));

export default router;
