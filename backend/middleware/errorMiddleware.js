/**
 * Centralized Error Handling Middleware
 * Follows best practices for separating operational vs. programmer errors
 */

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    
    // Log the error securely (hide stack traces in production)
    console.error(`[Error] ${err.name}: ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // Default error message
    let message = 'Internal Server Error';

    // Operational errors (e.g., API failures) send their actual message
    if (err.isOperational || statusCode < 500) {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
};

module.exports = errorHandler;
