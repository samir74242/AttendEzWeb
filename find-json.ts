import fs from 'fs';
import path from 'path';

function searchDir(dir: string, depth = 0) {
  if (depth > 4) return;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.includes('node_modules') || file.includes('dist') || file.startsWith('.')) continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath, depth + 1);
      } else if (file.endsWith('.json') && (file.includes('service') || file.includes('credential') || file.includes('key') || file.includes('firebase') || file.includes('secret'))) {
        console.log("Found JSON file:", fullPath);
      }
    }
  } catch (e) {}
}

console.log("Searching in /app...");
searchDir('/app');
console.log("Searching in /etc...");
searchDir('/etc');
console.log("Searching in current directory...");
searchDir('.');
