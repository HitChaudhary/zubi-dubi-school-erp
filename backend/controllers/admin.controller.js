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
      select: { id: true, name: true, email: true, role: true, createdAt: true },
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
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required.' });
    }
    if (!['TEACHER', 'STUDENT'].includes(role)) {
      return res.status(400).json({ message: 'role must be TEACHER or STUDENT.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, schoolId },
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
    const { name, email, password } = req.body;

    // Make sure the target user actually belongs to this admin's school
    const existing = await prisma.user.findFirst({ where: { id, schoolId } });
    if (!existing) return res.status(404).json({ message: 'User not found in your school.' });

    const data = { ...(name && { name }), ...(email && { email }) };
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id }, data });

    return res.json({
      message: 'User updated.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
