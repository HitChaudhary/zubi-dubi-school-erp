import prisma from '../config/prisma.js';

// GET /api/student/stats
export const getStats = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const studentId = req.user.userId;

    const [meetingCount, assignmentCount, submissionCount, gradedCount] = await Promise.all([
      prisma.meeting.count({ where: { schoolId, status: { in: ['SCHEDULED', 'ONGOING'] } } }),
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

// GET /api/student/meetings — meetings available to join in the student's school
export const getMeetings = async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      where: { schoolId: req.user.schoolId },
      orderBy: { createdAt: 'desc' },
      include: { host: { select: { id: true, name: true } } },
    });
    return res.json({ meetings });
  } catch (error) {
    console.error('getMeetings error:', error);
    return res.status(500).json({ message: 'Failed to load meetings.' });
  }
};

// GET /api/student/assignments — assignments for the student's school, with their own submission (if any)
export const getAssignments = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const studentId = req.user.userId;

    const assignments = await prisma.assignment.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { select: { id: true, name: true } },
        submissions: { where: { studentId } },
      },
    });

    const shaped = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      fileUrl: a.fileUrl,
      dueDate: a.dueDate,
      createdAt: a.createdAt,
      teacher: a.teacher,
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
    const studentId = req.user.userId;
    const { fileUrl } = req.body;

    if (!fileUrl) return res.status(400).json({ message: 'fileUrl is required.' });

    // Confirm the assignment belongs to the student's own school
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, schoolId: req.user.schoolId },
    });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already submitted this assignment.' });
    }

    const submission = await prisma.submission.create({
      data: { assignmentId, studentId, fileUrl },
    });

    return res.status(201).json({ message: 'Submitted successfully.', submission });
  } catch (error) {
    console.error('submitAssignment error:', error);
    return res.status(500).json({ message: 'Failed to submit assignment.' });
  }
};

// GET /api/student/submissions — the student's own submission history
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { studentId: req.user.userId },
      orderBy: { submittedAt: 'desc' },
      include: { assignment: { select: { id: true, title: true, dueDate: true } } },
    });
    return res.json({ submissions });
  } catch (error) {
    console.error('getSubmissions error:', error);
    return res.status(500).json({ message: 'Failed to load submissions.' });
  }
};
