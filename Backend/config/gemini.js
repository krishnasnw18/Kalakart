const { GoogleGenAI } = require("@google/genai");

const getApiKey = () =>
  process.env.CHATBOT_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  "";

const getModelName = () =>
  process.env.CHATBOT_GEMINI_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemini-3.6-flash";

function parseImageData(imageData) {
  if (!imageData || typeof imageData !== "string") {
    return null;
  }

  const match = imageData.match(
    /^data:(image\/[\w.+-]+);base64,(.+)$/
  );

  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }

  return {
    mimeType: "image/jpeg",
    data: imageData
  };
}

async function generateAIResponse({
  systemInstruction,
  contents,
  image,
  preferredModel
}) {
  const apiKey = getApiKey();

  if (!apiKey) {
    const error = new Error(
      "Gemini API key is not configured on the backend server."
    );
    error.code = "GEMINI_AUTH";
    throw error;
  }

  const targetModel = preferredModel || getModelName();
  const parsedImage = parseImageData(image);

  const contentsCopy = JSON.parse(
    JSON.stringify(Array.isArray(contents) ? contents : [])
  );

  if (parsedImage && contentsCopy.length > 0) {
    const lastTurn = contentsCopy[contentsCopy.length - 1];

    if (lastTurn && lastTurn.role === "user") {
      if (!Array.isArray(lastTurn.parts)) {
        lastTurn.parts = [];
      }

      lastTurn.parts.unshift({
        inlineData: {
          mimeType: parsedImage.mimeType,
          data: parsedImage.data
        }
      });
    }
  }

  if (contentsCopy.length === 0) {
    contentsCopy.push({
      role: "user",
      parts: [{ text: "Hello" }]
    });
  }

  const ai = new GoogleGenAI({
    apiKey
  });

  console.log(`Gemini request → model: ${targetModel}`);

  try {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: contentsCopy,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: "minimal"
        }
      }
    });

    if (response?.text && response.text.trim()) {
      console.log("Gemini response received successfully.");
      return response.text;
    }

    const error = new Error("Gemini returned an empty response.");
    error.code = "GEMINI_EMPTY_RESPONSE";
    throw error;

  } catch (error) {
    const status =
      error?.status ||
      error?.statusCode ||
      error?.response?.status;

    const message = error?.message || String(error);

    console.error("Gemini API Error:", {
      status,
      message,
      model: targetModel
    });

    if (
      status === 429 ||
      message.includes("429") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("quota")
    ) {
      const quotaError = new Error(
        "Gemini quota exceeded or temporarily unavailable."
      );
      quotaError.code = "GEMINI_QUOTA";
      quotaError.status = 429;
      throw quotaError;
    }

    if (
      status === 401 ||
      message.includes("API key") ||
      message.includes("INVALID_ARGUMENT")
    ) {
      const authError = new Error(
        "Gemini API key is invalid or not authorized."
      );
      authError.code = "GEMINI_AUTH";
      authError.status = 401;
      throw authError;
    }

    if (status === 403) {
      const permissionError = new Error(
        "Gemini API permission denied."
      );
      permissionError.code = "GEMINI_PERMISSION";
      permissionError.status = 403;
      throw permissionError;
    }

    if (
      status === 404 ||
      message.includes("model not found") ||
      message.includes("not found")
    ) {
      const modelError = new Error(
        `Gemini model "${targetModel}" was not found.`
      );
      modelError.code = "GEMINI_MODEL_NOT_FOUND";
      modelError.status = 404;
      throw modelError;
    }

    const apiError = new Error(
      `Gemini AI request failed: ${message}`
    );
    apiError.code = "GEMINI_API_ERROR";
    apiError.status = status;
    throw apiError;
  }
}

module.exports = {
  getApiKey,
  generateAIResponse,
  GEMINI_MODEL: getModelName()
};