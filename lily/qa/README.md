# QA scripts

Playwright checks used during development. Serve the site locally
(`python3 -m http.server 8767` from the repository root) and run from this
folder with Node. `BASE` overrides the URL.

- `e2e.js` — full interaction walk: deep-link guard, sound, menu, back at every stage, letter, journal, finale, restart, reduced motion, five viewports. `PART=1` or `PART=2` runs half.
- `layout.js` — every journal page at 375, 390 and 430 wide: no overflow, every illustration and note inside the paper.
- `clipcheck.js` — no lily head crosses the viewport edge; letter text fits its panels.
- `prescene.js` — envelope and letter are `visibility:hidden` before their scene.
- `spam.js` — twelve rapid taps at each stage, and back pressed mid-unfold, both recover.
- `frames.js` — grabs intermediate frames into a contact sheet: `node frames.js <url> <w> <h> <out.png> <progress> "<ms>:click <sel>" ... --grab start,end,step [--crop x,y,w,h] [--rm]`.
- `release.js` — release regression: `RUNS` full runs end to end at 390x664, the back-then-mailbox race, thirty rounds of rapid taps across the sequence, replay, and intro-text geometry at five phone viewports.
