/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getOpsxExploreCommandTemplate } from './workflows/explore.js';
export { getNewChangeSkillTemplate, getOpsxNewCommandTemplate } from './workflows/new-change.js';
export { getContinueChangeSkillTemplate, getOpsxContinueCommandTemplate } from './workflows/continue-change.js';
export { getApplyChangeSkillTemplate, getOpsxApplyCommandTemplate } from './workflows/apply-change.js';
export { getUpdateChangeSkillTemplate, getOpsxUpdateCommandTemplate } from './workflows/update-change.js';
export { getFfChangeSkillTemplate, getOpsxFfCommandTemplate } from './workflows/ff-change.js';
export { getSyncSpecsSkillTemplate, getOpsxSyncCommandTemplate } from './workflows/sync-specs.js';
export { getArchiveChangeSkillTemplate, getOpsxArchiveCommandTemplate } from './workflows/archive-change.js';
export { getBulkArchiveChangeSkillTemplate, getOpsxBulkArchiveCommandTemplate } from './workflows/bulk-archive-change.js';
export { getVerifyChangeSkillTemplate, getOpsxVerifyCommandTemplate } from './workflows/verify-change.js';
export { getLadderAuditSkillTemplate, getOpsxLadderAuditCommandTemplate } from './workflows/ladder-audit.js';
export { getGuardrailsSkillTemplate, getOpsxGuardrailsCommandTemplate } from './workflows/guardrails.js';
export { getDebtLedgerSkillTemplate, getOpsxDebtLedgerCommandTemplate } from './workflows/debt-ledger.js';
export { getTokenBudgetSkillTemplate, getOpsxTokenBudgetCommandTemplate } from './workflows/token-budget.js';
export { getBenchmarkSkillTemplate, getOpsxBenchmarkCommandTemplate } from './workflows/benchmark.js';
export { getDependencyCheckSkillTemplate, getOpsxDependencyCheckCommandTemplate } from './workflows/dependency-check.js';
export { getParallelExecuteSkillTemplate, getOpsxParallelExecuteCommandTemplate } from './workflows/parallel-execute.js';
export { getLearnSkillTemplate, getOpsxLearnCommandTemplate } from './workflows/learn.js';
export { getInitUnifiedSkillTemplate, getOpsxInitUnifiedCommandTemplate } from './workflows/init-unified.js';
export { getOnboardSkillTemplate, getOpsxOnboardCommandTemplate } from './workflows/onboard.js';
export { getOpsxProposeSkillTemplate, getOpsxProposeCommandTemplate } from './workflows/propose.js';
export { getFeedbackSkillTemplate } from './workflows/feedback.js';
export { getTranslatorSkillTemplate } from './workflows/translator.js';
