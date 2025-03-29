import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory name (ESM replacement for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const profilesDir = path.join(__dirname, 'public', 'uploads', 'profiles');
const postsDir = path.join(__dirname, 'public', 'uploads', 'posts');

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// Define storage for profile pictures
const profileStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, profilesDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});

// Define storage for post content
const postStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, postsDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'post-' + uniqueSuffix + ext);
  },
});

// File filter for images only
const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer instances for different upload types
export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

export const uploadPostMedia = multer({
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter,
});

// Helper to get file URL from filename
export const getFileUrl = (filename: string, type: 'profile' | 'post') => {
  if (!filename) return null;
  
  const baseDir = type === 'profile' ? 'profiles' : 'posts';
  return `/uploads/${baseDir}/${filename}`;
};

// Helper to get filename from URL
export const getFilenameFromUrl = (url: string | null) => {
  if (!url) return null;
  
  return path.basename(url);
};