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

    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    res.render("products", {
      title: "Productos",
      products: result.docs,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page
    });
  } catch (error) {
    res.status(500).send("Error al cargar productos");
  }
});

// Vista de detalle de producto
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", { product });
  } catch (error) {
    res.status(500).send("Error al cargar producto");
  }
});

// Vista de carrito
router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate("products.product").lean();

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", { cart });
  } catch (error) {
    res.status(500).send("Error al cargar carrito");
  }
});

export default router;