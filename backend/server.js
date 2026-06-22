import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authroutes.js';
import { authenticateJWT, authorizeRoles } from './midddleware/authmiddlerware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Public Routes
app.use('/api/auth', authRoutes);

// Example Protected Route: Staff starts a meeting
app.post(
  '/api/meetings/start', 
  authenticateJWT, 
  authorizeRoles('TEACHER', 'SCHOOL_ADMIN'), 
  (req, res) => {
    // You have access to req.user.schoolId and req.user.userId here!
    res.json({ message: 'Meeting room created successfully by staff.' });
  }
);

// Example Protected Route: Student joins a meeting
app.get(
  '/api/meetings/join', 
  authenticateJWT, 
  authorizeRoles('STUDENT', 'TEACHER'), 
  (req, res) => {
    res.json({ message: 'Welcome to the classroom.' });
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));