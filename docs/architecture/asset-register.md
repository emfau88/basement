# External visual asset register

No third-party visual asset may enter the production bundle without a completed row and a locally retained license/source record where the source permits it.

| Status | Asset/purpose | Source URL | Creator/provider | License | Downloaded | Original/version | Production path | SHA-256 | Modifications | Attribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Integrated | Games indirect light/look-development HDRI | <https://polyhaven.com/a/art_studio> | Oliksiy Yakovlyev / Poly Haven | CC0 | 2026-09-12 | `art_studio_1k.hdr` | `public/assets/photoreal/games/environment/art-studio-1k.hdr` | `5BD8EFB8D01D9E2262F23347305C3C697910067E185BDC0C9F7CA2BB9A3321CC` | Runtime PMREM environment; low neutral intensity; Desktop only | Not required; credit retained here |
| Integrated | Warm cast-concrete wall material | <https://polyhaven.com/a/concrete_wall_009> | Charlotte Baglioni / Poly Haven | CC0 | 2026-09-12 | 1K diffuse, OpenGL normal and ARM maps | `public/assets/photoreal/games/materials/concrete-wall/` | WebP base `5C72642E…4292F0`; normal `C7AC7BA6…8499D`; ARM `AC15B29B…513344` | Production WebP conversion; runtime tint/repeat; displacement omitted; ARM reused by material channels | Not required; credit retained here |
| Shortlisted | Subtly worn concrete floor material | <https://polyhaven.com/a/concrete_floor> | eye-candy.xyz / Poly Haven | CC0 | Pending | Concrete Floor, 1K/2K maps | Pending | Pending | KTX2; color neutralized; no runtime displacement | Not required; credit planned |
| Integrated | Walnut desk and shelf material | <https://polyhaven.com/a/walnut_veneer_02> | Jenelle van Heerden / Poly Haven | CC0 | 2026-09-12 | 1K diffuse, OpenGL normal and ARM maps | `public/assets/photoreal/games/materials/walnut/` | WebP base `CF20725F…D69BE9`; normal `A1903D7B…E62BC2`; ARM `78737EF2…B6A7D6` | Production WebP conversion; runtime tint/repeat; Desktop only; displacement omitted | Not required; credit retained here |
| Integrated | Large left-side plant | <https://polyhaven.com/a/potted_plant_02> | Rico Cilliers / Poly Haven | CC0 | 2026-09-12 | Potted Plant 02, 1K glTF source | `public/assets/photoreal/games/models/potted-plant-02.glb` | `24121505FF29F928E837A9252F67F0A652CDFAE08D4C7F076677FCCB6E869DB6` | Joined/pruned, WebP textures, Meshopt GLB; Desktop only | Not required; credit retained here |
| Shortlisted | Small desk plant | <https://polyhaven.com/a/potted_plant_04> | James Ray Cock / Poly Haven | CC0 | Pending | Potted Plant 04, glTF | Pending | Pending | 1K KTX2 textures; simplified low tier | Not required; credit planned |
| Integrated | Rug weave source | <https://polyhaven.com/a/dirty_carpet> | Rohit Seervi / Poly Haven | CC0 | 2026-09-12 | Dirty Carpet, 1K maps | `public/assets/photoreal/games/materials/rug/` | Warm base `1CFD6D74…FB5C79`; normal `09FF0C4F…AF32EB`; ARM `37B6A5AE…642D01` | Warm ImageGen base-color derivative; production WebP; no displacement; Desktop maps only | Not required; credit retained here |
| Project-produced | Waterfront Games window backplate | OpenAI ImageGen | EMFAU project | Project-owned output | 2026-09-12 | 1672 × 941 generated PNG | `public/assets/photoreal/games/backdrops/waterfront-city.webp` | `93F727B3AA128A818471A7309CF4F9A2A604A9F680C68DB33AB2BC3007A92D6A` | Resized to 1600px wide and converted to WebP; exact prompt retained | None |

## Review rules

- Accept self-authored work, CC0, or a license that explicitly permits commercial web use and redistribution inside the deployed project.
- Reject unclear licensing, editorial-only assets, ripped game/movie assets and assets whose source cannot be traced.
- Record each HDRI, texture set, model, decal and font independently.
- Preserve the source URL and license terms recorded at download time.
- Compute the checksum after download and again for the production derivative.
- Note mesh simplification, texture resizing, channel packing, relighting and other material changes.
- Keep required attribution in the product documentation and deployment when the license requires it.
