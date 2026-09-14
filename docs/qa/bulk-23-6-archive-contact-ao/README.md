# Bulk 23.6 — Archive contact-AO pilot

This Desktop-only A/B experiment added seven soft, static contact patches: four beneath the sofa, coffee table, memorial and shelving, plus three directly behind the wall-mounted Archive elements. The runtime implementation was removed after review; these files remain only as decision evidence.

It deliberately did not use full-screen SSAO, temporal sampling or a blur pass.

## Evidence

- `before-desktop-1440x900.jpg`: default production lighting
- `after-desktop-1440x900.jpg`: identical camera and resolution with contact AO enabled
- `measurements.json`: runtime state, resource count and estimated uncompressed GPU texture memory

## Initial finding

The contact patches improve only the immediate furniture/wall junctions. They introduce no visible noise or loss of sharpness and require no additional network resource. The shared 256 × 256 mask uses approximately 0.25 MiB of Desktop GPU texture memory.

Decision: the grounding improvement was too small to justify another runtime path. The experimental implementation was removed, and global SSAO remains rejected for the current scene.
