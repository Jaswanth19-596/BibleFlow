# BibleFlow Knowledge Graph

## Architecture Decisions
1. **Frontend Framework**: React 18 with TypeScript and Vite. Chosen for component-based UI, strong typing, and fast build times.
2. **State Management & Data Fetching**: React Query (`@tanstack/react-query`) is used for server state caching, while standard React Context/Hooks handle local state.
3. **Graph Engine**: `@xyflow/react` (React Flow) v12. Chosen to provide the interactive, drag-and-drop node-based visualization of Bible verses and theological topics.
4. **Backend as a Service (BaaS)**: Supabase (PostgreSQL + Real-time subscriptions). Handles the database (`topics`, `verses`, `connections`, `topic_links`) and provides real-time updates so changes are instantly synced across clients.
5. **Routing**: React Router DOM v6 for client-side routing.
6. **Styling**: Tailwind CSS 3.4 for utility-first, responsive, and customizable styling.
7. **External APIs**: `bible-api.com` is used for fetching KJV Bible texts securely and freely without requiring API keys. Verse text is now stored as multi-line strings with `[ch:v]` prefixes (e.g. `[3:16] For God so loved...`) enabling per-verse line display.

## Core Entities & Data Models
- **Topics**: Represents a theological concept or study theme (e.g., "Faith", "Salvation"). Has a name, description, and color.
- **Verses (Nodes)**: Represents a specific Bible verse or custom verse selection. Belongs to a Topic. Contains the biblical text (multi-line `[ch:v] text` format), reference (book, chapter, verse_start, verse_end), a personalized note, and its XY coordinates for the graph. `chapter=0` is a sentinel value indicating a custom (non-contiguous) verse selection. They have types: `main`, `supporting`, `contrast`, `context`.
- **Connections (Edges)**: Represents relationships between verses within a topic graph. Types include `supports`, `contrasts`, `explains`, `fulfills`, `references`.
- **Topic Links (Cross-Topic Edges)**: Represents macroscopic relationships between overarching Topics (e.g., Topic A leads to Topic B).
- **Entities**: Represents biblical people, places, nations, events, objects, or concepts. Has a type, description, optional metadata, `timeline_period_id` (nullable FK to timeline_periods), `atlas_x`/`atlas_y` for positioning on the People Atlas canvas, and `lat`/`lng` (nullable) for geographical coordinates on the Biblical Map.
- **Entity Mentions**: Bridge table linking Entities to Verses. Captures the specific context of the mention (e.g., 'speaker', 'subject', 'location') and optional anchor words in the verse text.
- **Entity Relationships**: Maps associations between Entities. Type is now a free-form string (users can type any custom relationship label like "father of", "king of", etc.).
- **Timeline Periods**: User-created time periods stored in `timeline_periods` table. Each has a name, color, `sort_order` (controls vertical stacking), and `band_height` (px height of the canvas band, default 300, min 120). Rendered as colored background bands on the People Atlas canvas. Supports insert-at-position (beginning, middle, end) and move-up/move-down reordering via `reorderTimelinePeriods()` batch update.

## Component Map & Data Flow
- **AppShell**: Main layout wrapper including the `Header` and `Sidebar`. Its responsive shell keeps a compact five-destination navigation rail visible on phones, preserves safe-area padding, and turns shared side panels into bottom sheets below the `sm` breakpoint.
- **Dashboard (`/`)**: Lists all Topics using `TopicGrid` and `TopicCard`. Uses `useTopics()` hook.
- **TopicGraphView (`/topic/:id`)**: The main interactive React Flow canvas. Renders `VerseNode` components and `ConnectionEdge` components. Uses `useVerses()` and `useConnections()` for state and Supabase sync. Entity tags (`EntityChipBar`) are embedded directly into verse nodes. On narrow screens its controls stack into a dedicated, icon-first toolbar while the canvas remains available beneath it.
- **TopicsNetwork (`/topics/network`)**: Macro-level view of all topics connected to each other via cross-topic links.
- **SearchPage (`/search`)**: Global search interface for finding verses across topics.
- **EntityExplorer (`/entities`)**: Dedicated interface for browsing, filtering, and managing all entities. Includes `EntityDetailSidebar` to show where entities are mentioned across all topics. Uses `useEntities()` and `useEntityMentions()` hooks.
- **PeopleAtlas (`/atlas`)**: A React Flow canvas showing all tagged people as a family tree diagram over user-created timeline bands. Sub-components: `PersonNode` (draggable person cards), `RelationshipEdge` (labeled lines connecting people), `TimelineBands` (colored SVG background bands with per-period heights and drag-to-resize handles), `CreatePeriodModal` (supports insert-at-position and move-up/down reordering), `CreateRelationshipModal`. Uses `usePeopleAtlas()` hook which orchestrates `useEntities()`, `useTimelinePeriods()`, and relationship queries. Dragging a person into a timeline band auto-assigns them to that period using cumulative Y-offset calculation. Period heights are persisted to Supabase via `band_height` column.
- **MapAtlas (`/map`)**: An interactive, full-viewport Leaflet map centered on the biblical world. A collapsible left study dock contains search and the Explore, Passage, Journey, and Library accordions; on phones it starts as a compact bottom control rail and expands into a bottom sheet, preserving a usable map viewport. `MapSearchBar` searches only local biblical, saved-study, and vetted historical-territory records.
  - **Canonical Biblical Locations**: The 1,354-source-row OpenBible dataset (including 72 current-source cited-coordinate supplements) is normalized into distinct map locations. Exact coordinate duplicates and nearby duplicate estimates are represented as one amber marker, while the popup/search result preserves alternate biblical names and references. Tiers still control density by zoom: major regions at low zoom, then major sites, then all locations.
  - **Historical peoples and kingdoms**: Search Canaanites, Ammonites, Edomites, Moabites, Philistines, Arameans, Assyrians, Babylonians, or the Hittite kingdom to display sourced geometry in a non-interactive pane beneath pins. The Hivite Gibeonite towns and Amorite historical centers instead render named site lenses; these show documented locations without inventing ethnic/imperial borders. The evidence card labels each evidence mode, references its source, and keeps genuinely unresolved groups (including Perizzites and Girgashites) explicit rather than fabricated.
  - **Book lens and study areas**: A book selector combines the catalog's cited places with a local-KJV scan for literal place names across the selected book, so representative source citations do not hide places mentioned elsewhere (including KJV spelling variants such as Askelon/Ashkelon). Small clickable pins preserve map movement and readability, while deliberately approximate historical study areas remain subtle (and are not modern political borders).
  - **Passage lens**: `PassageMapPanel` accepts a book, chapter, and optional verse range; the map loads the local KJV text, matches literal biblical names plus cataloged references, then temporarily shows only the matched indigo pins. The sidebar and active study badge give exact selected-passage verse references, and clearing restores the normal map.
  - **Travel insight**: `TravelInsightPanel` selects any two built-in or saved places and shows a teal A→B map layer. `travelInsights.ts` calculates a haversine distance, a 16–22 km/day walking range, terrain context, and direct/overland/historical-corridor study options. These are deliberately labeled estimates rather than modern directions or asserted reconstructed routes.
  - **Bible-aware Search**: Exact canonical names and alternate biblical names rank before partial matches; cited references are searchable. There is intentionally no Nominatim/general-world fallback, preventing an ambiguous biblical query from opening a modern street abroad.
  - **Search Result Pin**: On selection, `handleFlyTo` drops a styled `divIcon` label marker with an auto-opening popup showing the biblical name, references, and alternate names. Amber styling identifies catalog locations; indigo identifies personal saved locations. Dismisses on any map click.
  - **Basemap**: Uses OpenStreetMap.de raster tiles, so the map remains visible without a provider API key. Biblical layers are rendered above the basemap.

## How It Works
1. **Initialization**: The App starts up at `main.tsx`, wrapping the application in `QueryClientProvider` and `BrowserRouter`.
2. **Topic Creation**: Users create a topic which is saved to Supabase via `useTopics()`. 
3. **Verse Addition**: Within a Topic, users add a verse. The app queries `bible-api.com` for the text, then saves the verse entity to Supabase via `useVerses()`. 
4. **Graph Interaction**: Verses appear as nodes on `VerseFlowCanvas`. Dragging nodes updates their `position_x` and `position_y` in real-time, syncing to Supabase. Drawing lines between nodes creates `Connections`.
5. **Real-time Sync**: Supabase channels listen for database changes, triggering React Query invalidations or state updates, ensuring any client looking at the same graph sees real-time movements and additions.

## Full Features of the Website
1. **Topic-Based Organization**: Create, manage, and color-code theological topics.
2. **Interactive Graph Visualization**: Draggable, auto-saving Bible verse nodes mapped visually on an infinite canvas.
3. **Semantic Verse Connections**: Draw directed lines to define doctrinal relationships (supports, contrasts, explains, fulfills, references).
4. **Contextual Entity Tagging**: Tag people, places, events, and concepts directly onto verses to build an interconnected biblical knowledge graph.
5. **Topic Network View**: A global visualization of how broad theological topics interrelate.
6. **Bible Integration**: Auto-fetches KJV text, validates verse structures, supports verse ranges and custom non-contiguous verse selections (Python-style fancy indexing). Verse text is stored as multi-line `[ch:v] text` format and rendered line-by-line in nodes with superscript verse numbers.
7. **Global Search & Discovery**: Search through all verses and personal notes with debounced grouping.
8. **Export & Sharing**: Export any topic graph as a high-quality PNG image.
9. **Dark Mode**: Complete support for system-preference dark mode.
10. **People Atlas**: Family tree diagram + vertical timeline with user-created colored background bands. People are draggable nodes, relationships are labeled edges, and dragging a person into a timeline band auto-assigns them to that period.
11. **Biblical Map**: Bible-first, full-canvas geographical explorer with a compact floating study dock; book-filtered locations and historical names; a KJV-backed passage-to-map lens with verse-level highlights; transparent distance/travel estimates between two locations; subtle approximate study-area overlays; regional entry points; biblical-name/reference search that never falls back to modern addresses; an explicit saved-place placement mode with edit/removal controls; and separately labeled person-route visualization.
12. **Mobile-first study workflow**: Phone-sized navigation exposes every primary destination; forms, confirmations, and entity details use safe-area-aware bottom sheets; interactive canvases trim secondary chrome, retain large touch targets, and keep their core pan/zoom/drag workflows available.
