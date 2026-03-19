const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL =
  process.env.GEMINI_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function generateResponse(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  try {
    const url = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    console.log("AI request url:", url);

    const res = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: String(prompt) }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const data = res.data;

    // Parse response chuẩn Gemini
    if (
      data?.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0]?.content?.parts?.length > 0
    ) {
      return data.candidates[0].content.parts[0].text;
    }

    return "AI không trả về nội dung.";
  } catch (err) {
    console.error(
      "Gemini API error:",
      err?.response?.status,
      err?.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { generateResponse };