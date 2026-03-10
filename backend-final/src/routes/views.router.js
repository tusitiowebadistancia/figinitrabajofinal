import { Router } from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = Router();

// Vista de productos con paginación
router.get("/products", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query } = req.query;

    limit = parseInt(limit);
    page = parseInt(page);

    const filter = {};

    if (query) {
      if (query === "true" || query === "false") {
        filter.status = query === "true";
      } else {
        filter.category = query;
      }
    }

    const options = {
      page,
      limit,
      lean: true
    };

    if (sort === "asc") {
      options.sort = { price: 1 };
    } else if (sort === "desc") {
      options.sort = { price: -1 };
    }

    const result = await Product.paginate(filter, options);

    res.render("products", {
      title: "Productos",
      products: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      sort,
      query,
      limit
    });
  } catch (error) {
    res.status(500).send("Error al cargar productos");
  }
});

// Vista detalle de producto
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findById(pid).lean();

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", {
      title: "Detalle del producto",
      product
    });
  } catch (error) {
    res.status(500).send("Error al cargar producto");
  }
});

// Vista de carrito específico
router.get("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", {
      title: "Carrito",
      cart
    });
  } catch (error) {
    res.status(500).send("Error al cargar carrito");
  }
});

router.post("/carts/:cid/products/:pid/add", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");

    const productInCart = cart.products.find(
      item => item.product.toString() === pid
    );

    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.redirect(`/carts/${cid}`);
  } catch (error) {
    res.status(500).send("Error al sumar producto");
  }
});

router.post("/carts/:cid/products/:pid/subtract", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");

    const productInCart = cart.products.find(
      item => item.product.toString() === pid
    );

    if (!productInCart) {
      return res.status(404).send("Producto no encontrado en carrito");
    }

    productInCart.quantity -= 1;

    if (productInCart.quantity <= 0) {
      cart.products = cart.products.filter(
        item => item.product.toString() !== pid
      );
    }

    await cart.save();
    res.redirect(`/carts/${cid}`);
  } catch (error) {
    res.status(500).send("Error al restar producto");
  }
});

router.post("/carts/:cid/products/:pid/update", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");

    const productInCart = cart.products.find(
      item => item.product.toString() === pid
    );

    if (!productInCart) {
      return res.status(404).send("Producto no encontrado en carrito");
    }

    const newQuantity = parseInt(quantity);

    if (isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).send("Cantidad inválida");
    }

    productInCart.quantity = newQuantity;

    await cart.save();
    res.redirect(`/carts/${cid}`);
  } catch (error) {
    res.status(500).send("Error al actualizar cantidad");
  }
});

router.post("/carts/:cid/products/:pid/delete", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");

    cart.products = cart.products.filter(
      item => item.product.toString() !== pid
    );

    await cart.save();
    res.redirect(`/carts/${cid}`);
  } catch (error) {
    res.status(500).send("Error al eliminar producto");
  }
});

router.post("/carts/:cid/clear", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send("Carrito no encontrado");

    cart.products = [];
    await cart.save();

    res.redirect(`/carts/${cid}`);
  } catch (error) {
    res.status(500).send("Error al vaciar carrito");
  }
});

export default router;