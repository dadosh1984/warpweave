# Warpweave skills for skills.sh

Install the Warpweave workflow skills into any [skills.sh](https://skills.sh)-compatible agent:

```bash
npx skills add dadosh1984/warpweave
```

Each `warpweave-*/SKILL.md` here is the same skill `warpweave init` writes into a
project. The skills drive the `warpweave` CLI, so for the full setup (CLI +
`warpweave/` project scaffolding + slash commands) run:

```bash
npx warpweave@latest init
```

> These files are generated from the skill templates — do not edit by hand. Run
> `pnpm build && pnpm generate:skills` after changing a template;
> `skillssh-parity.test.ts` fails if they drift.
