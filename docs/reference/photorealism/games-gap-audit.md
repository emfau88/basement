# Games photorealism gap audit

Canonical target: `canonical-games-warm-cinematic.png`

Current fixed capture: `../../qa/current/desktop-1440x900-games.jpg`

Comparison viewport: 1440 × 900

## Preserve

- Straight-on camera from behind the chair.
- Center display as the primary interactive surface with two supporting monitors.
- GAME LAB architectural header, compact right details panel and bottom navigation.
- Current project data, selection synchronization, inspect behavior and mobile sheet system.
- Broad window opening and symmetrical workstation hierarchy.

## Required changes

| Area | Current state | Canonical target | Implementation response |
| --- | --- | --- | --- |
| Architecture | Thin procedural slabs with uniform surfaces | Thick, constructed concrete shell with deep framed glazing | Rebuild Games-visible shell at real scale; bevel edges; add reveals, sill and mullion depth |
| Desk | Rounded boxes with flat wood color | Substantial walnut worktop, black steel frame and believable joinery | Authored hero mesh with directed walnut UVs, edge radius and cable details |
| Chair | Simple block silhouette | Recognizable ergonomic mesh task chair | Authored multi-part hero asset with mesh/fabric normal response and mobile LOD |
| Displays | Flat frames with limited housing depth | Manufactured monitor bodies, stands, bezels and screen glow | Preserve live canvases; replace housings and stands; tune emissive response without bloom haze |
| Lighting | Broad flat fill and multiple decorative sources | Daylight-led scene with warm practical pools and readable dark depth | PMREM HDR environment, one main shadow source, non-shadowing practicals and baked/contact grounding |
| Materials | Mostly uniform color/roughness | Concrete pores and seams, walnut grain, powder coat, glass and woven textiles | PBR map sets with correct color space, scale and UV direction; restrained material variation |
| Window view | Procedural gradient and simple blocks | Soft photographic waterfront/city depth | Layered low-cost skyline/backplate with depth haze; never compete with monitor content |
| Props | Sparse geometric markers | Curated plants, books, lamp, controller, mug and storage | Use a small number of optimized authored props; remove anything that weakens hierarchy |
| Floor/rug | Flat slabs | Subtle worn concrete plus tactile patterned rug | PBR floor, mapped rug surface and deliberate contact shadows |
| UI | Functional and compact | Same hierarchy, sharper integration with the room | Preserve DOM implementation; only tune scene occlusion/composition if fixed captures require it |

## Deliberate deviations

- The production window view may use a layered backplate rather than full 3D city geometry to protect mobile performance.
- The exact branded chair silhouette will be original rather than copied from a commercial product.
- Small decorative text inside the generated mockup is inspiration only; production uses existing accessible HTML/canvas content.
- Mobile keeps the approved scene-first sheet and uses intentional reframing rather than reproducing the Desktop crop.

## Acceptance focus

The largest credibility gains must come from shell depth, the chair/desk silhouettes, material response and contact lighting. Additional small props cannot compensate for weaknesses in those four areas.
