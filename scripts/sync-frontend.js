const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'frontend', 'dist');
const dstDir = path.resolve(__dirname, '..', 'backend', 'public');

if (!fs.existsSync(srcDir)) {
  console.error(`[sync-frontend] Frontend dist folder not found at: ${srcDir}`);
  process.exit(1);
}

if (!fs.existsSync(dstDir)) {
  fs.mkdirSync(dstDir, { recursive: true });
}

// Clean old assets folder in backend/public to eliminate stale chunk hashes
const dstAssetsDir = path.join(dstDir, 'assets');
if (fs.existsSync(dstAssetsDir)) {
  console.log('[sync-frontend] Cleaning obsolete assets in backend/public/assets...');
  fs.rmSync(dstAssetsDir, { recursive: true, force: true });
}

console.log(`[sync-frontend] Copying fresh frontend build from ${srcDir} to ${dstDir}...`);
fs.cpSync(srcDir, dstDir, { recursive: true });

console.log('[sync-frontend] Successfully synced frontend distribution to backend/public!');
