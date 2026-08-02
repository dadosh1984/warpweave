# ci-release-tracking Specification

## Purpose

Ensures the CI "Validate Release Tracking" job gives developers reliable signal on release pull requests: a legitimate release PR (a version bump that consumes the pending changesets) and any non-release PR complete the job successfully, without the misleading failure introduced in `f43dfa2`.

## Requirements

### Requirement: Legitimate release PR completes the job successfully

The CI release tracking validation SHALL complete successfully for a legitimate release pull request.

#### Scenario: Release PR bumps version and consumes changesets

- **WHEN** a pull request bumps the package version and removes the pending changesets that cover those changes
- **THEN** the "Validate Release Tracking" CI job SHALL complete successfully
- **AND** the CI SHALL NOT report that changed packages lack a changeset

#### Scenario: Version bump consumes a changeset already merged to the base branch

- **WHEN** a pull request bumps the package version and the changesets covering that release were already merged into the base branch
- **THEN** the "Validate Release Tracking" CI job SHALL still complete successfully

### Requirement: Non-release PR completes the job successfully

The CI release tracking validation SHALL complete successfully for a pull request that changes neither the package version nor any changesets.

#### Scenario: Source or documentation change

- **WHEN** a pull request changes source code or documentation without changing the package version and without adding or removing changesets
- **THEN** the "Validate Release Tracking" CI job SHALL complete successfully

### Requirement: Changeset additions are still validated

The CI release tracking validation SHALL continue to validate the well-formedness of pending changesets added or removed by a pull request.

#### Scenario: PR adds or removes changesets

- **WHEN** a pull request adds or removes a changeset file under `.changeset/`
- **THEN** the CI SHALL validate the changesets (for example with `changeset status`) and fail with a non-zero exit code if they are invalid
