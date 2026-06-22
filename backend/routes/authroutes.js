import { Router } from 'express';
import { login } from '../controllers/authcontroller.js';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

export default router;