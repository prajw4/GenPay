const dotenv = require("dotenv");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let initPromise = null;

if (!apiKey) {
  console.warn("[GeminiService] GEMINI_API_KEY is not set. AI features will use fallback responses.");
}

async function getClient() {
  if (!apiKey) return null;
  if (genAI) return genAI;
  if (!initPromise) {
    initPromise = import("@google/generative-ai")
      .then(({ GoogleGenerativeAI }) => {
        genAI = new GoogleGenerativeAI(apiKey);
        return genAI;
      })
      .catch(err => {
        console.error("[GeminiService] Failed to init GoogleGenerativeAI:", err);
        return null;
      });
  }
  return initPromise;
}

async function askGemini(message) {
  const client = await getClient();
  if (!client) {
    return "AI insights are unavailable because the AI service is not configured.";
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const reply = result.response.text();
    return reply;
  } catch (error) {
    console.error("Error in askGemini:", error);
    return "Sorry, something went wrong while processing your request.";
  }
}

module.exports = { askGemini };
