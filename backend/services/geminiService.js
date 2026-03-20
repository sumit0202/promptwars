const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Process user input using Gemini API to extract intent, entities, risk level, and actions.
 * @param {string} userInput - The user's input text
 * @returns {Promise<Object>} - The structured JSON response
 */
async function processIntent(userInput) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is missing in the environment variables');
        }

        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        
        const prompt = `You are an emergency response AI.

Analyze the following user input and return STRICT JSON:

{
  "intent": "string",
  "risk_level": "low" | "medium" | "high",
  "entities": {
    "location": "string",
    "issue": "string"
  },
  "actions": ["string"],
  "authorities": ["string"]
}

User Input:
${userInput}

Rules:
- No explanation
- Only JSON
- Actions must be practical and immediate`;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        // Clean up markdown formatting if the model returns it
        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
        }
        
        return JSON.parse(responseText);
    } catch (error) {
        console.error('Error in geminiService:', error);
        throw new Error('Failed to process input with Gemini API');
    }
}

module.exports = {
    processIntent
};
