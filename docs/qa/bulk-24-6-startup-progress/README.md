# Bulk 24.6 — Truthful startup progress

The existing loading surface now reflects real application work instead of fixed timeouts.

## Behavior

- Initial scene construction advances the first progress phase.
- Every required texture, model and environment request contributes its actual request progress.
- The bar reserves its final step for parsing, GPU preparation and scene integration.
- `studio ready` appears only after the selected quality tier has completed or its supported fallback is active.
- The progress element exposes `aria-valuenow`, a readable label and stable QA data attributes.

## Scope guardrail

This bulk does not modify, simplify or recompress the plant, keyboard, mouse, HDR environment or other visual assets.

## Verification

- Production build and TypeScript validation
- Complete Desktop/Mobile interaction and responsive matrix
- GitHub Pages `/basement/` subpath QA
- Local browser completion check (`gamesProof=ready` before the loader finishes)
