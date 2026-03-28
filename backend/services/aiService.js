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

  // PRE-FLIGHT DIAGNOSTIC: List all models this key can see
  try {
    const axios = require('axios');
    console.log("[aiService] Diagnostic: Attempting to list all models available to this key...");
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const listResponse = await axios.get(listUrl);
    if (listResponse.data && listResponse.data.models) {
      const modelNames = listResponse.data.models.map(m => m.name.replace('models/', ''));
      console.log(`[aiService] Diagnostic: SUCCESS. I can see these models: ${modelNames.join(', ')}`);
    } else {
      console.warn("[aiService] Diagnostic: No models returned from the API.");
    }
  } catch (diagError) {
    console.error("[aiService] Diagnostic Model Listing FAILED:", diagError.response?.status || diagError.message);
    if (diagError.response && diagError.response.data) {
       console.error("[aiService] Diagnostic Error Data:", JSON.stringify(diagError.response.data));
    }
  }

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
    "gemini-2.0-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
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

MUST strictly follow this exact JSON schema:
{
  "test_metadata": {
    "subject": "Topic Name Here"
  },
  "questions": [
    {
      "id": "q1",
      "question_text": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "correct_answer": "A",
      "explanation": "...",
      "difficulty": "Easy"
    }
  ]
}

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
      console.warn(`[aiService] SDK Model ${modelName} failed: ${error.message}. Trying next...`);
      continue;
    }
  }

  // LAST RESORT: Direct REST call to bypass SDK
  console.log("[aiService] All SDK models failed. Attempting last-resort direct REST call...");
  const restFallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const fallbackModel of restFallbackModels) {
    try {
      const axios = require('axios');
      const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`;
      
      const restResponse = await axios.post(restUrl, {
        contents: [{ parts: [{ text: prompt }] }]
      }, { timeout: 30000 });

      if (restResponse.data && restResponse.data.candidates) {
        let restText = restResponse.data.candidates[0].content.parts[0].text.trim();
        if (restText.startsWith('```')) {
          restText = restText.replace(/^```json/, '').replace(/```$/, '').trim();
        }
        console.log(`[aiService] Direct REST call SUCCEEDED with ${fallbackModel}!`);
        return JSON.parse(restText);
      }
    } catch (restError) {
      console.error(`[aiService] Direct REST call FAILED for ${fallbackModel}:`, restError.response?.status || restError.message);
      if (restError.response && restError.response.data) {
          console.error("[aiService] REST Error Details:", JSON.stringify(restError.response.data));
      }
      lastError = restError;
    }
  }

  throw new Error(`AI Generation failed (SDK & REST). Last error: ${lastError?.message}`);
};

module.exports = { generateTestFromText };
