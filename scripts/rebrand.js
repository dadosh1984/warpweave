#!/usr/bin/env node

/**
 * Rebranding script: warpweave → warpweave
 * Replaces all mentions in src/ directory
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Replacement patterns (order matters!)
const replacements = [
  { pattern: /OPENSPEC_DIR_NAME/g, replacement: 'SPECTRIX_DIR_NAME' },
  { pattern: /OpenSpecRoot/g, replacement: 'SpectrixRoot' },
  { pattern: /OpenSpec/g, replacement: 'Warpweave' },
  { pattern: /warpweave/g, replacement: 'warpweave' },
];

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

async function walkDir(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  console.log('🔨 Starting rebranding (warpweave → warpweave)...\n');
  
  const files = await walkDir(srcDir);
  console.log(`Found ${files.length} TypeScript files in src/\n`);
  
  let modifiedCount = 0;
  for (const file of files) {
    const modified = await processFile(file);
    if (modified) {
      modifiedCount++;
      const relativePath = path.relative(rootDir, file);
      console.log(`  ✓ ${relativePath}`);
    }
  }
  
  console.log(`\n✅ Rebranding complete!`);
  console.log(`   Modified: ${modifiedCount}/${files.length} files\n`);
}

main().catch(console.error);
