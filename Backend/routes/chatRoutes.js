const express = require("express");
const crypto = require("crypto");
const {
  generateAIResponse,
  getApiKey
} = require("../config/gemini");

const router = express.Router();

// In-memory conversation history
// conversationId -> [{ role: "user" | "model", text: string }]
const conversationStore = new Map();
const MAX_HISTORY_TURNS = 10;

/**
 * Detect language.
 * ShilpAura currently supports English and Hindi only.
 */
function autoDetectLanguage(text, requestedLang) {
  if (
    requestedLang &&
    ["en", "hi"].includes(requestedLang.toLowerCase())
  ) {
    return requestedLang.toLowerCase();
  }

  if (!text) return "en";

  // Hindi / Devanagari detection
  const devanagariPattern = /[\u0900-\u097F]/;

  if (devanagariPattern.test(text)) {
    return "hi";
  }

  return "en";
}

router.post("/", async (req, res) => {
  try {
    const {
      message,
      conversationId,
      language,
      image
    } = req.body;

    // Require text or image
    const hasMessage =
      typeof message === "string" &&
      message.trim().length > 0;

    const hasImage =
      typeof image === "string" &&
      image.trim().length > 0;

    if (!hasMessage && !hasImage) {
      return res.status(400).json({
        success: false,
        message: "A text message or an image attachment is required."
      });
    }

    const trimmedMessage = hasMessage
      ? message.trim()
      : "Describe this product/image and provide useful business suggestions.";

    // Prevent huge requests
    if (trimmedMessage.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Message is too long. Please limit it to 3000 characters."
      });
    }

    // Existing conversation or new one
    const currentConvId =
      conversationId &&
      typeof conversationId === "string" &&
      conversationId.trim()
        ? conversationId.trim()
        : `conv_${crypto.randomBytes(8).toString("hex")}`;

    const lang = autoDetectLanguage(
      trimmedMessage,
      language
    );

    // This now resolves CHATBOT_GEMINI_API_KEY first
    const apiKey = getApiKey();

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Chatbot Gemini API key is not configured."
      });
    }

    // Language instruction
    const languagePrompt =
      lang === "hi"
        ? "Respond in clear Hindi using Devanagari script."
        : "Respond in clear English.";

    const systemInstruction = `
You are ShilpAura AI Sahayak, an AI business assistant for Indian artisans and micro-entrepreneurs.

Your job is to help artisans with:
- Product pricing
- Product descriptions
- Selling online
- Marketplace listings
- Product ideas
- Basic business guidance
- Marketing suggestions
- Understanding their products

Understand English and Hindi.

${languagePrompt}

Keep answers practical, concise, and easy for an artisan to understand.

Do not invent prices, certifications, marketplace policies, customer data, sales figures, or other factual business information that has not been provided.

When information is missing, clearly say so instead of making it up.
`;

    // Retrieve conversation history
    let history =
      conversationStore.get(currentConvId) || [];

    const contents = [];

    // Add recent conversation
    const recentHistory =
      history.slice(-MAX_HISTORY_TURNS);

    for (const item of recentHistory) {
      contents.push({
        role:
          item.role === "user"
            ? "user"
            : "model",
        parts: [
          {
            text: item.text
          }
        ]
      });
    }

    // Current user message
    contents.push({
      role: "user",
      parts: [
        {
          text: trimmedMessage
        }
      ]
    });

    // Ask Gemini
    const replyText = await generateAIResponse({
      systemInstruction,
      contents,
      image: hasImage ? image : null,
      preferredModel: "gemini-3.6-flash"
    });

    const reply =
      replyText ||
      "Sorry, I could not generate a response. Please try again.";

    console.log("=================================");
    console.log("POST /api/chat");
    console.log("USER:", trimmedMessage);
    console.log("AI:", reply);
    console.log("CONVERSATION ID:", currentConvId);
    console.log("=================================");

    // Save conversation
    history.push({
      role: "user",
      text: trimmedMessage
    });

    history.push({
      role: "model",
      text: reply
    });

    // Keep only latest 20 messages
    if (history.length > 20) {
      history = history.slice(-20);
    }

    conversationStore.set(
      currentConvId,
      history
    );

    return res.json({
      success: true,
      reply,
      conversationId: currentConvId
    });

  } catch (error) {
    console.error("Chat API Error:", error);

    const status =
      error.status ||
      (error.code === "GEMINI_QUOTA" ? 429 : 500);

    return res.status(status).json({
      success: false,
      message:
        error.message ||
        "An unexpected error occurred while communicating with the AI model."
    });
  }
});

module.exports = router;