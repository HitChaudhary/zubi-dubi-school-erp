import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../midddleware/authmiddlerware.js';
import {
  getStats,
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getAssignments,
  createAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
} from '../controllers/teacher.controller.js';

const router = Router();

router.use(authenticateJWT, authorizeRoles('TEACHER'));

router.get('/stats', getStats);

router.get('/meetings', getMeetings);
router.post('/meetings', createMeeting);
router.put('/meetings/:id', updateMeeting);
router.delete('/meetings/:id', deleteMeeting);

router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/assignments/:id/submissions', getSubmissions);

router.put('/submissions/:id/grade', gradeSubmission);

export default router;
