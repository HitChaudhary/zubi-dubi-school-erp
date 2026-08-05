import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_super_secret_key';

// Hard cap on any single file relayed through the socket — keeps this in sync
// with the Server's maxHttpBufferSize below. Files are relayed directly
// between clients for the live session and are never written to disk or DB.
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

function roomFor(schoolId, standard) {
  return `class:${schoolId}:${standard ?? 'ALL'}`;
}

export function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
    maxHttpBufferSize: 1e7, // 10MB — reject anything larger before it ever hits RAM
  });

  // ── Auth: every socket must present a valid JWT (same one used for the REST API) ──
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token.'));
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true, schoolId: true, standard: true },
      });
      if (!user) return next(new Error('User not found.'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, name, role, schoolId } = socket.user;

    // Join a class's file-share room. `standard` may be null/undefined for a
    // school-wide meeting — that's a valid room, not a missing parameter.
    // - Students may only join their own class (or a school-wide room).
    // - Teachers/admins may join any class in their own school (they may teach several).
    socket.on('join_class', (standard = null) => {
      if (!schoolId) return;
      if (role === 'STUDENT' && standard && socket.user.standard !== standard) {
        socket.emit('file_share_error', { message: 'You can only join your own class.' });
        return;
      }
      socket.join(roomFor(schoolId, standard));
    });

    socket.on('leave_class', (standard = null) => {
      if (!schoolId) return;
      socket.leave(roomFor(schoolId, standard));
    });

    // Relay a file straight through to everyone else currently in the class
    // room — never persisted to disk or the database. Only teachers/admins
    // may broadcast; students are receive-only.
    socket.on('send_file', (data = {}, ack) => {
      try {
        const { standard = null, fileName, fileType, fileBuffer } = data;

        if (role === 'STUDENT') {
          return ack?.({ ok: false, message: 'Only teachers can share files in class.' });
        }
        if (!fileName || !fileBuffer) {
          return ack?.({ ok: false, message: 'Missing file data.' });
        }
        const size = fileBuffer.byteLength ?? fileBuffer.length ?? 0;
        if (size > MAX_FILE_BYTES) {
          return ack?.({ ok: false, message: 'File is larger than the 10MB limit.' });
        }

        socket.to(roomFor(schoolId, standard)).emit('receive_file', {
          fileName,
          fileType: fileType || 'application/octet-stream',
          fileData: fileBuffer,
          senderName: name,
          sentAt: Date.now(),
        });
        ack?.({ ok: true });
      } catch (err) {
        console.error('send_file error:', err);
        ack?.({ ok: false, message: 'Failed to share file.' });
      }
    });
  });

  return io;
}
