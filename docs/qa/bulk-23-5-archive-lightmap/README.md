# Bulk 23.5 — Archive lightmap pilot

This was an isolated Desktop-only A/B experiment using three small precomputed irradiance maps for the static Archive wall and furniture surfaces. The runtime implementation was removed after review; these files remain only as decision evidence.

## Evidence

- `before-desktop-1440x900.jpg`: default production lighting
- `after-desktop-1440x900.jpg`: identical camera and resolution with the pilot enabled
- `measurements.json`: runtime state, resource count and estimated uncompressed GPU texture memory

## Initial finding

The pilot slightly warms indirect light and softens brightness transitions around the memorial and shelving. The change is subtle rather than transformative. It adds no network request and uses approximately 2.63 MiB of additional Desktop GPU texture memory.

Decision: the visual improvement was too small. Lightmaps were not expanded and the experimental runtime path was removed.
