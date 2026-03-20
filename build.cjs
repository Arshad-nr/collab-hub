/**
 * build.cjs — copies compiled frontend builds into backend/public/
 * Run after: npm run build:react  &&  npm run build:angular
 */
const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌  Source not found: ${src}`);
    process.exit(1);
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

// React → backend/public/student
// Vite outputs to student-portal/dist/
const reactSrc  = path.join(ROOT, 'student-portal', 'dist');
const reactDest = path.join(ROOT, 'backend', 'public', 'student');
console.log('📦  Copying React build → backend/public/student ...');
copyDir(reactSrc, reactDest);
console.log('✅  React done.');

// Angular → backend/public/admin
// Angular v17 outputs to admin-portal/dist/admin-portal/browser/
// Fallback: admin-portal/dist/admin-portal  (older builders)
let angularSrc = path.join(ROOT, 'admin-portal', 'dist', 'admin-portal', 'browser');
if (!fs.existsSync(angularSrc)) {
  angularSrc = path.join(ROOT, 'admin-portal', 'dist', 'admin-portal');
}
const angularDest = path.join(ROOT, 'backend', 'public', 'admin');
console.log('📦  Copying Angular build → backend/public/admin ...');
copyDir(angularSrc, angularDest);
console.log('✅  Angular done.');

console.log('\n🚀  Build artefacts ready in backend/public/');
console.log('   Run:  npm start   (or  node backend/server.js)');
console.log('   Then open:  http://localhost:5000\n');
