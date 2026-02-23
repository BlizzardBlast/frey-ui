import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const libraryIndexPath = path.join(
  rootDir,
  'packages',
  'frey-ui',
  'src',
  'index.ts'
);
const storiesRoot = path.join(rootDir, 'apps', 'storybook', 'src', 'stories');

function walkStoryFiles(dir) {
  const storyFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      storyFiles.push(...walkStoryFiles(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.stories.tsx')) {
      storyFiles.push(entryPath);
    }
  }

  return storyFiles;
}

const indexSource = fs.readFileSync(libraryIndexPath, 'utf8');
const exportMatches = [
  ...indexSource.matchAll(
    /export\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+'\.\/[^']+';/g
  )
];

const exportedComponents = exportMatches
  .map((match) => match[1])
  .sort((a, b) => a.localeCompare(b));

const storyFiles = walkStoryFiles(storiesRoot);
const documentedComponents = new Set(
  storyFiles
    .map(
      (storyPath) => path.relative(storiesRoot, storyPath).split(path.sep)[0]
    )
    .filter(Boolean)
);

const missingStories = exportedComponents.filter(
  (componentName) => !documentedComponents.has(componentName)
);

const castWrapperStoryFiles = storyFiles
  .filter((storyPath) => {
    const source = fs.readFileSync(storyPath, 'utf8');
    return /as unknown as React\.ComponentType/.test(source);
  })
  .map((storyPath) => path.relative(rootDir, storyPath));

if (missingStories.length > 0 || castWrapperStoryFiles.length > 0) {
  console.error('Storybook API coverage check failed.');

  if (missingStories.length > 0) {
    console.error('\nMissing component stories:');
    for (const componentName of missingStories) {
      console.error(`- ${componentName}`);
    }
  }

  if (castWrapperStoryFiles.length > 0) {
    console.error('\nStories still using cast wrappers:');
    for (const storyPath of castWrapperStoryFiles) {
      console.error(`- ${storyPath}`);
    }
  }

  process.exit(1);
}

console.log(
  `Storybook API coverage check passed for ${exportedComponents.length} component exports.`
);
