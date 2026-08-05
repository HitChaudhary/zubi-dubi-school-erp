import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authroutes.js';
import registrationRoutes from './routes/registration.routes.js';
import superadminRoutes from './routes/superadmin.routes.js';
import adminRoutes from './routes/admin.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import { attachSocket } from './realtime/classFileShare.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ limit: '2mb' })); // JSON body cap — actual file uploads go through multer/socket, not JSON

// Uploaded assignment files (served as static, e.g. /uploads/assignments/xyz.pdf)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/register', registrationRoutes);

// Role-scoped dashboard APIs (each router enforces its own auth + role checks)
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Real-time class file sharing (Socket.io) — see realtime/classFileShare.js
attachSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
