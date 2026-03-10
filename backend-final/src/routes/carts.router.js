import { Router } from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const router = Router();

// Crear carrito
router.post("/", async (req, res) => {
  try {
    const cart = await Cart.create({ products: [] });
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Obtener carrito por id con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();

    if (!cart) {
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    }

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Agregar producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    }

    const productExists = await Product.findById(pid);
    if (!productExists) {
      return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    }

    const productIndex = cart.products.findIndex(
      item => item.product.toString() === pid
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Actualizar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    }

    cart.products = products;
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Actualizar solo la cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    }

    const productInCart = cart.products.find(
      item => item.product.toString() === pid
    );

    if (!productInCart) {
      return res.status(404).json({ status: "error", error: "Producto no encontrado en carrito" });
    }

    productInCart.quantity = quantity;
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    }

    cart.products = cart.products.filter(
      item => item.product.toString() !== pid
    );

    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();

    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;