const express = require("express");
const { db } = require("../config/firebase");

const router = express.Router();

// Create a new product
router.post("/", async (req, res) => {
    try {
        const {
            name,
            category,
            descriptionEnglish,
            descriptionHindi,
            material,
            rawMaterialCost,
            price,
            imageUrl,
            userId
        } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                success: false,
                message: "Product name and category are required."
            });
        }

        const product = {
            name,
            category,
            descriptionEnglish: descriptionEnglish || "",
            descriptionHindi: descriptionHindi || "",
            material: material || "",
            rawMaterialCost: rawMaterialCost || 0,
            price: price || 0,
            imageUrl: imageUrl || "",
            userId: userId || "",
            createdAt: new Date()
        };

        const docRef = await db.collection("products").add(product);

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            productId: docRef.id,
            product
        });

    } catch (error) {
        console.error("Create product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create product.",
            error: error.message
        });
    }
});

// Get all products
router.get("/", async (req, res) => {
    try {
        const snapshot = await db
            .collection("products")
            .orderBy("createdAt", "desc")
            .get();

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            products
        });

    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products.",
            error: error.message
        });
    }
});
// Get one product by ID
router.get("/:id", async (req, res) => {
    try {
        const doc = await db
            .collection("products")
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        res.json({
            success: true,
            product: {
                id: doc.id,
                ...doc.data()
            }
        });

    } catch (error) {
        console.error("Get product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product.",
            error: error.message
        });
    }
});
// Delete a product
router.delete("/:id", async (req, res) => {
    try {
        const productRef = db
            .collection("products")
            .doc(req.params.id);

        const doc = await productRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        await productRef.delete();

        res.json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete product.",
            error: error.message
        });
    }
});
module.exports = router;