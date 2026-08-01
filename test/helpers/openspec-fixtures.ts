import * as fs from 'node:fs';
import * as path from 'node:path';

/** Minimal healthy Spectrix root layout shared by slice test suites. */
export function createOpenSpecRoot(rootDir: string): void {
  fs.mkdirSync(path.join(rootDir, 'spectrix', 'specs'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'spectrix', 'changes', 'archive'), { recursive: true });
  fs.writeFileSync(path.join(rootDir, 'spectrix', 'config.yaml'), 'schema: spec-driven\n');
}

/** Writes a spec file under the root's spectrix/specs/<id>/spec.md. */
export function writeSpec(rootDir: string, specId: string, body: string): void {
  const specDir = path.join(rootDir, 'spectrix', 'specs', specId);
  fs.mkdirSync(specDir, { recursive: true });
  fs.writeFileSync(path.join(specDir, 'spec.md'), body);
}
