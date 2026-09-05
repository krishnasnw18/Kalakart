require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { db } = require("./config/firebase");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const enhanceRoutes = require("./routes/enhanceRoutes");
const cloudinary = require("./config/cloudinary");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/upload-image", uploadRoutes);
app.use("/api/enhance-image", enhanceRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Artisan AI Backend is running"
    });
});

app.get("/test-firebase", async (req, res) => {
    try {
        const docRef = await db.collection("test").add({
            message: "Firebase connection successful",
            createdAt: new Date()
        });

        res.json({
            success: true,
            documentId: docRef.id
        });
    } catch (error) {
        console.error("Firebase error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get("/test-cloudinary", async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            {
                folder: "artisan-test"
            }
        );

        res.json({
            success: true,
            message: "Cloudinary upload successful",
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});