const request = require('supertest');
const app = require('../server');

// Mock the Gemini API Service to avoid real network requests during integration tests
jest.mock('../services/geminiService', () => {
    return {
        processIntent: jest.fn(async (userInput) => {
            if (!userInput || userInput.trim() === '') {
                throw new Error("Input is missing");
            }
            if (userInput.includes('error test')) {
                throw new Error("Simulated Gemini Error");
            }
            if (userInput.toLowerCase().includes('heart attack')) {
                return {
                    intent: "emergency_medical",
                    risk_level: "high",
                    entities: { location: "unknown", issue: "heart attack" },
                    actions: ["Call ambulance", "Perform CPR if unconscious"],
                    authorities: ["Emergency Medical Services"]
                };
            }
            if (userInput.toLowerCase().includes('noise complaint')) {
                return {
                    intent: "civic_issue",
                    risk_level: "low",
                    entities: { location: "unknown", issue: "noise" },
                    actions: ["Contact non-emergency line"],
                    authorities: ["Police (Non-Emergency)"]
                };
            }
            return {
                intent: "general_help",
                risk_level: "low",
                entities: { location: "unknown", issue: "general" },
                actions: ["Provide helpful info"],
                authorities: []
            };
        })
    };
});

describe('POST /api/process', () => {
    
    // Positive Test Case: High Urgency Medical Input
    it('should process a valid medical emergency input successfully', async () => {
        const response = await request(app)
            .post('/api/process')
            .send({ userInput: "My father is having a heart attack!" })
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('intent', 'emergency_medical');
        expect(response.body).toHaveProperty('risk_level', 'high');
        expect(response.body.actions).toContain('Call ambulance');
    });

    // Positive Test Case: Low Urgency Civic Issue
    it('should process a valid civic input with low urgency', async () => {
        const response = await request(app)
            .post('/api/process')
            .send({ userInput: "There is a noise complaint next door." })
            .expect(200);

        expect(response.body).toHaveProperty('intent', 'civic_issue');
        expect(response.body).toHaveProperty('risk_level', 'low');
    });

    // Negative Test Case: Missing input
    it('should return 400 Bad Request if userInput is entirely missing', async () => {
        const response = await request(app)
            .post('/api/process')
            .send({})
            .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.errors[0]).toHaveProperty('msg', 'User input is required.');
    });

    // Negative Test Case: Empty string
    it('should return 400 Bad Request if userInput is an empty string', async () => {
        const response = await request(app)
            .post('/api/process')
            .send({ userInput: "   " })
            .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body.errors[0]).toHaveProperty('msg', 'Input cannot be entirely blank spaces.');
    });

    // Edge Test Case: Excessively long input (assuming your router handles it gracefully, or simulating error)
    it('should handle typical processing errors gracefully and return 500 or 502', async () => {
        const response = await request(app)
            .post('/api/process')
            .send({ userInput: "error test string" })
            .expect(502);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Simulated Gemini Error');
    });

    // Edge Test Case: SQL Injection/XSS attempt (should be passed to string and safely handled)
    it('should process special characters safely without crashing', async () => {
        const response = await request(app)
            .post('/api/process')
            .send({ userInput: "<script>alert('xss')</script> OR 1=1" })
            .expect(200);

        expect(response.body).toHaveProperty('intent', 'general_help');
    });
});
