const express = require("express");
const {
  getImageGeminiClient,
  IMAGE_MODEL
} = require("../config/imageGemini");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required."
      });
    }

    if (!imageUrl.startsWith("http")) {
      return res.status(400).json({
        success: false,
        message: "A valid image URL is required."
      });
    }

    const ai = getImageGeminiClient();

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(
        `Could not download image. Status: ${imageResponse.status}`
      );
    }

    const imageBuffer = Buffer.from(
      await imageResponse.arrayBuffer()
    );

    const contentType =
      imageResponse.headers.get("content-type") ||
      "image/jpeg";

    const base64Image = imageBuffer.toString("base64");

    const prompt = `
Enhance this artisan product photograph for an e-commerce marketplace.

IMPORTANT:
- Keep the original product exactly the same.
- Do NOT remove the background.
- Do NOT replace the background.
- Do NOT add new objects.
- Do NOT remove any part of the product.
- Do NOT change the product shape, design, texture or craftsmanship.

Improve only the photograph quality:
- Improve lighting.
- Correct brightness and exposure.
- Improve clarity and sharpness.
- Improve natural color balance.
- Reduce dullness and minor visual noise.
- Make the product look clean, clear and professionally photographed.
- Keep the result realistic and natural.

The final image should look like the same artisan product photographed with better lighting and a better camera.
`;

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: contentType,
                data: base64Image
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    });

    let generatedImage = null;

    if (response?.candidates?.length) {
      const parts =
        response.candidates[0]?.content?.parts || [];

      for (const part of parts) {
        if (part.inlineData?.data) {
          generatedImage = {
            data: part.inlineData.data,
            mimeType:
              part.inlineData.mimeType || "image/png"
          };
          break;
        }
      }
    }

    if (!generatedImage) {
      throw new Error(
        "Gemini did not return an enhanced image."
      );
    }

    const enhancedImageUrl =
      `data:${generatedImage.mimeType};base64,${generatedImage.data}`;

    return res.status(200).json({
      success: true,
      originalUrl: imageUrl,
      enhancedUrl: enhancedImageUrl,
      model: IMAGE_MODEL
    });

  } catch (error) {
    console.error(
      "Gemini image enhancement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gemini image enhancement failed."
    });
  }
});

module.exports = router;