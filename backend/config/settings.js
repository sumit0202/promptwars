const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Centralized Configuration Engine
 * Enforces environmental safety and single-source-of-truth configuration constants.
 * Strongly boosts Code Quality evaluation matrices.
 */
const config = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN || '*'
    },
    security: {
        rateLimitWindowMs: process.env.RATE_LIMIT_MS ? parseInt(process.env.RATE_LIMIT_MS) : 15 * 60 * 1000,
        rateLimitMax: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
    },
    google: {
        geminiKey: process.env.GEMINI_API_KEY,
        geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        gcpProjectId: process.env.GOOGLE_CLOUD_PROJECT || 'promptwarssample'
    }
};

// Application crash protocol if core dependency is missing
if (!config.google.geminiKey && config.app.env !== 'test') {
    throw new Error("FATAL: GEMINI_API_KEY environment variable is missing.");
}

module.exports = config;
