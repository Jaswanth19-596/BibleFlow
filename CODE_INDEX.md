# BibleFlow Code Index

Auto-navigation index. See `KNOWLEDGE_GRAPH.md` for architecture/data-model narrative and `README.md` for setup/usage. This file exists so a fresh session can locate the right file(s) without re-globbing/re-reading the tree.

## Maintenance protocol

- This index must be updated in the SAME turn/commit as any change that adds, removes, renames, or meaningfully changes the purpose/exports of a file under `src/` or `supabase/migrations/`.
- **Adding a file**: add a new `### <path>` entry in the correct directory section, keeping alphabetical order within that section.
- **Deleting a file**: remove its entry.
- **Changing exports/purpose significantly**: update the entry in place.
- **Small internal refactors** that don't change a file's purpose or public exports do NOT require an index update.
- If unsure whether this index is stale: run `git log -1 --format=%cd CODE_INDEX.md` to see when it was last touched, then `git diff --stat <that-date> -- src/` (or just `git status`) to see if `src/` moved since. If so, treat entries touching those files as suspect and verify against the real file before trusting the index.
- Keep each entry to 2-5 lines. Always start an entry with `### <path>` (grep-friendly).

## Known inconsistencies (as of last index update)

- `EntityExplorerPage.tsx` (`src/pages/`) is **not routed** in `App.tsx` and has no nav link in `Header.tsx`. The `/entities` route does not exist despite the page being fully built. Confirm before assuming it's reachable.
- `src/components/atlas/CreateRelationshipModal.tsx` is **not imported anywhere** (`PeopleAtlas.tsx` uses an inline pending-connection prompt instead, plus `EditRelationshipModal` for edits). Likely dead code — verify with a fresh grep before relying on or deleting it.
- Two migrations are both numbered `007_*` (`007_period_band_height.sql`, `007_relationship_sort_order.sql`) — they don't conflict (different tables/columns) but confirm apply order in Supabase if it ever matters.

## Quick task → file map

| Task | File(s) |
|---|---|
| Add/change a DB table or column | `supabase/migrations/*.sql` (new file), `src/lib/types.ts`, `src/lib/supabase.ts` |
| Change topic CRUD / dashboard | `src/pages/Dashboard.tsx`, `src/hooks/useTopics.ts`, `src/components/topics/*` |
| Change verse graph canvas / nodes / dragging | `src/components/graph/VerseFlowCanvas.tsx`, `VerseNode.tsx` |
| Change verse add/edit form (incl. custom "fancy indexing" verse selection) | `src/components/graph/VerseSidebar.tsx` |
| Change verse-to-verse connections (edges, word anchors) | `src/hooks/useConnections.ts`, `src/components/graph/ConnectionEdge.tsx`, `ConnectionPopover.tsx` |
| Change cross-topic links / network view | `src/pages/TopicsNetwork.tsx`, `src/hooks/useTopicLinks.ts`, `src/components/graph/CrossTopicEdge.tsx` |
| Change entity tagging on verses | `src/components/entities/TagEntityModal.tsx`, `EntityChipBar.tsx`, `EntityTag.tsx`, `src/hooks/useEntityMentions.ts` |
| Change Entity Explorer page | `src/components/entities/EntityExplorer.tsx`, `EntityDetailSidebar.tsx` (⚠ page not routed, see above) |
| Change People Atlas (family tree/timeline) | `src/components/atlas/PeopleAtlas.tsx`, `PersonNode.tsx`, `RelationshipEdge.tsx`, `TimelineBands.tsx`, `src/hooks/usePeopleAtlas.ts`, `useTimelinePeriods.ts` |
| Change Biblical Map | `src/components/map/BibleMap.tsx`, `MapSearchBar.tsx`, `MapSidebar.tsx`, `TerritoryEvidenceCard.tsx`, `PassageMapPanel.tsx`, `TravelInsightPanel.tsx`, `CreatePlaceModal.tsx`, `src/lib/passagePlaces.ts`, `src/lib/territorySearch.ts`, `src/lib/travelInsights.ts`, `src/data/biblicalAreas.ts`, `src/data/biblicalPlaces.ts`, `src/data/biblicalTerritories.ts` |
| Change global verse search | `src/pages/SearchPage.tsx`, `searchVerses()` in `src/lib/supabase.ts` |
| Change routing / page shell / nav | `src/App.tsx`, `src/components/layout/AppShell.tsx`, `Header.tsx`, `Sidebar.tsx` |
| Change Bible text fetching (KJV) | `src/lib/bibleApi.ts`, `src/lib/bibleWorker.ts` (web worker), `public/kjv.json` |
| Change Bible book/chapter/verse metadata or validation | `src/lib/bibleBooks.ts` |
| Change edge/verse/entity color palettes | `src/lib/edgeTypes.ts` |
| Change PWA/service worker/install behavior | `vite.config.ts` (VitePWA config), `src/hooks/usePWA.ts` |
| Change Tailwind theme/dark mode | `tailwind.config.js`, `src/styles/index.css` |
| Change shared UI primitives (buttons, inputs, modals) | `src/components/common/*` |

## src/

### src/App.tsx
Root component. Wraps everything in `ReactFlowProvider` and defines all routes via `react-router-dom`. Routes: `/` → Dashboard, `/topic/:id` → TopicGraphView, `/topics/network` → TopicsNetwork, `/search` → SearchPage, `/atlas` → ContextAtlasPage, `/map` → MapAtlasPage. **No `/entities` route** (see Known Inconsistencies).

### src/main.tsx
App entry point. Sets up `QueryClientProvider` (React Query) and `BrowserRouter`, renders `<App />` into `#root`.

### src/vite-env.d.ts
Vite client type reference + `ImportMetaEnv` typing for `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## src/pages/

### src/pages/ContextAtlasPage.tsx
Thin wrapper — renders `<PeopleAtlas />`. Route: `/atlas`.

### src/pages/Dashboard.tsx
Topics listing page (route `/`). Fetches topics via `useTopics()`, verse/connection counts per topic via `getVerseCountByTopic`/`getConnectionCountByTopic`. Renders `TopicSearchBar`, `TopicGrid`, `NewTopicModal`, `EditTopicModal`, `ConfirmDialog`.

### src/pages/EntityExplorerPage.tsx
Thin wrapper — renders `<EntityExplorer />`. **Not currently routed anywhere in `App.tsx`.**

### src/pages/MapAtlasPage.tsx
Thin wrapper — renders `<BibleMap />` in a full-height container. Route: `/map`.

### src/pages/SearchPage.tsx
Global verse search page (route `/search`). Debounced (300ms) search via `searchVerses()`, groups results by topic, click navigates to `/topic/:id?highlight=:verseId`.

### src/pages/TopicGraphView.tsx
Main per-topic graph page (route `/topic/:id`). Orchestrates verses, connections, topic links, entity mentions, in-topic search, PNG export (`html-to-image`), topic rename, and a legacy verse-text migration effect (upgrades old plain-text verses to `[ch:v]` format on load). Contains a local `LinkTopicModal` for cross-topic linking. Renders `VerseFlowCanvas`, `VerseSidebar`, `ConnectionPopover`, `TagEntityModal`, `EntityDetailSidebar`.

### src/pages/TopicsNetwork.tsx
Topic network graph page (route `/topics/network`). Self-contained React Flow instance (not `VerseFlowCanvas`) with a local `TopicNodeComponent`. Persists node positions to `localStorage` (`topicsNetworkPositions`). Drag between topic nodes → create `TopicLink`; click an edge → edit/delete via inline modals.

## src/components/atlas/

### src/components/atlas/CreatePeriodModal.tsx
Modal for creating/editing a `TimelinePeriod`. Handles insert-at-position (beginning/after-X/end) on create, and Move Up/Down reordering on edit — both via the `onReorder` batch-update callback. Includes delete.

### src/components/atlas/CreatePersonModal.tsx
Simple modal for creating/editing a person `Entity` (name + description only; color defaults to `ENTITY_TYPE_COLORS.person`).

### src/components/atlas/CreateRelationshipModal.tsx
Modal for creating an `EntityRelationship` between two people, with autocomplete suggestions from `SUGGESTED_TYPES` + existing relationship types. **Not imported/used anywhere** — `PeopleAtlas.tsx` uses its own inline pending-connection UI instead. Likely dead code.

### src/components/atlas/EditRelationshipModal.tsx
Modal for editing/deleting an existing `EntityRelationship`'s type and description. Used by `PeopleAtlas.tsx`.

### src/components/atlas/PeopleAtlas.tsx
Main People Atlas canvas (React Flow). Combines `usePeopleAtlas()` (people/relationships/periods) with `getEntityMentionsWithBooks()` (mention counts). Renders `PersonNode`s + `RelationshipEdge`s over `TimelineBands`. Dragging a person into a band auto-assigns `timeline_period_id` via `findPeriodForY()`. Drawing a connection opens an inline relationship-type prompt (quick-select buttons + free text) rather than a modal.

### src/components/atlas/PersonNode.tsx
React Flow node for a person: avatar-initial circle, name, mention count, description, hover-only edit/delete buttons. Exports `PersonNodeData` type. 4-sided handles (top/left/bottom/right, source+target each).

### src/components/atlas/RelationshipEdge.tsx
React Flow edge for person-to-person relationships. Dashed gray line, label shows `type` with spaces (hyphens replaced), click opens edit via `data.onEdit`.

### src/components/atlas/TimelineBands.tsx
Renders SVG background bands per `TimelinePeriod` (colored, semi-transparent, sticky left label) as a React Flow child (`className="react-flow__background"`, `zIndex:-1`). Implements custom pointer-based drag-to-resize on each band's bottom edge (`MIN_BAND_HEIGHT = 120`), calling `onResizePeriod(periodId, newHeight)` on release. Also exported as named `{ TimelineBands }`.

## src/components/common/

### src/components/common/Button.tsx
Generic button. `variant`: primary/secondary/danger/ghost. `size`: sm/md/lg. Forwards ref.

### src/components/common/ConfirmDialog.tsx
Wraps `Modal` with a confirm/cancel footer. `variant`: danger/primary.

### src/components/common/Input.tsx
Text input with optional `label` and `error`. Forwards ref.

### src/components/common/Modal.tsx
Portal-based modal (renders into `document.body`). Handles Escape-to-close and body scroll lock. `size`: sm/md/lg.

### src/components/common/Select.tsx
`<select>` wrapper with `label`, `error`, `options: {value,label}[]`, `placeholder`. Forwards ref.

## src/components/entities/

### src/components/entities/EntityChipBar.tsx
Renders a row of `EntityTag` chips for a verse's mentions, plus a "+" add-tag button. Returns `null` if no mentions and no `onAddClick`. Used inside `VerseNode`.

### src/components/entities/EntityDetailSidebar.tsx
Fixed right-side panel showing one entity's relationships (via `getEntityRelationships` query) and verse mentions grouped by topic (via `useEntityMentions`). Click a mention navigates to `/topic/:id`.

### src/components/entities/EntityExplorer.tsx
Full entity browser: search + type-filter pills, grouped grid by `EntityType`, delete confirmation. Contains local `EntityCard` component. Opens `EntityDetailSidebar` on click. Used by `EntityExplorerPage` (currently unrouted).

### src/components/entities/EntityTag.tsx
Single pill-shaped entity chip (icon + name), optional `compact` sizing, optional remove button (shows on hover).

### src/components/entities/TagEntityModal.tsx
Modal to tag an entity onto a verse: pick mention `context`, search/select an existing entity, or inline-create a new one via `useEntities().createEntity`. Used by `TopicGraphView`.

## src/components/graph/

### src/components/graph/ConnectionEdge.tsx
React Flow edge type `connection`. Bezier path colored by `EDGE_COLORS[type]` (overridden by `anchor_color` if set). Label shows custom `label` or type label + optional word-anchor badge; click opens edit via `data.onEdit`. Exported default (`memo`) + named `{ ConnectionEdgeComponent }`.

### src/components/graph/ConnectionPopover.tsx
Inline popover for editing a `Connection`: type select, optional label, word-anchor display/color-swap/remove (`ANCHOR_COLOR_PALETTE`), delete with confirm step.

### src/components/graph/CrossTopicEdge.tsx
React Flow edge type `crossTopic`. Dashed blue bezier line for `TopicLink`s inside a per-topic graph, label shows `description`, click via `data.onClick`.

### src/components/graph/VerseFlowCanvas.tsx
Core per-topic React Flow canvas. Registers node type `verse` (`VerseNode`) and edge types `connection`/`crossTopic`. Owns word-anchor selection state (`pendingAnchor`), builds nodes/edges from `verses`/`connections`/`topicLinks` with change-detection to avoid unnecessary React Flow node resets, computes optimal handle sides via `getOptimalHandles()`, debounces position saves (500ms via `useDebouncedCallback`), and implements search highlighting (`searchQuery` prop, ≥2 chars activates). `onConnect` auto-flips source/target if the pending anchor is on the drag target.

### src/components/graph/VerseNode.tsx
React Flow node type `verse`. Renders per-line verse text (parses `[ch:v]` prefix → superscript), per-word click-to-anchor (`buildAnchorKey`/`parseAnchorKey` from `lib/utils.ts`), search-match highlighting, pending/established anchor styling, and embeds `EntityChipBar`. 4-sided handles. Exports `AnchorHighlight` and `VerseNodeData` types; default export wrapped in `memo`.

### src/components/graph/VerseSidebar.tsx
Add/Edit verse form with two modes: **Standard Range** (book/chapter/verse_start/verse_end, KJV text auto-fetched via `fetchKjvVerseRange`) and **Custom Selection** ("fancy indexing" — comma-separated `ch:v` / `ch:v-v` list, optionally prefixed with a book name, parsed by local `parseCustomVerseInput()`/`extractBookPrefix()`, fetched via `fetchKjvCustomVerses`). Custom mode saves with sentinel `chapter=0, verse_start=0, verse_end=null`. Also handles verse `type` and personal `note`.

## src/components/layout/

### src/components/layout/AppShell.tsx
Top-level layout: `Header` + main content area + optional slide-in `Sidebar` (controlled via `showSidebar`/`sidebarContent`/`onCloseSidebar` props — currently unused by any page, all pages render their own overlays instead).

### src/components/layout/Header.tsx
Top nav bar. Nav items: Topics (`/`), Network (`/topics/network`), People (`/atlas`), Map (`/map`), Search (`/search`). **No Entities nav link.** Shows offline badge (`usePWA().isOffline`) and Install button (`usePWA().canInstall`).

### src/components/layout/Sidebar.tsx
Generic slide-in right sidebar shell (close button + scrollable content area). Used via `AppShell`'s `sidebarContent` prop (currently unused elsewhere).

## src/components/map/

### src/components/map/BibleMap.tsx
Main Leaflet map component (route `/map` via `MapAtlasPage`). Imperative Leaflet setup in refs (not react-leaflet declarative API) — map, tile layer, book-filtered biblical-location pins, passage-highlight pins, personal markers, saved-person routes, and temporary travel-insight route layers are managed via `useEffect` + refs. Full-bleed map layout with `MapSidebar` overlaying from the left and a floating active study badge when passage or travel insights are active.

### src/components/map/CreatePlaceModal.tsx
Custom fixed-overlay modal (name + description) for either naming a newly placed location or editing an existing saved place. Not built on the shared `Modal` component.

### src/components/map/MapSearchBar.tsx
Bible-aware map search embedded in the left map sidebar. Searches saved places, the current book-filtered `BIBLICAL_PLACE_CLUSTERS` names/aliases (and cited references), and the local historical-territory catalog; deliberately never falls back to external geocoding. Ranks exact/canonical matches first, supports keyboard navigation, and exports `SearchContext` for `BibleMap.handleFlyTo`.

### src/components/map/MapSidebar.tsx
Collapsible left-side map dock. Exports `BibleRegion` and `BIBLE_REGIONS` for focused map views; contains Explore, Passage, Journey, and Library accordions, saved-place management, and separately labeled person routes. It renders a compact territory evidence card immediately below map search so territory context never blocks the map.

### src/components/map/TerritoryEvidenceCard.tsx
Compact in-sidebar evidence card for a selected historical people or kingdom. Distinguishes source confidence bands, source rough outlines, attested-site lenses, and truly unresolved groups; shows references/source attribution without blocking the map. Exports `TerritoryEvidenceCard`.

### src/components/map/PassageMapPanel.tsx
Sidebar panel for mapping places in a selected Bible book, chapter, or verse range. Selects a book/chapter/range, validates against `BIBLE_BOOKS`, invokes the local passage query, and lists matched places with their exact verse references inline.

### src/components/map/TravelInsightPanel.tsx
Sidebar journey-planning panel. Offers searchable From/To selectors across biblical and saved places, then presents direct, overland, and historical-corridor study options with estimated walking days, terrain context, and an explicit uncertainty note inline.

## src/components/topics/

### src/components/topics/EditTopicModal.tsx
Edit form for an existing `Topic` (name, description, color — presets + custom picker). Structurally near-identical to `NewTopicModal`.

### src/components/topics/NewTopicModal.tsx
Create form for a new `Topic` (name, description, color — presets + custom picker).

### src/components/topics/TopicCard.tsx
Dashboard grid card: color dot, updated-at date, kebab menu (edit/delete), name, description, verse/connection counts. Wrapped in a `Link` to `/topic/:id`.

### src/components/topics/TopicGrid.tsx
Grid layout for `TopicCard`s with loading skeleton state and empty state.

### src/components/topics/TopicSearchBar.tsx
Simple controlled search input for filtering the Dashboard topic list (no debounce — filtering happens client-side in `Dashboard.tsx`).

## src/data/

### src/data/biblicalAreas.ts
Static, deliberately approximate historical study-area polygons (Canaan, Egypt/Sinai, Mesopotamia/exile, Roman-era Judea/Galilee/Perea, and Mediterranean churches). Exports `BiblicalArea` and `BIBLICAL_AREAS`; the map shows applicable translucent areas when a Bible book is selected.

### src/data/biblicalTerritories.ts
Vetted historical evidence catalog used by the Kingdoms & Peoples map search. Embeds unchanged OpenBible CC-BY 4.0 isobands plus the sourced Hatti rough outline; provides site-based lenses for the Hivite Gibeonite towns and Amorite historical centers, and explicit unresolved records for groups that cannot be responsibly mapped. Exports selection/data types, `SOURCE_BACKED_TERRITORIES`, `SITE_BACKED_HISTORICAL_LENSES`, and `GROUPS_WITHOUT_SOURCE_BACKED_TERRITORY`.

### src/data/biblicalPlaces.ts
OpenBible.info (CC-BY) raw place dictionary plus curated regional/common-place additions and 72 current-source supplements with a cited verse and coordinate. Exports raw `BiblicalPlace`/`BIBLICAL_PLACES`, normalized `BiblicalPlaceCluster`/`BIBLICAL_PLACE_CLUSTERS`, and count constants. Clusters consolidate coordinate duplicates and nearby alternate estimates, retain aliases/references, per-book names/references/mention counts, and importance tiers for the map/search UI.

## src/hooks/

### src/hooks/useConnections.ts
React Query + Supabase CRUD/subscription hook for `Connection`s scoped to a `topicId`. Real-time handler checks whether the changed connection's `from`/`to` verse belongs to the currently-cached verse set before invalidating (avoids cross-topic invalidation noise). Returns `{ connections, loading, error, createConnection, updateConnection, deleteConnection, refetch }`.

### src/hooks/useDebounce.ts
Exports `useDebounce<T>(value, delay)` (debounced value) and `useDebouncedCallback(callback, delay)` (debounced function, cleans up timeout on unmount).

### src/hooks/useEntities.ts
React Query + Supabase CRUD/subscription hook for `Entity` records (global, not scoped). Returns `{ entities, loading, error, createEntity, updateEntity, deleteEntity, searchEntities, refetch }`.

### src/hooks/useEntityMentions.ts
Exports two hooks: `useVerseMentions(verseId)` (mentions for one verse, with create/delete mutations — used by `VerseNode`/`TopicGraphView` flow) and `useEntityMentions(entityId)` (read-only, all mentions for one entity — used by `EntityDetailSidebar`).

### src/hooks/usePeopleAtlas.ts
Composite hook combining `useEntities()` (filtered to `type==='person'`), `useTimelinePeriods()`, and `entity_relationships` CRUD (global query key `entity-relationships-all`). Also exposes `savePosition`/`assignPeriod` mutations. Used by `PeopleAtlas.tsx` and `BibleMap.tsx` (for relationships only).

### src/hooks/usePWA.ts
Tracks online/offline (`navigator.onLine` + events), install-prompt availability (`beforeinstallprompt`), and installed/standalone state. Returns `{ isOffline, canInstall, isInstalled, install, isPWA }`. Used by `Header.tsx`.

### src/hooks/useTimelinePeriods.ts
React Query + Supabase CRUD/subscription hook for `TimelinePeriod`s. Returns `{ periods, loading, error, createPeriod, updatePeriod, deletePeriod, reorderPeriods }` — `reorderPeriods` batch-updates `sort_order` for multiple periods at once.

### src/hooks/useTopicLinks.ts
React Query + Supabase CRUD/subscription hook for `TopicLink`s (global, not scoped to one topic). Returns `{ links, loading, error, createTopicLink, updateTopicLink, deleteTopicLink, refetch }`.

### src/hooks/useTopics.ts
React Query + Supabase CRUD/subscription hook for `Topic`s. Returns `{ topics, loading, error, createTopic, updateTopic, deleteTopic, refetch }`.

### src/hooks/useVerses.ts
React Query + Supabase CRUD/subscription hook for `Verse`s scoped to a `topicId`. `updateVersePosition` uses optimistic update (`onMutate`) with rollback on error — used for drag-to-save on the canvas. Returns `{ verses, loading, error, createVerse, updateVerse, updateVersePosition, deleteVerse, refetch }`.

## src/lib/

### src/lib/bibleApi.ts
Client-facing Bible-text-fetch API. Spins up a singleton Web Worker (`bibleWorker.ts`) and communicates via `postMessage`/job-id promise map. Exports `fetchKjvVerse(book, chapter, verse)`, `fetchKjvVerseRange(book, chapter, verseStart, verseEnd)`, `fetchKjvBook(book)` (full local book for map coverage), `fetchKjvCustomVerses(book, selections: VerseSelection[])` (the "fancy indexing" entry point), and `VerseSelection` interface.

### src/lib/bibleBooks.ts
Static `BIBLE_BOOKS` array (all 66 books: name/abbrev/testament/group/chapters/versesPerChapter). Exports `BibleBook` interface and helpers: `getBookByName()`, `getBookAbbrev()`, `getVersesInChapter()`, `validateVerseRef()`, `validateVerseRange()`, `formatVerseRef()` (handles `chapter===0` custom-verse sentinel → `"Book (custom)"`).

### src/lib/bibleWorker.ts
Web Worker (module worker, loaded by `bibleApi.ts` via `new Worker(new URL(...))`). Lazily fetches and caches `/kjv.json` (local full-KJV dataset, not `bible-api.com` despite the name — despite README's claim of external API, actual verse lookups run fully offline against this local dataset). Handles `fetchKjvVerseRange`, `fetchKjvBook`, and `fetchKjvCustomVerses` message types, returning multi-line `[ch:v] text` strings.

### src/lib/passagePlaces.ts
Pure passage-to-map matching utility. Exports selection/study/match types plus `findPlacesInPassage()` and `findPlacesInBook()`, which join local KJV `[chapter:verse]` text with catalog references and safe biblical-name matching (including selected KJV spelling variants); also formats passage and matched-verse labels for map UI.

### src/lib/territorySearch.ts
Pure local search/ranking utility for historical peoples and kingdoms. Exports `TerritorySearchResult`, `hasMappedHistoricalEvidence()`, and `searchHistoricalTerritories()`, which return source-backed geometry, attested-site lenses, or explicitly unresolved evidence records without using external geocoding.

### src/lib/edgeTypes.ts
Color/label constant maps: `EDGE_COLORS`/`EDGE_LABELS` (by `ConnectionType`), `CROSS_TOPIC_COLOR`, `EDGE_STYLE`, `VERSE_TYPE_COLORS`, `ANCHOR_COLOR_PALETTE` (8-color palette for word anchors, distinct from edge colors), `ENTITY_TYPE_COLORS`/`ENTITY_TYPE_ICONS`/`ENTITY_TYPE_LABELS` (by `EntityType`), `ENTITY_RELATION_LABELS` (static map — note: since `EntityRelationType` is now free-form string, this map is only a fallback/legacy set of labels, not exhaustive).

### src/lib/supabase.ts
All Supabase client setup + every DB query/mutation/subscription function in the app (topics, verses, connections, topic_links, search, entities, entity_mentions, entity_relationships, timeline_periods, atlas helpers). ~550 lines, organized in commented sections. Real-time subscriptions use `supabase.channel(name-with-random-suffix).on('postgres_changes', ...)`. Also exports `AtlasEntityMention` interface and `getEntityMentionsWithBooks()` (joined query used by `PeopleAtlas` for mention counts).

### src/lib/travelInsights.ts
Pure geography/study-estimate utility for the map. Exports travel place, route option, and insight types plus haversine distance, terrain-context heuristics, walking-day ranges, and three intentionally approximate direct/overland/corridor options.

### src/lib/types.ts
All shared TypeScript interfaces/types: `VerseType`, `ConnectionType`/`EdgeType`, `Topic`, `Verse`, `Connection`, `TopicLink`, `VerseWithTopic`, `EntityType`, `EntityMentionContext`, `EntityRelationType` (= `string`), `Entity`, `EntityMention`, `EntityMentionWithEntity`, `EntityMentionWithVerse`, `EntityRelationship`, `TimelinePeriod`.

### src/lib/utils.ts
Small helpers: `formatDate()`, `buildAnchorKey(cleanWord, occurrenceIndex)` / `parseAnchorKey(anchorKey)` (word-anchor composite-key codec, handles duplicate words in a verse via occurrence index; legacy fallback for anchors without an index).

## src/styles/

### src/styles/index.css
Tailwind directives + global resets + extensive React Flow customization (handle styling/hover states, per-side handle offsets) + custom animations (`animate-in slide-in-from-right`, atlas expand, etc.) + `.verse-node`/`.person-node`/`.entity-chip-bar`/search-highlight styles. Not exhaustively inventoried line-by-line — check directly for exact class definitions when styling.

## supabase/migrations/

Chronological order (by filename prefix):

1. `001_initial_schema.sql` — Core schema: `topics`, `verses`, `connections`, `topic_links`. Indexes, full-text search index on verses, RLS disabled (single-user app), realtime enabled, `updated_at` triggers.
2. `002_word_anchors.sql` — Adds `anchor_word`, `anchor_color` columns to `connections`.
3. `003_entities.sql` — Entity system: `entities`, `entity_mentions`, `entity_relationships` tables (with a now-superseded CHECK constraint on relationship `type`, removed in 005). RLS disabled, realtime enabled, `updated_at` trigger for entities.
4. `004_people_atlas.sql` — Adds `timeline_periods` table; adds `timeline_period_id`, `atlas_x`, `atlas_y` to `entities`. RLS **enabled** on `timeline_periods` with an allow-all policy (inconsistent with the disabled-RLS pattern elsewhere).
5. `005_remove_relationship_type_check.sql` — Drops the CHECK constraint on `entity_relationships.type` (via constraint-name lookup fallback) so relationship types can be free-form strings.
6. `006_entity_coordinates.sql` — Adds `lat`, `lng` (NUMERIC) to `entities` + index, for the Biblical Map.
7. `007_period_band_height.sql` — Adds `band_height` (INTEGER, default 300) to `timeline_periods`, for resizable timeline bands.
7. `007_relationship_sort_order.sql` — Adds `sort_order` (INTEGER, default 0) to `entity_relationships`, for ordering a person's travel route on the Biblical Map. **Shares prefix `007` with the file above** — both are additive/independent (different tables), so apply order between the two doesn't matter, but be aware the numbering collides if a script assumes strict ordering.

## Config files

- **package.json** — Vite + React 18 + TypeScript app named `bible-flow`. Key deps: `@xyflow/react` (graph canvas), `@supabase/supabase-js`, `@tanstack/react-query`, `react-router-dom` v6, `leaflet`/`react-leaflet` (map — though `BibleMap.tsx` uses imperative `leaflet` directly, not `react-leaflet` components), `html-to-image` (PNG export), `kjv` (npm package, though actual verse data is served from `public/kjv.json`, not this package — verify which is actually used before assuming). Scripts: `dev`, `build` (`tsc -b && vite build`), `lint`, `preview`.
- **vite.config.ts** — `@` path alias → `./src`. `vite-plugin-pwa` with `autoUpdate` registration, full manifest (name "Bible Flow"), Workbox runtime caching: CacheFirst for `bible-api.com` (30-day, up to 1000 entries — legacy, see `bibleWorker.ts` note above about actually using local `kjv.json`), NetworkFirst for `*.supabase.co` (1-day, up to 500 entries).
- **tailwind.config.js** — `darkMode: 'class'`. Custom `edge.*` and `verse.*` color extensions mirroring `src/lib/edgeTypes.ts` (kept in sync manually — not imported from TS, duplicated by hand).
- **tsconfig.json** — Root project-references config pointing to `tsconfig.app.json` + `tsconfig.node.json`.
- **tsconfig.app.json** — App source config (target ES2020, strict, `noUnusedLocals`/`noUnusedParameters` on). `@/*` → `./src/*` path alias (mirrors Vite alias).
- **tsconfig.node.json** — Config for Vite config file itself (target ES2022, no path alias needed).
- **index.html** — Vite entry HTML. PWA meta tags (apple-mobile-web-app-*, theme-color `#4f46e5`), loads `/src/main.tsx` as a module script.
- **postcss.config.js** — Standard `tailwindcss` + `autoprefixer` plugins.
