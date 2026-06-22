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

// GET /api/teacher/meetings
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
export const createMeeting = async (req, res) => {
  try {
    const { title, meetingLink, startTime } = req.body;
    if (!title || !meetingLink) {
      return res.status(400).json({ message: 'title and meetingLink are required.' });
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        meetingLink,
        startTime: startTime ? new Date(startTime) : null,
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

// PUT /api/teacher/meetings/:id  — update status (SCHEDULED / ONGOING / ENDED), title, link
export const updateMeeting = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, title, meetingLink } = req.body;

    const existing = await prisma.meeting.findFirst({ where: { id, hostId: req.user.userId } });
    if (!existing) return res.status(404).json({ message: 'Meeting not found.' });

    const data = { ...(title && { title }), ...(meetingLink && { meetingLink }) };
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

// GET /api/teacher/assignments
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

// POST /api/teacher/assignments
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

// DELETE /api/teacher/assignments/:id
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

// GET /api/teacher/assignments/:id/submissions
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
      include: { student: { select: { id: true, name: true, email: true } } },
    });

    return res.json({ assignment, submissions });
  } catch (error) {
    console.error('getSubmissions error:', error);
    return res.status(500).json({ message: 'Failed to load submissions.' });
  }
};

// PUT /api/teacher/submissions/:id/grade
export const gradeSubmission = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { grade } = req.body;
    if (!grade) return res.status(400).json({ message: 'grade is required.' });

    // Make sure this submission belongs to one of this teacher's assignments
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
