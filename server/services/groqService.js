const Groq = require("groq-sdk");
//this is a comment to try committing
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function parseJsonResponse(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

async function generateChallenge({ topic, difficulty, category }) {
  const prompt = `
You are a coding challenge author for an educational platform called TheDevStudio.

Create ONE programming challenge with these constraints:
- Topic/focus: ${topic || "general algorithms"}
- Difficulty: ${difficulty || "medium"}
- Category: ${category || "Arrays"}
- Language: JavaScript
- Suitable for university students

Return ONLY valid JSON in this exact shape. No markdown. No explanation:
{
  "title": "string",
  "description": "string with problem statement, constraints, and examples",
  "difficulty": "easy",
  "category": "Arrays",
  "points": 100,
  "starterCode": "function solve(input) {\\n  // Your code here\\n}",
  "testCases": [
    { "input": "string", "expectedOutput": "string", "isHidden": false }
  ]
}

Rules:
- Include at least 3 test cases
- starterCode must be a JavaScript function skeleton
- difficulty must be lowercase: easy, medium, or hard
- category must be one of: Arrays, Strings, Trees, Graphs, Dynamic Programming, Sorting
- points: easy=50, medium=100, hard=150
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0].message.content;
  return parseJsonResponse(text);
}

module.exports = { generateChallenge };