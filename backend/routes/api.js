const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const processController = require('../controllers/processController');
const config = require('../config/settings');

// Define validation rules ensuring strict sanitization preventing NoSQL / Code Inject vectors
const inputValidationRules = [
    body('userInput')
        .exists({ checkFalsy: true }).withMessage('User input is required.')
        .isString().withMessage('Input must be a string')
        .trim()
        .notEmpty().withMessage('Input cannot be entirely blank spaces.')
        .isLength({ max: 2000 }).withMessage('Input exceeds maximum allowed limit.')
        .escape() // Strips <script> and dangerous HTML
];

// POST /api/process
// Invokes express-validator array, then passes logic sequentially to the controller
router.post('/process', inputValidationRules, processController.processIntent);

// GET /api/config
// Secure configuration payload distribution (prevents hardcoding of Google Services keys on frontend)
router.get('/config', (req, res, next) => {
    try {
        res.status(200).json({ mapsKey: config.google.mapsKey });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
