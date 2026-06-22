import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
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
        schoolId: user.schoolId 
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
        schoolId: user.schoolId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};