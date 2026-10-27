# Portfolio branch preview studio

Open all eight portfolio branches from one tabbed HTML page. Each site is an isolated, pinned snapshot; this branch does not modify any source branch.

## Run

Run `python3 -m http.server 4180` in this folder, then open http://localhost:4180/ . Opening index.html directly can block JavaScript modules inside modern site versions, so use the local server.

The root `index.html` includes the complete tab interface, styles and controls. Supporting websites and their assets live in `sites/`. Serve or deploy this entire directory, not index.html alone. Relative URLs also work under a GitHub Pages project path.

## Included versions

| Tab | Source branch |
|---|---|
| Original site | main |
| Classic resume | design/bootstrap-resume-classic |
| Career timeline | experiment/bootstrap-career-timeline |
| Creative CV | design/creative-cv-now-ui |
| Resilience lab | design/resilience-incident-lab |
| Blueprint | design/refero-portfolio-concepts |
| Immersive | design/immersive-operations |
| Systems Architect | design/systems-architect |

`versions.json` records exact source commits. These are snapshots, so later source changes are not automatically reflected. Legacy versions retain their original content, dependencies and unfinished features. External fonts/CDNs may need Internet access.

## Controls

- Select a tab or use Left/Right, Home and End while a tab is focused.
- Choose full width, desktop (1440px), tablet (768px) or mobile (390px).
- Reload only the selected version, or open it in a separate tab.
- Share a selected version using the page URL hash, such as `#systems-architect`.

Frames load on first selection and preserve their state when switching tabs. Each frame has its own document, so styles and navigation do not overlap. Snapshots served from the same origin can share the original sites' saved theme preferences.

## Refresh snapshots

Fetch origin first: `git fetch origin`. Then run `python3 scripts/build-preview.py` and `python3 scripts/check-preview.py`.

The generator reads source commits with git archive, never checks out or changes source branches, excludes editor history and repository metadata, and generates the standalone preview shell from `scripts/preview-shell.html`.

Canonical repository: https://github.com/supersaiyane/gurpreetsingh . Future development uses new branches; main remains untouched.
