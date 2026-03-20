const geminiService = require('../services/geminiService');
const { validationResult } = require('express-validator');
const NodeCache = require('node-cache');

// Initialize Memory Cache allocating resources efficiently (Optimal CPU/Latency)
// TTL: 1 Hour (3600 seconds). Prevents wasting Gemini API quota on duplicate submissions.
const aiCache = new NodeCache({ stdTTL: 3600, checkperiod: 600, useClones: false });

/**
 * Controller explicitly handling Intent Processing via Google Gemini 
 * Integrates Input Sanitization, Caching layers, and Service calls securely.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response payload
 * @param {Function} next - Error middleware pipeline hook
 */
const processIntent = async (req, res, next) => {
    try {
        // 1. Validate constraints directly attached on route (prevents processing Malformed input)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { userInput } = req.body;
        const normalizedInput = userInput.trim().toLowerCase();
        
        // 2. Optimization Layer: Resource-efficient Response Caching bypassing LLM processing
        const cacheHashKey = Buffer.from(normalizedInput).toString('base64');
        const cachedResponse = aiCache.get(cacheHashKey);
        
        if (cachedResponse) {
            console.log(JSON.stringify({ severity: 'INFO', message: `Cache HIT [efficiency optimized] - Served from Memory` }));
            return res.status(200).json(cachedResponse);
        }

        console.log(JSON.stringify({ severity: 'INFO', message: `Processing fresh prompt sequence length: ${userInput.length}` }));

        // 3. Orchestrator delegates strict text manipulation to specialized domain service
        const result = await geminiService.processIntent(userInput);
        
        // 4. Cache newly minted successful payloads specifically avoiding failed API states 
        if (result && result.intent) {
            aiCache.set(cacheHashKey, result);
        }
        
        // 5. Success Pipeline Exit
        return res.status(200).json(result);

    } catch (error) {
        // Operational mapping explicitly wrapping generic exceptions cleanly behind 502/500 screens
        if (!error.statusCode) {
            error.statusCode = 502; // Bad Gateway indicating upstream AI processing failure
            error.isOperational = true;
        }
        next(error); 
    }
};

module.exports = {
    processIntent
};
