export interface TesslSkill {
  name: string;
  description: string;
  version: string;
  downloadUrl: string;
}

export interface TesslRegistryConfig {
  enabled: boolean;
  endpoint: string;
  autoDetect: boolean;
  cacheTtlMs: number;
}

export const DEFAULT_REGISTRY_ENDPOINT = 'https://tessl.io/api/registry/search';
export const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const CACHE_DIR_NAME = 'registry-cache';
export const CACHE_FILE_NAME = 'skills-cache.json';
