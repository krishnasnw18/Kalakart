require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { db } = require("./config/firebase");
const cloudinary = require("./config/cloudinary");

const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const enhanceRoutes = require("./routes/enhanceRoutes");
const imageGeminiRoutes = require("./routes/imageGeminiRoutes");
const voiceDescriptionRoutes = require("./routes/voiceDescriptionRoutes");
const authRoutes = require("./routes/authRoutes");
const aiProductRoutes = require("./routes/aiProductRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// =========================================================
// AI ROUTES
// =========================================================

app.use("/api/generate-product", aiProductRoutes);
app.use("/api/voice-description", voiceDescriptionRoutes);
app.use("/api/chat", chatRoutes);

// Gemini image enhancement
app.use("/api/enhance-image-ai", imageGeminiRoutes);

// Existing Cloudinary image enhancement fallback
app.use("/api/enhance-image", enhanceRoutes);

// =========================================================
// CORE APP ROUTES
// =========================================================

app.use("/api/products", productRoutes);
app.use("/api/upload-image", uploadRoutes);
app.use("/api/auth", authRoutes);

// =========================================================
// ROOT
// =========================================================

app.get("/", (req, res) => {
    res.json({
        message: "Artisan AI Backend is running"
    });
});

// =========================================================
// FIREBASE TEST
// =========================================================

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

// =========================================================
// CLOUDINARY TEST
// =========================================================

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

// =========================================================
// SERVER
// =========================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});