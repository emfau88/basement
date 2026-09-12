# External visual asset register

No third-party visual asset may enter the production bundle without a completed row and a locally retained license/source record where the source permits it.

| Status | Asset/purpose | Source URL | Creator/provider | License | Downloaded | Original/version | Production path | SHA-256 | Modifications | Attribution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Integrated | Games indirect light/look-development HDRI | <https://polyhaven.com/a/art_studio> | Oliksiy Yakovlyev / Poly Haven | CC0 | 2026-09-12 | `art_studio_1k.hdr` | `public/assets/photoreal/games/environment/art-studio-1k.hdr` | `5BD8EFB8D01D9E2262F23347305C3C697910067E185BDC0C9F7CA2BB9A3321CC` | Runtime PMREM environment; low neutral intensity; Desktop only | Not required; credit retained here |
| Integrated | Warm cast-concrete wall material | <https://polyhaven.com/a/concrete_wall_009> | Charlotte Baglioni / Poly Haven | CC0 | 2026-09-12 | 1K diffuse, OpenGL normal and ARM maps | `public/assets/photoreal/games/materials/concrete-wall/` | Base `59811FAD…DBA8FE`; normal `0CAA2F86…C5C04F`; ARM `E8C5155A…D5FBC4` | Runtime tint/repeat; displacement omitted; ARM reused by material channels | Not required; credit retained here |
| Shortlisted | Subtly worn concrete floor material | <https://polyhaven.com/a/concrete_floor> | eye-candy.xyz / Poly Haven | CC0 | Pending | Concrete Floor, 1K/2K maps | Pending | Pending | KTX2; color neutralized; no runtime displacement | Not required; credit planned |
| Integrated | Walnut desk and shelf material | <https://polyhaven.com/a/walnut_veneer_02> | Jenelle van Heerden / Poly Haven | CC0 | 2026-09-12 | 1K diffuse, OpenGL normal and ARM maps | `public/assets/photoreal/games/materials/walnut/` | Base `0E066C98…93FDEA`; normal `A54E8A4B…829DC1`; ARM `5772CF8C…1F3EDF` | Runtime tint/repeat; Desktop only; displacement omitted; ARM reused by material channels | Not required; credit retained here |
| Shortlisted | Large left-side plant | <https://polyhaven.com/a/potted_plant_02> | Rico Cilliers / Poly Haven | CC0 | Pending | Potted Plant 02, glTF | Pending | Pending | Desktop LOD plus simplified/mobile billboard variants | Not required; credit planned |
| Shortlisted | Small desk plant | <https://polyhaven.com/a/potted_plant_04> | James Ray Cock / Poly Haven | CC0 | Pending | Potted Plant 04, glTF | Pending | Pending | 1K KTX2 textures; simplified low tier | Not required; credit planned |
| Shortlisted | Rug weave source | <https://polyhaven.com/a/dirty_carpet> | Rohit Seervi / Poly Haven | CC0 | Pending | Dirty Carpet, 1K maps | Pending | Pending | Recolored warm neutral; KTX2; no displacement | Not required; credit planned |

## Review rules

- Accept self-authored work, CC0, or a license that explicitly permits commercial web use and redistribution inside the deployed project.
- Reject unclear licensing, editorial-only assets, ripped game/movie assets and assets whose source cannot be traced.
- Record each HDRI, texture set, model, decal and font independently.
- Preserve the source URL and license terms recorded at download time.
- Compute the checksum after download and again for the production derivative.
- Note mesh simplification, texture resizing, channel packing, relighting and other material changes.
- Keep required attribution in the product documentation and deployment when the license requires it.
