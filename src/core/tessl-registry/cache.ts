import * as fs from 'node:fs';
import * as path from 'node:path';
import { CACHE_DIR_NAME, CACHE_FILE_NAME, DEFAULT_CACHE_TTL_MS, type TesslSkill } from './types.js';

interface CacheEntry {
  timestamp: number;
  skills: TesslSkill[];
}

export function getCacheDir(projectRoot: string): string {
  return path.join(projectRoot, 'warpweave', CACHE_DIR_NAME);
}

function getCachePath(projectRoot: string): string {
  return path.join(getCacheDir(projectRoot), CACHE_FILE_NAME);
}

export function readCache(projectRoot: string, ttlMs: number = DEFAULT_CACHE_TTL_MS): TesslSkill[] | null {
  const cachePath = getCachePath(projectRoot);
  if (!fs.existsSync(cachePath)) return null;

  try {
    const raw = fs.readFileSync(cachePath, 'utf-8');
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > ttlMs) return null;
    return entry.skills;
  } catch {
    return null;
  }
}

export function writeCache(projectRoot: string, skills: TesslSkill[]): void {
  const cacheDir = getCacheDir(projectRoot);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const entry: CacheEntry = { timestamp: Date.now(), skills };
  fs.writeFileSync(getCachePath(projectRoot), JSON.stringify(entry, null, 2), 'utf-8');
}

export function clearCache(projectRoot: string): void {
  const cachePath = getCachePath(projectRoot);
  if (fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
  }
}
