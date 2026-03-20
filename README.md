# Universal Intent-to-Action Bridge

An AI-powered web application that acts as an emergency response triage system. It converts unstructured real-world inputs (like voice transcripts, event descriptions) into structured actionable JSON, identifying intents, extracting entities, estimating risk, and suggesting concrete actions.

### Chosen Vertical
**Crisis Management & Emergency Response.** This project acts as a middle-layer between panicked or unstructured distress signals (voice, text) and structured systems (911 dispatchers, emergency responders, or volunteer networks).

### Approach and Logic
1. **Dynamic Input Processing**: Converts natural human language into rigid JSON objects. This handles ambiguous scenarios (e.g., distinguishing a loud party from an active robbery) seamlessly.
2. **Context-Aware Decision Making**: Analyzes factors like missing entities or urgency. If "fire" is detected without an explicit location, the logic ensures responders are alerted to a "high" risk level even if the address is "unknown" so they can trace the location themselves.
3. **Robust Separation of Concerns**: We separated logic into distinct services. A `geminiService.js` wraps the Gemini API securely. A rate-limiter prevents abuse, and HTTP headers restrict attack vectors.
4. **Resiliency over Perfection**: Testing layers ensure that even if the AI responds in malformed structures or if the endpoint experiences extremely heavy server load, it will gracefully fall back to an error state without crashing the container.

### How the Solution Works
1. A user, responder, or API client sends an unstructured input phrase to the `/api/process` endpoint.
2. The core backend processes this using the Gemini-2.5-flash model via a highly tuned, strict system prompt forcing JSON outputs.
3. The response evaluates the `intent`, `risk_level`, `entities`, `actions`, and `authorities`.
4. The React/Vanilla frontend parses the JSON, updates visual urgency components (color-coded risk banners), and formats actionable steps.

### Assumptions Made
- The integration environment provides standard inputs via text APIs. If handling voice or image, it is assumed those streams have already been translated to text before hitting this specific processing endpoint.
- Network bandwidth is sufficient for API calls.
- Gemini processing time operates within a 15-second response window to prevent client timeouts.

---

## 🚀 Features & Evaluation Focus Areas
- **Code Quality**: Clean, modular structure separating UI, Routes, Services, and Tests.
- **Security**: Hardened Express application using `helmet` for Security Headers, HTTP Rate-Limiting, CORS scoping, and hidden `.env`.
- **Efficiency**: Written using raw modern JavaScript and `node:18-alpine` inside Docker to load quickly. Minimum memory footprint.
- **Testing**: Complete E2E testing framework via Jest and Supertest. Includes *Positive*, *Negative*, and *Edge/Security* cases. Includes an automated *Load Test* script.
- **Accessibility**: Valid, semantic HTML with full ARIA implementations, explicit contrasts, and screen-recorder hidden decorative icons.
- **Google Services**: Meaningful integration of the Google Gemini SDK for pure, generative decision-making workflows.

---

## 🛠️ Setup Instructions & Scripts

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables:**
   Use the `.env` template to add your Gemini Key.
   \`\`\`
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   \`\`\`

3. **Running tests:**
   \`\`\`bash
   # Run all Unit & Integration Tests (Jest)
   npm run test
   
   # Run Load Testing (Autocannon)
   npm run load
   \`\`\`

4. **Start Application Locally:**
   \`\`\`bash
   npm start
   \`\`\`
