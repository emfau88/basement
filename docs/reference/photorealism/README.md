# Photorealism reference intake

The original concept mockup shown earlier in the conversation was not available as a repository file. Three replacement candidates were generated from the current fixed Games capture on 2026-09-12 and are preserved here. The user selected the recommended A/B direction: Candidate A as the foundation with Candidate B's additional depth and controlled lighting. The combined result is the canonical target.

## Candidates

| Candidate | Direction | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| `candidate-a-warm-industrial.png` | Warm concrete, walnut, black steel and balanced daylight | 1586 × 992 | `DE8DECE879CE70864D58EC1128585D43CA2D516B3183040E81266186649DEC6D` |
| `candidate-b-cinematic-tech.png` | Graphite, dark timber, cool ambient light and restrained amber accents | 1586 × 992 | `E04D01AB05EEDCE32586D12BC545A14CBAC9B952B45C744B38778C5DBE269E4D` |
| `candidate-c-brutalist-gallery.png` | Pale concrete, white oak, glass and broad daylight | 1586 × 992 | `D8F4D2872984CFAFD7FAC5114A717A7423889B56C121DE9079AE0E04643A4110` |
| `canonical-games-warm-cinematic.png` | Approved A/B mix: warm industrial foundation with cinematic depth | 1586 × 992 | `E3EE8E26BF10170478D2A6183010A8A213508AE1D86DE2380B2F854D73900F24` |

All three use `docs/qa/current/desktop-1440x900-games.jpg` as the composition and UI reference. The generation specifications are recorded in `generation-prompts.md`.

Before visible Games implementation:

1. place the approved original image in this directory without recompressing it;
2. replace the pending fields below;
3. keep only one file marked as the canonical visual target;
4. complete the fixed-camera gap audit in `docs/architecture/photorealism-plan.md`;
5. pass Roadmap Decision Gate C.

| Field | Value |
| --- | --- |
| Canonical file | `canonical-games-warm-cinematic.png` |
| Dimensions | 1586 × 992 |
| Source/date | ImageGen candidates generated 2026-09-12 from the current Games capture |
| Approved by | Project owner — approved recommended A/B direction |
| Approval date | 2026-09-12 |
| Current comparison | `docs/qa/current/desktop-1440x900-games.jpg` |

Do not silently combine candidates. The explicitly approved candidate, plus any explicitly requested adjustments, becomes the visual source of truth.
