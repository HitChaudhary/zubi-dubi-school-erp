import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../midddleware/authmiddlerware.js';
import {
  getStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMeetings,
  getAssignments,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticateJWT, authorizeRoles('SCHOOL_ADMIN'));

router.get('/stats', getStats);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/meetings', getMeetings);
router.get('/assignments', getAssignments);

export default router;
