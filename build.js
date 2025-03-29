// This script prepares the application for deployment
// It copies the index.html file to the server/public directory

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

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
  
  // Run the build command
  console.log('Running build command...');
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Build stderr: ${stderr}`);
    }
    console.log(`Build output: ${stdout}`);
    console.log('Build completed successfully!');
  });
} catch (err) {
  console.error('Error during build preparation:', err);
}