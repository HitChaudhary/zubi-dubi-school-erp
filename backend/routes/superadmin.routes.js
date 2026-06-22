import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../midddleware/authmiddlerware.js';
import {
  getStats,
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getUsers,
} from '../controllers/superadmin.controller.js';

const router = Router();

router.use(authenticateJWT, authorizeRoles('SUPER_ADMIN'));

router.get('/stats', getStats);

router.get('/schools', getSchools);
router.get('/schools/:id', getSchool);
router.post('/schools', createSchool);
router.put('/schools/:id', updateSchool);
router.delete('/schools/:id', deleteSchool);

router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions', createSubscription);
router.put('/subscriptions/:id', updateSubscription);
router.delete('/subscriptions/:id', deleteSubscription);

router.get('/users', getUsers);

export default router;
