const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

try {
    const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY || "dummy-key");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Successfully initialized GoogleGenerativeAI and got model instance.");
    process.exit(0);
} catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error);
    process.exit(1);
}
