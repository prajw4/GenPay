import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function askGemini(message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const reply = result.response.text();
    return reply;
  } catch (error) {
    console.error("Error in askGemini:", error);
    return "Sorry, something went wrong while processing your request.";
  }
}
