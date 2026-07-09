import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { notifyApplicantApproved, notifyApplicantRejected } from '../utils/mailer.js';

// GET /api/superadmin/stats
export const getStats = async (req, res) => {
  try {
    const [totalSchools, totalUsers, activeSubscriptions, totalMeetings, totalAssignments, usersByRole, pendingRequests] =
      await Promise.all([
        prisma.school.count(),
        prisma.user.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.meeting.count(),
        prisma.assignment.count(),
        prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
        prisma.registrationRequest.count({ where: { status: 'PENDING' } }),
      ]);

    const roleCounts = usersByRole.reduce((acc, row) => {
      acc[row.role] = row._count.role;
      return acc;
    }, {});

    return res.json({
      totalSchools,
      totalUsers,
      activeSubscriptions,
      totalMeetings,
      totalAssignments,
      roleCounts,
      pendingRequests,
    });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({ message: 'Failed to load system stats.' });
  }
};

// GET /api/superadmin/schools
export const getSchools = async (req, res) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, meetings: true, assignments: true } },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const shaped = schools.map((s) => ({
      id: s.id,
      name: s.name,
      domain: s.domain,
      createdAt: s.createdAt,
      userCount: s._count.users,
      meetingCount: s._count.meetings,
      assignmentCount: s._count.assignments,
      latestSubscription: s.subscriptions[0] || null,
    }));

    return res.json({ schools: shaped });
  } catch (error) {
    console.error('getSchools error:', error);
    return res.status(500).json({ message: 'Failed to load schools.' });
  }
};

// GET /api/superadmin/schools/:id
export const getSchool = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        subscriptions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!school) return res.status(404).json({ message: 'School not found.' });

    return res.json({ school });
  } catch (error) {
    console.error('getSchool error:', error);
    return res.status(500).json({ message: 'Failed to load school.' });
  }
};

// POST /api/superadmin/schools
// Creates a school and, optionally, its first SCHOOL_ADMIN user in one go.
export const createSchool = async (req, res) => {
  try {
    const { name, domain, adminName, adminEmail, adminPassword } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'School name is required.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: { name, domain: domain || null },
      });

      let admin = null;
      if (adminName && adminEmail && adminPassword) {
        const hashed = await bcrypt.hash(adminPassword, 10);
        admin = await tx.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            password: hashed,
            role: 'SCHOOL_ADMIN',
            schoolId: school.id,
          },
        });
      }

      return { school, admin };
    });

    return res.status(201).json({
      message: 'School created successfully.',
      school: result.school,
      admin: result.admin
        ? { id: result.admin.id, name: result.admin.name, email: result.admin.email }
        : null,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'That domain or admin email is already in use.' });
    }
    console.error('createSchool error:', error);
    return res.status(500).json({ message: 'Failed to create school.' });
  }
};

// PUT /api/superadmin/schools/:id
export const updateSchool = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, domain } = req.body;

    const school = await prisma.school.update({
      where: { id },
      data: { name, domain },
    });

    return res.json({ message: 'School updated.', school });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'School not found.' });
    if (error.code === 'P2002') return res.status(409).json({ message: 'That domain is already in use.' });
    console.error('updateSchool error:', error);
    return res.status(500).json({ message: 'Failed to update school.' });
  }
};

// DELETE /api/superadmin/schools/:id
export const deleteSchool = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.school.delete({ where: { id } });
    return res.json({ message: 'School deleted.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'School not found.' });
    console.error('deleteSchool error:', error);
    return res.status(500).json({ message: 'Failed to delete school.' });
  }
};

// GET /api/superadmin/subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: { school: { select: { id: true, name: true } } },
    });
    return res.json({ subscriptions });
  } catch (error) {
    console.error('getSubscriptions error:', error);
    return res.status(500).json({ message: 'Failed to load subscriptions.' });
  }
};

// POST /api/superadmin/subscriptions
export const createSubscription = async (req, res) => {
  try {
    const { schoolId, planName, status, endDate } = req.body;

    if (!schoolId || !planName || !endDate) {
      return res.status(400).json({ message: 'schoolId, planName and endDate are required.' });
    }

    const subscription = await prisma.subscription.create({
      data: {
        schoolId: Number(schoolId),
        planName,
        status: status || 'ACTIVE',
        endDate: new Date(endDate),
      },
    });

    return res.status(201).json({ message: 'Subscription created.', subscription });
  } catch (error) {
    if (error.code === 'P2003') return res.status(404).json({ message: 'School not found.' });
    console.error('createSubscription error:', error);
    return res.status(500).json({ message: 'Failed to create subscription.' });
  }
};

// PUT /api/superadmin/subscriptions/:id
export const updateSubscription = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { planName, status, endDate } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(planName && { planName }),
        ...(status && { status }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    });

    return res.json({ message: 'Subscription updated.', subscription });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Subscription not found.' });
    console.error('updateSubscription error:', error);
    return res.status(500).json({ message: 'Failed to update subscription.' });
  }
};

// DELETE /api/superadmin/subscriptions/:id
export const deleteSubscription = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.subscription.delete({ where: { id } });
    return res.json({ message: 'Subscription deleted.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Subscription not found.' });
    console.error('deleteSubscription error:', error);
    return res.status(500).json({ message: 'Failed to delete subscription.' });
  }
};

// GET /api/superadmin/users  (optional query: ?role=TEACHER&schoolId=1)
export const getUsers = async (req, res) => {
  try {
    const { role, schoolId } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(schoolId && { schoolId: Number(schoolId) }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        school: { select: { id: true, name: true } },
      },
    });

    return res.json({ users });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ message: 'Failed to load users.' });
  }
};

// GET /api/superadmin/registration-requests  (optional ?status=PENDING|APPROVED|REJECTED)
export const getRegistrationRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await prisma.registrationRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, schoolName: true, domain: true, adminName: true, adminEmail: true,
        status: true, rejectionReason: true, reviewedByName: true, reviewedAt: true, createdAt: true,
      },
    });
    return res.json({ requests });
  } catch (error) {
    console.error('getRegistrationRequests error:', error);
    return res.status(500).json({ message: 'Failed to load registration requests.' });
  }
};

// PUT /api/superadmin/registration-requests/:id/approve
// Creates the real School + SCHOOL_ADMIN user (reusing the password the applicant set) in one transaction.
export const approveRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const request = await prisma.registrationRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.status !== 'PENDING') {
      return res.status(409).json({ message: `This request was already ${request.status.toLowerCase()}.` });
    }

    // Someone may have registered this email through another path since the request was filed.
    const existingUser = await prisma.user.findUnique({ where: { email: request.adminEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists; cannot approve.' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: { name: request.schoolName, domain: request.domain },
      });
      const admin = await tx.user.create({
        data: {
          name: request.adminName,
          email: request.adminEmail,
          password: request.password, // already hashed at submission time
          role: 'SCHOOL_ADMIN',
          schoolId: school.id,
        },
      });
      const updated = await tx.registrationRequest.update({
        where: { id },
        data: { status: 'APPROVED', reviewedAt: new Date(), reviewedByName: req.user.name || null },
      });
      return { school, admin, updated };
    });

    notifyApplicantApproved(request).catch(() => {});

    return res.json({
      message: 'Request approved. School and admin account created.',
      school: result.school,
      admin: { id: result.admin.id, name: result.admin.name, email: result.admin.email },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'That domain or email is already in use.' });
    }
    console.error('approveRequest error:', error);
    return res.status(500).json({ message: 'Failed to approve request.' });
  }
};

// PUT /api/superadmin/registration-requests/:id/reject
export const rejectRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { reason } = req.body;

    const request = await prisma.registrationRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.status !== 'PENDING') {
      return res.status(409).json({ message: `This request was already ${request.status.toLowerCase()}.` });
    }

    const updated = await prisma.registrationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || null,
        reviewedAt: new Date(),
        reviewedByName: req.user.name || null,
      },
    });

    notifyApplicantRejected(updated).catch(() => {});

    return res.json({ message: 'Request rejected.', request: updated });
  } catch (error) {
    console.error('rejectRequest error:', error);
    return res.status(500).json({ message: 'Failed to reject request.' });
  }
};
