## Priorities

1. Implement the user's requested behavior completely.
2. Use the smallest maintainable change that fits existing project patterns.
3. Verify the changed behavior with the least expensive reliable check.
4. Preserve unrelated user work and avoid expanding scope.

## Scope and execution

- Read the relevant source, configuration, references, and callers before editing. For a bug, fix the shared root cause rather than one visible symptom.
- Act immediately on small, clear tasks. Plan only when the approach is materially ambiguous, architectural, or risky.
- Ask a question only when repository evidence and documentation cannot resolve choices with meaningfully different outcomes.
- Do not add unrelated features, refactors, abstractions, dependencies, documentation, or cleanup.
- Reuse existing helpers and patterns first, then the standard library or platform, then already-installed dependencies.
- Do not add a production dependency without explicit user approval.
- Keep changes local and migrate every affected caller. Remove obsolete code introduced by the changed path; do not leave compatibility shims unless requested.

## Documentation lookup

- Check installed package versions and existing project usage before searching external documentation.
- Use current official documentation through Context7 or Exa when an API is unfamiliar, version-sensitive, or has changed. Do not research ordinary business logic or established local patterns.
- Verify current documentation before adding or changing Minecraft Script API members, events, signatures, or configuration syntax.

## Verification

- Use the fastest existing check that can fail for the change. Verification is proportional, not a ritual.
- For TypeScript source changes, run the configured `typecheck` script when present. For JavaScript source changes, run the configured `check` script when present.
- For runtime or gameplay behavior, use the smallest practical smoke or reproduction step. For BP/RP JSON, use the project's configured parser or schema validator when available.
- Run existing tests only when they cover the changed area. Prefer the narrowest relevant test target.
- Run the full test suite only when the user asks or an existing repository policy explicitly requires it.
- **Do not create new test files or test cases unless the user explicitly requests tests or an existing repository policy requires them.** Never invent `*.test.*` files, assertion scripts, demos, fixtures, snapshots, or a test framework solely to prove completion.
- If behavior intentionally changes, update existing assertions only as needed to match the requested contract; do not expand coverage by default.
- Do not install or configure testing, linting, or formatting tools just to complete a task.
- If no relevant check exists or the environment cannot run it, state that plainly. Do not manufacture a substitute or claim unrun checks passed.
- Report the exact verification command or observed smoke result. Distinguish new failures from pre-existing failures.

## Code rules

- Prefer boring, linear code, guard clauses, explicit state names, and one source of truth.
- Do not build speculative flexibility. Avoid one-implementation interfaces, factories for one product, and helpers used once unless they materially clarify the code.
- Preserve input validation, security boundaries, and protections against data loss, duplication, or invalid world state.
- Use naming instead of explanatory comments. Add a short comment only for a non-obvious invariant, external constraint, or unavoidable workaround.
- Validate predictable invalid states before calling an API. Use `try-catch` only for a documented or observed unguardable failure when the catch performs meaningful recovery, cleanup, translation, or contextual rethrow. Keep the `try` block narrow; never silently swallow errors.
- Avoid repeated allocation, copying, logging, or exception handling in tick handlers and other hot paths.
- Follow the existing TypeScript configuration and style. Do not introduce unused imports, variables, or exports.

## Minecraft Bedrock conventions

- Check entity validity, optional components, and unloaded blocks with guards before use.
- When already installed, prefer `@minecraft/vanilla-data` typed identifiers over raw component, entity, block, item, and effect strings.
- When already installed, check `@minecraft/math` before writing vector, matrix, clamp, lerp, or similar math helpers.
- Do not add either package solely to satisfy these preferences.
- Validate changed BP/RP JSON against the project's configured Bedrock schemas when available.
- In Regolith projects, inspect compilation output through `.regolith/tmp` without resolving its symlinks.

## Repository hygiene

- Never discard, overwrite, or revert unrelated user changes.
- Do not create repository files for agent memory, lessons, session notes, plans, or debugging logs.
- Do not create or update documentation, changelogs, or generated artifacts unless requested or required by the changed contract.
- Do not commit, push, publish, or delete unrelated files unless explicitly requested.
- Commit messages, when requested, use a short natural subject and no AI attribution, tool attribution, or structured report trailers.

## Communication

- Be direct and concise. State assumptions only when they materially affect the implementation.
- After changes, report what changed, the verification evidence, and any real blocker or residual risk. Do not add ritual sections for untouched files.
- Never report completion with known errors in the changed path or imply that a check ran when it did not.
