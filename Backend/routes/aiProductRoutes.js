const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const {
      productInput,
      category,
      rawMaterialCost,
      quantity,
      dimensions,
      weight
    } = req.body;

    if (!productInput || !productInput.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product information is required."
      });
    }

    const prompt = `
You are the product intelligence assistant for ShilpAura,
an application helping Indian artisans turn handmade products
into online-ready products.

The artisan may provide only a simple natural description.
They may not know technical craft, e-commerce, SEO, or marketplace terminology.

Your job is to:
1. Understand what the artisan said.
2. Extract information that is clearly available.
3. Infer simple product attributes only when they are reasonably supported
   by the information provided.
4. Never invent unsupported facts.
5. Create professional marketplace content from the available information.
6. Keep unknown fields empty.

Artisan's description:
"${productInput}"

Additional information provided by the artisan/app:
Category: "${category || ""}"
Raw material cost: "${rawMaterialCost ?? ""}"
Quantity: "${quantity ?? ""}"
Dimensions: "${dimensions || ""}"
Weight: "${weight || ""}"

Return ONLY valid JSON using exactly this structure:

{
  "title": "",
  "category": "",
  "material": "",
  "color": "",
  "design": "",
  "technique": "",
  "features": [],
  "descriptionEnglish": "",
  "descriptionHindi": "",
  "keywords": []
}

Rules:
- Do not invent facts.
- Do not claim certifications, origins, brands, quality grades, or special properties
  unless the artisan clearly mentioned them.
- If material is not known, return "".
- If color is not known, return "".
- If design or motif is not known, return "".
- If technique is not known, return "".
- If no features are clearly available, return [].
- Category may use the provided category when appropriate.
- The English description should be clear, concise, and suitable for online selling.
- The Hindi description should naturally communicate the same information.
- Keywords should be useful for online search and should only be based on
  known product information.
- Keep the title concise and marketplace-friendly.
- Return JSON only.
- Do not use markdown or code fences.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    let text = response.text.trim();

    text = text.replace(/^```json\s*/i, "");
    text = text.replace(/^```\s*/i, "");
    text = text.replace(/\s*```$/i, "");

    const productData = JSON.parse(text);

    res.status(200).json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error("Gemini product generation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate product information.",
      error: error.message
    });
  }
});

module.exports = router;