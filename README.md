# Gurpreet Singh - Systems Architect

Fresh portfolio design on `design/systems-architect` in https://github.com/supersaiyane/gurpreetsingh. Other branches are preserved.

## Preview

Run `python3 -m http.server 4177 --directory dist` and open http://localhost:4177/ . No build step or runtime dependencies.

## Implementation

- `dist/index.html`: fresh semantic page and native case-study/incident dialogs.
- `dist/architect.css`: independent responsive design and theme tokens. No inherited page CSS.
- `dist/architect.mjs`: canvas sculpture, project studies, themes and new incident UI.
- `dist/incident.mjs`: reused deterministic incident model, fictional evidence and safety gates.
- `dist/assets/companies/`: unmodified company marks and source attribution.
- `docs/systems-architect.md`: research and design reference lock.

Project architecture diagrams are conceptual. Portfolio content is based on the owner's supplied resume, original portfolio and project links. No production or personal resume file is published. No visitor tracking, backend, external AI service or production actions.

Native dialogs support Escape, focus containment and focus return. The sculpture stops offscreen and in background tabs, respects reduced-motion preferences and has a pause control. Day/night preference is optional and saved locally. Google Fonts is optional; system fallbacks are defined.

## Validation

`npm test` verifies the shared incident safety model. `node --check dist/architect.mjs` checks syntax. Browser QA covers all case studies, gated incident recovery, exclusive experience rows, themes and desktop/mobile layouts.

Static deployment directory: `dist`. Relative asset paths support GitHub Pages project hosting.
