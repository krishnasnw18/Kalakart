const { GoogleGenAI } = require("@google/genai");

const getImageGeminiApiKey = () => {
  return process.env.IMAGE_ENHANCEMENT_GEMINI_API_KEY || "";
};

const getImageGeminiClient = () => {
  const apiKey = getImageGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      "Image enhancement Gemini API key is not configured."
    );
  }

  return new GoogleGenAI({
    apiKey
  });
};

module.exports = {
  getImageGeminiApiKey,
  getImageGeminiClient,
  IMAGE_MODEL: "gemini-3.1-flash-image"
};