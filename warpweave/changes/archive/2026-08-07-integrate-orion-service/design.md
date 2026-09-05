# Design: Orion Integration

## Config file (`orion.json`)
* Location: project root (`orion.json`).
* Fields:
  * `endpoint`: string – base URL of the Orion service (e.g., `http://localhost:8000`).
  * `apiKey`: string – secret used for `Authorization: Bearer <apiKey>` header.
* The file is read synchronously at runtime via `fs.readFileSync` and parsed with `JSON.parse`. Errors are turned into a user‑friendly `Error` with a helpful message.

## Client Wrapper (`src/orion/client.ts`)
* Exported async function `orionRequest({prompt}: {prompt: string}): Promise<{answer: string}>`.
* Reads config with `readOrionConfig()` (throws if missing/invalid).
* Performs a `fetch` POST to `${endpoint}/v1/chat/completions`:
  ```ts
  const resp = await fetch(`${endpoint}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({prompt}),
  });
  ```
* On non‑2xx responses throws an `Error` with the response body text.
* Returns `await resp.json()` cast to `{answer: string}`.

## CLI command (`src/cli/orion.ts`)
* Register command `orion:ask <prompt>` with commander.
* Calls `orionRequest({prompt})` and `console.log(answer)`.
* Catches errors, logs to `stderr`, and exits with code 1.

## Tests (`test/orion/client.test.ts`)
* Mock `global.fetch` with `vi.fn()`.
* Test happy path – returns `answer`.
* Test missing config – expects thrown error.
* Test server error – expects thrown error with response text.

## CLI tests (`test/cli/orion.test.ts`)
* Use `runCli` helper to execute `ww orion:ask "test"`.
* Mock client via `vi.spyOn` to avoid real network calls.
* Verify console output contains the expected answer.

## Documentation (README snippet)
```
# Orion integration
Create `orion.json` in the project root:
```json
{
  "endpoint": "http://localhost:8000",
  "apiKey": "your‑secret‑key"
}
```

Run a prompt:
```bash
ww orion:ask "Explain the concept of YAGNI"
```
``` 
```

## Minimal‑output (Ponytail) notes
* No new dependencies other than built‑in `node:fs` and the global `fetch` (available in Node ≥18).
* All code fits in a single file per artifact (client, CLI command).
* Errors are handled with a single `try/catch` and expressive messages.
