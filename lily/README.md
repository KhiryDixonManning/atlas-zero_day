# The Art of Noticing — Lily

A small interactive world made for one person. It opens with handwritten
letters gathering into a white lily, leads through a night garden to a
vintage mailbox, an envelope with a wax seal, a letter that unfolds, and a
journal of things the author noticed. The last page holds a pressed lily
that comes back to life.

Built as a static site: no build step, no framework, no external requests.
Open `index.html` over any static server (fonts load as modules, so it needs
`http://`, not `file://`).

```
lily/
  index.html          shell, navigation, menu
  css/
    base.css          tokens, nav, menu, paper grain
    bloom.css         scene 1
    garden.css        scene 2 (garden, mailbox)
    envelope.css      scene 3 (envelope, seal, letter)
    journal.css       scenes 4 and 5 (pages, discoveries, pressed lily)
    fonts.css         self-hosted @font-face rules
  js/
    main.js           scene router, back / replay / restart, session persistence
    audio.js          synthesized soundscape (silent until sound is turned on)
    util.js           easing, noise, hashing
    glyphs.js         glyph atlas for the particle flower
    art.js            SVG generators: lilies, mailbox, envelope, journal illustrations
    content.js        the writing (edit this to change the words)
    scenes/
      bloom.js        glyph particles gather into a procedural 3D lily
      garden.js       garden, mailbox, envelope and letter (one continuous scene)
      journal.js      page-turning journal and the final flower
  fonts/              Caveat, Cormorant Garamond, IBM Plex Mono (SIL OFL)
```

## How it moves

* **Scene 1** is a canvas particle system. Each glyph is a sample on a real
  three-dimensional lily (six tepals on a tilted axis, stamens, stem,
  leaves), lit by a fixed moonlight direction. Particles are called in by
  distance from the heart of the flower, fly in on a curved path, settle,
  then the bud opens. Touching stirs the glyphs; they spring back. Tapping
  early hurries the bloom. The glow layer is the same picture drawn small
  and blurred.
* **Scene 2** is layered SVG: hills, mist, grass, swaying lily sprigs, a
  mailbox drawn in oblique view, fireflies on a canvas. The door is a CSS
  3D hinge with an overshoot-and-settle keyframe. The flag and the lilies
  are tappable.
* **Scene 3** uses FLIP transitions so the envelope leaves the mailbox and
  the letter leaves the envelope without a cut. The wax seal is two SVG
  halves under clip paths that split along a crack.
* **Scenes 4 and 5** are a stack of pages that rotate around the left edge.
  Pages scroll internally on short screens. Each illustration has a small
  interaction; the pressed lily on the last page blooms when touched.

## Navigation

Top left: back (puts the envelope back, turns a page back, or returns to
the previous scene). Top right: sound toggle, and a menu with replay,
the garden, read the letter again, and start from the beginning. Progress
is kept in `sessionStorage`, so a refresh keeps her place and deep links
(`#/garden`, `#/journal/4`) only open places she has already reached.

## Accessibility and performance

* `prefers-reduced-motion` shortens or removes every animation and skips the
  particle flight.
* Every interactive element is reachable by keyboard; the journal responds
  to arrow keys and swipes.
* The particle scene caps device pixel ratio at 2 and drops to 1.25 if frames
  run long. Animation loops pause when the tab is hidden.
* Total weight is about 0.5 MB, most of it fonts.
