require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

async function test() {
  const apiKey = process.env.GENAI_API_KEY;
  if (!apiKey) {
    console.error("No API Key found in .env");
    return;
  }

  console.log("Testing with API Key length:", apiKey.length);
  const localGenAI = new GoogleGenerativeAI(apiKey);

  try {
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await axios.get(listUrl);
    console.log("Available models:");
    listResponse.data.models.forEach(m => console.log(m.name));
  } catch (err) {
    console.error("Failed to list models via REST", err.response?.status, err.response?.data);
  }

  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  for(const modelName of models) {
    try {
        console.log(`\nTesting SDK model: ${modelName}`);
        const model = localGenAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello!");
        console.log(`Success with ${modelName}:`, result.response.text());
        break; 
    } catch (err) {
        console.error(`Failed ${modelName}:`, err.status, err.message);
    }
  }
}

test();
