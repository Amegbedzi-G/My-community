// This script copies our root index.html file to the public directory 
// where the vite.ts file is looking for it during deployment

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to source index.html file
const sourceFile = path.join(__dirname, 'index.html');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'server', 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Creating public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Path to destination index.html file
const destFile = path.join(publicDir, 'index.html');

try {
  // Copy the file
  fs.copyFileSync(sourceFile, destFile);
  console.log('Successfully copied index.html to server/public directory');
} catch (err) {
  console.error('Error copying file:', err);
}