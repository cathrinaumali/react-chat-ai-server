require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.ORIGIN || "http://localhost:3000";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

app.use(
  cors({
    origin: ORIGIN,
  })
);

// Route to handle requests
app.get("/api/generate", async (req, res) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  try {
    const prompt = req.query.prompt || "Hello, how are you?";
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Start the chat session
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });

    // Send a message to the AI
    const result = await chatSession.sendMessage(prompt);

    // Return the AI response as JSON
    return res.json({
      success: true,
      prompt: prompt,
      response: result.response.text(),
    });
  } catch (error) {
    console.error("Error during API request:", error);

    // Return error response
    return res.status(500).json({
      success: false,
      message: "Failed to generate a response.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
