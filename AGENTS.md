# BibleFlow

Visual Bible study app: organize verses, entities, timelines, and geography into interactive
graph/map canvases. React + TypeScript + Vite, Supabase (Postgres + real-time) backend,
`@xyflow/react` for graph canvases, Leaflet for the map, Tailwind for styling.

## Read these first (in this order)

1. **CODE_INDEX.md** — file-by-file navigation index (path → purpose → exports) for everything
   under `src/` and `supabase/migrations/`. Check this BEFORE globbing/grepping/reading the tree
   from scratch — it exists so you don't have to rediscover the codebase every session.
2. **KNOWLEDGE_GRAPH.md** — architecture decisions, data model, component map, and full feature
   list, in prose. Read this for *why* things are structured as they are, not just *where*.
3. **README.md** — setup, dev commands, DB schema tables, usage guide. Some of its "Project
   Structure" tree has drifted from reality (new dirs like `atlas/`, `entities/`, `map/` were
   added after it was written) — trust CODE_INDEX.md over README.md's structure section if they
   disagree.

Dev commands: `npm run dev` (port 5173), `npm run build` (tsc -b && vite build), `npm run lint`,
`npm run preview`.

## Maintaining these docs — do this, don't skip it

These three files are the project's persistent memory across sessions and terminals. A change
that isn't reflected here is invisible to the next session, which then burns tokens
re-discovering it. Update docs **in the same turn** as the code change that necessitates it —
don't defer it to "later cleanup":

- **Added / removed / renamed a file, or changed its purpose or public exports** (component
  props, hook return shape, util function signature) → update its entry in `CODE_INDEX.md`
  (add/remove/edit the `### path` block in the matching directory section).
- **Added or changed a Supabase migration** → add a one-line entry to CODE_INDEX.md's migrations
  section, in chronological/application order.
- **Changed architecture, data model, a core entity's shape, or added/removed a user-facing
  feature** → update the relevant section of `KNOWLEDGE_GRAPH.md`.
- **Changed setup steps, DB schema at the SQL level, or dev commands** → update `README.md`.
- Purely internal refactors that don't change a file's purpose or exports don't need a doc
  update.
- If you're unsure whether CODE_INDEX.md is stale, compare `git log -1 --format=%cd
  CODE_INDEX.md` against recent commits touching `src/` — if src/ has moved on since, verify
  suspect entries against the real file before trusting the index.
