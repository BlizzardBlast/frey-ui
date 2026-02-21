import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const destDir = path.join(rootDir, '.vitest-reports');
fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });

const searchPaths = ['packages', 'apps'];
for (const searchPath of searchPaths) {
  const dirPath = path.join(rootDir, searchPath);
  if (!fs.existsSync(dirPath)) continue;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const srcFile = path.join(
        dirPath,
        entry.name,
        '.vitest-reports',
        'blob.json'
      );
      if (fs.existsSync(srcFile)) {
        const destFile = path.join(destDir, `${searchPath}-${entry.name}.json`);
        fs.copyFileSync(srcFile, destFile);
      }
    }
  }
}
