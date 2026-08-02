import * as fs from 'node:fs';
import * as path from 'node:path';

export interface DetectedDependency {
  name: string;
  version: string;
}

export function detectDependencies(projectRoot: string): DetectedDependency[] {
  const pkgPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) return [];

  try {
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    const deps: DetectedDependency[] = [];

    const allDeps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    for (const [name, version] of Object.entries(allDeps)) {
      deps.push({ name, version: String(version) });
    }

    return deps;
  } catch {
    return [];
  }
}
