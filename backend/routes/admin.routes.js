import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../midddleware/authmiddlerware.js';
import {
  getStats,
  getUsers, createUser, updateUser, deleteUser,
  getMeetings, createMeeting, updateMeeting, deleteMeeting,
  getAssignments, createAssignment, deleteAssignment, getSubmissions, gradeSubmission,
  getSchool, updateSchool,
  getAttendanceOverview,
  getTeacherAttendance,
} from '../controllers/admin.controller.js';

const router = Router();
router.use(authenticateJWT, authorizeRoles('SCHOOL_ADMIN'));

router.get('/stats',   getStats);
router.get('/school',  getSchool);
router.put('/school',  updateSchool);

router.get('/users',        getUsers);
router.post('/users',       createUser);
router.put('/users/:id',    updateUser);
router.delete('/users/:id', deleteUser);

router.get('/meetings',         getMeetings);
router.post('/meetings',        createMeeting);
router.put('/meetings/:id',     updateMeeting);
router.delete('/meetings/:id',  deleteMeeting);

router.get('/assignments',                  getAssignments);
router.post('/assignments',                 createAssignment);
router.delete('/assignments/:id',           deleteAssignment);
router.get('/assignments/:id/submissions',  getSubmissions);
router.put('/submissions/:id/grade',        gradeSubmission);

// Attendance oversight
router.get('/attendance', getAttendanceOverview);  // ?standard=10A&date=2024-06-26
router.get('/teacher-attendance', getTeacherAttendance);  // ?date=2024-06-26

export default router;
