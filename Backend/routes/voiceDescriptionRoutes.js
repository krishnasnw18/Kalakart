const express = require("express");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio recording was provided."
      });
    }

    const language = req.body.language || "en";
    const selectedCategory = req.body.category || "";

    const audioData = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "audio/webm";

    const prompt = `
You are the product intelligence and voice assistant for ShilpAura,
an application helping Indian artisans turn handmade products into
online-ready products.

The artisan may speak in Hindi, Marathi, English, or a mixture of languages.

Listen carefully to the audio and understand what the artisan means.
The artisan may describe the product very simply and may not know
technical craft terms, e-commerce terminology, SEO, or marketplace fields.

Your job is to do ALL of the following in ONE response:
1. Transcribe the artisan's speech.
2. Detect the spoken language.
3. Translate the meaningful content into clear English.
4. Extract product information that is clearly available.
5. Infer simple attributes only when the information reasonably supports them.
6. Generate a concise marketplace-friendly product title.
7. Generate a professional English marketplace description.
8. Generate a natural Hindi product description.
9. Generate useful SEO keywords.

Selected category from the app: "${selectedCategory}"

Return ONLY valid JSON in exactly this structure:

{
  "transcript": "what the artisan said",
  "detectedLanguage": "Hindi",
  "translatedEnglish": "faithful English translation of the artisan's words",
  "title": "short marketplace-friendly product title",
  "category": "most suitable category",
  "productDescriptionEnglish": "professional marketplace-ready English description",
  "productDescriptionHindi": "natural Hindi product description",
  "material": "main material",
  "color": "main color",
  "design": "design or motif",
  "technique": "crafting technique",
  "features": ["feature1", "feature2", "feature3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Rules:
- Preserve the meaning of the artisan's original speech.
- Hindi or Marathi speech must be translated into clear English.
- Do not invent certifications, origins, brands, quality claims, or special properties.
- Do not invent technical craft information that was not stated or reasonably supported.
- If a field is not known, return an empty string.
- If there are no clear features, return an empty array.
- Keywords must be based only on known product information.
- The English description must be suitable for online selling.
- The Hindi description must naturally communicate the same known information.
- Keep the title concise.
- Return JSON only.
- Do not use markdown or code fences.

The selected app language is: ${language}.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: audioData
          }
        },
        {
          text: prompt
        }
      ]
    });

    let text = response.text.trim();

    text = text.replace(/^```json\s*/i, "");
    text = text.replace(/^```\s*/i, "");
    text = text.replace(/\s*```$/i, "");

    const voiceData = JSON.parse(text);

    res.status(200).json({
      success: true,
      data: voiceData
    });

  } catch (error) {
    console.error("Voice AI error:", error);

    res.status(500).json({
      success: false,
      message: "Could not process the voice recording.",
      error: error.message
    });
  }
});

module.exports = router;