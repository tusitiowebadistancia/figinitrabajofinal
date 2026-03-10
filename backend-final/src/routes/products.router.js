import { Router } from "express";
import Product from "../models/product.model.js";

const router = Router();

// Crear producto
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Obtener productos con filtros, paginacion y orden
router.get("/", async (req, res) => {
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

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `${baseUrl}?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`
        : null,
      nextLink: result.hasNextPage
        ? `${baseUrl}?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`
        : null
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// Obtener producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    }
    res.json({ status: "success", payload: product });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;