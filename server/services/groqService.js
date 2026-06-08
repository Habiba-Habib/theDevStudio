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
- Include exactly 1 test case
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
async function askDevStudioAssistant({ message, courses = [], user = null }) {
  const courseList = courses.length
    ? courses.map(course => {
        return `- ${course.title} | ${course.category} | ${course.level} | $${course.price} | ${course.duration || "No duration"}`;
      }).join("\n")
    : "No published courses were found.";

  const userContext = user
    ? `The current user is logged in as ${user.role}. Their name is ${user.name}.`
    : "The current user is not logged in.";

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
You are The Dev Studio assistant.

The Dev Studio is a coding education platform with:
- Courses
- Coding challenges
- Student dashboard
- Payments/enrollment
- Instructor applications
- Admin management

Your job:
- Help users navigate the website
- Recommend relevant published courses
- Explain how to enroll
- Explain where to find challenges
- Explain student/instructor features
- Keep answers short and friendly
- Do not invent routes that are not listed

Valid website routes:
- Home: /
- All courses: /courses/all-courses
- Coding challenges: /challenges
- Student dashboard: /student/dashboard
- My courses: /student/my-courses
- Become instructor: /become-instructor
- Login: /auth/login
- Signup: /auth/signup

${userContext}

Published courses currently available:
${courseList}
`
      },
      {
        role: "user",
        content: message
      }
    ],
    temperature: 0.4
  });

  return completion.choices[0].message.content;
}
module.exports = { generateChallenge, askDevStudioAssistant };