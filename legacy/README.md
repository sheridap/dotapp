# Legacy prototype (2013)

The original jQuery + Amplify.js prototype, preserved as-is for reference. Also tagged `legacy-2013` in git.

Open `view/index.html` directly in a browser; no build step. Only the two library files the page actually loaded were kept. The full Amplify 1.1.0 tarball that used to live under `resources/lib/` is in git history at the tag.

Known defects in this code, all fixed by construction in the TypeScript port under `src/`:

- gravity is implemented twice (cell event cascade and a column collapse loop) and both dereference a null dot
- adjacency wraps rows: index 5 and 6 count as neighbors
- a single click leaves the line active forever; no document-level mouseup
- square detection fires on a one-step backtrack and does not clear the color
- mouse-only input
