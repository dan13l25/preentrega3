import productService from "../dao/services/productService.js";
import ProductDTO from "../dao/DTO/productDTO.js";

export default class ProductController {
    constructor() {
        console.log("productcontroller funciona");
    }

    async addProduct(req, res) {
        const { title, description, price, thumbnails, code, stock, status, category, brand } = req.body;
        const userId = req.userId; 

        const productData = new ProductDTO(title, brand, description, price, stock, category, thumbnails, userId);

        try {
            await productService.addProduct(
                productData.title,
                productData.description,
                productData.price,
                productData.image,
                code,
                productData.stock,
                status,
                productData.category,
                productData.brand
            );
            res.status(201).json({ message: "Producto añadido correctamente" });
        } catch (error) {
            console.error("Error al añadir el producto:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async readProducts(req, res) {
        try {
            const products = await productService.readProducts();
            res.json(products);
        } catch (error) {
            console.error("Error al leer los productos:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getProducts(req, res) {
        const { category, brand, sort } = req.query;

        try {
            const products = await productService.getProducts(category, brand, sort);
            res.json(products);
        } catch (error) {
            console.error("Error al obtener los productos:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getProductById(req, res) {
        console.log("estos son los ", req.params);
        const { pid } = req.params;
        try {
            const product = await productService.getProductById(pid);
            if (!product) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            res.json(product);
        } catch (error) {
            console.error("Error al obtener el producto:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async getByBrand(req, res) {
        const { brand } = req.params;

        try {
            const products = await productService.getByBrand(brand);
            res.json(products);
        } catch (error) {
            console.error("Error al obtener los productos por marca:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async deleteProductById(req, res) {
        const { pid } = req.params;

        try {
            await productService.deleteProductById(pid);
            res.json({ message: "Producto eliminado correctamente" });
        } catch (error) {
            console.error("Error al eliminar el producto:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async updateProduct(req, res) {
        const { pid } = req.params;
        const newData = req.body;

        try {
            const updatedProduct = await productService.updateProduct(pid, newData);
            res.json(updatedProduct);
        } catch (error) {
            console.error("Error al actualizar el producto:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    async renderProductsPage(req, res) {
        try {
            const products = await productService.readProducts();
            const plainProducts = products.map(product => product.toObject());
            res.render("product", { products: plainProducts });
        } catch (error) {
            console.error("Error al renderizar la página de productos:", error.message);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }
}
