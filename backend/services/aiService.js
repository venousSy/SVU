const { GoogleGenerativeAI } = require("@google/genai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);

const generateTestFromText = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Role: You are an Academic Assessment Expert for the Syrian Virtual University (SVU) Computer Science programs.

Objective: Convert the provided Markdown text (extracted from study materials) into a standardized Multiple Choice Question (MCQ) test.

Standardized Constraints (SVU Style):
1. Question Type: 100% Multiple Choice Questions (MCQs).
2. Options: Each question must have exactly 4 options (A, B, C, D).
3. Distractors: Follow "Millman’s Criteria"—distractors must be plausible, related to the topic, and approximately the same length as the correct answer. Avoid "All of the above" or "None of the above" unless necessary.
4. Difficulty Distribution:
   - 30% Knowledge (Definitions, basic facts).
   - 50% Understanding (Interpreting concepts, explaining "why").
   - 20% Application (Problem-solving, code analysis, or scenario-based).
5. Language: Use technical English (standard for SVU Computer Science courses), ensuring terminology matches the provided text exactly.

Output Format (JSON): Return the test in a structured JSON format. 
Do not include any conversational filler, markdown formatting blocks (like \`\`\`json), or explanations outside the JSON object.

JSON Schema:
{
  "test_metadata": { "subject": "Extract from text", "total_questions": 10 },
  "questions": [
    {
      "id": 1,
      "question_text": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct_answer": "A",
      "explanation": "...",
      "difficulty": "Knowledge"
    }
  ]
}

Input Text:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text().trim();

    // Remove markdown code blocks if the model included them despite instructions
    if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error(`Failed to generate test: ${error.message}`);
  }
};

module.exports = { generateTestFromText };
