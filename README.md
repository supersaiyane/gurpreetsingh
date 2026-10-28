# Cinematic systems portfolio

A fresh, scroll-driven portfolio for Gurpreet Singh. Branch: `design/cinematic-systems`.

## Preview

Run `npm run dev`, then open http://localhost:4181 . The static website lives in `dist/` and requires no build step.

## Experience

- Three cinematic chapters with a native canvas architecture model, scroll-driven camera, exploded layers and live traffic.
- Chapter navigation, day/night theme, motion pause and automatic reduced-motion reading mode.
- Company logos and an exclusive experience accordion.
- Three simulated incidents with evidence tabs, unsafe-action blocking, safety checks and explicit human approval.
- Five real projects in a scroll-linked gallery on desktop and a swipeable gallery on phones.
- Portfolio terminal with command history, completion and section navigation.

The architecture is code-native geometry, not a video, copied footage or image sequence. Canvas is decorative; narrative content and navigation remain accessible HTML. No source code is executed by the terminal. All incident telemetry and AI recommendations are fictional simulations.

## References

Craise (https://craise.com/) informed continuous scene pacing and pinned scroll progression. OHZI (https://ohzi.io/) informed spatial atmosphere and bright typography on a midnight canvas. Linear (https://linear.app/) informed technical text clarity. The composition, code, scene geometry, illustrations and portfolio content are specific to this portfolio.

Fresh entry styles and interaction: `dist/cinematic.css` and `dist/cinematic.mjs`. Existing tested incident and terminal domain logic is reused; previous template styles and UI scripts are not loaded.

## Verification

`npm test` runs the shared domain tests. Browser checks cover scene chapter changes, gallery navigation, exclusive accordion behavior, theme switching, static reading mode, terminal commands and all three incident recovery paths. A 390px iframe is used temporarily for mobile visual QA and is not part of the delivered site.

## Publishing

This branch does not change the live site. To publish later, select `design/cinematic-systems` in `publishing.json` on `ops/pages-publisher`. Leave `deploy` true. The publisher uses this branch's `dist/` folder. Main and existing design branches remain untouched.
