import { Router } from 'express';
import { submitRequest, checkStatus } from '../controllers/registration.controller.js';

const router = Router();

// POST /api/register — submit a school signup request
router.post('/', submitRequest);

// GET /api/register/status?email=... — check where a request stands
router.get('/status', checkStatus);

export default router;
