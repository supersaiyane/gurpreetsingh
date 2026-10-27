# Publish any portfolio design - leave main untouched

This branch, `ops/pages-publisher`, owns the GitHub Pages publishing workflow. It does not change, merge or push to main or any source design branch.

## Choose the public version

1. Open publishing.json on the ops/pages-publisher branch in GitHub.
2. Set source_branch to the exact desired branch below. Keep deploy set to true for a public deployment.
3. Commit the configuration change directly to ops/pages-publisher.
4. Open Actions → Publish selected portfolio to follow the build and deployment.

The public URL stays https://supersaiyane.github.io/gurpreetsingh/ . One selected version is published at a time.

Supported versions:
- main (read-only publishing source)
- design/bootstrap-resume-classic
- design/creative-cv-now-ui
- experiment/bootstrap-career-timeline
- design/resilience-incident-lab
- design/refero-portfolio-concepts
- design/immersive-operations
- design/systems-architect
- preview (the comparison studio)

New design/* and experiment/* branches also work when they contain index.html at the root or inside dist/. main is also supported as a read-only source; publishing it does not modify or merge into the branch.

## How publishing works

The workflow reads the selected source branch, detects dist/index.html before root index.html, copies the appropriate site directory into the Pages artifact, checks its local entry-page assets and publishes the artifact. It preserves relative file layouts and legacy runtime scripts, skips Git/editor metadata, creates .nojekyll and records the source commit in deployment.json. No source code from the selected branch is executed by the publisher.

Pages must remain set to GitHub Actions, not Deploy from a branch. Selecting a design branch root manually bypasses this workflow and can serve its README instead of dist/.

Only configuration/workflow/test changes on ops/pages-publisher trigger this workflow. Editing a source design does not silently replace the live version. To publish later changes to the same selected design, re-run all jobs of the latest successful Publish selected portfolio run. The workflow fetches the selected source branch's latest commit each time.

Manual workflow_dispatch is deliberately not required: GitHub requires a manual-dispatch workflow to exist on the default branch. The configuration-commit trigger works without editing main.

Set deploy to false for a package-only validation run. This uploads the artifact and skips production deployment.

## Local verification

python3 -m unittest discover -s tests -v
python3 scripts/prepare_pages.py

Use --fetch to read the current remote source commit. Local packaging otherwise uses the existing origin/* remote-tracking ref. Artifacts go to .pages-artifact and are ignored by Git.

The portfolio files at this branch root are the original Blueprint deployment baseline; the workflow always publishes the selected source through its generated artifact. No design edits should be made to the baseline copies here.
