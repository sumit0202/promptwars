const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

// POST /api/process
router.post('/process', async (req, res) => {
    try {
        const { userInput } = req.body;
        
        if (!userInput) {
            return res.status(400).json({ error: 'User input is required' });
        }

        console.log(`Processing input: "${userInput}"`);
        
        // Call Gemini Service
        const result = await geminiService.processIntent(userInput);
        
        res.json(result);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

module.exports = router;
