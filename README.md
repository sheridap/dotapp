# DotApp

A connect-the-dots puzzle in the spirit of the 2013 iOS game Dots. Drag through orthogonally
adjacent dots of one color to clear them. Close a loop and every dot of that color clears.
Thirty moves, score is dots cleared.

Started in 2013 as a jQuery prototype. Ported in 2026 to TypeScript with a pure game model so the
rules can be tested in isolation and later ported to Swift for an iOS build.

## Run

```
npm install
npm run dev        # Vite dev server
npm test           # Vitest, model tests only
npm run lint       # ESLint + Prettier check
npm run build      # type-check + production bundle to dist/
```

## Layout

```
src/game/    pure model: board, chain rules, gravity, game state. No DOM imports.
src/ui/      DOM view (CSS grid + SVG connector), HUD, stylesheet.
src/main.ts  wires model transitions to pointer gestures and re-renders.
legacy/      the 2013 prototype, preserved as-is. See legacy/README.md.
```

The model is a set of pure functions over an immutable `GameState`. Every pointer gesture is one
transition: `pointerDown`, `pointerEnter`, `pointerUp`, `pointerCancel`. Randomness comes in through
an injected `Rng`, so tests use fixed boards and seeded refills.

## Rules as implemented

- A link must be orthogonally adjacent and the same color. Row edges do not wrap.
- Stepping back onto the previous dot undoes the last link.
- Revisiting any earlier dot in the path closes a loop. A closed loop clears the whole color, and
  the refill for that turn never uses that color.
- Releasing on a single dot clears nothing and spends no move.
- Cleared columns collapse downward and refill from the top.
