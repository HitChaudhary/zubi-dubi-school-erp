import prisma from '../config/prisma.js';

// ─────────────────────────────────────────────────────────
// TEACHER: Mark / update attendance for a class on a date
// POST /api/teacher/attendance
// Body: { standard, date, records: [{ studentId, status }] }
// status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE"
// ─────────────────────────────────────────────────────────
export const markAttendance = async (req, res) => {
  try {
    const { standard, date, records } = req.body;

    if (!standard || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'standard, date, and records[] are required.' });
    }

    const day = new Date(date);
    day.setUTCHours(0, 0, 0, 0);

    // Upsert each student record in a transaction
    const ops = records.map(({ studentId, status }) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: Number(studentId), date: day } },
        update: {
          status,
          teacherId:  req.user.userId,
          updatedAt:  new Date(),
        },
        create: {
          schoolId:   req.user.schoolId,
          teacherId:  req.user.userId,
          studentId:  Number(studentId),
          standard,
          date:       day,
          status,
        },
      })
    );

    await prisma.$transaction(ops);

    return res.json({
      message: `Attendance saved for ${records.length} student(s) in class ${standard} on ${date}.`,
    });
  } catch (err) {
    console.error('markAttendance error:', err);
    return res.status(500).json({ message: 'Failed to save attendance.' });
  }
};

// ─────────────────────────────────────────────────────────
// TEACHER: Get students of a standard (to build the mark form)
// GET /api/teacher/attendance/students?standard=10A
// ─────────────────────────────────────────────────────────
export const getStudentsByStandard = async (req, res) => {
  try {
    const { standard } = req.query;
    if (!standard) return res.status(400).json({ message: 'standard is required.' });

    const students = await prisma.user.findMany({
      where:   { schoolId: req.user.schoolId, role: 'STUDENT', standard },
      orderBy: [{ rollNo: 'asc' }, { name: 'asc' }],
      select:  { id: true, name: true, rollNo: true, standard: true, email: true },
    });

    return res.json({ students });
  } catch (err) {
    console.error('getStudentsByStandard error:', err);
    return res.status(500).json({ message: 'Failed to load students.' });
  }
};

// ─────────────────────────────────────────────────────────
// TEACHER: Get saved records for a class on a specific date
// GET /api/teacher/attendance?standard=10A&date=2024-06-26
// ─────────────────────────────────────────────────────────
export const getAttendanceByDate = async (req, res) => {
  try {
    const { standard, date } = req.query;
    if (!standard || !date) return res.status(400).json({ message: 'standard and date required.' });

    const day = new Date(date);
    day.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: {
        schoolId: req.user.schoolId,
        standard,
        date: { gte: day, lte: dayEnd },
      },
      include: {
        student: { select: { id: true, name: true, rollNo: true } },
      },
    });

    return res.json({ records });
  } catch (err) {
    console.error('getAttendanceByDate error:', err);
    return res.status(500).json({ message: 'Failed to load attendance.' });
  }
};

// ─────────────────────────────────────────────────────────
// TEACHER: Daily report — all classes, one date
// GET /api/teacher/attendance/daily?date=2024-06-26
// ─────────────────────────────────────────────────────────
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const target = date ? new Date(date) : new Date();
    target.setUTCHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setUTCHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: {
        schoolId: req.user.schoolId,
        date: { gte: target, lte: end },
      },
      include: {
        student: { select: { id: true, name: true, rollNo: true, standard: true } },
      },
      orderBy: [{ standard: 'asc' }, { student: { rollNo: 'asc' } }],
    });

    // Group by standard
    const byClass = {};
    for (const r of records) {
      const cls = r.student.standard || r.standard;
      if (!byClass[cls]) byClass[cls] = { standard: cls, present: 0, absent: 0, late: 0, leave: 0, total: 0, records: [] };
      byClass[cls].total++;
      byClass[cls][r.status.toLowerCase()]++;
      byClass[cls].records.push(r);
    }

    return res.json({ date: target.toISOString().split('T')[0], classes: Object.values(byClass) });
  } catch (err) {
    console.error('getDailyReport error:', err);
    return res.status(500).json({ message: 'Failed to load daily report.' });
  }
};

// ─────────────────────────────────────────────────────────
// TEACHER: Monthly report — one class, one month
// GET /api/teacher/attendance/monthly?standard=10A&year=2024&month=6
// ─────────────────────────────────────────────────────────
export const getMonthlyReport = async (req, res) => {
  try {
    const { standard, year, month } = req.query;
    if (!standard || !year || !month) {
      return res.status(400).json({ message: 'standard, year, and month required.' });
    }

    const y = Number(year), m = Number(month) - 1; // JS months 0-indexed
    const from = new Date(Date.UTC(y, m, 1));
    const to   = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));

    const records = await prisma.attendance.findMany({
      where: {
        schoolId: req.user.schoolId,
        standard,
        date: { gte: from, lte: to },
      },
      include: {
        student: { select: { id: true, name: true, rollNo: true } },
      },
      orderBy: [{ student: { rollNo: 'asc' } }, { date: 'asc' }],
    });

    // Build matrix: student → { days: {dateStr: status}, totals }
    const studentMap = {};
    for (const r of records) {
      const sid = r.student.id;
      if (!studentMap[sid]) {
        studentMap[sid] = { student: r.student, days: {}, present: 0, absent: 0, late: 0, leave: 0 };
      }
      const d = r.date.toISOString().split('T')[0];
      studentMap[sid].days[d] = r.status;
      studentMap[sid][r.status.toLowerCase()]++;
    }

    return res.json({
      standard,
      year: y, month: m + 1,
      students: Object.values(studentMap),
    });
  } catch (err) {
    console.error('getMonthlyReport error:', err);
    return res.status(500).json({ message: 'Failed to load monthly report.' });
  }
};

// ─────────────────────────────────────────────────────────
// STUDENT: Own attendance — full history for heatmap + summary
// GET /api/student/attendance
// ─────────────────────────────────────────────────────────
export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Fetch ALL attendance records for this student (for full-year heatmap)
    const records = await prisma.attendance.findMany({
      where:   { studentId },
      orderBy: { date: 'asc' },
      select:  { date: true, status: true },
    });

    // Summary
    const total   = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent  = records.filter(r => r.status === 'ABSENT').length;
    const late    = records.filter(r => r.status === 'LATE').length;
    const leave   = records.filter(r => r.status === 'LEAVE').length;
    const pct     = total > 0 ? Math.round(((present + late) / total) * 100) : null;

    // Build heatmap map: "YYYY-MM-DD" → status
    const heatmap = {};
    for (const r of records) {
      const key = r.date.toISOString().split('T')[0];
      heatmap[key] = r.status;
    }

    // Last 30 days list for the day-by-day view
    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);
    const recent = records.filter(r => new Date(r.date) >= since30).reverse();

    return res.json({
      heatmap,         // { "2024-06-01": "PRESENT", ... }
      recent,          // last 30 days for list view
      summary: { total, present, absent, late, leave, pct },
    });
  } catch (err) {
    console.error('getMyAttendance error:', err);
    return res.status(500).json({ message: 'Failed to load attendance.' });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN: Full school attendance for a date (all classes)
// GET /api/admin/attendance?date=2024-06-26&standard=10A
// ─────────────────────────────────────────────────────────
export const getAdminAttendanceOverview = async (req, res) => {
  try {
    const { date, standard } = req.query;

    const target = date ? new Date(date) : new Date();
    target.setUTCHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setUTCHours(23, 59, 59, 999);

    const where = {
      schoolId: req.user.schoolId,
      date: { gte: target, lte: end },
    };
    if (standard) where.standard = standard;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, rollNo: true, standard: true } },
        teacher: { select: { name: true } },
      },
      orderBy: [{ standard: 'asc' }, { student: { rollNo: 'asc' } }],
    });

    const summary = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 };
    for (const r of records) summary[r.status]++;

    return res.json({ records, summary, total: records.length });
  } catch (err) {
    console.error('getAdminAttendanceOverview error:', err);
    return res.status(500).json({ message: 'Failed to load attendance.' });
  }
};
