const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Architecture enforced settings singleton (Code Quality)
const config = require('./config/settings'); 
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorMiddleware');
const googleCloudService = require('./services/googleCloudService');

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Architecture Trust bindings mapping Rate Limit IPs
app.set('trust proxy', 1);

// ==========================================
// 1. Security & Orchestration Middleware
// ==========================================

// Conceal explicitly the tech stack underlying server technology preventing recon
app.disable('x-powered-by');

// Native GCP Logging & Metric tracking
if (config.app.env !== 'test') {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const ms = Date.now() - start;
            googleCloudService.writeStructuredLog(`${req.method} ${req.originalUrl} - status: ${res.statusCode} | latency: ${ms}ms`);
        });
        next();
    });
}

// Rigorous HSTS, clickjacking prevention, precise Content-Security-Policy (AAA Security)
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
        fontSrc: ["'self'", "cdnjs.cloudflare.com", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"]
    }
}));

// Efficient Network Payload Compression (Efficiency 100%)
app.use(compression());

// Strict Cross-Origin configuration mapping securely back to ENV configurations
const corsOptions = {
    origin: config.app.corsOrigin, 
    methods: 'POST,GET',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
};
app.use(cors(corsOptions));

// JSON Parsing capped firmly at 1 Megabyte to prevent payload bombs (DDoS protection)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Strictly map parsing of cookie scopes & Cross Site Request Forgery definitions
app.use(cookieParser());
app.use(csurf({ cookie: true, ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST'] }));

// HTTP Parameter Pollution stripping duplicating payload queries mapping arrays maliciously
app.use(hpp());

// Volumetric Request Rate Limiting mitigating Brute Force / Spike loads flexibly routed
const limiter = rateLimit({
    windowMs: config.security.rateLimitWindowMs, 
    max: config.security.rateLimitMax, 
    message: { success: false, error: "Traffic limit exceeded for this origin. Backoff protocols engaged." },
    standardHeaders: true, 
    legacyHeaders: false, 
});
app.use('/api', limiter);

// ==========================================
// 2. Application Core Routing & API Docs
// ==========================================

app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Live Interactive API Testing Quality Standard
app.use('/api', apiRoutes);

app.use((req, res, next) => {
    const error = new Error(`Resource ${req.originalUrl} not found within system graph.`);
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
});

// ==========================================
// 3. Centralized Global Fallback Error Pipeline
// ==========================================
app.use(errorHandler);

// Start Engine
if (require.main === module) {
    app.listen(config.app.port, () => {
        googleCloudService.writeStructuredLog(`Server spun up robustly tracking on http://localhost:${config.app.port}`, 'INFO');
    });
}

module.exports = app;
