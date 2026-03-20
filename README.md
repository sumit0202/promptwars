# Universal Intent-to-Action Bridge

An AI-powered web application that acts as an emergency response triage system. It converts unstructured real-world inputs (like voice transcripts, event descriptions) into structured actionable JSON, identifying intents, extracting entities, estimating risk, and suggesting concrete actions.

## 🚀 Features
- **Prompt Analysis:** Utilizes the Gemini API to analyze emergency contexts accurately.
- **Structured JSON Output:** Returns clean JSON extracting the issue, location, risk level, actions, and authorities to contact.
- **Dynamic UI:** A clean, responsive dashboard displaying structured details intuitively.
- **Modularity:** Separation of frontend and backend concerns.

## ⚙️ Tech Stack
- Frontend: HTML5, Tailwind CSS (via CDN), Vanilla JavaScript
- Backend: Node.js, Express
- AI Integration: Google Gemini API SDK

## 📁 Project Structure
\`\`\`
/project
  /frontend
    index.html
    app.js
    styles.css
  /backend
    server.js
    routes/
      api.js
    services/
      geminiService.js
  .env                  # Environment Variables
  package.json          # Node dependencies
  README.md             # Project Documentation
\`\`\`

## 🛠️ Setup Instructions

1. **Clone or Download the Project.**
2. **Navigate to the Project Directory:**
   \`\`\`bash
   cd project
   \`\`\`
   
3. **Install Dependencies:**
   Make sure you have Node.js installed, then run:
   \`\`\`bash
   npm install
   \`\`\`

4. **Set Up the Environment Variables:**
   - Open the `.env` file in the root directory.
   - Replace `your_gemini_api_key_here` with your actual Google Gemini API Key.
   \`\`\`
   PORT=3000
   GEMINI_API_KEY=your_real_api_key
   \`\`\`

## 🏃 How to Run Locally

1. **Start the Application Server**
   From the root project directory, run:
   \`\`\`bash
   npm start
   \`\`\`

2. **Open the Application**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## 🧪 Example API Response
\`\`\`json
{
  "intent": "emergency_medical",
  "risk_level": "high",
  "entities": {
    "location": "unknown",
    "issue": "chest pain and heavy sweating"
  },
  "actions": [
    "Have the person sit down or lie down",
    "Keep the person calm and warm",
    "Ask if they take any heart medication like nitroglycerin and help them take it if prescribed",
    "If unconscious, prepare to perform CPR"
  ],
  "authorities": [
    "Ambulance (e.g., 911)"
  ]
}
\`\`\`

Prepared for the Hackathon! 🎉
