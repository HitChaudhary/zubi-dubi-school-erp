import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';
import { notifySuperAdminsOfNewRequest } from '../utils/mailer.js';

// POST /api/register — public, no auth. A prospective School Admin applies here.
export const submitRequest = async (req, res) => {
  try {
    const { schoolName, domain, adminName, adminEmail, password } = req.body;

    if (!schoolName || !adminName || !adminEmail || !password) {
      return res.status(400).json({ message: 'schoolName, adminName, adminEmail and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Already an active account with this email? Send them to login instead.
    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists. Please log in instead.' });
    }

    // Block a second pending request for the same email while one is still open.
    const existingPending = await prisma.registrationRequest.findFirst({
      where: { adminEmail, status: 'PENDING' },
    });
    if (existingPending) {
      return res.status(409).json({ message: 'You already have a pending request awaiting review.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const request = await prisma.registrationRequest.create({
      data: { schoolName, domain: domain || null, adminName, adminEmail, password: hashed },
    });

    // Notify every super admin — failures here never block the applicant's request.
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { email: true },
    });
    notifySuperAdminsOfNewRequest(superAdmins.map((u) => u.email), request).catch(() => {});

    return res.status(201).json({
      message: 'Your request has been submitted. You will be notified once it is reviewed.',
      requestId: request.id,
    });
  } catch (error) {
    console.error('submitRequest error:', error);
    return res.status(500).json({ message: 'Failed to submit registration request.' });
  }
};

// GET /api/register/status?email=... — public, lets an applicant check where their request stands.
export const checkStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email is required.' });

    const request = await prisma.registrationRequest.findFirst({
      where: { adminEmail: email },
      orderBy: { createdAt: 'desc' },
      select: { schoolName: true, status: true, rejectionReason: true, createdAt: true, reviewedAt: true },
    });

    if (!request) return res.status(404).json({ message: 'No registration request found for that email.' });

    return res.json({ request });
  } catch (error) {
    console.error('checkStatus error:', error);
    return res.status(500).json({ message: 'Failed to check status.' });
  }
};
