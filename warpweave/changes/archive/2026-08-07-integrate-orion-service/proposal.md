# Proposal: Integrate Orion Service

## Goal
Add support for an external Orion AI service so that the CLI can send prompts to the service and display answers.

## Rationale
* Enables advanced AI‑driven features (code generation, chat, reasoning) without embedding a model.
* Keeps the core CLI lightweight; the heavy model runs remotely.

## High‑level approach
1. Add a config file (`orion.json` or `orion.yaml`) that stores the service endpoint and API key.
2. Implement a thin client wrapper (`src/orion/client.ts`) that performs an HTTP POST to the configured endpoint.
3. Expose a new CLI command `orion:ask <prompt>` that forwards the prompt to the client and prints the response.
4. Add unit tests for the client (mock fetch) and the CLI command.
5. Update documentation (README) with usage instructions.

## Acceptance Criteria (GIVEN‑WHEN‑THEN)
* **GIVEN** an `orion.json` file with a valid `endpoint` and `apiKey`
* **WHEN** the user runs `ww orion:ask "Hello"`
* **THEN** the CLI makes a POST request to `${endpoint}` with the prompt and prints the `answer` field from the JSON response.

* **GIVEN** the config file is missing or malformed
* **WHEN** the user runs `ww orion:ask …`
* **THEN** the CLI exits with a clear error message explaining the problem.

* **GIVEN** the server returns an error
* **WHEN** the user runs `ww orion:ask …`
* **THEN** the CLI displays the server error without crashing.

## Scope
* Only a minimal client; no retries, streaming, or advanced auth beyond the API key.
* No UI beyond the console output of the answer.
* Tests cover happy path, missing config, and server error.
