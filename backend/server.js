const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Security & Parsing Middleware
// ==========================================

// HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined')); // detailed logging payload tracking
}

// Helmet configures secure HTTP response headers (X-XSS-Protection, HSTS, etc.)
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:"]
    }
}));

// Cross-Origin Scope
// Allowing origin restriction ensures no spoofed site can ping APIs on the user's behalf
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*', // Configurable via ENV, defaults to wildcard for loose testing
    methods: 'POST,GET',
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsers restricted limit to 1MB strictly
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Distributed Denial of Service (DDoS) Protection via Rate Limiter
const limiterWindowMs = process.env.RATE_LIMIT_MS ? parseInt(process.env.RATE_LIMIT_MS) : 15 * 60 * 1000;
const limiterMax = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100;
const limiter = rateLimit({
    windowMs: limiterWindowMs, 
    max: limiterMax, 
    message: { success: false, error: "Too many requests originating from this IP, please try again later." },
    standardHeaders: true, 
    legacyHeaders: false, 
});
// Applied to all API traffic
app.use('/api', limiter);

// ==========================================
// 2. Application Routes
// ==========================================

// Static File Server
app.use(express.static(path.join(__dirname, '../frontend')));

// Main API Endpoints
app.use('/api', apiRoutes);

// Fallback 404 Route for anything unmatched
app.use((req, res, next) => {
    const error = new Error('Not Found Route');
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
});

// ==========================================
// 3. Centralized Global Error Handler
// ==========================================
app.use(errorHandler);


// Ensure Environment dependencies strictly resolved before taking on network connections
if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV !== 'test') {
    console.error('CRITICAL ERROR: GEMINI_API_KEY environment variable is absolutely required.');
    process.exit(1);
}

// Start server conditionally, ignoring to bind port if required as a module (Jest Testing usage)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[STARTUP] Server securely running on http://localhost:${PORT}`);
    });
}

module.exports = app;
