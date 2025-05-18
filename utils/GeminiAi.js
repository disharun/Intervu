const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Validate API key
if (!apiKey) {
  throw new Error(
    "NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables"
  );
}

// Initialize the API
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize the model for content generation
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  apiVersion: "v1beta",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 800,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

// Initialize the chat model
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  apiVersion: "v1beta",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 800,
  },
});

// Create a chat session
const chat = chatModel.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 800,
  },
});

export async function sendChatMessage(message) {
  try {
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Chat message error:", error);
    throw new Error(`Failed to send chat message: ${error.message}`);
  }
}

export async function generateQuestions(
  role,
  description,
  experience,
  numQuestions = 5
) {
  try {
    // Validate inputs
    if (!role || !description || !experience) {
      throw new Error(
        "Missing required parameters: role, description, and experience are required"
      );
    }

    const prompt = `Create ${numQuestions} interview questions for a ${role} position.
Job Description: ${description}
Years of Experience: ${experience}

You MUST return the response in this EXACT JSON format, with no additional text, markdown, or formatting:
{
  "interviewQuestions": [
    {
      "question": "First question here",
      "answer": "Detailed answer here"
    }
  ]
}

IMPORTANT RULES:
1. Return ONLY the JSON object, no other text
2. Do not use markdown formatting (no \`\`\`json)
3. The response must be valid JSON that can be parsed
4. Each question and answer must be a non-empty string
5. Use EXACTLY "interviewQuestions" as the key (camelCase, not snake_case)
6. Keep each answer concise, maximum 3-4 sentences
7. Do not use special characters or formatting in answers
8. Ensure the JSON is complete and properly closed`;

    try {
      // Generate content with proper error handling
      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (!response) {
        throw new Error("No response received from Gemini API");
      }

      const text = response.text();

      if (!text) {
        throw new Error("Empty response received from Gemini API");
      }

      console.log("Raw API Response:", text);

      // Clean the response text
      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Cleaned response:", cleanedText);

      // Try to parse the response as JSON
      let parsedResponse;
      try {
        // First, verify if the JSON is complete
        if (!cleanedText.endsWith("}")) {
          throw new Error("Incomplete JSON response");
        }

        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Raw AI response:", text);
        console.error("Cleaned response:", cleanedText);
        console.error("Parse error:", parseError);
        throw new Error("AI response was not valid JSON");
      }

      // Validate the structure
      if (!parsedResponse || typeof parsedResponse !== "object") {
        throw new Error("AI response is not an object");
      }

      if (!parsedResponse.interviewQuestions) {
        throw new Error("Response missing interviewQuestions array");
      }

      if (!Array.isArray(parsedResponse.interviewQuestions)) {
        throw new Error("interviewQuestions must be an array");
      }

      if (parsedResponse.interviewQuestions.length === 0) {
        throw new Error("No questions were generated");
      }

      // Validate each question
      parsedResponse.interviewQuestions.forEach((q, index) => {
        if (!q || typeof q !== "object") {
          throw new Error(`Question ${index + 1} is not an object`);
        }
        if (typeof q.question !== "string" || !q.question.trim()) {
          throw new Error(`Question ${index + 1} is missing or invalid`);
        }
        if (typeof q.answer !== "string" || !q.answer.trim()) {
          throw new Error(`Answer ${index + 1} is missing or invalid`);
        }
      });

      return parsedResponse;
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (error.message?.includes("models/gemini-pro is not found")) {
        throw new Error(
          "Invalid Gemini API configuration. Please check your API key and model settings."
        );
      }
      // Add more specific error handling
      if (error.message?.includes("PERMISSION_DENIED")) {
        throw new Error("API key is invalid or has insufficient permissions");
      }
      if (error.message?.includes("UNAUTHENTICATED")) {
        throw new Error("Invalid API key");
      }
      throw error;
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

// Export both the chat session and the sendMessage function
export const chatSession = {
  sendMessage: sendChatMessage,
};
