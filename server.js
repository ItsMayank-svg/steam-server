require("dotenv").config();
const cors = require("cors");
const express = require("express");
const formidable = require("formidable-serverless");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = 5000;
console.log("inside server.js");

const corsOptions = {
  origin: "*",
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const prompt =
  "You are an AI assistant designed for a company named M.I.W.A which works on transforming education start-up integrating arts into STEM to create STEAM. education. If you are asked a question related to the MIWA or education system reply in precise manner but if anyone asks any random question which is not related to education or the company reply with a message like 'I'm sorry, I don't find the question relevant to our company. If you still have any query contact founder of M.I.W.A, Mr. Uttam Sharma, mail: uttamsharma78@gmail.com'. Question: ";
  
// const main = async () => {
//   const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash",
//   });

//   const result = await model.generateContent("where is taj mahal, and also tell me some details about it. The response you generate should not contain bold font style");

//   const answer = result.response.text();
//   console.log("Answer: ", answer);
// };

// main();

app.post("/api/text", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt + req.body.question);

    const answer = result.response.text();
    res.json({ answer });
    console.log("Answer: ", answer);
  } catch (error) {
    console.error("Error details:", error.message || error);
    if (error.message === "Unsupported file type.") {
      res.send({ answer: error.message });
    } else {
      res.send({
        answer:
          "An error occurred, if this continues for other input as well. Contact the owner.",
      });
    }
  }
});

app.get("/", (req, res) => {
  res.send("hello from STEAM Server...");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
