import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../midddleware/authmiddlerware.js';
import {
  getStats,
  getMeetings, createMeeting, updateMeeting, deleteMeeting,
  getAssignments, createAssignment, deleteAssignment, getSubmissions, gradeSubmission,
  getStudentsByStandard, getAttendance, markAttendance, getAttendanceReport,
  getMyStudents, createStudent,
  getMySelfAttendanceToday, markMySelfAttendance,
} from '../controllers/teacher.controller.js';
import { uploadAssignmentFile } from '../utils/upload.js';

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
// Wrap multer so file-too-large / bad-upload errors come back as clean JSON
// instead of Express's default HTML error page.
function handleAssignmentUpload(req, res, next) {
  uploadAssignmentFile(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File is larger than the 10MB limit.'
        : 'Failed to upload file.';
      return res.status(400).json({ message });
    }
    next();
  });
}

router.post('/assignments',                    handleAssignmentUpload, createAssignment);
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

// Self attendance (teacher's own daily check-in)
router.get('/self-attendance/today', getMySelfAttendanceToday);
router.post('/self-attendance',      markMySelfAttendance);

export default router;
