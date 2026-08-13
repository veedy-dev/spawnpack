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
- You may suggest a production dependency when it is the smallest suitable solution, but explain why and ask the user before adding it.
- Keep changes local and migrate every affected caller. Remove obsolete code introduced by the changed path; do not leave compatibility shims unless requested.

## Documentation lookup

- Before planning or implementing any Minecraft Bedrock change, verify the current relevant documentation. This includes Script API and BP/RP JSON formats, components, events, schemas, MoLang, manifests, commands, animations, and pack behavior.
- Prefer Exa MCP for documentation and web research. If Exa is unavailable, use built-in web search or browsing. Use Context7 only as a last resort because its indexed documentation may lag behind current releases.
- Prefer current Microsoft Creator documentation and versioned references on `bedrock.dev`. For Script API, also use `https://jaylydev.github.io/scriptapi-docs/latest/`. Use `wiki.bedrock.dev` for established concepts and proven implementation patterns. Confirm stable versus preview status and the target Minecraft version.
- For other external libraries, frameworks, SDKs, APIs, and CLI tools, verify current official documentation before relying on unfamiliar or version-sensitive behavior.

## Verification

- After TypeScript changes, run `tsc --noEmit`.
- For JavaScript, run the project's configured `npm run typecheck` or `npm run check` script when present.
- Do not create or run tests unless the user asks or an existing repository policy explicitly requires them.
- If the relevant command is unavailable or fails for a pre-existing reason, state that plainly.

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
- Prefer `@minecraft/vanilla-data` typed identifiers over raw component, entity, block, item, and effect strings.
- Check `@minecraft/math` before writing vector, matrix, clamp, lerp, or similar math helpers.
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
