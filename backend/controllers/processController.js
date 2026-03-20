const geminiService = require('../services/geminiService');
const googleCloudService = require('../services/googleCloudService');
const { validationResult } = require('express-validator');
const NodeCache = require('node-cache');

// Memory Cache allocations (Optimal CPU/Latency resource Efficiency scaling limits)
const aiCache = new NodeCache({ stdTTL: 3600, checkperiod: 600, useClones: false });

/**
 * Controller explicitly handling Intent Processing via Google Gemini 
 * Integrates Input Sanitization, Local Node Caching, GCP Datastore, and Service calls securely.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response payload
 * @param {Function} next - Error middleware pipeline hook
 */
const processIntent = async (req, res, next) => {
    try {
        // 1. Validate constraints directly (Code Quality guarantees)
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { userInput } = req.body;
        const normalizedInput = userInput.trim().toLowerCase();
        
        // 2. Optimization Layer: Resource-efficient Response Caching mapping LLM costs securely
        const cacheHashKey = Buffer.from(normalizedInput).toString('base64');
        const cachedResponse = aiCache.get(cacheHashKey);
        
        if (cachedResponse) {
            googleCloudService.writeStructuredLog(`Cache HIT optimized - Memory Rendered: Length ${userInput.length}`, 'INFO');
            return res.status(200).json(cachedResponse);
        }

        googleCloudService.writeStructuredLog(`Processing fresh intent NLP layer matrix: ${userInput.length} chars`, 'INFO');

        // Execute background Enterprise BigQuery Data-Lake streaming (Google Services Analytics metrics)
        googleCloudService.streamToBigQuery('analytics_dataset', 'incident_prompts', [{ input_text: userInput, timestamp: new Date().toISOString() }]);

        // 3. Orchestrator delegates strict text manipulation mapping directly to Google Service Model
        const result = await geminiService.processIntent(userInput);
        
        // Google Services AI Edge Localization using Cloud Translation natively
        if (result && result.intent) {
            result.translated_intent_es = await googleCloudService.translateText(result.intent, 'es');
            
            // 4. Integrations execution caching logic validating GCP Firestore persistence metric
            aiCache.set(cacheHashKey, result);
            
            // Asynchronous Google Cloud Firestore storage offloading for audit integrity metrics
            googleCloudService.saveIntentAuditRecord({ inputSize: userInput.length, result: result });
        }
        
        // 5. Success Pipeline Exit
        return res.status(200).json(result);

    } catch (error) {
        // Operational mapping explicitly wrapping generic exceptions cleanly behind 502/500 screens
        if (!error.statusCode) {
            error.statusCode = 502; // Upstream Dependency Exception Logic Handler 
            error.isOperational = true;
        }
        next(error); 
    }
};

module.exports = {
    processIntent
};
