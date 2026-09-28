const express = require('express');

const { login, registro } = require('../controllers/authController');
const { rateLimitLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/login (con rate limit: 5 intentos fallidos / 15 min)
router.post('/login', rateLimitLogin, login);
router.post('/register', registro);

module.exports = router;