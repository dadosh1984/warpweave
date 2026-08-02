/**
 * Skill Generation Utilities
 *
 * Shared utilities for generating skill and command files.
 */

import {
  getExploreSkillTemplate,
  getNewChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getApplyChangeSkillTemplate,
  getUpdateChangeSkillTemplate,
  getFfChangeSkillTemplate,
  getSyncSpecsSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxProposeSkillTemplate,
  getLadderAuditSkillTemplate,
  getGuardrailsSkillTemplate,
  getDebtLedgerSkillTemplate,
  getTokenBudgetSkillTemplate,
  getBenchmarkSkillTemplate,
  getDependencyCheckSkillTemplate,
  getParallelExecuteSkillTemplate,
  getLearnSkillTemplate,
  getInitUnifiedSkillTemplate,
  getTranslatorSkillTemplate,
  getPonytailMinimalOutputSkillTemplate,
  getSuperpowersTddSkillTemplate,
  getSecurityScanSkillTemplate,
  getDriftDetectionSkillTemplate,
  getReleaseCompareSkillTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxUpdateCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxLadderAuditCommandTemplate,
  getOpsxGuardrailsCommandTemplate,
  getOpsxDebtLedgerCommandTemplate,
  getOpsxTokenBudgetCommandTemplate,
  getOpsxBenchmarkCommandTemplate,
  getOpsxDependencyCheckCommandTemplate,
  getOpsxParallelExecuteCommandTemplate,
  getOpsxLearnCommandTemplate,
  getOpsxInitUnifiedCommandTemplate,
  getOpsxSecurityScanCommandTemplate,
  getOpsxDriftDetectionCommandTemplate,
  getOpsxReleaseCompareCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';
import { WARPWEAVE_CLI_ALLOWED_TOOLS } from './allowed-tools.js';

/**
 * Skill template with directory name and workflow ID mapping.
 */
export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

/**
 * Command template with ID mapping.
 */
export interface CommandTemplateEntry {
  template: ReturnType<typeof getOpsxExploreCommandTemplate>;
  id: string;
}

/**
 * Gets skill templates with their directory names, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose workflowId is in this array
 */
export function getSkillTemplates(workflowFilter?: readonly string[]): SkillTemplateEntry[] {
  const all: SkillTemplateEntry[] = [
    { template: getExploreSkillTemplate(), dirName: 'warpweave-explore', workflowId: 'explore' },
    { template: getNewChangeSkillTemplate(), dirName: 'warpweave-new-change', workflowId: 'new' },
    { template: getContinueChangeSkillTemplate(), dirName: 'warpweave-continue-change', workflowId: 'continue' },
    { template: getApplyChangeSkillTemplate(), dirName: 'warpweave-apply-change', workflowId: 'apply' },
    { template: getUpdateChangeSkillTemplate(), dirName: 'warpweave-update-change', workflowId: 'update' },
    { template: getFfChangeSkillTemplate(), dirName: 'warpweave-ff-change', workflowId: 'ff' },
    { template: getSyncSpecsSkillTemplate(), dirName: 'warpweave-sync-specs', workflowId: 'sync' },
    { template: getArchiveChangeSkillTemplate(), dirName: 'warpweave-archive-change', workflowId: 'archive' },
    { template: getBulkArchiveChangeSkillTemplate(), dirName: 'warpweave-bulk-archive-change', workflowId: 'bulk-archive' },
    { template: getVerifyChangeSkillTemplate(), dirName: 'warpweave-verify-change', workflowId: 'verify' },
    { template: getOnboardSkillTemplate(), dirName: 'warpweave-onboard', workflowId: 'onboard' },
    { template: getOpsxProposeSkillTemplate(), dirName: 'warpweave-propose', workflowId: 'propose' },
    { template: getLadderAuditSkillTemplate(), dirName: 'warpweave-ladder-audit', workflowId: 'ladder-audit' },
    { template: getGuardrailsSkillTemplate(), dirName: 'warpweave-guardrails', workflowId: 'guardrails' },
    { template: getDebtLedgerSkillTemplate(), dirName: 'warpweave-debt-ledger', workflowId: 'debt-ledger' },
    { template: getTokenBudgetSkillTemplate(), dirName: 'warpweave-token-budget', workflowId: 'token-budget' },
    { template: getBenchmarkSkillTemplate(), dirName: 'warpweave-benchmark', workflowId: 'benchmark' },
    { template: getDependencyCheckSkillTemplate(), dirName: 'warpweave-dependency-check', workflowId: 'dependency-check' },
    { template: getParallelExecuteSkillTemplate(), dirName: 'warpweave-parallel-execute', workflowId: 'parallel-execute' },
    { template: getLearnSkillTemplate(), dirName: 'warpweave-learn', workflowId: 'learn' },
    { template: getInitUnifiedSkillTemplate(), dirName: 'warpweave-init-unified', workflowId: 'init-unified' },
    { template: getTranslatorSkillTemplate(), dirName: 'warpweave-translator', workflowId: 'translator' },
    { template: getPonytailMinimalOutputSkillTemplate(), dirName: 'warpweave-ponytail-minimal-output', workflowId: 'ponytail-minimal-output' },
    { template: getSuperpowersTddSkillTemplate(), dirName: 'warpweave-superpowers-tdd', workflowId: 'superpowers-tdd' },
    { template: getSecurityScanSkillTemplate(), dirName: 'warpweave-security-scan', workflowId: 'security-scan' },
    { template: getDriftDetectionSkillTemplate(), dirName: 'warpweave-drift-detection', workflowId: 'drift-check' },
    { template: getReleaseCompareSkillTemplate(), dirName: 'warpweave-release-compare', workflowId: 'release-compare' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.workflowId));
}

/**
 * Gets command templates with their IDs, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return templates whose id is in this array
 */
export function getCommandTemplates(workflowFilter?: readonly string[]): CommandTemplateEntry[] {
  const all: CommandTemplateEntry[] = [
    { template: getOpsxExploreCommandTemplate(), id: 'explore' },
    { template: getOpsxNewCommandTemplate(), id: 'new' },
    { template: getOpsxContinueCommandTemplate(), id: 'continue' },
    { template: getOpsxApplyCommandTemplate(), id: 'apply' },
    { template: getOpsxUpdateCommandTemplate(), id: 'update' },
    { template: getOpsxFfCommandTemplate(), id: 'ff' },
    { template: getOpsxSyncCommandTemplate(), id: 'sync' },
    { template: getOpsxArchiveCommandTemplate(), id: 'archive' },
    { template: getOpsxBulkArchiveCommandTemplate(), id: 'bulk-archive' },
    { template: getOpsxVerifyCommandTemplate(), id: 'verify' },
    { template: getOpsxOnboardCommandTemplate(), id: 'onboard' },
    { template: getOpsxProposeCommandTemplate(), id: 'propose' },
    { template: getOpsxLadderAuditCommandTemplate(), id: 'ladder-audit' },
    { template: getOpsxGuardrailsCommandTemplate(), id: 'guardrails' },
    { template: getOpsxDebtLedgerCommandTemplate(), id: 'debt-ledger' },
    { template: getOpsxTokenBudgetCommandTemplate(), id: 'token-budget' },
    { template: getOpsxBenchmarkCommandTemplate(), id: 'benchmark' },
    { template: getOpsxDependencyCheckCommandTemplate(), id: 'dependency-check' },
    { template: getOpsxParallelExecuteCommandTemplate(), id: 'parallel-execute' },
    { template: getOpsxLearnCommandTemplate(), id: 'learn' },
    { template: getOpsxInitUnifiedCommandTemplate(), id: 'init-unified' },
    { template: getOpsxSecurityScanCommandTemplate(), id: 'security-scan' },
    { template: getOpsxDriftDetectionCommandTemplate(), id: 'drift-check' },
    { template: getOpsxReleaseCompareCommandTemplate(), id: 'release-compare' },
  ];

  if (!workflowFilter) return all;

  const filterSet = new Set(workflowFilter);
  return all.filter(entry => filterSet.has(entry.id));
}

/**
 * Converts command templates to CommandContent array, optionally filtered by workflow IDs.
 *
 * @param workflowFilter - If provided, only return contents whose id is in this array
 */
export function getCommandContents(workflowFilter?: readonly string[]): CommandContent[] {
  const commandTemplates = getCommandTemplates(workflowFilter);
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

/**
 * Generates skill file content with YAML frontmatter.
 *
 * @param template - The skill template
 * @param generatedByVersion - The Warpweave version to embed in the file
 * @param transformInstructions - Optional callback to transform the instructions content
 */
export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
allowed-tools: ${WARPWEAVE_CLI_ALLOWED_TOOLS}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires warpweave CLI.'}
metadata:
  author: ${template.metadata?.author || 'warpweave'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
