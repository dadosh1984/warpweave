import * as fs from 'node:fs';
import * as path from 'node:path';

/** Minimal healthy Warpweave root layout shared by slice test suites. */
export function createOpenSpecRoot(rootDir: string): void {
  fs.mkdirSync(path.join(rootDir, 'warpweave', 'specs'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'warpweave', 'changes', 'archive'), { recursive: true });
  fs.writeFileSync(path.join(rootDir, 'warpweave', 'config.yaml'), 'schema: spec-driven\n');
}

/** Writes a spec file under the root's warpweave/specs/<id>/spec.md. */
export function writeSpec(rootDir: string, specId: string, body: string): void {
  const specDir = path.join(rootDir, 'warpweave', 'specs', specId);
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(path.join(specDir, 'spec.md'), body);
}
