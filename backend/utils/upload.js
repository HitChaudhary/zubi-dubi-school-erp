import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  },
});

// Teachers attach the actual file (not just a link) when creating an assignment.
// 10MB cap keeps this consistent with the live class file-share limit.
export const uploadAssignmentFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file'); // field name the frontend sends: "file"
