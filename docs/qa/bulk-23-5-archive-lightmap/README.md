# Bulk 23.5 — Archive lightmap pilot

This is an isolated Desktop-only A/B experiment. The default URL keeps the approved Archive unchanged; adding `?archive-lightmap=pilot` enables three small precomputed irradiance maps for the static Archive wall and furniture surfaces.

## Evidence

- `before-desktop-1440x900.jpg`: default production lighting
- `after-desktop-1440x900.jpg`: identical camera and resolution with the pilot enabled
- `measurements.json`: runtime state, resource count and estimated uncompressed GPU texture memory

## Initial finding

The pilot slightly warms indirect light and softens brightness transitions around the memorial and shelving. The change is subtle rather than transformative. It adds no network request and uses approximately 2.63 MiB of additional Desktop GPU texture memory.

Recommendation: do not expand lightmaps to the other zones unless this fixed comparison is considered a clearly worthwhile visual improvement. Contact grounding/AO is expected to deliver a stronger next improvement for the current runtime-built geometry.
