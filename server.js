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

    const result = await model.generateContent(req.body.question);

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
  res.send("hello from Play with files..");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});