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
  getReleaseCompareSkillTemplate,
  getOpsxReleaseCompareCommandTemplate,
} from '../../../src/core/templates/skill-templates.js';
import {
  generateSkillContent,
  getCommandContents,
  getSkillTemplates,
} from '../../../src/core/shared/skill-generation.js';
import { STORE_SELECTION_GUIDANCE } from '../../../src/core/templates/workflows/store-selection.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: '393bee6ddd9f0b959b9f89cb002896be9baefdd5f57920899718a54aba2e88e2',
  getNewChangeSkillTemplate: 'a1d2a56c61df256d4fc9f27d1ce0ad19936653836471d2585a2e71cfde00dc8d',
  getContinueChangeSkillTemplate: '690d716482d754d50946df603b78722e988b9c638e86e786aa30621ad6151e73',
  getApplyChangeSkillTemplate: '639450e57f3540ca04b276e55be539b7fd71c1ef5a70cada0dd8cb5db7b3c5c0',
  getFfChangeSkillTemplate: '67cd0ed10148a6937aa74f30d3ae22ee4b4e78abac7adda0c5fb634ef57e2c48',
  getSyncSpecsSkillTemplate: 'b500dc535c3bea89e0ec081de3cebbf0a4d5d86c09195ec7f823290d993e8851',
  getOnboardSkillTemplate: '15585222b40217ef4f12ea6b791fb43d1044bee2cebd842d73c22681c433b8f2',
  getOpsxExploreCommandTemplate: '434dc27a5a783be2c86ca2e9ca8e0e5013d26648fcd75b3085b42294c0b64094',
  getOpsxNewCommandTemplate: '2ae3d728a13141c0db466584023556d5fd00422777d05ae2608689993da4ba5a',
  getOpsxContinueCommandTemplate: '71eb88a4ec4e458438a467ddcef5fb31a4d71c861608bef15f6fb750400696a7',
  getOpsxApplyCommandTemplate: 'a93cdb4743c7ead435a13be8437e23fbb952c7adaf4c14086f2c67c910d7c694',
  getOpsxFfCommandTemplate: 'b7bc62b421f8fc3757ee359bdea7f4aa57ee343aeae107167b339679e05e89d2',
  getArchiveChangeSkillTemplate: 'a66ea6e59e38d9c5768ad487b4fbc8640d0f6a3c9c3911cfe753b38a2ffa5172',
  getBulkArchiveChangeSkillTemplate: 'a519376d30216a2f5eebca782b8d34ba412fd6a2e7dc61ac5a136d743973539c',
  getOpsxSyncCommandTemplate: '1670ca0b00a2e944644feb73a7c9267cf38e66c494d9c0a67d10f1e5b58677bc',
  getVerifyChangeSkillTemplate: 'db1b4a6368b55115ac1a6d853cc64023def0455fbc8c08702820db66e8ff52d2',
  getOpsxArchiveCommandTemplate: '4b5b984d5585b7f7603c0f3977466f1ee4b5b826ae436dec5838d239a6e6515d',
  getOpsxOnboardCommandTemplate: '22c1348db8c67cb5e4d52a7b9df418e96f5e4b0e2acf074cf1a3286cd2e91421',
  getOpsxBulkArchiveCommandTemplate: 'b9b23f3e9f64e846e27f7778f6c74a6525357c1a3e10697309785f37397cc5d5',
  getOpsxVerifyCommandTemplate: 'f8e239176db13a5e3bb0342c98a08a3971f637b97d58de242073037fca194fc6',
  getOpsxProposeSkillTemplate: '2a0c611c7d264df19ab7c9b1d7e0bb4e1b4fc8920d6959440f59967926af5db2',
  getOpsxProposeCommandTemplate: '15b82d3802bc7447cd2048edaaa4922343d8bb89c7f4be08b22bf0a6526e0a48',
  getFeedbackSkillTemplate: '5a5409d71814e32ddf2f00c2364cb9bace1ef5dfb5aa85ac8ae2b71efcf5dd90',
  getUpdateChangeSkillTemplate: '6a5c2470b6220cf1497f08db7705500ed9eb7edfea4c1c4b1d8782c2f1508697',
  getOpsxUpdateCommandTemplate: '8fde649c1e9d5764e87f1e280c319f5c89158ae3b86995a0f83d5f2acc128a71',
  getLadderAuditSkillTemplate: '8124341684785f9f0d3dcf87572ba0d3fb0608ea31ccc43cbf31c91bc9dffc4c',
  getOpsxLadderAuditCommandTemplate: 'bcbef54bd64a2832f6eecefe81ceaf09351f1ecb86ee42d496f016f0508a005d',
  getGuardrailsSkillTemplate: '7a19bbba7fe04525e8cb21334dce7cbc1b157aee30b580beb8978488fa9bdc00',
  getOpsxGuardrailsCommandTemplate: '8314b42a465cd7eeb5fe97da56ad4a4119d372ccd8a208018cdd8aac2d28b566',
  getDebtLedgerSkillTemplate: '8c5e0f5fd78c117442e2e885ca9496fb573a2868be3418e9ad007100c30fd93c',
  getOpsxDebtLedgerCommandTemplate: '4690cea9e945055a67d114db2fd6cbf571d56d0400d06f68dd4925e6d30ad31c',
  getTokenBudgetSkillTemplate: 'ff4dc13db1d884ac4879a9121e01f7eaca407fa365bdaa4cd92e05db69738d0f',
  getOpsxTokenBudgetCommandTemplate: 'a14bdf24af5b541a5e2b533ec7b2e35aec22c106432c6503b41c89db4ec15784',
  getBenchmarkSkillTemplate: '20a4b83f0cb2d59ee5fc78c40440c72aab46c96f3951cef7cb88229fc8558792',
  getOpsxBenchmarkCommandTemplate: '7e9234f31c9fbf5ed345387e5df5fbe87e79803d2847ae9921821550ad256d35',
  getDependencyCheckSkillTemplate: 'd607befb2cd20eebfc2076a1ef994221ff164cb2e351ea8f4aebda17c2169330',
  getOpsxDependencyCheckCommandTemplate: 'ec6b0dc89fa9f7d9cfd24ed05cd1230f970d816bbbbf1cc2559e2ee919ec2f2c',
  getParallelExecuteSkillTemplate: 'f48e84632d8faecab03837f43141496339a8e0d0284bfe7ef6d84ed68e09855c',
  getOpsxParallelExecuteCommandTemplate: '673d9bd87a5d04e83e188fd5c7c9c5193507d17794074b41e3bee8b37564dcfd',
  getLearnSkillTemplate: '0fb22082b3fb847b2ff2d01d17fcd2d7d343c8e42e66badf4669f318556077a5',
  getOpsxLearnCommandTemplate: '66aecd574f0e35521df4805f3859da37b3d44e53c6196208f23af45a950d2765',
  getInitUnifiedSkillTemplate: '774c0355d9d06bdb6ab176a363bba8da211166f16c56425f227468885adb2cf1',
  getOpsxInitUnifiedCommandTemplate: '60f8e24872180aba62c8051ebf8edd9da94ba1da2dcbf28af89ad37ea1e19676',
  getTranslatorSkillTemplate: 'f2ae18181fd9fa659f96bd83b15b8bdb989b72090d6982e26cd92afee5d194a1',
  getPonytailMinimalOutputSkillTemplate: 'd512f976f2797b0c9f707888e5bb5114109ec1b36d851e5f6b73cba6d4877f93',
  getSuperpowersTddSkillTemplate: 'aa49de37eb95da4c06ee094fd1aff90d8c832852031eb1600dd38836f9757385',
  getSecurityScanSkillTemplate: '1a89fa9f5513e9fc447ba743fdeb7035dc5a61aa6ad44aa77ebe39a75bab76b3',
  getOpsxSecurityScanCommandTemplate: 'e3930358ca7d43dd02ff4f2356c74c868d7c1005262d7545223f7f4c4fcfc5bc',
  getDriftDetectionSkillTemplate: '8ada033da496703b4dbf389f2687e3f5e953acd9bb049d33b6558fbd8d69c939',
  getOpsxDriftDetectionCommandTemplate: '73bb2c75df6ed174ff3b3c2b549d7f7d261230f24a6ee75430ce373e2141d70b',
  getReleaseCompareSkillTemplate: 'be99671e61b05ea9463e2acf75bdb6fbc681c2e5141d4ee0a736ad6bf367650b',
  getOpsxReleaseCompareCommandTemplate: 'baeae7ff1211c648e73d35467aa5bd24e6d86d6e76df8f300887554b1fb31616',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'warpweave-explore': 'd262938feda1c91bf44e5fbcdda596b8627c7a1e7d429809afb249babc6da76f',
  'warpweave-new-change': 'c544501d2cebc22eaabfb7665e72d215fa07f04eaa20eecf87be5de98085ca75',
  'warpweave-continue-change': 'd3de54fc92b53d75c7956ee9dcb283c2f65ef4de046f28bb3dbaca11f16244a7',
  'warpweave-apply-change': 'a2564809b321cacf8c16ec8185b2b8736e71dffe13f78b8deb715875c7a989f4',
  'warpweave-ff-change': '7a2aa084777e6487d0cf0a972d1fd875b8f76a19f0870c3d866822cd04a6b663',
  'warpweave-sync-specs': 'a17819378435c34e0930269344c11ed002de9647a64f4c917ac312c9404608df',
  'warpweave-archive-change': '7e51379dd231403e8ae97b4775052db0d1a41eb0396969d3d33282790fb609f1',
  'warpweave-bulk-archive-change': '651dcac1460efea1e3f1b2b1147a6f4d9a0fe0ad75934a8c46d28006800e03e9',
  'warpweave-verify-change': '3e85f75ca5f1e4e7b20cf97438da3cc3ec8e22da37930267368fc7e4976ed33a',
  'warpweave-onboard': 'b2dd181d63a28ca44ee055fbd67a7f8bea1ce687929277fefdb85693b1c4ddd9',
  'warpweave-propose': 'e13fa1fe578b40ded03c92ce07d51b94359b24dbd3b384d4ba72164df6086180',
  'warpweave-update-change': 'fc8eba067557d415436ce617651e60391f50d788e7d86cdc38aa58b3f6fd2f8e',
  'warpweave-ladder-audit': '0d74d4135974cd5389b102d94873835c5b5e6c0523fe94589e40729032b1825a',
  'warpweave-guardrails': '5cd21eb167cddda6caed23c34edce6b9b2a15710013abd30701231f65731753b',
  'warpweave-debt-ledger': '45d192a6423676408ba4701dbf35615079c1b0f838e6306b47d06e86446edc83',
  'warpweave-token-budget': '5805997e3071b198b3637f70b707e3684b0ef6179ed4915015dd68fd3068229a',
  'warpweave-benchmark': 'c6471cdfc428dd9884cfdbe2a1e6ae29164d0d6fbcaa042345e50aea81ead61e',
  'warpweave-dependency-check': '16ded44cfbd8f7a68f5dad89275ac3d49de438ef673156bb4e9dee34d048391c',
  'warpweave-parallel-execute': 'ebdc7b290c0a5f29f3533a938bf75a8d7d0e6505c94d99da330399932a4f2af5',
  'warpweave-learn': '18682a542047bdd79ab542a2cbf8659d6124a49dbaa43d81220b3f5c1b5f895a',
  'warpweave-init-unified': '51940ca9031dfd43beb72e6f8cef15bbbf21294026c6e4046be057c23d394ea4',
  'warpweave-translator': 'f8de477735c4a97dd34022cfb19bcbcf6a0f32eb587bc51504b0fc91076f09e7',
  'warpweave-ponytail-minimal-output': '58abd130ef8c19075ed7c12ff62ce1e9e731bf532d4c84c552fe4db434ce7f6c',
  'warpweave-superpowers-tdd': 'b35afd13f1a37a57c518fe02a1dddfcdc4e5b8dfcb1f9136364c54f07ea47b71',
  'warpweave-security-scan': '718856aaf4376c0980e690db71dc16f0404f6646df047eca443f100182411963',
  'warpweave-drift-detection': '0b99a9b7d7ca2122a35dc284813bc479ee5a31afdeab52768003fd3980f80f10',
  'warpweave-release-compare': 'ac74c7acfd2c711656759dab13880aea7a7837b5094b3fa8868138a9dc592a2f',
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
  ['warpweave-release-compare', getReleaseCompareSkillTemplate],
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
      getReleaseCompareSkillTemplate,
      getOpsxReleaseCompareCommandTemplate,
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
