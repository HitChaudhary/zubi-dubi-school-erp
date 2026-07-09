import prisma from '../config/prisma.js';

// GET /api/student/stats
export const getStats = async (req, res) => {
  try {
    const schoolId  = req.user.schoolId;
    const studentId = req.user.userId;

    // Get student's own standard so we can count only their meetings
    const me = await prisma.user.findUnique({
      where: { id: studentId },
      select: { standard: true },
    });

    const [meetingCount, assignmentCount, submissionCount, gradedCount] = await Promise.all([
      prisma.meeting.count({
        where: {
          schoolId,
          status: { in: ['SCHEDULED', 'ONGOING'] },
          // Show meetings for their class OR school-wide meetings (standard null)
          OR: [{ standard: me?.standard }, { standard: null }],
        },
      }),
      prisma.assignment.count({ where: { schoolId } }),
      prisma.submission.count({ where: { studentId } }),
      prisma.submission.count({ where: { studentId, grade: { not: null } } }),
    ]);

    return res.json({ meetingCount, assignmentCount, submissionCount, gradedCount });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({ message: 'Failed to load stats.' });
  }
};

// GET /api/student/meetings
// Only returns meetings for the student's own standard (or school-wide meetings where standard is null)
export const getMeetings = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Look up the student's standard from the DB (source of truth, not JWT)
    const me = await prisma.user.findUnique({
      where: { id: studentId },
      select: { standard: true, rollNo: true },
    });

    const meetings = await prisma.meeting.findMany({
      where: {
        schoolId: req.user.schoolId,
        OR: [
          { standard: me?.standard },   // meetings for their class
          { standard: null },            // school-wide meetings
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { host: { select: { id: true, name: true } } },
    });

    return res.json({ meetings, myStandard: me?.standard });
  } catch (error) {
    console.error('getMeetings error:', error);
    return res.status(500).json({ message: 'Failed to load meetings.' });
  }
};

// GET /api/student/assignments — assignments for this school, annotated with student's own submission
export const getAssignments = async (req, res) => {
  try {
    const schoolId  = req.user.schoolId;
    const studentId = req.user.userId;

    const assignments = await prisma.assignment.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      include: {
        teacher:     { select: { id: true, name: true } },
        submissions: { where: { studentId } },
      },
    });

    const shaped = assignments.map((a) => ({
      id:           a.id,
      title:        a.title,
      description:  a.description,
      fileUrl:      a.fileUrl,
      dueDate:      a.dueDate,
      createdAt:    a.createdAt,
      teacher:      a.teacher,
      mySubmission: a.submissions[0] || null,
    }));

    return res.json({ assignments: shaped });
  } catch (error) {
    console.error('getAssignments error:', error);
    return res.status(500).json({ message: 'Failed to load assignments.' });
  }
};

// POST /api/student/assignments/:id/submit
export const submitAssignment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const studentId    = req.user.userId;
    const { fileUrl }  = req.body;

    if (!fileUrl) return res.status(400).json({ message: 'fileUrl is required.' });

    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, schoolId: req.user.schoolId },
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
    if (existing) return res.status(409).json({ message: 'You have already submitted this assignment.' });

    const submission = await prisma.submission.create({
      data: { assignmentId, studentId, fileUrl },
    });

    return res.status(201).json({ message: 'Submitted successfully.', submission });
  } catch (error) {
    console.error('submitAssignment error:', error);
    return res.status(500).json({ message: 'Failed to submit assignment.' });
  }
};

// GET /api/student/submissions
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where:   { studentId: req.user.userId },
      orderBy: { submittedAt: 'desc' },
      include: { assignment: { select: { id: true, title: true, dueDate: true } } },
    });
    return res.json({ submissions });
  } catch (error) {
    console.error('getSubmissions error:', error);
    return res.status(500).json({ message: 'Failed to load submissions.' });
  }
};

// GET /api/student/attendance — student's own attendance history
export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.userId;
    // ?days=N controls how far back to look (default 30, used for the list view).
    // The heatmap requests a longer window (e.g. 120) to fill out its calendar grid.
    const days = Math.min(Number(req.query.days) || 30, 365);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const records = await prisma.attendance.findMany({
      where: { studentId, date: { gte: since } },
      orderBy: { date: 'desc' },
      select: { date: true, status: true, standard: true },
    });

    const total   = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent  = records.filter(r => r.status === 'ABSENT').length;
    const late    = records.filter(r => r.status === 'LATE').length;

    return res.json({
      records,
      summary: { total, present, absent, late, pct: total ? Math.round((present / total) * 100) : null },
    });
  } catch (error) {
    console.error('getMyAttendance error:', error);
    return res.status(500).json({ message: 'Failed to load attendance.' });
  }
};
