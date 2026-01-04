require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;

console.log("🚀 Voice To Intent backend starting...");

/* CORS */
const corsOptions = {
  origin: ["http://localhost:5173", "https://voice-to-intent.vercel.app"],
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json());

/* Gemini Init */
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

/* Health Check */
app.get("/", (req, res) => {
  res.send("🎙️ Voice To Intent backend is running");
});

/* INTENT EXTRACTION ENDPOINT */
app.post("/api/intent", async (req, res) => {
  const { text } = req.body;
  console.log(text);
  if (!text || !text.trim()) {
    return res.status(400).json({
      message: "Text input is required",
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
const prompt = `
You are an intent extraction engine.

A person may speak casually and emotionally.
Your task is to extract and NORMALIZE intent, and then provide helpful suggestions.

Rules:
- Do NOT repeat the user's sentence verbatim
- Rewrite intent into short, clear, neutral statements
- If the user is unsure or choosing between options, classify as "decisions"
- Only classify as "questions" if asking for factual information
- Do NOT convert decisions into questions
- Suggestions must be practical and actionable
- Suggestions should help the user achieve or manage the extracted intents
- Suggestions must NOT introduce new tasks, reminders, decisions, or questions
- Keep suggestions concise (1–2 lines each)
- Return ONLY valid JSON
- No markdown
- No explanations

Format:
{
  "tasks": [],
  "reminders": [],
  "decisions": [],
  "questions": [],
  "suggestions": []
}

Input:
"${text}"
`;



    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (err) {
      console.error("❌ JSON parse failed:", rawResponse);
      parsed = {
        tasks: [],
        reminders: [],
        decisions: [],
        questions: [],
        suggestions: [],
      };
    }

    res.json(parsed);
  } catch (error) {
    console.error("❌ Intent extraction error:", error.message || error);
    res.status(500).json({
      tasks: [],
      reminders: [],
      decisions: [],
      questions: [],
      suggestions: [],
    });
  }
});

/* CHATBOT ENDPOINT (APP-SCOPED) */
app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      reply: "Please ask a question.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

const prompt = `
You are a chatbot for a specific web application called "Voice to Intent".

ABOUT THE APP:
- Name: Voice to Intent
- Purpose: Convert natural voice or text into structured intent
- Extracts: tasks, reminders, decisions, questions
- Input: Voice or text
- Focused, minimal productivity tool

TECH STACK:
- Frontend: React, Material UI, Tailwind CSS
- Speech Recognition: Web Speech API
- Backend: Node.js, Express
- AI: Google Gemini

OWNER:
- Name: Mayank Gupta
- Email: gupta.mayank.mg02@gmail.com
- LinkedIn: https://www.linkedin.com/in/mayank-gupta-aa1028208

ALLOWED CONVERSATION:
- Friendly greetings (Hi, Hello, Hey, Good morning, Good evening)
- Basic polite questions (How are you?, What is this app?, Who built this?)
- Questions about the app, its usage, features, tech stack, or owner

GREETING BEHAVIOR:
- If the user greets you, respond politely and briefly
- You may introduce the app in one short sentence

STRICT RULES:
- If the question is NOT related to this app AND is NOT a greeting,
  reply EXACTLY with:
  "This doesn't seem relevant to this application, please contact owner"
- Keep answers short and clear
- Do NOT hallucinate features
- Do NOT answer general knowledge questions

User question:
"${message}"
`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    res.json({ reply });
  } catch (error) {
    console.error("❌ Chatbot error:", error.message || error);
    res.json({
      reply:
        "This doesn't seem relevant to this application, please contact owner",
    });
  }
});


/* Server */
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
