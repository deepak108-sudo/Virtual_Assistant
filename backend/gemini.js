import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_URL;

    const prompt = `
You are a voice assistant named ${assistantName}, created by ${userName}.
Understand the user's command and return a JSON response like:

{
  "type": "<command type>",
  "userInput": "<cleaned user question>",
  "response": "<natural spoken reply>"
}

For factual questions like "Who is the Prime Minister of India", "What is the capital of France", etc., 
ALWAYS use: "type": "general" with a direct answer in "response".

Use "google_search" ONLY if the question is vague, personal, or unanswerable.

Examples:
- User: "Who is the Prime Minister of India?"
  → { "type": "general", "userInput": "...", "response": "The Prime Minister of India is Narendra Modi." }

- User: "Search for top 10 programming languages"
  → { "type": "google_search", "userInput": "...", "response": "Searching Google for that." }

Command: "${command}"
Only return valid JSON.
`;


    const result = await axios.post(apiUrl, {
      contents: [{ parts: [{ text: prompt.trim() }] }],
    });

    const raw = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw || typeof raw !== "string") {
      throw new Error("Invalid Gemini response");
    }

    return raw; // JSON string from Gemini
  } catch (error) {
    console.error("Gemini Error:", error.message);

    return JSON.stringify({
      type: "fallback_type",
      userInput: command,
      response: "Sorry, I couldn’t process your request.",
    });
  }
};

export default geminiResponse;
