import { Router } from 'express';
import { login, me } from '../controllers/authcontroller.js';
import { authenticateJWT } from '../midddleware/authmiddlerware.js';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me — returns the current user based on the JWT (used to validate sessions on app load)
router.get('/me', authenticateJWT, me);

export default router;
