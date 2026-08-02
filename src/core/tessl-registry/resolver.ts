import { DEFAULT_REGISTRY_ENDPOINT, type TesslSkill, type TesslRegistryConfig } from './types.js';
import { readCache, writeCache } from './cache.js';
import { detectDependencies } from './detector.js';

interface RegistryApiResponse {
  skills: TesslSkill[];
}

async function queryRegistry(libraryName: string, endpoint: string): Promise<TesslSkill[]> {
  const url = `${endpoint}?q=${encodeURIComponent(libraryName)}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return [];

  const data: RegistryApiResponse = await response.json() as RegistryApiResponse;
  return data.skills ?? [];
}

export async function resolveSkills(
  projectRoot: string,
  config: TesslRegistryConfig
): Promise<TesslSkill[]> {
  if (!config.enabled) return [];

  const cached = readCache(projectRoot, config.cacheTtlMs);
  if (cached) return cached;

  const deps = config.autoDetect ? detectDependencies(projectRoot) : [];
  const allSkills: TesslSkill[] = [];

  for (const dep of deps) {
    const skills = await queryRegistry(dep.name, config.endpoint);
    allSkills.push(...skills);
  }

  if (allSkills.length > 0) {
    writeCache(projectRoot, allSkills);
  }

  return allSkills;
}

export async function resolveSkillsForDeps(
  deps: string[],
  endpoint: string = DEFAULT_REGISTRY_ENDPOINT
): Promise<TesslSkill[]> {
  const allSkills: TesslSkill[] = [];
  for (const dep of deps) {
    const skills = await queryRegistry(dep, endpoint);
    allSkills.push(...skills);
  }
  return allSkills;
}
