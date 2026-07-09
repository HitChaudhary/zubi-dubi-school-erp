// ── teacher.routes.js  (add these routes to your existing teacher router) ──
// Also add to admin.routes.js and student.routes.js as shown below

import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authmiddlerware.js';
import {
  markAttendance,
  getStudentsByStandard,
  getAttendanceByDate,
  getDailyReport,
  getMonthlyReport,
  getMyAttendance,
  getAdminAttendanceOverview,
} from '../controllers/attendance.controller.js';

// ── TEACHER ROUTER ─────────────────────────────────────────────────
export const teacherAttendanceRouter = Router();
teacherAttendanceRouter.use(authenticateJWT, authorizeRoles('TEACHER', 'SCHOOL_ADMIN'));

// Get students of a class to build the form
teacherAttendanceRouter.get('/students',  getStudentsByStandard);  // ?standard=10A

// Mark attendance for a class on a date
teacherAttendanceRouter.post('/',         markAttendance);

// Get saved records for a class+date
teacherAttendanceRouter.get('/',          getAttendanceByDate);    // ?standard=10A&date=2024-06-26

// Daily summary report (all classes)
teacherAttendanceRouter.get('/daily',     getDailyReport);         // ?date=2024-06-26

// Monthly matrix report
teacherAttendanceRouter.get('/monthly',   getMonthlyReport);       // ?standard=10A&year=2024&month=6


// ── STUDENT ROUTER ─────────────────────────────────────────────────
export const studentAttendanceRouter = Router();
studentAttendanceRouter.use(authenticateJWT, authorizeRoles('STUDENT'));

// Student's full attendance history + heatmap data
studentAttendanceRouter.get('/', getMyAttendance);


// ── ADMIN ROUTER ───────────────────────────────────────────────────
export const adminAttendanceRouter = Router();
adminAttendanceRouter.use(authenticateJWT, authorizeRoles('SCHOOL_ADMIN', 'SUPER_ADMIN'));

// Admin oversight: any class, any date
adminAttendanceRouter.get('/', getAdminAttendanceOverview);        // ?date=2024-06-26&standard=10A


// ── HOW TO REGISTER IN server.js ───────────────────────────────────
// import { teacherAttendanceRouter, studentAttendanceRouter, adminAttendanceRouter } from './routes/attendance.routes.js';
// app.use('/api/teacher/attendance', teacherAttendanceRouter);
// app.use('/api/student/attendance', studentAttendanceRouter);
// app.use('/api/admin/attendance',   adminAttendanceRouter);
