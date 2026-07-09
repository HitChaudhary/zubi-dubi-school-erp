import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_super_secret_key';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
       return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 2. Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: { select: { id: true, name: true } } },
    });

    if (!user) {
       return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
       return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 4. Generate JWT with role and school context
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        schoolId: user.schoolId,
        rollNo: user.rollNo,
        standard: user.standard,
        school: user.school
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Respond with token and user info
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        rollNo: user.rollNo,
        standard: user.standard,
        school: user.school
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// GET /api/auth/me — used by the frontend to re-validate a stored token / refresh user info
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        rollNo: true,
        standard: true,
        school: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Me error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};
