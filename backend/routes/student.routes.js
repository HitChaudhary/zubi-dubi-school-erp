import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../midddleware/authmiddlerware.js';
import {
  getStats,
  getMeetings,
  getAssignments,
  submitAssignment,
  getSubmissions,
} from '../controllers/student.controller.js';

const router = Router();

router.use(authenticateJWT, authorizeRoles('STUDENT'));

router.get('/stats', getStats);
router.get('/meetings', getMeetings);
router.get('/assignments', getAssignments);
router.post('/assignments/:id/submit', submitAssignment);
router.get('/submissions', getSubmissions);

export default router;
