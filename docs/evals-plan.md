# LLM Evals Plan

Date: 2025-12-22

## Goals
- Add an LLM-as-judge evaluation layer for MCP tool outputs.
- Keep evals opt-in, local-first, and safe for live accounts.
- Make evals easy to extend (new tools, new checks) without rewriting harnesses.

## Framework Notes (Research)
- OpenAI provides built-in grader primitives for evaluating model outputs, plus structured outputs for enforcing JSON evaluation results. This is a good baseline for robust, schema-validated grading. (See Sources.)
- Promptfoo supports configurable evaluation runs and model-graded assertions, making it a strong option for higher-level evaluation workflows. (See Sources.)
- RAGAS provides evaluation utilities focused on RAG-style tasks and metrics, which may become useful later if we add retrieval-heavy features. (See Sources.)

## Proposed Architecture
- **Eval cases**: A small JSON/YAML spec describing tool calls plus expected facts.
- **Runner**: Uses the existing MCP harness to execute tool calls and capture outputs.
- **Grader**: Pluggable evaluation backend; initial implementation uses OpenAI structured outputs for deterministic JSON grading.
- **Modes**:
  - Mock mode (deterministic): run against the existing mock VRChat API fixture.
  - Live mode (opt-in): run against real user credentials with interactive login fallback.
- **Config**: A gitignored config file enables evals and stores the OpenAI key/model.
- **Reporting**: Console summary with per-case pass/fail, score, and short reason.

## Phases
### Phase I (Implement Now)
- Add an eval config schema + example file (gitignored).
- Add a minimal LLM grader that:
  - Calls OpenAI Responses with a strict JSON schema.
  - Produces pass/fail + score + per-fact support flags.
- Add a mock eval test suite that:
  - Runs against the mock MCP server.
  - Evaluates 2–3 curated cases (pass + fail).
- Add `npm run test:evals` and document eval usage in AGENTS/README.

### Phase II (Next)
- Add live eval suite with user-specific expectations (e.g., friend exists).
- Add a single “live sanity” case for each curated tool.
- Add a small results snapshot (JSON) to help spot regressions.

### Phase III (Optional / Later)
- Integrate Promptfoo for richer dashboards and easy scenario expansion.
- Explore RAGAS if we introduce RAG workflows or knowledge-grounded evals.

## Sources
- https://platform.openai.com/docs/guides/graders
- https://platform.openai.com/docs/guides/structured-outputs
- https://www.promptfoo.dev/docs/intro/
- https://docs.ragas.io/
