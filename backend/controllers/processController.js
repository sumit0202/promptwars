const geminiService = require('../services/geminiService');
const { validationResult } = require('express-validator');

/**
 * Controller to handle Intent Processing via Google Gemini
 */
const processIntent = async (req, res, next) => {
    try {
        // 1. Initial Input Validation Check (handled via express-validator attached on route)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return 400 Bad Request if validation rules fail
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { userInput } = req.body;

        console.log(`[INFO] Processing sanitized input length: ${userInput.length} chars`);

        // 2. Delegate to the AI Service
        const result = await geminiService.processIntent(userInput);
        
        // 3. Return structured payload
        res.status(200).json(result);

    } catch (error) {
        // Tag operational API errors with 502 Bad Gateway to signify external API dependency failure, else 500
        if (!error.statusCode) {
            error.statusCode = 502;
            error.isOperational = true;
        }
        next(error); // Pass to centralized error handler
    }
};

module.exports = {
    processIntent
};
