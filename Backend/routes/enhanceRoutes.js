const express = require("express");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required"
      });
    }

    if (!imageUrl.includes("res.cloudinary.com")) {
      return res.status(400).json({
        success: false,
        message: "A valid Cloudinary image URL is required"
      });
    }

    const uploadIndex = imageUrl.indexOf("/upload/");

    if (uploadIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Invalid Cloudinary image URL"
      });
    }

    let publicId = imageUrl.substring(
      uploadIndex + "/upload/".length
    );

    // Remove Cloudinary version
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    /*
     * AI PRODUCT IMAGE ENHANCEMENT
     *
     * 1. AI background removal
     * 2. AI image enhancement
     * 3. Automatic brightness
     * 4. Sharpening
     * 5. 1200x1200 e-commerce format
     * 6. White professional background
     * 7. Automatic quality + format
     */

    const enhancedUrl = cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          raw_transformation: "e_background_removal"
        },
        {
          raw_transformation: "e_auto_enhance"
        },
        {
          raw_transformation: "e_auto_brightness"
        },
        {
          raw_transformation: "e_sharpen"
        },
        {
          raw_transformation:
            "c_fill,g_auto,w_1200,h_1200,b_white"
        },
        {
          quality: "auto",
          fetch_format: "auto"
        }
      ]
    });

    return res.status(200).json({
      success: true,
      originalUrl: imageUrl,
      enhancedUrl
    });

  } catch (error) {
    console.error("Image enhancement error:", error);

    return res.status(500).json({
      success: false,
      message: "Image enhancement failed"
    });
  }
});

module.exports = router;