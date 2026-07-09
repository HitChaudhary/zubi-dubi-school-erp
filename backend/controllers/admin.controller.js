import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const [teacherCount, studentCount, meetingCount, assignmentCount] = await Promise.all([
      prisma.user.count({ where: { schoolId, role: 'TEACHER' } }),
      prisma.user.count({ where: { schoolId, role: 'STUDENT' } }),
      prisma.meeting.count({ where: { schoolId } }),
      prisma.assignment.count({ where: { schoolId } }),
    ]);

    return res.json({ teacherCount, studentCount, meetingCount, assignmentCount });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({ message: 'Failed to load school stats.' });
  }
};

// GET /api/admin/users  (optional ?role=TEACHER|STUDENT)
export const getUsers = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { role } = req.query;

    const users = await prisma.user.findMany({
      where: {
        schoolId,
        role: role ? role : { in: ['TEACHER', 'STUDENT'] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, rollNo: true, standard: true, createdAt: true },
    });

    return res.json({ users });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Failed to load users.' });
  }
};

// POST /api/admin/users — create a TEACHER or STUDENT scoped to the admin's own school
export const createUser = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { name, email, password, role, rollNo, standard } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required.' });
    }
    if (!['TEACHER', 'STUDENT'].includes(role)) {
      return res.status(400).json({ message: 'role must be TEACHER or STUDENT.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, schoolId, rollNo: rollNo || null, standard: standard || null },
    });

    return res.status(201).json({
      message: 'User created.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }
    console.error('createUser error:', error);
    return res.status(500).json({ message: 'Failed to create user.' });
  }
};

// PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const id = Number(req.params.id);
    const { name, email, password, rollNo, standard } = req.body;

    // Make sure the target user actually belongs to this admin's school
    const existing = await prisma.user.findFirst({ where: { id, schoolId } });
    if (!existing) return res.status(404).json({ message: 'User not found in your school.' });

    const data = {
      ...(name && { name }),
      ...(email && { email }),
      ...(rollNo !== undefined && { rollNo: rollNo || null }),
      ...(standard !== undefined && { standard: standard || null }),
    };
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id }, data });

    return res.json({
      message: 'User updated.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, standard: user.standard },
    });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'That email is already in use.' });
    console.error('updateUser error:', error);
    return res.status(500).json({ message: 'Failed to update user.' });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const id = Number(req.params.id);

    const existing = await prisma.user.findFirst({ where: { id, schoolId } });
    if (!existing) return res.status(404).json({ message: 'User not found in your school.' });

    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User removed.' });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
};

// GET /api/admin/meetings — every meeting scheduled within this school
export const getMeetings = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const meetings = await prisma.meeting.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      include: { host: { select: { id: true, name: true } } },
    });
    return res.json({ meetings });
  } catch (error) {
    console.error('getMeetings error:', error);
    return res.status(500).json({ message: 'Failed to load meetings.' });
  }
};

// POST /api/admin/meetings — admin schedules a school-wide meeting, hosted by themselves
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

// PUT /api/admin/meetings/:id — admin can moderate ANY meeting in their school (not just ones they host)
export const updateMeeting = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const id = Number(req.params.id);
    const { status, title, meetingLink } = req.body;

    const existing = await prisma.meeting.findFirst({ where: { id, schoolId } });
    if (!existing) return res.status(404).json({ message: 'Meeting not found in your school.' });

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

// DELETE /api/admin/meetings/:id — admin can remove any meeting in their school
export const deleteMeeting = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const id = Number(req.params.id);

    const existing = await prisma.meeting.findFirst({ where: { id, schoolId } });
    if (!existing) return res.status(404).json({ message: 'Meeting not found in your school.' });

    await prisma.meeting.delete({ where: { id } });
    return res.json({ message: 'Meeting deleted.' });
  } catch (error) {
    console.error('deleteMeeting error:', error);
    return res.status(500).json({ message: 'Failed to delete meeting.' });
  }
};

// GET /api/admin/assignments — every assignment issued within this school
export const getAssignments = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const assignments = await prisma.assignment.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
    });
    return res.json({ assignments });
  } catch (error) {
    console.error('getAssignments error:', error);
    return res.status(500).json({ message: 'Failed to load assignments.' });
  }
};

// POST /api/admin/assignments — admin issues a school-wide assignment under their own name
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

// DELETE /api/admin/assignments/:id — admin can remove any assignment in their school
export const deleteAssignment = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const id = Number(req.params.id);

    const existing = await prisma.assignment.findFirst({ where: { id, schoolId } });
    if (!existing) return res.status(404).json({ message: 'Assignment not found in your school.' });

    await prisma.assignment.delete({ where: { id } });
    return res.json({ message: 'Assignment deleted.' });
  } catch (error) {
    console.error('deleteAssignment error:', error);
    return res.status(500).json({ message: 'Failed to delete assignment.' });
  }
};

// GET /api/admin/assignments/:id/submissions — admin oversight on any assignment in their school
export const getSubmissions = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const assignmentId = Number(req.params.id);

    const assignment = await prisma.assignment.findFirst({ where: { id: assignmentId, schoolId } });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found in your school.' });

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

// PUT /api/admin/submissions/:id/grade — admin can grade/override any submission in their school
export const gradeSubmission = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const id = Number(req.params.id);
    const { grade } = req.body;
    if (!grade) return res.status(400).json({ message: 'grade is required.' });

    const submission = await prisma.submission.findFirst({
      where: { id, assignment: { schoolId } },
    });
    if (!submission) return res.status(404).json({ message: 'Submission not found in your school.' });

    const updated = await prisma.submission.update({ where: { id }, data: { grade } });
    return res.json({ message: 'Grade saved.', submission: updated });
  } catch (error) {
    console.error('gradeSubmission error:', error);
    return res.status(500).json({ message: 'Failed to save grade.' });
  }
};

// GET /api/admin/school — the admin's own school profile + latest subscription (read-only; billing is super-admin owned)
export const getSchool = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { users: true, meetings: true, assignments: true } },
      },
    });
    if (!school) return res.status(404).json({ message: 'School not found.' });

    return res.json({
      school: {
        id: school.id,
        name: school.name,
        domain: school.domain,
        createdAt: school.createdAt,
        userCount: school._count.users,
        meetingCount: school._count.meetings,
        assignmentCount: school._count.assignments,
        subscription: school.subscriptions[0] || null,
      },
    });
  } catch (error) {
    console.error('getSchool error:', error);
    return res.status(500).json({ message: 'Failed to load school profile.' });
  }
};

// PUT /api/admin/school — admin can rename their school / change its domain
export const updateSchool = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { name, domain } = req.body;

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: { ...(name && { name }), ...(domain !== undefined && { domain: domain || null }) },
    });

    return res.json({ message: 'School profile updated.', school });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'That domain is already in use.' });
    console.error('updateSchool error:', error);
    return res.status(500).json({ message: 'Failed to update school profile.' });
  }
};

// GET /api/admin/attendance?standard=10A&date=2024-06-26
export const getAttendanceOverview = async (req, res) => {
  try {
    const { standard, date } = req.query;
    const schoolId = req.user.schoolId;

    const where = { schoolId };
    if (standard) where.standard = standard;

    if (date) {
      const d = new Date(date); d.setHours(0, 0, 0, 0);
      const e = new Date(date); e.setHours(23, 59, 59, 999);
      where.date = { gte: d, lte: e };
    } else {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const end   = new Date(); end.setHours(23, 59, 59, 999);
      where.date  = { gte: today, lte: end };
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, rollNo: true, standard: true } },
        teacher: { select: { id: true, name: true } },
      },
      orderBy: [{ standard: 'asc' }, { student: { rollNo: 'asc' } }],
    });

    return res.json({ records });
  } catch (error) {
    console.error('getAttendanceOverview error:', error);
    return res.status(500).json({ message: 'Failed to load attendance overview.' });
  }
};
