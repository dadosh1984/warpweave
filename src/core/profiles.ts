/**
 * Profile System
 *
 * Defines workflow profiles that control which workflows are installed.
 * Profiles determine WHICH workflows; delivery (in global config) determines HOW.
 */

import type { Profile } from './global-config.js';

/**
 * Core workflows included in the 'core' profile.
 * These provide the streamlined experience for new users.
 */
export const CORE_WORKFLOWS = ['propose', 'explore', 'apply', 'update', 'sync', 'archive', 'translator', 'ponytail-minimal-output', 'superpowers-tdd', 'security-scan'] as const;

/**
 * All available workflows in the system.
 */
export const ALL_WORKFLOWS = [
  'propose',
  'explore',
  'new',
  'continue',
  'apply',
  'update',
  'ff',
  'sync',
  'archive',
  'bulk-archive',
  'verify',
  'onboard',
  'ladder-audit',
  'guardrails',
  'debt-ledger',
  'token-budget',
  'benchmark',
  'dependency-check',
  'parallel-execute',
  'learn',
  'init-unified',
  'translator',
  'ponytail-minimal-output',
  'superpowers-tdd',
  'security-scan',
] as const;

export type WorkflowId = (typeof ALL_WORKFLOWS)[number];
export type CoreWorkflowId = (typeof CORE_WORKFLOWS)[number];

/**
 * Unified pipeline profiles, mirroring `config/profiles/*.yaml`.
 * Each maps a preset id to the workflow set it installs and a short description.
 */
export const UNIFIED_PROFILE_PRESETS = [
  {
    id: 'minimal',
    description: 'Solo developer: relaxed TDD, ultra minimalism, core gates only',
    workflows: [...CORE_WORKFLOWS, 'ladder-audit', 'guardrails', 'debt-ledger', 'benchmark'],
  },
  {
    id: 'standard',
    description: 'Small team: strict TDD, subagent review, all four gates',
    workflows: [...ALL_WORKFLOWS],
  },
  {
    id: 'enterprise',
    description: 'Large team: strictest gates, parallel agents, two reviewers',
    workflows: [...ALL_WORKFLOWS],
  },
] as const;

export type UnifiedProfilePreset = (typeof UNIFIED_PROFILE_PRESETS)[number]['id'];

/**
 * Resolves which workflows should be active for a given profile configuration.
 *
 * - 'core' profile always returns CORE_WORKFLOWS
 * - 'custom' profile returns the provided customWorkflows, or empty array if not provided
 */
export function getProfileWorkflows(
  profile: Profile,
  customWorkflows?: string[]
): readonly string[] {
  if (profile === 'custom') {
    return customWorkflows ?? [];
  }
  return CORE_WORKFLOWS;
}
