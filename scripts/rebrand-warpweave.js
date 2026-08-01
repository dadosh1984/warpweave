#!/usr/bin/env node

/**
 * Warpweave Rebrand Script
 * Replaces all warpweave/Warpweave/WARPWEAVE → warpweave/Warpweave/WARPWEAVE
 * and warpweave/OpenSpec/WARPWEAVE → warpweave/Warpweave/WARPWEAVE (where appropriate)
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Replacement patterns (order matters!)
const replacements = [
  // warpweave → warpweave (case-preserving)
  { pattern: /\bspectrix\b/g, replacement: 'warpweave' },
  { pattern: /\bSpectrix\b/g, replacement: 'Warpweave' },
  { pattern: /\bSPECTRIX\b/g, replacement: 'WARPWEAVE' },
  
  // warpweave → warpweave (case-preserving) - for most cases
  { pattern: /\bopenspec\b/g, replacement: 'warpweave' },
  { pattern: /\bOpenspec\b/g, replacement: 'Warpweave' },
  { pattern: /\bOPENSPEC\b/g, replacement: 'WARPWEAVE' },
];

// Files/directories to skip
const skipDirs = ['node_modules', 'dist', '.git', '.github'];

async function processFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let originalContent = content;
    
    for (const { pattern, replacement } of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function walkDir(dir, skip = []) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!skip.includes(entry.name)) {
        files.push(...await walkDir(fullPath, skip));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.md'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  console.log('🔨 Starting warpweave rebrand...\n');
  
  const targets = [
    { dir: 'src', extensions: ['.ts'] },
    { dir: 'docs', extensions: ['.md'] },
    { dir: 'scripts', extensions: ['.js'] },
  ];
  
  let totalModified = 0;
  let totalFiles = 0;
  
  for (const { dir, extensions } of targets) {
    const dirPath = path.join(rootDir, dir);
    console.log(`Processing ${dir}/...`);
    
    const files = await walkDir(dirPath, skipDirs);
    const matchingFiles = files.filter(f => extensions.some(ext => f.endsWith(ext)));
    
    let modifiedInDir = 0;
    for (const file of matchingFiles) {
      const modified = await processFile(file);
      if (modified) {
        modifiedInDir++;
        const relativePath = path.relative(rootDir, file);
        console.log(`  ✓ ${relativePath}`);
      }
    }
    
    totalModified += modifiedInDir;
    totalFiles += matchingFiles.length;
    console.log(`  ${modifiedInDir}/${matchingFiles.length} files modified\n`);
  }
  
  console.log(`\n✅ Rebrand complete!`);
  console.log(`   Modified: ${totalModified}/${totalFiles} files\n`);
}

main().catch(console.error);
