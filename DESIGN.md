# Design system

## Bixray's Live Predictor demo desk

The interface is an operate-first fixture ledger: visitors scan a match slate, then inspect one transparent model readout. Bixray's name leads the masthead and prediction desk; the demo label makes it clear that this release is a static simulation, not a live sportsbook or broadcast feed.

### Palette and type

- Paper `#f5f6f1` and white surfaces establish a bright, low-glare working canvas.
- Ink `#17241f` carries navigation and the analysis panel; citrus `#d8f36a` marks the demo system state and selected probability; cobalt `#4262e8` identifies the active sport and selected fixture.
- Coral marks simulated in-progress state. Color is always paired with explicit text.
- Use local system sans-serif stacks. Avoid remote font dependencies.

### Composition and behavior

- A compact ink masthead and high-contrast simulation notice establish product and data status before the slate.
- Fixture rows use a three-column ledger: teams and state, simulated score or start, and model lean. At desktop widths a pinned dark analysis panel sits beside the ledger; on narrower screens it follows the list in document order.
- Sport tabs, status filters, search, sorting, fixture selection, and home-advantage range control are native buttons, input, and select elements with visible focus.
- Keep synthetic fixture data separate from prediction calculations. Explain current assumptions and identify every odds value as illustrative.
- Use reduced-motion preferences and do not imply that the demo refreshes or connects to an external provider.
