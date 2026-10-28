# Verification - 28 October 2026

- All 16 existing domain tests passed; JavaScript syntax check passed.
- Entry validation: 40 unique IDs, 9 valid same-page anchors, all 6 referenced local assets present, no emdashes in the new entry/style/controller files.
- Browser desktop (1280 x 720): opening scene, architecture chapter and changing camera/layer positions visually verified; project chapter navigation advances the horizontal gallery and keeps link rows visible.
- Browser 390px iframe: mobile hero and native project gallery visually checked; next-project control advanced to 02 / 05.
- All three incidents completed in-browser. For each: broad strategy blocked; bounded check passed; approval stayed disabled before acknowledgment; explicit approval restored service. Completion reached 3 / 3.
- Experience accordion: opening Vertisystem closed NatWest; only one company remained open.
- Terminal: ls projects returned all five builds. Navigation commands adapt old domain IDs to this template's section IDs.
- Motion toggle switched to static layout with all three chapters visible and aria-hidden=false. System reduced-motion preference uses the same static path and additionally disables CSS transitions.
- Day/night switch visually checked. No runtime errors reported by browser console.
- Temporary QA harness removed. Public publishing config and existing branches were not edited.

## Hero revision verification

- Replaced projected slabs with locally bundled Three.js 0.180.0 and a reflective, shader-lit 3D core with independent orbital paths. Preserved MIT license.
- Desktop browser screenshots verified opening and expanded camera views. No browser errors during scene initialization, chapter changes, theme switch or motion pause.
- 390px iframe screenshot verified the adjusted sculpture position clears the main copy and action.
- Motion pause leaves all three chapter headings visible in static reading mode. Day/night controls remain functional.
- New scene and controller syntax checks passed; all 16 domain tests passed again. Temporary mobile QA harness removed.

## Continuous page journey verification

- 19 domain tests pass, including continuous section coordinates, accordion layout remeasurement, boundary clamping and multi-channel pose interpolation.
- Browser desktop: the same WebGL canvas stays visible after the hero; experience carries the smaller core in the margin, the signal line traces the route, and contact reassembles the core behind the closing typography.
- Browser incident check: a latency injection changed the shared signal to amber; bounded safety check, acknowledgment and approval restored blue. Recovery logic remains unchanged.
- Global motion pause hides the world and signal and leaves all three narrative chapters accessible. Resume restores the continuous canvas.
- 390px iframe: experience text, company controls and signal route visually checked; object stays behind content. No browser runtime errors in the desktop journey.
- Temporary mobile harness removed; all changes remain isolated to design/cinematic-systems.

## Mobile refinement - iPhone 17 Pro Max viewport

- Tested a 440 x 956 CSS viewport in an iframe, not a physical iPhone/Safari runtime.
- Mobile hero height measured 1299px, down from the prior 300svh/2868px layout (about 55%). Chapters remain accessible in natural flow.
- Measured section padding ranges from 16px to 52px; no horizontal overflow.
- Three CSS animations were running and their timelines advanced from 8ms to 8683ms. No Three.js core/module downloads on mobile.
- Motion pause removed active animations; resume restored all three. Day mode checked with animations running.
- Desktop 1280px viewport retained its GPU scene and reported no runtime errors. All 19 domain tests passed.
- Temporary mobile probe and harness removed before commit.
