import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../midddleware/authmiddlerware.js';
import {
  getStats,
  getMeetings, createMeeting, updateMeeting, deleteMeeting,
  getAssignments, createAssignment, deleteAssignment, getSubmissions, gradeSubmission,
  getStudentsByStandard, getAttendance, markAttendance, getAttendanceReport,
  getMyStudents, createStudent,
} from '../controllers/teacher.controller.js';

const router = Router();
router.use(authenticateJWT, authorizeRoles('TEACHER'));

router.get('/stats', getStats);

// Meetings
router.get('/meetings',          getMeetings);
router.post('/meetings',         createMeeting);
router.put('/meetings/:id',      updateMeeting);
router.delete('/meetings/:id',   deleteMeeting);

// Assignments
router.get('/assignments',                     getAssignments);
router.post('/assignments',                    createAssignment);
router.delete('/assignments/:id',              deleteAssignment);
router.get('/assignments/:id/submissions',     getSubmissions);
router.put('/submissions/:id/grade',           gradeSubmission);

// Students
router.get('/students',   getMyStudents);   // ?standard=10A (optional)
router.post('/students',  createStudent);

// Attendance
router.get('/attendance/students',  getStudentsByStandard);  // ?standard=10A
router.get('/attendance',           getAttendance);           // ?standard=10A&date=2024-06-26
router.post('/attendance',          markAttendance);
router.get('/attendance/report',    getAttendanceReport);     // ?standard=10A

export default router;
