const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateChallenge({ topic, difficulty, category }) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `
You are a coding challenge author for an educational platform called TheDevStudio.

Create ONE programming challenge with these constraints:
- Topic/focus: ${topic || "general algorithms"}
- Difficulty: ${difficulty || "medium"}
- Category: ${category || "Arrays"}
- Language: JavaScript
- Suitable for university students

Return ONLY valid JSON in this exact shape (no markdown, no extra text):
{
  "title": "string",
  "description": "string with problem statement, constraints, and examples",
  "difficulty": "easy" | "medium" | "hard",
  "category": "Arrays" | "Strings" | "Trees" | "Graphs" | "Dynamic Programming" | "Sorting",
  "points": number,
  "starterCode": "string",
  "testCases": [
    { "input": "string", "expectedOutput": "string", "isHidden": false }
  ]
}

Rules:
- Include at least 3 test cases
- starterCode must be a JavaScript function skeleton
- difficulty must be lowercase: easy, medium, or hard
- points: easy=50, medium=100, hard=150 (approximate)
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
}

module.exports = { generateChallenge };