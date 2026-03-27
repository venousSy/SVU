const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

const generateTestFromText = async (text) => {
  const rawApiKey = process.env.GENAI_API_KEY;
  if (!rawApiKey) {
    console.error("AI Service Error: GENAI_API_KEY is missing from process.env");
    throw new Error("Missing Gemini API Key. Please check Railway variables.");
  }

  const apiKey = rawApiKey.trim();
  // Diagnostic: Check API Key length and mask (first 4, last 4)
  const maskedKey = apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
  console.log(`[aiService] Debug: Using API Key (Masked: ${maskedKey}, Length: ${apiKey.length})`);

  // Refresh genAI instance with trimmed key to be safe
  const localGenAI = new GoogleGenerativeAI(apiKey);

  const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "models/gemini-1.5-flash",
    "gemini-1.5-pro",
    "models/gemini-1.5-pro",
    "gemini-pro",
    "models/gemini-pro"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[aiService] Attempting generation with model: ${modelName}`);
      const model = localGenAI.getGenerativeModel({ model: modelName });

      const prompt = `
Role: You are an Academic Assessment Expert for the Syrian Virtual University (SVU) Computer Science programs.
Objective: Convert the provided Markdown text into a standardized MCQ test in JSON.
Language: English.
Constraints: 10 questions, 4 options (A, B, C, D), correct_answer, explanation, difficulty.
JSON Only. No markdown blocks.

Input Text:
${text}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      }

      console.log(`[aiService] Success with model: ${modelName}`);
      return JSON.parse(responseText);

    } catch (error) {
      lastError = error;
      // If it's a 404 (Model not found), try the next one
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('not found')) {
        console.warn(`[aiService] Model ${modelName} not found (404). Trying next...`);
        continue;
      }
      // If it's a different error (like 429 or auth), break early
      console.error(`[aiService] Permanent Error with ${modelName}:`, error.message);
      break;
    }
  }

  throw new Error(`AI Generation failed after trying multiple models. Last error: ${lastError?.message}`);
};

module.exports = { generateTestFromText };
