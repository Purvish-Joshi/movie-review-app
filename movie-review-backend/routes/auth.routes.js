const express = require('express');
const router = express.Router();
const { register, login, googleAuth } = require('../controllers/auth.controller');

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/google
router.post('/google', googleAuth);

module.exports = router; 