import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

// GET /api/teacher/stats
export const getStats = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const [meetingCount, assignmentCount, submissionCount, studentCount] = await Promise.all([
      prisma.meeting.count({ where: { hostId: teacherId } }),
      prisma.assignment.count({ where: { teacherId } }),
      prisma.submission.count({ where: { assignment: { teacherId } } }),
      prisma.user.count({ where: { schoolId: req.user.schoolId, role: 'STUDENT' } }),
    ]);
    return res.json({ meetingCount, assignmentCount, submissionCount, studentCount });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({ message: 'Failed to load stats.' });
  }
};

// ---------- Meetings ----------

// GET /api/teacher/meetings  — only meetings this teacher hosts
export const getMeetings = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { hostId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ meetings });
  } catch (error) {
    console.error('getMeetings error:', error);
    return res.status(500).json({ message: 'Failed to load meetings.' });
  }
};

// POST /api/teacher/meetings
// Body: { title, meetingLink, startTime?, standard }
// standard = which class this meeting is for, e.g. "10A"
export const createMeeting = async (req, res) => {
  try {
    const { title, meetingLink, startTime, standard } = req.body;
    if (!title || !meetingLink) {
      return res.status(400).json({ message: 'title and meetingLink are required.' });
    }
    if (!standard) {
      return res.status(400).json({ message: 'standard (class) is required so only that class sees the meeting.' });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        meetingLink,
        startTime: startTime ? new Date(startTime) : null,
        standard,               // <-- which class
        schoolId: req.user.schoolId,
        hostId: req.user.userId,
      },
    });

    return res.status(201).json({ message: 'Meeting scheduled.', meeting });
  } catch (error) {
    console.error('createMeeting error:', error);
    return res.status(500).json({ message: 'Failed to create meeting.' });
  }
};

// PUT /api/teacher/meetings/:id
export const updateMeeting = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, title, meetingLink, standard } = req.body;

    const existing = await prisma.meeting.findFirst({ where: { id, hostId: req.user.userId } });
    if (!existing) return res.status(404).json({ message: 'Meeting not found.' });

    const data = {
      ...(title && { title }),
      ...(meetingLink && { meetingLink }),
      ...(standard && { standard }),
    };
    if (status) {
      data.status = status;
      if (status === 'ONGOING' && !existing.startTime) data.startTime = new Date();
      if (status === 'ENDED') data.endTime = new Date();
    }

    const meeting = await prisma.meeting.update({ where: { id }, data });
    return res.json({ message: 'Meeting updated.', meeting });
  } catch (error) {
    console.error('updateMeeting error:', error);
    return res.status(500).json({ message: 'Failed to update meeting.' });
  }
};

// DELETE /api/teacher/meetings/:id
export const deleteMeeting = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.meeting.findFirst({ where: { id, hostId: req.user.userId } });
    if (!existing) return res.status(404).json({ message: 'Meeting not found.' });

    await prisma.meeting.delete({ where: { id } });
    return res.json({ message: 'Meeting deleted.' });
  } catch (error) {
    console.error('deleteMeeting error:', error);
    return res.status(500).json({ message: 'Failed to delete meeting.' });
  }
};

// ---------- Assignments ----------

export const getAssignments = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { submissions: true } } },
    });
    return res.json({ assignments });
  } catch (error) {
    console.error('getAssignments error:', error);
    return res.status(500).json({ message: 'Failed to load assignments.' });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { title, description, fileUrl, dueDate } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'title and description are required.' });
    }
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        fileUrl: fileUrl || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        schoolId: req.user.schoolId,
        teacherId: req.user.userId,
      },
    });
    return res.status(201).json({ message: 'Assignment created.', assignment });
  } catch (error) {
    console.error('createAssignment error:', error);
    return res.status(500).json({ message: 'Failed to create assignment.' });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.assignment.findFirst({ where: { id, teacherId: req.user.userId } });
    if (!existing) return res.status(404).json({ message: 'Assignment not found.' });
    await prisma.assignment.delete({ where: { id } });
    return res.json({ message: 'Assignment deleted.' });
  } catch (error) {
    console.error('deleteAssignment error:', error);
    return res.status(500).json({ message: 'Failed to delete assignment.' });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, teacherId: req.user.userId },
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      orderBy: { submittedAt: 'desc' },
      include: { student: { select: { id: true, name: true, email: true, rollNo: true, standard: true } } },
    });
    return res.json({ assignment, submissions });
  } catch (error) {
    console.error('getSubmissions error:', error);
    return res.status(500).json({ message: 'Failed to load submissions.' });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { grade } = req.body;
    if (!grade) return res.status(400).json({ message: 'grade is required.' });

    const submission = await prisma.submission.findFirst({
      where: { id, assignment: { teacherId: req.user.userId } },
    });
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    const updated = await prisma.submission.update({ where: { id }, data: { grade } });
    return res.json({ message: 'Grade saved.', submission: updated });
  } catch (error) {
    console.error('gradeSubmission error:', error);
    return res.status(500).json({ message: 'Failed to save grade.' });
  }
};

// ---------- Students ----------

// GET /api/teacher/students  (optional ?standard=10A)
// Teachers can view (but not edit others') the students in their own school.
export const getMyStudents = async (req, res) => {
  try {
    const { standard } = req.query;
    const students = await prisma.user.findMany({
      where: {
        schoolId: req.user.schoolId,
        role: 'STUDENT',
        ...(standard && { standard }),
      },
      orderBy: [{ standard: 'asc' }, { rollNo: 'asc' }],
      select: { id: true, name: true, email: true, rollNo: true, standard: true, createdAt: true },
    });
    return res.json({ students });
  } catch (error) {
    console.error('getMyStudents error:', error);
    return res.status(500).json({ message: 'Failed to load students.' });
  }
};

// POST /api/teacher/students
// Body: { name, email, password, rollNo, standard }
// Lets a teacher enroll a new student directly into their own school.
export const createStudent = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { name, email, password, rollNo, standard } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required.' });
    }
    if (!standard) {
      return res.status(400).json({ message: 'standard (class) is required.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: 'STUDENT',
        schoolId,
        rollNo: rollNo || null,
        standard,
      },
    });

    return res.status(201).json({
      message: 'Student created.',
      student: { id: student.id, name: student.name, email: student.email, rollNo: student.rollNo, standard: student.standard },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }
    console.error('createStudent error:', error);
    return res.status(500).json({ message: 'Failed to create student.' });
  }
};

// ---------- Attendance ----------

// GET /api/teacher/attendance/students?standard=10A
// Returns all students of a given standard in this school
export const getStudentsByStandard = async (req, res) => {
  try {
    const { standard } = req.query;
    if (!standard) return res.status(400).json({ message: 'standard query param required.' });

    const students = await prisma.user.findMany({
      where: { schoolId: req.user.schoolId, role: 'STUDENT', standard },
      orderBy: { rollNo: 'asc' },
      select: { id: true, name: true, rollNo: true, standard: true, email: true },
    });
    return res.json({ students });
  } catch (error) {
    console.error('getStudentsByStandard error:', error);
    return res.status(500).json({ message: 'Failed to load students.' });
  }
};

// GET /api/teacher/attendance?standard=10A&date=2024-06-26
// Returns attendance records for a class on a given date
export const getAttendance = async (req, res) => {
  try {
    const { standard, date } = req.query;
    if (!standard || !date) return res.status(400).json({ message: 'standard and date are required.' });

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: {
        schoolId: req.user.schoolId,
        standard,
        date: { gte: dayStart, lte: dayEnd },
      },
      include: { student: { select: { id: true, name: true, rollNo: true } } },
    });
    return res.json({ records });
  } catch (error) {
    console.error('getAttendance error:', error);
    return res.status(500).json({ message: 'Failed to load attendance.' });
  }
};

// POST /api/teacher/attendance
// Body: { standard, date, records: [{ studentId, status }] }
// Upserts one row per student (so teacher can re-submit corrections)
export const markAttendance = async (req, res) => {
  try {
    const { standard, date, records } = req.body;
    if (!standard || !date || !records?.length) {
      return res.status(400).json({ message: 'standard, date, and records are required.' });
    }

    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const ops = records.map(({ studentId, status }) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId, date: day } },
        update: { status, teacherId: req.user.userId, updatedAt: new Date() },
        create: {
          schoolId: req.user.schoolId,
          teacherId: req.user.userId,
          studentId,
          standard,
          date: day,
          status,
        },
      })
    );

    await prisma.$transaction(ops);
    return res.json({ message: `Attendance saved for ${records.length} student(s).` });
  } catch (error) {
    console.error('markAttendance error:', error);
    return res.status(500).json({ message: 'Failed to save attendance.' });
  }
};

// GET /api/teacher/attendance/report?standard=10A
// Returns attendance summary per student for the last 30 days
export const getAttendanceReport = async (req, res) => {
  try {
    const { standard } = req.query;
    if (!standard) return res.status(400).json({ message: 'standard required.' });

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const records = await prisma.attendance.findMany({
      where: { schoolId: req.user.schoolId, standard, date: { gte: since } },
      include: { student: { select: { id: true, name: true, rollNo: true } } },
      orderBy: { date: 'desc' },
    });

    // Group by student
    const byStudent = {};
    for (const r of records) {
      const sid = r.student.id;
      if (!byStudent[sid]) byStudent[sid] = { student: r.student, total: 0, present: 0, absent: 0, late: 0 };
      byStudent[sid].total++;
      if (r.status === 'PRESENT') byStudent[sid].present++;
      else if (r.status === 'ABSENT') byStudent[sid].absent++;
      else byStudent[sid].late++;
    }

    return res.json({ report: Object.values(byStudent) });
  } catch (error) {
    console.error('getAttendanceReport error:', error);
    return res.status(500).json({ message: 'Failed to load report.' });
  }
};
