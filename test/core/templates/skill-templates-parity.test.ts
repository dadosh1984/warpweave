import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxUpdateCommandTemplate,
  getOpsxVerifyCommandTemplate,
  getLadderAuditSkillTemplate,
  getOpsxLadderAuditCommandTemplate,
  getGuardrailsSkillTemplate,
  getOpsxGuardrailsCommandTemplate,
  getDebtLedgerSkillTemplate,
  getOpsxDebtLedgerCommandTemplate,
  getTokenBudgetSkillTemplate,
  getOpsxTokenBudgetCommandTemplate,
  getBenchmarkSkillTemplate,
  getOpsxBenchmarkCommandTemplate,
  getDependencyCheckSkillTemplate,
  getOpsxDependencyCheckCommandTemplate,
  getParallelExecuteSkillTemplate,
  getOpsxParallelExecuteCommandTemplate,
  getLearnSkillTemplate,
  getOpsxLearnCommandTemplate,
  getInitUnifiedSkillTemplate,
  getOpsxInitUnifiedCommandTemplate,
  getSyncSpecsSkillTemplate,
  getUpdateChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import {
  generateSkillContent,
  getCommandContents,
  getSkillTemplates,
} from '../../../src/core/shared/skill-generation.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: '1907b8c9aba7107d80f16707ba9665188ffdded5702746656382a1d1a5d8674e',
  getNewChangeSkillTemplate: '2769787a16c59f69374aac1ff11f201db9f16382a5b651aff16a1ea7cbfffbe2',
  getContinueChangeSkillTemplate: 'c6896ee38dac55a53ea2834e0a351380284cbe4107e27e88e874f3b13224cf1f',
  getApplyChangeSkillTemplate: '2f9d19a191abc0dfa0e4a836c532d422306658825d3531acf6a31abf59a21cd7',
  getFfChangeSkillTemplate: 'f0981a1bbd6d41803f1dbb1ae317f0ca5ced086b7a0c1534a31dd7845d1c6c0b',
  getSyncSpecsSkillTemplate: '0c5d2a381238716fff9501a2887b85cf3c5eae4171489ff3096d4c37e65010ff',
  getOnboardSkillTemplate: '339800aa4727754228cb89de6bd6a532e9215c3a9d7b5ef2255c81c7d11205e0',
  getOpsxExploreCommandTemplate: 'a704bfca0bc6d3b5d82d420464d279ad5f87a3061544dafd0098e8e91e32c9d2',
  getOpsxNewCommandTemplate: 'f7fed3b2cba703437202a7064cfa92e1c95d16bc2e34f7b33c7f0fca67440339',
  getOpsxContinueCommandTemplate: '30963fc0a5a12ade43b8ed553ca12bc5eff96dd23ab83aebbe7d8d58c2a08259',
  getOpsxApplyCommandTemplate: '98dcec4e16d3ada1c8eb1eab93f1cc898fc587cb51a42084e20b7e317b56728d',
  getOpsxFfCommandTemplate: 'caa153ead72ec90616ae3db80151cf8902d1d291dafefc296144ea949fa9233b',
  getArchiveChangeSkillTemplate: '6b1dec5c13cad5bb9fb80fe06e4b8b4c9b959e1ceb03e3b0a39827d5d9acbe50',
  getBulkArchiveChangeSkillTemplate: '272e29a3a1b3263899b3d7ed74b113c0f3337e400f98334b6489533d1f31d609',
  getOpsxSyncCommandTemplate: '4d3393b5d0209462dae1dd9e2852f35fa5304a8dc9865fae814de45b91a43515',
  getVerifyChangeSkillTemplate: '37d322e10e642832e6ac6934811f72ebd2e8b127d5166c35f5cb306678ae046c',
  getOpsxArchiveCommandTemplate: '041b1c3788088851276ba7608edcaf71dbc6a893ebc985fa9573013776322fb1',
  getOpsxOnboardCommandTemplate: 'bbd33c79ea3ecf8fec6bfeecea40dbed409cf1702b276ebde2c27950c16c1b98',
  getOpsxBulkArchiveCommandTemplate: 'a1893c8b53e2508027f71d3a84f9136933c04214943e00cffeeb1a472dc33ce3',
  getOpsxVerifyCommandTemplate: 'a0fa66ba40a86ea7f053097f3670ddad74b016a45da4b497c72824989a2cf62c',
  getOpsxProposeSkillTemplate: '9a501d3a8a09e24c8805042c4763a25d69370b9e80015e5a9386db5292b62c55',
  getOpsxProposeCommandTemplate: 'e0cb7359d37012ccedc218158513cb5a2565f3028d6928c653999d4418bed977',
  getFeedbackSkillTemplate: '85a7e2dbd4e46964863f9639ad1317ba1eccf76c8ac3c6eb9b9c5ed792db4f3e',
  getUpdateChangeSkillTemplate: 'd1874fd4ddb4ea760f4a768e1e3d0f1c1b4359cfbbb4ae244e2b4a63bbc06429',
  getOpsxUpdateCommandTemplate: 'd4f9ba055963f7410c41754a4d252bbe313da059e4fc9741dc1ef08d24778029',
  getLadderAuditSkillTemplate: 'd46978a12990ea772f1eed188ec1d97b8e9fdb252dc8eb89daa42407723b8279',
  getOpsxLadderAuditCommandTemplate: '23fac7c57aad3dec3bc400879b857042d8c2a5a134a5bb67661a1dc49a022ac5',
  getGuardrailsSkillTemplate: '555075c6a1492fd2ba6cf04b24cc87f6437ae87b27698f115ba7206c00a89c72',
  getOpsxGuardrailsCommandTemplate: '014f976ae51dece4b62b30bff9fab1b18c19aac6f9f76e8a58844bf45457a246',
  getDebtLedgerSkillTemplate: '02845a7a0719bf14e5279dec8e2f034476ea98e9732869d98310ab57ccefd64c',
  getOpsxDebtLedgerCommandTemplate: '4a3ee4e8c7f220409ff47f6717f840296058cb22509815a713bf4314163c05e4',
  getTokenBudgetSkillTemplate: 'e7cf84306467cfc27804130f120ba6ddb40b5708ff3a99a4363536be2d29b0fb',
  getOpsxTokenBudgetCommandTemplate: 'dc14744dc84054fffa5613842c20aa82717d1c85f32a9c8e17dac23f0e6eeb27',
  getBenchmarkSkillTemplate: '0a48a2a0a210b7ce745b7b4e35683fb2ea27b66b1f4aaf57415e088778eb3e42',
  getOpsxBenchmarkCommandTemplate: 'bcfc73cb1b35d5932441b4d6f6031acf1701f73d7df1984c0b64476954d321e0',
  getDependencyCheckSkillTemplate: '3feabd43295eeb88101c8114689b951b1fd669c1ebcf6ae2885dab4ac014ff61',
  getOpsxDependencyCheckCommandTemplate: 'dee042b1c78312bd6929a6d2ded187bd76fce7fb50199c948fe8579ecfbf943c',
  getParallelExecuteSkillTemplate: 'd54afc0b643467b3eca19f0e78adeee34ff0ce4f280608d414fc54f89a2d95b7',
  getOpsxParallelExecuteCommandTemplate: '306e56fab45cf441b0f14a9b3937ad99a4eb1fddaa3f2c290074281de86e3676',
  getLearnSkillTemplate: '9d0cbcb6c243e2ee6d307c0266745487b25367ecca9e278dc8dfd7f7b6bd5d0f',
  getOpsxLearnCommandTemplate: '7d54fffc038fb79cc7f6c4524897acbc64533ab67ea9dd3f85e734bc8ff75303',
  getInitUnifiedSkillTemplate: '66732407f85a2c22afc50c2832a71e174fe074e9e47101a384d7176d23bf3582',
  getOpsxInitUnifiedCommandTemplate: 'c12bf908f254751aa579f09ab76e7189bae6e87b9508f63359ecf1919fafebb1',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '0950b191a7e5a8fa104a4fa2db4f8ec98d60497a6270aedec5e7435163e5379e',
  'openspec-new-change': '503ea0aad3920609db9f01e157d53881e0d3b71ca23e003eabf6d777b60a1309',
  'openspec-continue-change': '1779ae73ebc431c2bea84b2329712b6178b126a07976926bbfac2a352c8e8819',
  'openspec-apply-change': '55f485fd107763a7ca3d88a9716fa267c54ce5d97b53694d5bb6cc82905d7acf',
  'openspec-ff-change': '652b32e43b47cec514c75c9ae4956364deeb2f8befe3f28bcd8c32b37a28ff77',
  'openspec-sync-specs': 'adf4b389d137d139f57c076bf38875ac0839d4717432f63ed9d95925e1372d8e',
  'openspec-archive-change': 'ec9da760c9f31e3de76d0f53de191cbdf11ca3f5adf1b87c477956503dad5e10',
  'openspec-bulk-archive-change': '5298badbc508c31c2faa8a6d12a11f09e4eff0e22dee1e0cba5fce7a40cd15e3',
  'openspec-verify-change': '6a9b96b919fa75d2fd77950d70c93003b5e62e5b1915702e93d6ccbb3c857513',
  'openspec-onboard': 'cc6ed64ec59577c03d8b25bba3203feb7bd99392ea406cd02a6e8d0a51741490',
  'openspec-propose': 'cda91c20c0f32307a7424ea5f63f4ac232794dddbd9a278f316db38a22a7c230',
  'openspec-update-change': '2399b087f68ddfcfcb9c256558290ce2cb115cdbcf033f8320fc32d31004630b',
  'openspec-ladder-audit': '83d44dc2b92e9c9b3ad7ffa25f59d552aaa009f6c78d309fbec2b6799af057bf',
  'openspec-guardrails': '92e695f6580ed033a2c093bd953d4ccb9409ffa8eb1a6ba947c3593a8f981fed',
  'openspec-debt-ledger': 'a63e4833c5e07f5ffbf2341d8748cb7e6c15d20d23ec836be270f98fda10e1c3',
  'openspec-token-budget': '7643aca8d8419fba794fde4838520ae9ba78920f800aec5b703858493c3522d5',
  'openspec-benchmark': '6e639bc27b0c7752e64b754fda15eacb42881e534e86b6ffba53025aec382200',
  'openspec-dependency-check': '77eacafa72fe0d0d811f5835337f934bd5b67e205932185b38aa9362ee97f6ce',
  'openspec-parallel-execute': '4520665ce8a09c5b00ec68ea4333cb8bdd48010ad9c2e3fcbf4deea4868944a1',
  'openspec-learn': '91c1402482422bf80192944fe46254c5179bf32bcf39e6058a0a2baeef508d43',
  'openspec-init-unified': 'c01733e0e132d772da1229e46509310a89036a10588b0f6cd885440e78a32c7f',
};

// Intentionally excludes getFeedbackSkillTemplate: this list only models templates
// deployed via generateSkillContent, while feedback is covered in function payload parity.
const GENERATED_SKILL_FACTORIES: Array<[string, () => SkillTemplate]> = [
  ['openspec-explore', getExploreSkillTemplate],
  ['openspec-new-change', getNewChangeSkillTemplate],
  ['openspec-continue-change', getContinueChangeSkillTemplate],
  ['openspec-apply-change', getApplyChangeSkillTemplate],
  ['openspec-ff-change', getFfChangeSkillTemplate],
  ['openspec-sync-specs', getSyncSpecsSkillTemplate],
  ['openspec-archive-change', getArchiveChangeSkillTemplate],
  ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
  ['openspec-verify-change', getVerifyChangeSkillTemplate],
  ['openspec-onboard', getOnboardSkillTemplate],
  ['openspec-propose', getOpsxProposeSkillTemplate],
  ['openspec-update-change', getUpdateChangeSkillTemplate],
  ['openspec-ladder-audit', getLadderAuditSkillTemplate],
  ['openspec-guardrails', getGuardrailsSkillTemplate],
  ['openspec-debt-ledger', getDebtLedgerSkillTemplate],
  ['openspec-token-budget', getTokenBudgetSkillTemplate],
  ['openspec-benchmark', getBenchmarkSkillTemplate],
  ['openspec-dependency-check', getDependencyCheckSkillTemplate],
  ['openspec-parallel-execute', getParallelExecuteSkillTemplate],
  ['openspec-learn', getLearnSkillTemplate],
  ['openspec-init-unified', getInitUnifiedSkillTemplate],
];

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxNewCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxOnboardCommandTemplate,
      getOpsxBulkArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
      getOpsxProposeSkillTemplate,
      getOpsxProposeCommandTemplate,
      getFeedbackSkillTemplate,
      getUpdateChangeSkillTemplate,
      getOpsxUpdateCommandTemplate,
      getLadderAuditSkillTemplate,
      getOpsxLadderAuditCommandTemplate,
      getGuardrailsSkillTemplate,
      getOpsxGuardrailsCommandTemplate,
      getDebtLedgerSkillTemplate,
      getOpsxDebtLedgerCommandTemplate,
      getTokenBudgetSkillTemplate,
      getOpsxTokenBudgetCommandTemplate,
      getBenchmarkSkillTemplate,
      getOpsxBenchmarkCommandTemplate,
      getDependencyCheckSkillTemplate,
      getOpsxDependencyCheckCommandTemplate,
      getParallelExecuteSkillTemplate,
      getOpsxParallelExecuteCommandTemplate,
      getLearnSkillTemplate,
      getOpsxLearnCommandTemplate,
      getInitUnifiedSkillTemplate,
      getOpsxInitUnifiedCommandTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    const actualHashes = Object.fromEntries(
      GENERATED_SKILL_FACTORIES.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  // The assertion above only compares the skills this file already lists, so a
  // workflow added to getSkillTemplates() but never pinned here would ship with
  // no golden hash and nothing would fail. Pin the registry itself.
  it('pins every skill the production registry deploys', () => {
    const pinned = GENERATED_SKILL_FACTORIES.map(([dirName]) => dirName).sort();
    const deployed = getSkillTemplates().map(({ dirName }) => dirName).sort();

    expect(pinned, 'add the new skill to GENERATED_SKILL_FACTORIES and EXPECTED_GENERATED_SKILL_CONTENT_HASHES').toEqual(deployed);
  });

  // Iterating the production registries (not a local list) means a newly
  // added workflow is covered automatically; the full-constant containment
  // check fails if any template's interpolation drifts.
  it('teaches store selection in every deployed skill template', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain(STORE_SELECTION_GUIDANCE);
    }
  });

  // Auto-approve the Spectrix CLI: every generated skill carries
  // `allowed-tools: Bash(spectrix:*)` so agents that honor it stop prompting
  // on each `spectrix` call. Iterating the registry covers new skills too.
  it('pre-approves the spectrix CLI via allowed-tools in every deployed skill', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain('allowed-tools: Bash(spectrix:*)');
    }
  });

  it('teaches store selection in every deployed otrix command template', () => {
    for (const entry of getCommandContents()) {
      expect(entry.body, entry.id).toContain(STORE_SELECTION_GUIDANCE);
    }

    // Feedback has no store-capable command and intentionally carries no
    // store teaching; it ships outside both registries.
    expect(getFeedbackSkillTemplate().instructions).not.toContain('**Store selection:**');
  });

  it('generates no workspace-planning residue in any workflow template (4.1)', () => {
    const allSkills: Array<[string, () => SkillTemplate]> = [
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['openspec-verify-change', getVerifyChangeSkillTemplate],
    ];

    for (const [dirName, createTemplate] of allSkills) {
      const content = generateSkillContent(createTemplate(), 'PARITY-BASELINE');
      expect(content, dirName).not.toContain('workspace-planning');
      expect(content, dirName).not.toContain('Workspace guard');
    }
  });

  it('gates the archive on a completed spec sync (#1393)', () => {
    const generatedSkill = generateSkillContent(getArchiveChangeSkillTemplate(), 'PARITY-BASELINE');
    const commandContent = getOpsxArchiveCommandTemplate().content;

    // The single archive skill references openspec-sync-specs; otrix command references /otrix:sync.
    expect(generatedSkill, 'skill').toContain('run the `openspec-sync-specs` workflow inline');
    expect(commandContent, 'otrix command').toContain('run the `/otrix:sync` workflow inline');

    const variants: Array<[string, string]> = [
      ['skill', generatedSkill],
      ['otrix command', commandContent],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Do not delegate it to a background task');
      expect(content, variant).toContain('Never archive while a spec sync is still in flight');

      // Verification must follow delta semantics.
      expect(content, variant).toContain('MODIFIED requirements carrying the scenario and description changes');
      expect(content, variant).toContain('REMOVED requirements gone');
      expect(content, variant).toContain('RENAMED requirements present under the new name and absent under the old one');

      // Verification is bound to the delta specs on disk, not to whatever the sync reports it touched.
      expect(content, variant).toContain('not only the ones the sync reports it touched');

      // Main spec paths are store-root aware
      expect(content, variant).toContain('<planningHome.root>/openspec/specs/<capability>/spec.md');
    }
  });

  it('gates bulk archive on inline synchronous spec sync and verification before moving change root', () => {
    const generatedSkill = generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE');
    const commandContent = getOpsxBulkArchiveCommandTemplate().content;

    // The bulk archive skill references openspec-sync-specs; otrix command references /otrix:sync.
    expect(generatedSkill, 'bulk skill').toContain('run the `openspec-sync-specs` workflow inline');
    expect(commandContent, 'bulk otrix command').toContain('run the `/otrix:sync` workflow inline');

    const variants: Array<[string, string]> = [
      ['bulk skill', generatedSkill],
      ['bulk otrix command', commandContent],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Do not delegate to a background task');
      expect(content, variant).toContain('Never archive a change while a spec sync is still in flight');
      expect(content, variant).toContain('Verify included delta specs before moving changeRoot');

      // Verification must follow delta semantics.
      expect(content, variant).toContain('MODIFIED requirements carrying scenario and description changes');
      expect(content, variant).toContain('REMOVED requirements gone');
      expect(content, variant).toContain('RENAMED requirements present under the new name and absent under the old one');

      // Main spec paths are store-root aware
      expect(content, variant).toContain('<planningHome.root>/openspec/specs/<capability>/spec.md');
    }
  });

  it('carries mixed included and excluded bulk-archive deltas through both generated variants', () => {
    const variants: Array<[string, string]> = [
      [
        'bulk skill',
        generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE'),
      ],
      ['bulk otrix command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain(
        'An inclusion or exclusion decision for every delta spec'
      );
      expect(content, variant).toContain(
        'A single change can have both included and excluded delta specs'
      );
      expect(content, variant).toContain(
        'passing only the included delta paths and explicitly instructing it to ignore'
      );
      expect(content, variant).not.toContain(
        'for each change, passing the delta spec analysis'
      );
      expect(content, variant).toContain(
        'Re-run the comparison only for delta specs in `includedDeltas`'
      );
      expect(content, variant).toContain(
        'Do not verify delta specs in `excludedDeltas`'
      );
      expect(content, variant).toContain('report `sync skipped`');
      expect(content, variant).toContain(
        '`sync skipped` without treating the archive itself as skipped'
      );

      // These three carried no assertion, so deleting any of them from a
      // single variant was caught only by the golden hash — and this repo
      // regenerates hashes as a matter of routine, which makes that no
      // protection at all.
      expect(content, variant).toContain(
        '`includedDeltas`: all non-conflicting delta specs from confirmed changes plus conflict deltas selected for sync'
      );
      expect(content, variant).toContain(
        '`excludedDeltas`: conflict deltas from confirmed changes excluded because their implementation is missing'
      );
      expect(content, variant).toContain(
        'Carry the per-delta `includedDeltas` and `excludedDeltas` decisions into execution'
      );
      // The worked example must show the skip, or the agent has no model of
      // what a partially-synced batch report looks like.
      expect(content, variant).toContain(
        '1 delta spec sync skipped (add-jwt/auth: implementation not found)'
      );
    }
  });

  it('lets the sync workflow honor the delta subset bulk archive hands it', () => {
    // Bulk archive tells sync to ignore excludedDeltas, but sync treats
    // existingOutputPaths as its own source of truth. Without an explicit
    // carve-out the callee re-syncs the delta the caller withheld, step 8b
    // never checks it (it verifies only includedDeltas), and the run still
    // reports `sync skipped` for a spec that was in fact written.
    const variants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain(
        'A caller narrows it by naming an explicit list of delta spec paths to sync'
      );
      expect(content, variant).toContain(
        'sync only the named paths and leave the remaining delta specs untouched'
      );
      expect(content, variant).toContain(
        'never widen it back to the full\n   list'
      );
      expect(content, variant).toContain(
        'Honor a caller-supplied subset of `existingOutputPaths`'
      );

      // Step 4 is the operative loop. Narrowing step 3 alone left the loop
      // still iterating "each path returned by the CLI", which re-widens the
      // set and re-syncs the delta the caller withheld — the original bug,
      // one step further down the template.
      expect(content, variant).toContain(
        'For each capability delta spec path selected in step 3'
      );
      expect(content, variant).not.toContain(
        'For each capability delta spec path returned by the CLI'
      );

      // The undefined edges: a named path outside existingOutputPaths, and an
      // empty named list. Both must stop rather than proceed on a guess.
      expect(content, variant).toContain(
        'If a named path is not in `existingOutputPaths`, do not sync it'
      );
      expect(content, variant).toContain(
        'If the named list is\n   empty, report that there is nothing to sync and stop'
      );
    }
  });

  it('requires apply context while keeping guidance advisory and state separate', () => {
    const variants: Array<[string, string]> = [
      ['apply skill', getApplyChangeSkillTemplate().instructions],
      ['apply command', getOpsxApplyCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Optional `context`');
      expect(content, variant).toContain('Optional `operationGuidance`');
      expect(content, variant).toContain('Treat `context` as a required prompt-level input');
      expect(content, variant).toContain('apply relevant project facts, conventions, and constraints');
      expect(content, variant).toContain(
        'Treat `operationGuidance` as optional additive advice'
      );
      expect(content, variant).toContain('Read and consider every');
      expect(content, variant).toContain('applicable and compatible with the built-in');
      expect(content, variant).toContain(
        'separate from CLI-returned state, missing artifacts, tasks'
      );
      expect(content, variant).toContain(
        'Do not use context or operation guidance as proof that a task is complete'
      );
      expect(content, variant).toContain('conflict and preserve the controlling value');
      expect(content, variant).toContain('do not follow it and explain why');
      expect(content, variant).toContain(
        'Do not copy runtime context or operation guidance into implementation files or planning artifacts'
      );
      expect(content, variant).toContain(
        'Preserve CLI-controlled blocked/ready/all-done behavior'
      );
      expect(content, variant).toContain(
        'These are prompt-level behavior contracts, not enforceable checks'
      );
    }
  });

  it('makes the archive-inputs lookup fail open and sync instruction consumption fail closed', () => {
    const archiveVariants: Array<[string, string]> = [
      ['archive skill', getArchiveChangeSkillTemplate().instructions],
      ['archive command', getOpsxArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of archiveVariants) {
      expect(content, variant).toContain(
        'spectrix instructions archive --change "<name>" --json'
      );
      expect(content, variant).toContain('same selected-root flags');
      // The archive-inputs lookup is a new CLI command, so a skill installed
      // ahead of the CLI (skills.sh) must degrade instead of blocking archiving.
      expect(content, variant).toContain('advisory and\n   optional');
      expect(content, variant).toContain('must never block archiving');
      expect(content, variant).toContain('older CLI that\n   does not support this command yet');
      expect(content, variant).toContain(
        'continue the archive workflow with no\n   context and no operation guidance'
      );
      expect(content, variant).toContain('Do not report an error and do not stop');
      expect(content, variant).not.toContain(
        'stop before inspecting or\n   writing specs or moving the change'
      );
      expect(content, variant).toContain('successful response may omit both optional fields');
      expect(content, variant).toContain(
        'Treat `context` as a\n   required prompt-level input'
      );
      expect(content, variant).toContain(
        'Treat `operationGuidance` as optional\n   additive advice'
      );
      expect(content, variant).toContain('read and consider every entry');
      expect(content, variant).toContain('report the conflict and preserve the controlling value');
      expect(content, variant).toContain('do not follow it\n   and explain why');
      expect(content, variant).toContain(
        '`artifactPaths.specs.existingOutputPaths` from status JSON as the only'
      );
      expect(content, variant).toContain('`specs` entry is missing');
      expect(content, variant).toContain('do not infer\n   delta specs from other artifacts');
      expect(content, variant).toContain(
        'spectrix instructions specs --change "<name>" --json'
      );
      expect(content, variant).toContain('stop\n   before writing any main spec or moving the change');
      expect(content, variant).toContain('valid response with omitted\n   `rules`');
      expect(content, variant).toContain('inline sync must reuse that snapshot');
      expect(content, variant).toContain('do not use them as archive guidance');
      expect(content, variant).toContain(
        'Existing CLI checks, resolved paths, prompts, and command contracts are unchanged'
      );
      expect(content, variant).toContain(
        'Never copy runtime context, operation guidance, or artifact-rule text verbatim'
      );
      expect(content, variant).toContain(
        'Artifact rules constrain only the specs being written and are never operation guidance'
      );
    }

    const syncVariants: Array<[string, string]> = [
      ['sync skill', getSyncSpecsSkillTemplate().instructions],
      ['sync command', getOpsxSyncCommandTemplate().content],
    ];

    for (const [variant, content] of syncVariants) {
      expect(content, variant).toContain(
        '`artifactPaths.specs.existingOutputPaths` from the status JSON as the'
      );
      expect(content, variant).toContain('`specs` entry is missing');
      expect(content, variant).toContain('do not infer them from other artifacts');
      expect(content, variant).toContain('reuse it and do not\n     fetch the same instructions again');
      expect(content, variant).toContain('Otherwise run that command once now');
      expect(content, variant).toContain('stop before writing any main spec');
      expect(content, variant).toContain('Do not treat the\n     failure as an absent rule set');
      expect(content, variant).toContain('valid response with omitted `rules`');
      expect(content, variant).toContain('Artifact rules are not operation guidance');
      expect(content, variant).toContain('without copying it verbatim');
    }
  });

  it('keeps bulk archive instruction lookups atomic across mixed-schema batches', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', getBulkArchiveChangeSkillTemplate().instructions],
      ['bulk command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('archive inputs once for the selected root');
      expect(content, variant).toContain(
        'spectrix instructions archive --change "<selected-change>" --json'
      );
      // Same rule as the single-change skill: a missing archive-inputs command
      // must not take down a whole batch.
      expect(content, variant).toContain('advisory and optional');
      expect(content, variant).toContain('must never block the batch');
      expect(content, variant).toContain(
        'continue the batch with no context and no operation guidance'
      );
      expect(content, variant).not.toContain(
        'stop the whole batch before inspecting specs, writing main specs'
      );
      expect(content, variant).toContain(
        'Treat this list as the only delta-spec source'
      );
      expect(content, variant).toContain('missing or the list is empty');
      expect(content, variant).toContain('mixed-schema\n        batches');
      expect(content, variant).toContain('fetch every\n   required specs-rule snapshot');
      expect(content, variant).toContain(
        'Obtain all snapshots before the first write or move'
      );
      expect(content, variant).toContain(
        'stop the whole batch before\n   any main-spec write or change move'
      );
      expect(content, variant).toContain(
        'sync must reuse it without fetching instructions again'
      );
      expect(content, variant).toContain(
        'Treat\n   `context` as a required prompt-level input across the batch'
      );
      expect(content, variant).toContain(
        'Treat\n   `operationGuidance` as optional additive advice'
      );
      expect(content, variant).toContain('read and consider every');
      expect(content, variant).toContain('report the conflict and preserve the controlling');
      expect(content, variant).toContain('do not\n   follow it and explain why');
      expect(content, variant).toContain(
        'Keep runtime inputs, conflict analysis, CLI-derived values, and artifact rules separate'
      );
      expect(content, variant).toContain(
        'Artifact rules constrain only written specs'
      );
      expect(content, variant).toContain(
        'Never copy runtime input or artifact-rule text verbatim into output files'
      );
    }
  });

  // The archive instructions must mirror `spectrix archive`'s date-prefix
  // rule (#1316): a change already named with a `YYYY-MM-DD-` prefix keeps
  // its name, so archived names never stack dates. Guard the caveat, the
  // literal `mv` target, and the success-summary examples an agent would
  // copy verbatim (#1317).
  it('never instructs stacking a date prefix on an already-dated change (#1317)', () => {
    const archiveInstructions: Array<[string, string]> = [
      ['openspec-archive-change', getArchiveChangeSkillTemplate().instructions],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate().instructions],
      ['openspec-onboard', getOnboardSkillTemplate().instructions],
      ['otrix-archive', getOpsxArchiveCommandTemplate().content],
      ['otrix-bulk-archive', getOpsxBulkArchiveCommandTemplate().content],
      ['otrix-onboard', getOpsxOnboardCommandTemplate().content],
    ];

    for (const [id, text] of archiveInstructions) {
      expect(text, id).toContain('already starts with a `YYYY-MM-DD-` prefix');

      // Every archive path an agent reproduces must name the derived target,
      // never a hardcoded date.
      expect(text, id).toContain('<target-name>');

      // Discriminator: a `YYYY-MM-DD-` after a path separator belongs to a
      // literal archive path the agent copies verbatim. The rule statements
      // only name the prefix, never place it in a path, so they stay legal.
      expect(text, id).not.toMatch(/\/YYYY-MM-DD-/);
    }
  });

  // Guidance that tells an agent to run `spectrix archive` has to pass
  // --yes: the agent cannot answer the confirmation prompts from a tool
  // call, so the bare command aborts (#1479). A golden hash proves the
  // generated file matches its source, never that the source is right, so
  // pin the flag itself.
  it('passes --yes wherever it tells an agent to run spectrix archive (#1479)', () => {
    // Sweep the whole corpus, not just the one template that has such an
    // invocation today: the point is to catch the next one.
    const corpus: Array<[string, string]> = [
      ...getSkillTemplates().map(
        ({ dirName, template }) => [dirName, template.instructions] as [string, string]
      ),
      ...getCommandContents().map((entry) => [entry.id, entry.body] as [string, string]),
    ];

    // Only runnable invocations count: prose that merely names the command
    // ("same rule as `spectrix archive`") has nothing to confirm, and it is
    // always mid-sentence, so requiring the command to open the line
    // separates the two. Everything a runnable line may legitimately carry in
    // front of the command is allowed, because each of these hid an
    // invocation from an earlier, stricter version of this check: indentation,
    // a list marker, a shell prompt, and a global flag between `spectrix` and
    // `archive`. Tokenised rather than pattern-matched - the regex this
    // replaces needed nested quantifiers to accept the flags, which is a ReDoS
    // shape even in a test.
    function archiveInvocations(text: string): string[] {
      return text.split('\n').filter((line) => {
        const bare = line
          .trimStart()
          .replace(/^(?:[-*+]|\d+\.)[ \t]+/, '')
          .replace(/^\$[ \t]+/, '');
        const tokens = bare.split(/\s+/).filter(Boolean);
        if (tokens[0] !== 'spectrix') return false;
        const archiveAt = tokens.indexOf('archive');
        if (archiveAt < 1) return false;
        // Anything between `spectrix` and `archive` has to be a global flag or
        // one's value, or this is a different subcommand that merely mentions
        // the word (`spectrix list archive`).
        return tokens
          .slice(1, archiveAt)
          .every((token, i, before) => token.startsWith('-') || !!before[i - 1]?.startsWith('-'));
      });
    }

    let total = 0;
    for (const [id, text] of corpus) {
      const invocations = archiveInvocations(text);
      total += invocations.length;
      for (const invocation of invocations) {
        expect(invocation.trim(), id).toContain('--yes');
      }
    }

    // Guards the guard, and names the floor rather than trusting `> 0`: the
    // onboarding walkthrough is the one template that is supposed to contain
    // a runnable archive invocation, so a corpus that stops containing it
    // fails here instead of passing vacuously.
    expect(total).toBeGreaterThan(0);
    const onboard = corpus.filter(([id]) => id.includes('onboard'));
    expect(onboard.length).toBeGreaterThan(0);
    for (const [id, text] of onboard) {
      expect(archiveInvocations(text), id).not.toHaveLength(0);
    }
  });

  // Covers both archive paths, not just the bulk one the fix targeted: the
  // single-change routing has been correct since #1357 (current wording from
  // #1394) but was never pinned, so a stale branch could silently reopen the
  // bug #1381 actually reported.
  it('honors Cancel at every archive confirmation (#1381)', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['bulk otrix command', getOpsxBulkArchiveCommandTemplate().content],
      ['single skill', generateSkillContent(getArchiveChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['single otrix command', getOpsxArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      // Offering "Cancel" without routing it let an agent fall straight through
      // to the archive step and move the changes anyway.
      expect(content, variant).toContain('"Cancel" — stop, do not archive');

      // An unrecognized answer must re-prompt; archiving is never the default.
      expect(content, variant).toContain('Anything else — ask again rather than archiving');
    }
  });

  // The bulk confirmation labels are written by the agent and carry an `N`
  // placeholder, so routing must match intent — matching the literal labels
  // would send every legitimate answer down the "ask again" path forever.
  it('routes the bulk archive confirmation by intent, not by literal label (#1381)', () => {
    const variants: Array<[string, string]> = [
      ['bulk skill', generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['bulk otrix command', getOpsxBulkArchiveCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      expect(content, variant).toContain('Route on the answer by intent, not by exact label');

      // The ready-only route has to name where "ready" is decided, or the agent
      // cannot tell which subset to archive.
      expect(content, variant).toContain('the changes the step 6 table marks');

      // A cancelled batch must archive nothing, reinforced where agents skim.
      expect(content, variant).toContain(
        'Never archive after the user cancels the confirmation'
      );
    }
  });

  it('makes the schema instruction field authoritative for artifact creation (#777)', () => {
    const variants: Array<[string, string]> = [
      ['propose skill', generateSkillContent(getOpsxProposeSkillTemplate(), 'PARITY-BASELINE')],
      ['propose command', getOpsxProposeCommandTemplate().content],
      ['continue skill', generateSkillContent(getContinueChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['continue command', getOpsxContinueCommandTemplate().content],
      ['ff skill', generateSkillContent(getFfChangeSkillTemplate(), 'PARITY-BASELINE')],
      ['ff command', getOpsxFfCommandTemplate().content],
    ];

    for (const [variant, content] of variants) {
      // The instruction field wins even for familiar artifact names: the old
      // hard-coded "Common artifact patterns" shortcut is what let agents
      // ignore custom schemas that reuse proposal.md/tasks.md file names.
      expect(content, variant).toContain('the authoritative guidance');
      expect(content, variant).not.toContain('Common artifact patterns');

      // Delegated creation is honored at the creation step itself, and the
      // delegated skill's output is verified rather than assumed.
      expect(content, variant).toContain(
        'If the `instruction` field delegates creation to a specific skill or command, invoke it to produce the artifact instead of writing the file yourself, then verify the artifact file exists at `resolvedOutputPath`'
      );

      // ...and restated in the artifact-creation guidelines.
      expect(content, variant).toContain(
        'If the `instruction` field directs you to use a specific skill or command to create the artifact, invoke it instead of writing the artifact directly'
      );
    }
  });
});
