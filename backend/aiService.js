const axios = require('axios');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct";

exports.chatWithGroq = async (messages) => {
  try {
    // Check if API key is set
    if (!GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY is not set in environment variables");
      return "*no response* - API key missing";
    }

    console.log("🔑 Using Groq API Key:", GROQ_API_KEY.substring(0, 10) + "...");
    console.log("🤖 Model:", MODEL_NAME);
    console.log("📝 Sending to Groq:", messages);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL_NAME,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const choice = response.data?.choices?.[0];
    const aiMessage = choice?.message?.content;

    console.log("📦 Groq Response Status:", response.status);
    console.log("📦 Groq Response Data:", response.data);

    if (!aiMessage || typeof aiMessage !== 'string') {
      console.error("❌ Empty or invalid AI message:", choice);
      return "*no response*";
    }

    console.log("✅ AI Response:", aiMessage.trim());
    return aiMessage.trim();
  } catch (error) {
    console.error("❌ Groq API error:", error?.response?.data || error.message);
    console.error("❌ Full error:", error);
    return "*no response*";
  }
};

