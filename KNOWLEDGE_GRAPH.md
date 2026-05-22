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
- **AppShell**: Main layout wrapper including the `Header` and `Sidebar`.
- **Dashboard (`/`)**: Lists all Topics using `TopicGrid` and `TopicCard`. Uses `useTopics()` hook.
- **TopicGraphView (`/topic/:id`)**: The main interactive React Flow canvas. Renders `VerseNode` components and `ConnectionEdge` components. Uses `useVerses()` and `useConnections()` for state and Supabase sync. Entity tags (`EntityChipBar`) are embedded directly into verse nodes.
- **TopicsNetwork (`/topics/network`)**: Macro-level view of all topics connected to each other via cross-topic links.
- **SearchPage (`/search`)**: Global search interface for finding verses across topics.
- **EntityExplorer (`/entities`)**: Dedicated interface for browsing, filtering, and managing all entities. Includes `EntityDetailSidebar` to show where entities are mentioned across all topics. Uses `useEntities()` and `useEntityMentions()` hooks.
- **PeopleAtlas (`/atlas`)**: A React Flow canvas showing all tagged people as a family tree diagram over user-created timeline bands. Sub-components: `PersonNode` (draggable person cards), `RelationshipEdge` (labeled lines connecting people), `TimelineBands` (colored SVG background bands with per-period heights and drag-to-resize handles), `CreatePeriodModal` (supports insert-at-position and move-up/down reordering), `CreateRelationshipModal`. Uses `usePeopleAtlas()` hook which orchestrates `useEntities()`, `useTimelinePeriods()`, and relationship queries. Dragging a person into a timeline band auto-assigns them to that period using cumulative Y-offset calculation. Period heights are persisted to Supabase via `band_height` column.
- **MapAtlas (`/map`)**: An interactive Leaflet map centered on the Middle East. Sub-components: `BibleMap` (core map with markers, click-to-add, and three new UX systems described below), `MapSidebar` (person filter panel), `CreatePlaceModal` (modal for naming a GPS-pinned place), `MapSearchBar` (search overlay with 3 tiers: local entities → biblical places dictionary → Nominatim geocoding; passes full `SearchContext` to `onFlyTo`).
  - **Biblical Places Overlay**: A viewport-filtered, zoom-tiered layer showing 1,280+ ancient place names as amber `circleMarker` + `tooltip`. Tiers: Tier 1 (zoom 4–6, ~30 major kingdoms), Tier 2 (zoom 7–9, cities+tribal territories), Tier 3 (zoom 10+, all places in view). Toggle via floating control panel. Powered by `BIBLICAL_PLACES` from `src/data/biblicalPlaces.ts`.
  - **Search Result Pin**: On search selection, `handleFlyTo` drops a styled `divIcon` label marker with auto-opening popup showing biblical name, verse reference, and note. Amber styling for biblical sources, indigo for local/modern. Dismisses on any map click.
  - **Map Style Toggle**: Switches between CARTO Voyager (modern) and Stadia/Stamen Terrain basemap tiles. Biblical layer group is re-added on top after tile swap.
  - **Floating Control Panel** (top-left): Title + status line, Biblical Places ON/OFF toggle with amber pill-switch, and Modern/Terrain segmented button.

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
11. **Biblical Map**: Interactive geographical map (Leaflet + OpenStreetMap) for pinning biblical locations and visualizing the travels of biblical figures. Click-to-add places, filter by person, and see where key figures traveled across the ancient world.
