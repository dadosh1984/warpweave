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
  getTranslatorSkillTemplate,
  getPonytailMinimalOutputSkillTemplate,
  getSuperpowersTddSkillTemplate,
  getSyncSpecsSkillTemplate,
  getUpdateChangeSkillTemplate,
  getVerifyChangeSkillTemplate,
  getSecurityScanSkillTemplate,
  getOpsxSecurityScanCommandTemplate,
  getDriftDetectionSkillTemplate,
  getOpsxDriftDetectionCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';
import {
  generateSkillContent,
  getCommandContents,
  getSkillTemplates,
} from '../../../src/core/shared/skill-generation.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: 'b3a1ef1f595b84ba52d7188f990274b0048232d0f97cd50bbab133aba4f6bd39',
  getNewChangeSkillTemplate: '0f53db986a27557fcfb13d6cb2b5e9f34b00e5b1f6d8fa76c8ef828fa38be5fb',
  getContinueChangeSkillTemplate: '30811ea3a5cfae4b06031d005667024e46a55d8ac1d86e4e09a9bae8d2ce9453',
  getApplyChangeSkillTemplate: '356611a31bb902f6a883ec68703e125fdaa23124fd4d282d09cb610fd43628ed',
  getFfChangeSkillTemplate: 'aac770cbdfae3873446f3d2250da613d5902ee6e2820a1f68f22df3efce30fa5',
  getSyncSpecsSkillTemplate: '72d3f60f964c6521c2d2fad1957ea8f35507e854b188a755f0e2b71b3555da6f',
  getOnboardSkillTemplate: '9fbe0e5e706060e611e55607ce909f7b673da28bd1aa3da6443f0f168bba6b8d',
  getOpsxExploreCommandTemplate: '4d5a50e3d05a00b74b4ec17efe13a0907e3fc8ee20c22da71327b2cef6980052',
  getOpsxNewCommandTemplate: 'ef994bab196a1ed4ddeb26b02b6b8f5aff2ccd9cf6e050beb023218726409f24',
  getOpsxContinueCommandTemplate: '348ec9a3bb5c2b018c1962d0f0a2445b5937d6725175f6a5b4ce7c57a1b417df',
  getOpsxApplyCommandTemplate: 'e18ccb07d867c60fc3dcd63dffdac0fa8dca4f60d181ef80c33512f22f0da5a6',
  getOpsxFfCommandTemplate: 'f98c1a4bc9dcb808b69ef4a46919e555f23b4346ec2311b30ec90c64fc460eb4',
  getArchiveChangeSkillTemplate: '2b505516059fa7ce44ea811f4b658a8a07536f203b5a044ed9894699c7dc7601',
  getBulkArchiveChangeSkillTemplate: '38600adf09cf4994511785fcae39eca4fd7343d9fd940168447dbd3a3af65e2a',
  getOpsxSyncCommandTemplate: '4c4806fd35fa739a9483c6847a8817c5b40f54107c3dff7f2a31a91acad0783e',
  getVerifyChangeSkillTemplate: '9c11f40700800803ef0a53029aae32c5eb6b1ad3abd8e7818a5363f54b1cffe7',
  getOpsxArchiveCommandTemplate: '2b910d6d11f2895df8d6ee5e8d9a9ab75a2488fd7a8ff591d4344feb8ca91c0f',
  getOpsxOnboardCommandTemplate: 'b457741217470196a2159074715658b1070a3a01f7f3f0910032b83bfaf5cde5',
  getOpsxBulkArchiveCommandTemplate: '137a0eaa63493e6a72763f60f793842334df922ee7eaf58fd67cd19bb5074cee',
  getOpsxVerifyCommandTemplate: '570c49b75dd64324867f909ddff110df324fdc043d433c89f79c26f79210df63',
  getOpsxProposeSkillTemplate: '12e77889b38418a6adb1d70c125f640a65258d406a164e74db95231c49be2864',
  getOpsxProposeCommandTemplate: 'd39c752df7ea59fe072258885c4e92f1df324423920b5a2c910c58205b3a891e',
  getFeedbackSkillTemplate: '5a5409d71814e32ddf2f00c2364cb9bace1ef5dfb5aa85ac8ae2b71efcf5dd90',
  getUpdateChangeSkillTemplate: '63708d0de3542e7c855ca1a770095960a565f2b7c1822faac8e2304154ab074f',
  getOpsxUpdateCommandTemplate: 'dfa9bbcf907c55b70f3a96cf95c6db0fc6f0c6120ccf620f35252660822be41c',
  getLadderAuditSkillTemplate: '1b1a4e5a0064634febd79aff34a11492eba703f75be97550b72a0881e08957ff',
  getOpsxLadderAuditCommandTemplate: '5fc4425114db7fb88408200ea7432561906e95744287af38b159b47ee3012ad2',
  getGuardrailsSkillTemplate: '75ded80f080ff3da0772f7a2202937ff2eb8f9a736fe55490727a034a4c505d3',
  getOpsxGuardrailsCommandTemplate: 'a690ccae3fbd7b1373fa3e0f99caca0e07d8a6057612a48894ffbdd330a8303f',
  getDebtLedgerSkillTemplate: '034846fd6a2f6f7892550542253e1d6ce312fde82b5d327c2ebc1eed1d775750',
  getOpsxDebtLedgerCommandTemplate: '9221d29b9c912c675dc9f4d1d80e4ad9d89ed6eb57d5debeb89157b2c8784d73',
  getTokenBudgetSkillTemplate: 'c370785131e53586fd2bce826fc4276ca986f3626c1aa3ca00fb89a76d3d60a0',
  getOpsxTokenBudgetCommandTemplate: 'fd70e218bed46283dcc024b04eddcc49bd032fb0481b134a40bfa7a5457205ae',
  getBenchmarkSkillTemplate: 'ee7387dd8340626d483212c42136473309ddfec807c68291d5cbde6f86e3cb67',
  getOpsxBenchmarkCommandTemplate: '6de66f3b3f470305db3be4b6c1cb7c8451250f38325f075833ebc16a8b001361',
  getDependencyCheckSkillTemplate: '428f19fc41c69caf0c08cfd5d40152cbc13fafc900494673b5ff08c2d79c507b',
  getOpsxDependencyCheckCommandTemplate: 'd40b7358a9607a19961ab95513566c0590323e1f21e2a9774c03c4552f067f5a',
  getParallelExecuteSkillTemplate: '1ea322e49ee7706235b5e95ceb335b9823d4bd39361cb9ead603236c18669945',
  getOpsxParallelExecuteCommandTemplate: '8332001eaa390b32f2b1266863194999c134257de8e7779be6c1e4f8579a4d0e',
  getLearnSkillTemplate: '77cbf3e8efd112d8f01aa43d53c0c9897eef0126302e90fbb6388161f38062d8',
  getOpsxLearnCommandTemplate: 'e9001eae85b9f541abc0d57969fbc0089b687eb2d554a3d9ba46e78af789e6e4',
  getInitUnifiedSkillTemplate: 'ad77be64880cd6da181d0b1ec9dcf3a126e0e320b2290a4857f5f04c01e3a6b8',
  getOpsxInitUnifiedCommandTemplate: 'b267fa884f1f4d594d110caf2e784a4c0d12e525a095b88e8c6fa8a28fc4fc21',
  getTranslatorSkillTemplate: 'b5cd1c6c921758ddfb89a09f536613d49eeab03622ae5c5152f0396c24b0345e',
  getPonytailMinimalOutputSkillTemplate: '2654f74f6ad5be6a3269c646460a9282301868d9500bbe7faf4bd09a704f0080',
  getSuperpowersTddSkillTemplate: '83ef6743035402052749c52a6a9ad089ffd5fd221e261f6ff6bd37f1942f2293',
  getSecurityScanSkillTemplate: 'c28737bc0bd0461a9b8e0176b2807947fcc221284eb1e0c9949a6ce73b21de60',
  getOpsxSecurityScanCommandTemplate: 'd110c39aab1ee8662735443d74d6007b05dc7ddfa32ad78b75682aa623c70009',
  getDriftDetectionSkillTemplate: '139d0005556c1dbac413d1b4f3d26fcb0e85b13c233d07c7ae79face9a750fbb',
  getOpsxDriftDetectionCommandTemplate: '27ac1c9c1e5a6db292f3b13d6dc8ef2eb5f252884aeb30af00c9932bcb4b7599',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'warpweave-explore': '12cf373fd4ecf50ddb239b2693e4d2713747f8368709a437faf064ace8fcf098',
  'warpweave-new-change': '72633ff954982862574971a99ce155245346ccd01d4a5f8678d9bd7174dad015',
  'warpweave-continue-change': '2fe5f69a7266e88ca4751602d14a6c3064b2098aaecf4f34267054bbd4788617',
  'warpweave-apply-change': 'f052265cbe56eb3b1625c501562a07860561020a28a268c7901ff4fa28efe452',
  'warpweave-ff-change': 'c5575c5c50f615578bf4fabb22582d92d6d64ca6355168f95daafb9bc5a3ea78',
  'warpweave-sync-specs': '0e683cde43e2a2183614345a96b80d9a540beff51f55feadeaaf64bf2a0575c2',
  'warpweave-archive-change': 'bdcb9240554422198cc1153711c4cd1ff625c5d9b5356ccbbc613a7e0a26ba9b',
  'warpweave-bulk-archive-change': '175c6e91104991f358920a717f77f572781e8c8ae0d6ef820c79a8484664bd5b',
  'warpweave-verify-change': 'd3a73670a326b1ae24a7627b222bcb9207a084af51b6b8811d540e6c64692fbd',
  'warpweave-onboard': '068d466d8162e1fdfd8288e84f3a56f7d7cc25a0ddf81cc84a234d4ecedb58d0',
  'warpweave-propose': '5437ccae5b9ab566f0041f1d654a49de9f4639d76ee291a0147f808e16a3e021',
  'warpweave-update-change': 'deb45dea49abd22d3524a05c666b6828e954504681eb049eefcba1c9bfedbeec',
  'warpweave-ladder-audit': 'd51830228981414dbb3454fe1bbd6ed67a86909db13d4de4a4d1d618269197ca',
  'warpweave-guardrails': 'a203cf3e71dee602663dcdad970e818a17e69ff923adb25d1bcad54a4410c9df',
  'warpweave-debt-ledger': '23b66b7c86250114235dcda5246da935f7c173e82a0b01d1b20eb190868f3ae0',
  'warpweave-token-budget': '20ddd8a8c80653b1afa82f008f9b219d01d5a5c819f994c7b91e40012606a459',
  'warpweave-benchmark': '36374d65ea32da227dcc3735d75e0f3600894ceb92f4042f382d8885bfd0d6c7',
  'warpweave-dependency-check': '6b85048a12359fe0d43ad5e2ebcd722177d93f91774c2502f02e666698cd2527',
  'warpweave-parallel-execute': '046aca8af8104712a7f87ca6c3a7c36395bf751b57eea4c281f664572934dcac',
  'warpweave-learn': '6c8e88107bf4bca19e5daac19d5a3bc1abc9e60ce7a9f63e1932d59bd7b03463',
  'warpweave-init-unified': 'c98f1fd89fcbac88f6fadfbdaef3ab5e0877cbe0113973c1d43ebdc57a4d49c1',
  'warpweave-translator': '05da878bb56300829ed356218eecd9d84e2639b548b917d0c06a3d5995a0a29f',
  'warpweave-ponytail-minimal-output': '0f96e500e3a63faa709b26383da61a24038fc2d03aec4da58fa22adce1c2e032',
  'warpweave-superpowers-tdd': 'c5ce3134257014a6892ca78fa8099751a5c446ab407cbbb10b71ff7aaa01f971',
  'warpweave-security-scan': '576fbb60100e5b436972ff712bae85772f895ddcad9a5a9b0072761a6140e16e',
  'warpweave-drift-detection': '4ccf560daf1653bd1ae4f15a35b46a364c5525adf2cea0462a37ea331ce47314',
};

// Intentionally excludes getFeedbackSkillTemplate: this list only models templates
// deployed via generateSkillContent, while feedback is covered in function payload parity.
const GENERATED_SKILL_FACTORIES: Array<[string, () => SkillTemplate]> = [
  ['warpweave-explore', getExploreSkillTemplate],
  ['warpweave-new-change', getNewChangeSkillTemplate],
  ['warpweave-continue-change', getContinueChangeSkillTemplate],
  ['warpweave-apply-change', getApplyChangeSkillTemplate],
  ['warpweave-ff-change', getFfChangeSkillTemplate],
  ['warpweave-sync-specs', getSyncSpecsSkillTemplate],
  ['warpweave-archive-change', getArchiveChangeSkillTemplate],
  ['warpweave-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
  ['warpweave-verify-change', getVerifyChangeSkillTemplate],
  ['warpweave-onboard', getOnboardSkillTemplate],
  ['warpweave-propose', getOpsxProposeSkillTemplate],
  ['warpweave-update-change', getUpdateChangeSkillTemplate],
  ['warpweave-ladder-audit', getLadderAuditSkillTemplate],
  ['warpweave-guardrails', getGuardrailsSkillTemplate],
  ['warpweave-debt-ledger', getDebtLedgerSkillTemplate],
  ['warpweave-token-budget', getTokenBudgetSkillTemplate],
  ['warpweave-benchmark', getBenchmarkSkillTemplate],
  ['warpweave-dependency-check', getDependencyCheckSkillTemplate],
  ['warpweave-parallel-execute', getParallelExecuteSkillTemplate],
  ['warpweave-learn', getLearnSkillTemplate],
  ['warpweave-init-unified', getInitUnifiedSkillTemplate],
  ['warpweave-translator', getTranslatorSkillTemplate],
  ['warpweave-ponytail-minimal-output', getPonytailMinimalOutputSkillTemplate],
  ['warpweave-superpowers-tdd', getSuperpowersTddSkillTemplate],
  ['warpweave-security-scan', getSecurityScanSkillTemplate],
  ['warpweave-drift-detection', getDriftDetectionSkillTemplate],
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
      getTranslatorSkillTemplate,
      getPonytailMinimalOutputSkillTemplate,
      getSuperpowersTddSkillTemplate,
      getSecurityScanSkillTemplate,
      getOpsxSecurityScanCommandTemplate,
      getDriftDetectionSkillTemplate,
      getOpsxDriftDetectionCommandTemplate,
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
  // `allowed-tools: Bash(warpweave:*)` so agents that honor it stop prompting
  // on each `warpweave` call. Iterating the registry covers new skills too.
  it('pre-approves the warpweave CLI via allowed-tools in every deployed skill', () => {
    for (const { template, dirName } of getSkillTemplates()) {
      const content = generateSkillContent(template, 'PARITY-BASELINE');
      expect(content, dirName).toContain('allowed-tools: Bash(warpweave:*)');
    }
  });

  it('teaches store selection in every deployed ww command template', () => {
    for (const entry of getCommandContents()) {
      expect(entry.body, entry.id).toContain(STORE_SELECTION_GUIDANCE);
    }

    // Feedback has no store-capable command and intentionally carries no
    // store teaching; it ships outside both registries.
    expect(getFeedbackSkillTemplate().instructions).not.toContain('**Store selection:**');
  });

  it('generates no workspace-planning residue in any workflow template (4.1)', () => {
    const allSkills: Array<[string, () => SkillTemplate]> = [
      ['warpweave-apply-change', getApplyChangeSkillTemplate],
      ['warpweave-sync-specs', getSyncSpecsSkillTemplate],
      ['warpweave-archive-change', getArchiveChangeSkillTemplate],
      ['warpweave-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['warpweave-verify-change', getVerifyChangeSkillTemplate],
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

    // The single archive skill references warpweave-sync-specs; ww command references /ww:sync.
    expect(generatedSkill, 'skill').toContain('run the `warpweave-sync-specs` workflow inline');
    expect(commandContent, 'ww command').toContain('run the `/ww:sync` workflow inline');

    const variants: Array<[string, string]> = [
      ['skill', generatedSkill],
      ['ww command', commandContent],
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
      expect(content, variant).toContain('<planningHome.root>/warpweave/specs/<capability>/spec.md');
    }
  });

  it('gates bulk archive on inline synchronous spec sync and verification before moving change root', () => {
    const generatedSkill = generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE');
    const commandContent = getOpsxBulkArchiveCommandTemplate().content;

    // The bulk archive skill references warpweave-sync-specs; ww command references /ww:sync.
    expect(generatedSkill, 'bulk skill').toContain('run the `warpweave-sync-specs` workflow inline');
    expect(commandContent, 'bulk ww command').toContain('run the `/ww:sync` workflow inline');

    const variants: Array<[string, string]> = [
      ['bulk skill', generatedSkill],
      ['bulk ww command', commandContent],
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
      expect(content, variant).toContain('<planningHome.root>/warpweave/specs/<capability>/spec.md');
    }
  });

  it('carries mixed included and excluded bulk-archive deltas through both generated variants', () => {
    const variants: Array<[string, string]> = [
      [
        'bulk skill',
        generateSkillContent(getBulkArchiveChangeSkillTemplate(), 'PARITY-BASELINE'),
      ],
      ['bulk ww command', getOpsxBulkArchiveCommandTemplate().content],
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
        'warpweave instructions archive --change "<name>" --json'
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
        'warpweave instructions specs --change "<name>" --json'
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
        'warpweave instructions archive --change "<selected-change>" --json'
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

  // The archive instructions must mirror `warpweave archive`'s date-prefix
  // rule (#1316): a change already named with a `YYYY-MM-DD-` prefix keeps
  // its name, so archived names never stack dates. Guard the caveat, the
  // literal `mv` target, and the success-summary examples an agent would
  // copy verbatim (#1317).
  it('never instructs stacking a date prefix on an already-dated change (#1317)', () => {
    const archiveInstructions: Array<[string, string]> = [
      ['warpweave-archive-change', getArchiveChangeSkillTemplate().instructions],
      ['warpweave-bulk-archive-change', getBulkArchiveChangeSkillTemplate().instructions],
      ['warpweave-onboard', getOnboardSkillTemplate().instructions],
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

  // Guidance that tells an agent to run `warpweave archive` has to pass
  // --yes: the agent cannot answer the confirmation prompts from a tool
  // call, so the bare command aborts (#1479). A golden hash proves the
  // generated file matches its source, never that the source is right, so
  // pin the flag itself.
  it('passes --yes wherever it tells an agent to run warpweave archive (#1479)', () => {
    // Sweep the whole corpus, not just the one template that has such an
    // invocation today: the point is to catch the next one.
    const corpus: Array<[string, string]> = [
      ...getSkillTemplates().map(
        ({ dirName, template }) => [dirName, template.instructions] as [string, string]
      ),
      ...getCommandContents().map((entry) => [entry.id, entry.body] as [string, string]),
    ];

    // Only runnable invocations count: prose that merely names the command
    // ("same rule as `warpweave archive`") has nothing to confirm, and it is
    // always mid-sentence, so requiring the command to open the line
    // separates the two. Everything a runnable line may legitimately carry in
    // front of the command is allowed, because each of these hid an
    // invocation from an earlier, stricter version of this check: indentation,
    // a list marker, a shell prompt, and a global flag between `warpweave` and
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
        if (tokens[0] !== 'warpweave') return false;
        const archiveAt = tokens.indexOf('archive');
        if (archiveAt < 1) return false;
        // Anything between `warpweave` and `archive` has to be a global flag or
        // one's value, or this is a different subcommand that merely mentions
        // the word (`warpweave list archive`).
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
      ['bulk ww command', getOpsxBulkArchiveCommandTemplate().content],
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
      ['bulk ww command', getOpsxBulkArchiveCommandTemplate().content],
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
