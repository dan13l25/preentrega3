import express from "express";
import ProductController from "../controllers/productController.js";

const productRouter = express.Router();
const productController = new ProductController();

productRouter.get("/", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const page = parseInt(req.query.page) || 1;

        const options = {
            limit,
            page,
            lean: true
        };

        const products = await Product.paginate({}, options);

        const totalPages = Math.ceil(products.total / limit);
        const isValid = page >= 1 && page <= totalPages;

        products.isValid = isValid;
        console.log(isValid);
        return res.json(products);

    } catch (error) {
        console.error(error);
        res.status(500).send("Error al recibir productos");
    }
});

// Ruta para renderizar la página de productos
productRouter.get("/view", productController.renderProductsPage);

productRouter.get("/:pid", productController.getProductById);
productRouter.get("/brand/:brand", productController.getByBrand);
productRouter.post("/", productController.addProduct);
productRouter.put("/:pid", productController.updateProduct);
productRouter.delete("/:pid", productController.deleteProductById);

export { productRouter };
