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
| Change Biblical Map | `src/components/map/BibleMap.tsx`, `HistoricalPlaceDetails.tsx`, `MapSearchBar.tsx`, `MapSidebar.tsx`, `TerritoryEvidenceCard.tsx`, `PassageMapPanel.tsx`, `TravelInsightPanel.tsx`, `CreatePlaceModal.tsx`, `src/lib/mapClustering.ts`, `src/lib/passagePlaces.ts`, `src/lib/territorySearch.ts`, `src/lib/travelInsights.ts`, `src/data/biblicalAreas.ts`, `src/data/biblicalPlaces.ts`, `src/data/generated/openBiblePlaces.json`, `src/data/biblicalTerritories.ts` |
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
Root component. Defines routes inside `Suspense`; Dashboard is eager, graph/network/search/people/map pages are lazy. The topic graph owns its ReactFlowProvider, keeping React Flow out of dashboard startup. **No `/entities` route** (see Known Inconsistencies).

### src/main.tsx
App entry point. Sets up `QueryClientProvider` (React Query) and `BrowserRouter`, renders `<App />` into `#root`.

### src/vite-env.d.ts
Vite client type reference + `ImportMetaEnv` typing for `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.

## src/pages/

### src/pages/ContextAtlasPage.tsx
Thin wrapper — renders `<PeopleAtlas />`. Route: `/atlas`.

### src/pages/Dashboard.tsx
Topics listing page (route `/`). Fetches topics via `useTopics()` and cached batched counts through `getTopicCounts()` (migration 009; bounded legacy fallback). Renders `TopicSearchBar`, `TopicGrid`, `NewTopicModal`, `EditTopicModal`, `ConfirmDialog`.

### src/pages/EntityExplorerPage.tsx
Thin wrapper — renders `<EntityExplorer />`. **Not currently routed anywhere in `App.tsx`.**

### src/pages/MapAtlasPage.tsx
Thin wrapper — renders `<BibleMap />` in a full-height container. Route: `/map`.

### src/pages/SearchPage.tsx
Global verse search page (route `/search`). Debounced (300ms) search via `searchVerses()`, groups results by topic, click navigates to `/topic/:id?highlight=:verseId`.

### src/pages/TopicGraphView.tsx
Main per-topic graph page (route `/topic/:id`), exported through a local ReactFlowProvider wrapper. Loads entity mentions by topic in pages, and imports PNG export code on demand. Orchestrates verses, connections, topic links, entity mentions, in-topic search, PNG export (`html-to-image`), topic rename, and a legacy verse-text migration effect (upgrades old plain-text verses to `[ch:v]` format on load). Contains a local `LinkTopicModal` for cross-topic linking. Renders `VerseFlowCanvas`, `VerseSidebar`, `ConnectionPopover`, `TagEntityModal`, `EntityDetailSidebar`.

### src/pages/TopicsNetwork.tsx
Topic network graph page (route `/topics/network`). Self-contained React Flow instance (not `VerseFlowCanvas`) with a local `TopicNodeComponent`. Persists node positions to `localStorage` (`topicsNetworkPositions`). Drag between topic nodes → create `TopicLink`; click an edge → edit/delete via inline modals.

## src/components/atlas/

### src/components/atlas/AtlasSearch.tsx
Accessible debounced-search result UI with keyboard selection, typed result rows, loading/empty states, clear and Show more. Receives the query/results and explicit selection callback.

### src/components/atlas/CreatePeriodModal.tsx
Modal for creating/editing a `TimelinePeriod`. Handles insert-at-position (beginning/after-X/end) on create, and Move Up/Down reordering on edit — both via the `onReorder` batch-update callback. Includes delete.

### src/components/atlas/CreatePersonModal.tsx
Async create/edit entity dialog for every EntityType plus group/institution/divine subtypes in metadata. Exports `AtlasEntityInput`; supports qualifiers, aliases, deliberate same-name identities and retained input on save failure.

### src/components/atlas/EntityPicker.tsx
Searchable labeled native entity selector used in relationship and parent editors. Searches names, aliases, qualifiers, types and subtypes; excludes a specified endpoint and distinguishes same-name records.

### src/components/atlas/FamilyJunctionNode.tsx
Fixed-size derived React Flow junction for shared parents. Opens its original assertions; never saves as an entity or receives a timeline assignment.

### src/components/atlas/PeopleAtlas.tsx
Provider-wrapped Atlas with Family/All relationships views, searchable entities/types/assertions/references, explicit camera focus, temporary result reveal, category/type/entity/period/status filters, bundles and immediate-neighbor focus. Derives shared-parent branches from confirmed direct assertions, preserves manual positions, and exposes shared editors and timeline controls. New entities spawn at the current canvas viewport center and are temporarily revealed through active filters. Starts in All relationships; non-family saves switch to that view and preserve earlier save reveals and expanded pair labels.

### src/components/atlas/PersonNode.tsx
Memoized card for any Atlas entity with type/subtype, qualifier, mentions and keyboard/touch Inspect action. The card body, name and avatar all allow dragging; a normal click opens details. Four-sided source/target handles. Exports `PersonNodeData`; management actions live in the Atlas detail panel.

### src/components/atlas/RelationshipEdge.tsx
Directional/category-styled relationship edge or orthogonal family segment. Exports `RelationshipEdgeData`; supports expanded path offsets, assertion-status dashes, selection and zoom-aware keyboard/touch labels.

### src/components/atlas/RelationshipEditor.tsx
Shared asynchronous create/edit/delete relationship dialog. Searchable endpoints and type suggestions, arbitrary custom definitions/categories/symmetry, statement/direction preview, status/period/parentage context and validated structured Scripture evidence. Duplicate checks and save failures retain input; required `onOpenExisting` opens/reveals the recorded assertion from a duplicate warning.

### src/components/atlas/SetParentsModal.tsx
Searchable one/two-parent shortcut with explicit direct-parentage confirmation, nature and period context. Uses one atomic save; existing unrelated assertions and evidence are preserved.

### src/components/atlas/TimelineBands.tsx
Renders SVG background bands per `TimelinePeriod` (colored, semi-transparent, sticky left label) as a React Flow child (`className="react-flow__background"`, `zIndex:-1`). Implements custom pointer-based drag-to-resize on each band's bottom edge (`MIN_BAND_HEIGHT = 120`), calling `onResizePeriod(periodId, newHeight)` on release. Also exported as named `{ TimelineBands }`.

### src/components/atlas/atlas.css
Scoped Atlas layout and visual system: paper/ink toolbar, search, responsive filters, desktop details pane/phone lower pane, typed edge labels, family junctions and light/dark presentation.

## src/components/common/

### src/components/common/Button.tsx
Generic button. `variant`: primary/secondary/danger/ghost. `size`: sm/md/lg. Forwards ref.

### src/components/common/ConfirmDialog.tsx
Wraps `Modal` with a confirm/cancel footer. `variant`: danger/primary.

### src/components/common/Input.tsx
Text input with optional `label` and `error`. Forwards ref.

### src/components/common/Modal.tsx
Portal-based modal (renders into `document.body`). Includes labeled dialog semantics, keyboard focus trapping/restoration, Escape-to-close and body scroll lock. A ref keeps close callbacks current without restarting focus on form updates. `size`: sm/md/lg.

### src/components/common/Select.tsx
`<select>` wrapper with `label`, `error`, `options: {value,label}[]`, `placeholder`. Forwards ref.

## src/components/entities/

### src/components/entities/EntityChipBar.tsx
Renders a row of `EntityTag` chips for a verse's mentions, plus a "+" add-tag button. Returns `null` if no mentions and no `onAddClick`. Used inside `VerseNode`.

### src/components/entities/EntityDetailSidebar.tsx
Fixed right-side panel showing full source → relationship → target statements (via `getEntityRelationships` query) and verse mentions grouped by topic (via `useEntityMentions`). Click a mention navigates to `/topic/:id`.

### src/components/entities/EntityExplorer.tsx
Full entity browser: search + type-filter pills, grouped grid by `EntityType`, delete confirmation. Contains local `EntityCard` component. Opens `EntityDetailSidebar` on click. Used by `EntityExplorerPage` (currently unrouted).

### src/components/entities/EntityTag.tsx
Single pill-shaped entity chip (icon + name; qualifier in tooltip), optional `compact` sizing, optional remove button (shows on hover).

### src/components/entities/TagEntityModal.tsx
Modal to tag an entity onto a verse: alias/qualifier-aware search and distinct same-name confirmation with save errors. Pick mention `context`, search/select an existing entity, or inline-create a new one via `useEntities().createEntity`. Used by `TopicGraphView`.

## src/components/graph/

### src/components/graph/ConnectionEdge.tsx
React Flow edge type `connection`. Bezier path colored by `EDGE_COLORS[type]` (overridden by `anchor_color` if set). Label shows custom `label` or type label + optional word-anchor badge; click opens edit via `data.onEdit`. Exported default (`memo`) + named `{ ConnectionEdgeComponent }`.

### src/components/graph/ConnectionPopover.tsx
Inline popover for editing a `Connection`: type select, optional label, word-anchor display/color-swap/remove (`ANCHOR_COLOR_PALETTE`), delete with confirm step.

### src/components/graph/CrossTopicEdge.tsx
React Flow edge type `crossTopic`. Dashed blue bezier line for `TopicLink`s inside a per-topic graph, label shows `description`, click via `data.onClick`.

### src/components/graph/VerseFlowCanvas.tsx
Core per-topic React Flow canvas. Registers node type `verse` (`VerseNode`) and edge types `connection`/`crossTopic`. Owns word-anchor selection state (`pendingAnchor`), builds nodes/edges from `verses`/`connections`/`topicLinks` with change-detection to avoid unnecessary React Flow node resets, computes optimal handle sides via `getOptimalHandles()`, saves positions once per completed drag without a shared debounce, and implements search highlighting (`searchQuery` prop, ≥2 chars activates). `onConnect` auto-flips source/target if the pending anchor is on the drag target.

### src/components/graph/VerseNode.tsx
React Flow node type `verse`. Renders per-line verse text (parses `[ch:v]` prefix → superscript), per-word click-to-anchor (`buildAnchorKey`/`parseAnchorKey` from `lib/utils.ts`), search-match highlighting, pending/established anchor styling, and embeds `EntityChipBar`. 4-sided handles. Exports `AnchorHighlight` and `VerseNodeData` types; default export wrapped in `memo`.

### src/components/graph/VerseSidebar.tsx
Add/Edit verse form with two modes: **Standard Range** (book/chapter/verse_start/verse_end, KJV text auto-fetched via `fetchKjvVerseRange`) and **Custom Selection** ("fancy indexing" — comma-separated `ch:v` / `ch:v-v` list, optionally prefixed with a book name, parsed by local `parseCustomVerseInput()`/`extractBookPrefix()`, fetched via `fetchKjvCustomVerses`). Custom mode saves with sentinel `chapter=0, verse_start=0, verse_end=null`. Also handles verse `type` and personal `note`.

## src/components/layout/

### src/components/layout/AppShell.tsx
Top-level layout: `Header` + main content area + optional slide-in `Sidebar` (controlled via `showSidebar`/`sidebarContent`/`onCloseSidebar` props — currently unused by any page, all pages render their own overlays instead).

### src/components/layout/Header.tsx
Persistent top nav bar, including on the map. Nav items: My topics (`/`), Connections (`/topics/network`), People (`/atlas`), Bible map (`/map`), Search (`/search`). **No Entities nav link.** Shows offline badge (`usePWA().isOffline`) and Install button (`usePWA().canInstall`).

### src/components/layout/Sidebar.tsx
Generic slide-in right sidebar shell (close button + scrollable content area). Used via `AppShell`'s `sidebarContent` prop (currently unused elsewhere).

## src/components/map/

### src/components/map/HistoricalEraPanel.tsx
Legacy era panel (no longer mounted in the map sidebar). Exports default panel and reusable `EvidenceLinks({ ids })`, still used by HistoricalPlaceDetails.

### src/components/map/CreatePathModal.tsx
Personal path creation/editing from existing places or a drawn draft. Accepts path/point defaults and era-resolved available-place labels, preserves previously saved point names, supports reorder/style/color and distance calculation.

### src/components/map/PathDrawingToolbar.tsx
Personal drawing status and Undo/Finish/Cancel controls driven by point count and total distance. Drawing state lives in BibleMap and survives era changes.


### src/components/map/BibleMap.tsx
Main Leaflet map (route `/map`). Composes shared era resolution with book/density filters, passage/route/focus overrides, measured camera fitting, accessible clustered pins, source evidence, saved places/paths, person routes, drawing and study travel estimates. Hidden personal-route IDs persist in localStorage, so route visibility survives reloads; new routes default to visible. Invalidates stale passage/search operations; era changes preserve personal work and camera position. Uses independent physical-base, era-context, journey and name layers.

### src/components/map/CreatePlaceModal.tsx
Custom fixed-overlay modal (name + description) for either naming a newly placed location or editing an existing saved place. Not built on the shared `Modal` component.

### src/components/map/HistoricalPlaceDetails.tsx
Evidence-forward selected catalog record. Receives resolved display name, era/snapshot selection, representation state and explicit map/related-identity callbacks. Separates era relevance and scoped name evidence from original catalog label, confidence, references and alternative identifications. An out-of-filter selection stays inspectable.

### src/components/map/MapSearchBar.tsx
Searches resolved catalog labels/aliases/references and saved places within the current era/book, plus compatible era context layers. Explicit broader search restores all catalog/book results and undated general territory evidence with classification status. `SearchContext` keeps stable place IDs; props include era selection/area candidates and selection callback. No external geocoding.

### src/components/map/MapSidebar.tsx
Responsive labeled workspaces: Explore places, Study a passage, Journeys, and Your saved items (Places/Routes). Persistent search, removable book/type/coverage filters, and labeled phone bottom navigation; coverage/type filter selectors are removed. Accepts current selection/status, detail visibility and collapse callback. Journey tools group route drawing/creation and distance measurement; saved-item actions stay visible for touch/keyboard.

### src/components/map/TerritoryEvidenceCard.tsx
Source-attributed general territory/site/unresolved evidence card. Optional `onReturnToAllEras` displays that the undated outline is hidden in era mode and offers deliberate return to the general catalog.

### src/components/map/PassageMapPanel.tsx
Passage selector and local-KJV result list with exact references. Accepts era selection and resolved result names; distinguishes curated membership from unclassified passage-study overrides.

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

### src/data/historicalEraContent.ts
Typed, additive frozen historical release: 12 eras, 13 snapshots/site contexts, 73 place annotations, scoped names/related identities, 17 itineraries, source registry and exact release manifest. Narrative relevance, not occupation dating. Editorial policy and complete ID table in docs/historical-era-sources.md.

### src/data/generated/historicalBaseMap.json
Natural Earth v5.1.2 physical FeatureCollection: unchanged global 50m land and selected 10m natural lakes. Dynamic-imported in its own precached map-only chunk; no political lines or modern labels.

### src/data/generated/historicalBaseMap.provenance.json
Pinned physical asset URLs, source version, license, input SHA-256 hashes and filtering method; regenerated with the basemap script.


### src/data/biblicalAreas.ts
Static, deliberately approximate historical study-area polygons (Canaan, Egypt/Sinai, Mesopotamia/exile, Roman-era Judea/Galilee/Perea, and Mediterranean churches). Exports `BiblicalArea` and `BIBLICAL_AREAS`; the map shows applicable translucent areas when a Bible book is selected.

### src/data/biblicalTerritories.ts
Vetted historical evidence catalog used by the Kingdoms & Peoples map search. Embeds unchanged OpenBible CC-BY 4.0 isobands plus the sourced Hatti rough outline; provides site-based lenses for the Hivite Gibeonite towns and Amorite historical centers, and explicit unresolved records for groups that cannot be responsibly mapped. Exports selection/data types, `SOURCE_BACKED_TERRITORIES`, `SITE_BACKED_HISTORICAL_LENSES`, and `GROUPS_WITHOUT_SOURCE_BACKED_TERRITORY`.

### src/data/biblicalPlaces.ts
Typed adapter over the generated OpenBible snapshot. Exports historical place kind/confidence/precision/coverage types and labels, `BiblicalPlaceCluster`, `BIBLICAL_PLACE_CLUSTERS`, source metadata, and counts; derives per-book indexes and search text without collapsing distinct ancient records that share a coordinate.

### src/data/generated/openBiblePlaces.json
Compact generated snapshot of the pinned OpenBible.info Bible Geocoding JSONL revision (CC BY 4.0): 1,335 mappable ancient records from 1,342 source records. Contains stable ids, translation aliases, complete cataloged references, types, primary point/precision, alternate resolutions, and confidence scores; regenerated by `scripts/import-openbible.mjs`.

## src/hooks/

### src/hooks/useHistoricalEra.ts
`useHistoricalEra()` returns validated URL/local-preference selection, committed selection, preview/commit, layer state and status announcement. URL wins on history navigation; preserves unrelated parameters and handles unavailable localStorage. Exports URL parse/serialize helpers and versioned preference key.

### src/hooks/useHistoricalEraLayers.ts
Renders/cleans independent Leaflet area/site and schematic journey groups plus collision-limited persistent names. Requires an explicit ready Map value; no camera fitting, database calls or per-era data fetch.

### src/hooks/useHistoricalBaseMap.ts
Switches between bundled physical geography and explicit modern OSM tiles. Loads the physical asset once through a lazy import, guards stale async results, retains attribution, and never switches automatically on zoom.

### src/hooks/useMapPaths.ts
React Query personal map-path CRUD with Supabase API calls and localStorage fallback. Returns paths/loading/error/refetch plus create/update/delete operations; independent of historical era content.


### src/hooks/useConnections.ts
React Query + Supabase CRUD/subscription hook for `Connection`s scoped to a `topicId`. Real-time handler checks whether the changed connection's `from`/`to` verse belongs to the currently-cached verse set before invalidating (avoids cross-topic invalidation noise). Returns `{ connections, loading, error, createConnection, updateConnection, deleteConnection, refetch }`.

### src/hooks/useDebounce.ts
Exports `useDebounce<T>(value, delay)` (debounced value) and `useDebouncedCallback(callback, delay)` (debounced function, cleans up timeout on unmount).

### src/hooks/useEntities.ts
React Query + Supabase CRUD/subscription hook for `Entity` records (global, not scoped). Returns `{ entities, loading, error, createEntity, updateEntity, deleteEntity, searchEntities, refetch }`.

### src/hooks/useEntityMentions.ts
Exports two hooks: `useVerseMentions(verseId)` (mentions for one verse, with create/delete mutations — used by `VerseNode`/`TopicGraphView` flow) and `useEntityMentions(entityId)` (read-only, all mentions for one entity — used by `EntityDetailSidebar`).

### src/hooks/usePeopleAtlas.ts
Composite Atlas hook exposes all entities, people, relationships with evidence, definitions/schema readiness, periods, retry/errors and CRUD. Adds `saveRelationship` and atomic `setParents`, realtime definition/evidence invalidation and optimistic per-entity position rollback. Legacy map relationship methods stay compatible.

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

### src/lib/historicalEraTypes.ts
Historical era/snapshot, structured Scripture reference, annotation/name, GeoJSON area, route/stop/segment, evidence, release-manifest, selection and layer contracts. Dates are qualified verbal metadata in this release.

### src/lib/historicalEraResolver.ts
Pure, pre-indexed membership and display-name resolution, book/density intersection, deduplicated passage/route/focus overrides, compatible areas/routes and separate counts. Exports ERAS, PLACE_BY_ID, ALL_ERAS, validated selection, annotation/name helpers, labelPlace and resolveHistoricalView.

### src/lib/validateHistoricalEras.ts
Pure release validator returning actionable errors for IDs, manifest drift, catalog revision, references, evidence, scope/name conflicts, drafts, coordinates, ring closure, route endpoint/geometry consistency and identification links.


### src/lib/atlasGraph.ts
Pure `deriveFamilies()` groups eligible exact direct-parent pairs by parentage/period context; excludes ambiguous, ancestral and uncertain cases. `bundleRelationships()`/`pairKey()` retain individual assertions while grouping endpoint pairs visually.

### src/lib/atlasSearch.ts
Pure `buildAtlasSearch()`, `normalizeSearch()` and `searchAtlas()`: typed entity/type/assertion/reference results, explicit aliases/qualifiers, book-abbreviation normalization, multiword matching and deterministic ranking.

### src/lib/relationships.ts
Shared built-in extensible definitions/category styling, explicit legacy resolution, entity qualifiers/aliases, full statements, canonical assertion identity, validated Scripture parsing/formatting and user-readable persistence errors. Parentage semantics are independent of marriage/concubinage.

### src/lib/bibleApi.ts
Client-facing Bible-text-fetch API. Spins up a singleton Web Worker (`bibleWorker.ts`) and communicates via `postMessage`/job-id promise map. Exports `fetchKjvVerse(book, chapter, verse)`, `fetchKjvVerseRange(book, chapter, verseStart, verseEnd)`, `fetchKjvBook(book)` (full local book for map coverage), `fetchKjvCustomVerses(book, selections: VerseSelection[])` (the "fancy indexing" entry point), and `VerseSelection` interface.

### src/lib/bibleBooks.ts
Static `BIBLE_BOOKS` array (all 66 books: name/abbrev/testament/group/chapters/versesPerChapter). Exports `BibleBook` interface and helpers: `getBookByName()`, `getBookAbbrev()`, `getVersesInChapter()`, `validateVerseRef()`, `validateVerseRange()`, `formatVerseRef()` (handles `chapter===0` custom-verse sentinel → `"Book (custom)"`).

### src/lib/bibleWorker.ts
Web Worker (module worker, loaded by `bibleApi.ts` via `new Worker(new URL(...))`). Lazily fetches and caches `/kjv.json` (local full-KJV dataset, not `bible-api.com` despite the name — despite README's claim of external API, actual verse lookups run fully offline against this local dataset). Handles `fetchKjvVerseRange`, `fetchKjvBook`, and `fetchKjvCustomVerses` message types, returning multi-line `[ch:v] text` strings.

### src/lib/mapClustering.ts
Pure projected-screen clustering for historical map records. Exports `clusterHistoricalPlaces()` and cluster/point interfaces; changes grid size by zoom and at close zoom groups only truly co-located records.

### src/lib/passagePlaces.ts
Pure passage-to-map matching utility. Exports selection/study/match types plus `findPlacesInPassage()` and `findPlacesInBook()`, which join local KJV `[chapter:verse]` text with catalog references and safe biblical-name matching (including selected KJV spelling variants); also formats passage and matched-verse labels for map UI.

### src/lib/territorySearch.ts
Pure local search/ranking utility for historical peoples and kingdoms. Exports `TerritorySearchResult`, `hasMappedHistoricalEvidence()`, and `searchHistoricalTerritories()`, which return source-backed geometry, attested-site lenses, or explicitly unresolved evidence records without using external geocoding.

### src/lib/edgeTypes.ts
Color/label constant maps: `EDGE_COLORS`/`EDGE_LABELS` (by `ConnectionType`), `CROSS_TOPIC_COLOR`, `EDGE_STYLE`, `VERSE_TYPE_COLORS`, `ANCHOR_COLOR_PALETTE` (8-color palette for word anchors, distinct from edge colors), `ENTITY_TYPE_COLORS`/`ENTITY_TYPE_ICONS`/`ENTITY_TYPE_LABELS` (by `EntityType`), `ENTITY_RELATION_LABELS` (static map — note: since `EntityRelationType` is now free-form string, this map is only a fallback/legacy set of labels, not exhaustive).

### src/lib/supabase.ts
All Supabase client setup + every DB query/mutation/subscription function in the app (topics, verses, connections, topic_links, search, entities, entity_mentions, entity_relationships, timeline_periods, atlas helpers). Organized in commented sections. Entity/relationship/definition/evidence reads are paginated. Adds `getRelationshipDefinitions`, `saveAtlasRelationship` and `setAtlasParents`; legacy reads tolerate missing migration 010. Real-time subscriptions use `supabase.channel(name-with-random-suffix).on('postgres_changes', ...)`. Also exports `TopicCounts`, `getTopicCounts(topicIds)` (batched RPC with legacy fallback), `getMentionsByTopic(topicId)` (500-row pages), and abortable `searchVerses(query, signal?)`. Also exports `AtlasEntityMention` interface and `getEntityMentionsWithBooks()` (joined query used by `PeopleAtlas` for mention counts).

### src/lib/travelInsights.ts
Pure geography/study-estimate utility for the map. Exports travel place, route option, and insight types plus haversine distance, terrain-context heuristics, walking-day ranges, and three intentionally approximate direct/overland/corridor options.

### src/lib/types.ts
All shared TypeScript interfaces/types, including optional relationship definitions/metadata/evidence and `RelationshipDraft`: `VerseType`, `ConnectionType`/`EdgeType`, `Topic`, `Verse`, `Connection`, `TopicLink`, `VerseWithTopic`, `EntityType`, `EntityMentionContext`, `EntityRelationType` (= `string`), `Entity`, `EntityMention`, `EntityMentionWithEntity`, `EntityMentionWithVerse`, `EntityRelationship`, `TimelinePeriod`.

### src/lib/utils.ts
Small helpers: `formatDate()`, `buildAnchorKey(cleanWord, occurrenceIndex)` / `parseAnchorKey(anchorKey)` (word-anchor composite-key codec, handles duplicate words in a verse via occurrence index; legacy fallback for anchors without an index).

## src/styles/

### src/styles/index.css
Global Tailwind styles, graph/entity presentation, Leaflet place clusters and evidence tooltips. Also owns responsive era timeline/dock/chip layout, physical-layer labels, focus and reduced-motion styling, and phone map-control spacing.

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

8. `008_map_paths.sql` — Saved map paths with ordered JSON points and style metadata.
9. `009_performance.sql` — Invoker-security batched topic count RPC, trigram indexes for substring search and topic/created-at verse index.
10. `010_relationship_atlas.sql` — Extensible definitions, relationship context/evidence, same-name entity identities, exact legacy classification, invoker atomic relationship/parent RPCs with cycle/duplicate checks, indexes and realtime. Requires explicit deployment to Supabase.

## Config files

- **package.json** — Vite + React 18 + TypeScript app named `bible-flow`. Key deps include React Flow, Supabase/React Query, React Router, Leaflet, and `html-to-image`. Scripts: `dev`, `build`, `lint`, `preview`, and `data:openbible` (regenerates the versioned historical-place snapshot).
- **scripts/import-openbible.mjs** — Dependency-free Node importer for the pinned OpenBible `ancient.jsonl`. Preserves each ancient identity, normalizes names/references/types/resolutions/confidence, and writes `src/data/generated/openBiblePlaces.json`; accepts optional `--input`/`--output` paths.
- **vite.config.ts** — `@` path alias → `./src`. `vite-plugin-pwa` with `autoUpdate` registration, full manifest (name "Bible Flow"), Workbox runtime caching: CacheFirst for `bible-api.com` (30-day, up to 1000 entries — legacy, see `bibleWorker.ts` note above about actually using local `kjv.json`), NetworkFirst for `*.supabase.co` (1-day, up to 500 entries).
- **tailwind.config.js** — `darkMode: 'class'`. Custom `edge.*` and `verse.*` color extensions mirroring `src/lib/edgeTypes.ts` (kept in sync manually — not imported from TS, duplicated by hand).
- **tsconfig.json** — Root project-references config pointing to `tsconfig.app.json` + `tsconfig.node.json`.
- **tsconfig.app.json** — App source config (target ES2020, strict, `noUnusedLocals`/`noUnusedParameters` on). `@/*` → `./src/*` path alias (mirrors Vite alias).
- **tsconfig.node.json** — Config for Vite config file itself (target ES2022, no path alias needed).
- **index.html** — Vite entry HTML. PWA meta tags (apple-mobile-web-app-*, theme-color `#4f46e5`), loads `/src/main.tsx` as a module script.
- **postcss.config.js** — Standard `tailwindcss` + `autoprefixer` plugins.

## Historical era validation and provenance

- **scripts/validate-historical-eras.mjs** — Runs the TypeScript content validator through Vite’s existing SSR loader without opening a server or adding test dependencies.
- **scripts/test-historical-eras.mjs** — Focused Node assertions for resolver behavior, URL rules, snapshot/name changes, overrides and invalid dataset fixtures; `npm run test:eras`.
- **scripts/prepare-historical-basemap.mjs** — Reproducible pinned Natural Earth importer; strips properties, selects two natural lake features, preserves geometry and writes SHA-256 provenance.
- **eslint.config.js** — Minimal ESLint 9 flat configuration for the existing TS/React project and hooks-order checking; generated artifacts excluded.
- **docs/historical-era-sources.md** — Source-check policy, exact curated place manifest, naming/identity decisions, physical-asset provenance and unresolved content limits.
- **docs/historical-era-verification.md** — Build/test/browser/cache results, payload changes and remaining validation limits.

- **scripts/test-performance.mjs** — Worker and map regression checks and diagnostic timings against the Git HEAD implementations; run with `node scripts/test-performance.mjs` before committing to compare this pass.
- **docs/performance-audit.md** — Bottlenecks addressed, measurements, migration deployment and verification limits.

## Relationship Atlas verification

- **docs/relationship-atlas-plan.md** — Design/implementation scope and completion checks.
- **docs/relationship-atlas-verification.md** — Implemented behavior, database rollout requirement and measured verification limits.
- **scripts/test-relationships.mjs** — Pure semantic, grouping, bundling, identity, Scripture/search regression checks and large-index diagnostics (`npm run test:relationships`).
- **scripts/test-relationship-database.mjs** — Boots a disposable local PostgreSQL instance, applies migrations and verifies RPC atomicity, evidence, cycles, identity and invoker access (`npm run test:relationships:database`); never uses project credentials.
- **scripts/relationship-preview.html** — Development-only in-memory browser fixture. Intercepts application reads/writes and disables realtime transport; `?failSave=1` simulates retained-input failures. Not included in the production build.
