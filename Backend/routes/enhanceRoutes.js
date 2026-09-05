const express = require("express");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const imageUrl = req.query.imageUrl;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: "imageUrl is required"
            });
        }

        const publicId = imageUrl
            .split("/upload/")[1]
            .split("/")
            .slice(1)
            .join("/")
            .replace(/\.[^/.]+$/, "");

        const enhancedUrl = cloudinary.url(publicId, {
            secure: true,
            transformation: [
                {
                    background: "white",
                    gravity: "auto",
                    crop: "pad"
                },
                {
                    quality: "auto:good",
                    fetch_format: "auto"
                }
            ]
        });

        res.json({
            success: true,
            originalUrl: imageUrl,
            enhancedUrl
        });

    } catch (error) {
        console.error("Enhancement error:", error);

        res.status(500).json({
            success: false,
            message: "Image enhancement failed.",
            error: error.message
        });
    }
});

module.exports = router;