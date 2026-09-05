# Spec: Orion Service Integration

## Scenario: Successful request
**GIVEN** a valid `orion.json` file with `endpoint` set to `http://localhost:8000` and a correct `apiKey`
**WHEN** the user runs `ww orion:ask "Hello world"`
**THEN** the CLI sends a POST request to `http://localhost:8000/v1/chat/completions` with the prompt in the JSON body and the `Authorization: Bearer <apiKey>` header, receives a JSON response `{"answer": "Hello world!"}` and prints `Hello world!` to stdout.

## Scenario: Missing config file
**GIVEN** no `orion.json` file exists in the project root
**WHEN** the user runs `ww orion:ask "test"`
**THEN** the CLI exits with code 1 and prints an error message `Orion config not found. Create orion.json with endpoint and apiKey.`

## Scenario: Invalid JSON in config
**GIVEN** `orion.json` exists but contains malformed JSON
**WHEN** the user runs `ww orion:ask "test"`
**THEN** the CLI exits with code 1 and prints `Failed to parse orion.json: <error>`.

## Scenario: Server returns error
**GIVEN** a valid config file
**WHEN** the user runs `ww orion:ask "test"` and the Orion server responds with HTTP 500 and body `Internal error`
**THEN** the CLI exits with code 1 and prints `Orion service error: Internal error`.

## Task List (tasks.md)
- [ ] Create `orion.json` config file template and validation.
- [ ] Implement `src/orion/client.ts` with `orionRequest`.
- [ ] Add `src/cli/orion.ts` commander command `orion:ask`.
- [ ] Register the new command in `src/cli/index.ts`.
- [ ] Write unit tests for the client (happy path, missing config, server error).
- [ ] Write CLI integration test for `orion:ask`.
- [ ] Update README with usage instructions.
- [ ] Run drift‑check, security‑scan, and verify.
