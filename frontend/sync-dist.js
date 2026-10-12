import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');
const backendPublicDir = path.resolve(__dirname, '../backend/public');
const backendAssetsDir = path.join(backendPublicDir, 'assets');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist. Run build first.');
  process.exit(1);
}

// 1. Clean obsolete assets in backend/public/assets
if (fs.existsSync(backendAssetsDir)) {
  fs.rmSync(backendAssetsDir, { recursive: true, force: true });
}
fs.mkdirSync(backendAssetsDir, { recursive: true });

// 2. Copy fresh dist files directly into backend/public
fs.cpSync(distDir, backendPublicDir, { recursive: true, force: true });

console.log('Build synced to backend/public with obsolete assets cleaned.');
