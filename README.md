# Bible Flow

A modern web application for visual Bible study that lets you organize, connect, and explore Scripture across theological topics through an interactive graph-based interface.

## Features

### Topic-Based Organization
- **Topics Dashboard**: Create and manage theological topics with color-coded cards
- **Topic Metadata**: Each topic has a name, description, and customizable color
- **Statistics**: View verse count and connection count for each topic at a glance
- **Topic Search**: Filter topics by name or description

### Interactive Graph Visualization
Built with React Flow (@xyflow/react), the graph view provides:
- **Draggable Nodes**: Each Bible verse appears as a node that can be positioned freely
- **Automatic Position Saving**: Node positions save automatically (debounced at 500ms) when dragged
- **Typed Verse Nodes**: Categorize verses within a topic with color-coded types:
  - `main` (indigo) - Primary verses representing the topic
  - `supporting` (green) - Verses that add supporting evidence
  - `contrast` (red) - Verses showing opposing or contrasting viewpoints
  - `context` (gray) - Historical or background context verses

### Semantic Verse Connections
Create meaningful relationships between verses with typed connections:
- `supports` (green) - One verse doctrinally supports another
- `contrasts` (red) - Verses presenting opposing concepts
- `explains` (purple) - One verse explains or clarifies another
- `fulfills` (orange) - Prophetic fulfillment relationships
- `references` (gray) - General cross-references

### Topic Network View
- **Global Visualization**: See all topics as nodes in a network graph
- **Cross-Topic Links**: Create relationships between topics (e.g., "Faith leads to Salvation")
- **Interactive Navigation**: Click any topic node to navigate to its detail view
- **Link Creation UI**: Drag between topic nodes to create new relationships

### Biblical Map
- **Historical eras**: Twelve discrete study periods, named snapshots, scoped place names and seventeen separate narrative itineraries. Use the timeline or phone dock to choose an era; Fit era moves the camera explicitly. Share era/snapshot selections through the URL.
- **Evidence and study overrides**: Curated era membership intersects with book/type/coverage filters. Passage results, selected route stops and explicit broader-search pins remain labeled study overrides. Unclassified does not mean historically absent. Saved/drafted personal work stays independent.
- **Physical backdrop**: Bundled Natural Earth land, Sea of Galilee and northern Dead Sea without modern political labels, plus an explicit Modern map option. Site halos indicate narrative context, and dashed journey lines indicate schematic sequence; neither claims precise historical boundaries or roads.
- **Focused study dock**: A collapsible left-side dock keeps Explore, Passage, Journey, and Library controls available without covering the map with modals
- **Complete historical-place catalog**: Browse 1,335 mappable ancient-place records generated from the pinned OpenBible Bible Geocoding dataset (1,342 source records), with stable source ids, complete cataloged verse references, translation names, and place types
- **No hidden catalog tiers**: Every record matching the active filters is represented at every zoom. Screen-space clustering keeps the map readable, and exact shared sites remain grouped into a selectable record list instead of burying overlapping pins
- **Historical-place filters**: Narrow the map by Bible book, coverage (every, major/regional, or major only), and place type such as settlement, region, landform, water feature, structure, route, or campsite
- **Evidence-aware place records**: Selecting a place opens a source-attributed record with aliases, Scripture references, coordinates, point precision, alternate geographic identifications, and OpenBible's time-weighted confidence score
- **Book-aware geography**: Select the book you are reading to show cataloged locations plus literal place names found in the local KJV text, with period-appropriate names where available
- **Passage → map**: Choose a chapter or verse range to load the local KJV text, highlight the places in that passage, fit the map to them, and see the exact verse references beside each result
- **Distance and travel insight**: Select any two biblical or saved places to compare straight-line distance, an honest ancient walking-day range, terrain context, and direct/overland/historical-corridor study options
- **Gentle geographic context**: Approximate historical study areas provide context without covering or intercepting the map; biblical locations remain small, clickable pins
- **Reliable place search**: Search canonical names, alternate biblical names, or cited references; map search never falls back to modern street addresses
- **Historical peoples and kingdoms**: Search source-backed groups such as Canaanites, Philistines, Moabites, Assyrians, or the Hittite kingdom to see qualified historical areas, biblical references, and data attribution. Hivites and Amorites use named site lenses where that is the more honest evidence; Perizzites and Girgashites remain clear research notes instead of invented borders
- **Personal study routes**: Save study locations, link them to people, and follow their ordered travel route
- **Saved-place management**: Add a place only when you enter placement mode, then focus, edit, or remove any saved place from the map sidebar

### Bible Integration
- **King James Version**: Auto-fetches KJV text using bible-api.com (free, no key required)
- **Complete Bible Index**: Full 66-book canon with accurate chapter and verse counts
- **Verse Validation**: Real-time validation of book names, chapters, and verse numbers
- **Range Support**: Add single verses or verse ranges (e.g., Romans 8:28-30)
- **Book Selector**: Organized dropdown by biblical groups (Pentateuch, Historical, Wisdom, etc.)

### Search & Discovery
- **Global Search**: Search across all verses by book name or personal notes
- **Debounced Search**: 300ms debounce for smooth typing experience
- **Grouped Results**: Results organized by topic with color indicators
- **Direct Navigation**: Click any result to jump to the topic with that verse highlighted

### Export & Sharing
- **PNG Export**: Download any topic graph as a high-quality PNG image
- **Dark Mode Support**: Clean interface adapts to system dark mode preference

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Routing** | React Router DOM v6 |
| **Graph Engine** | @xyflow/react (React Flow) 12.3 |
| **Backend** | Supabase (PostgreSQL + Real-time subscriptions) |
| **Styling** | Tailwind CSS 3.4 |
| **Bible API** | bible-api.com (free KJV) |
| **Export** | html-to-image |
| **Historical Geography** | OpenBible.info Bible Geocoding Data (CC BY 4.0, pinned snapshot) |

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works perfectly)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bible-flow.git
   cd bible-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - In the SQL Editor, run the migration from `supabase/migrations/`
   - Go to Settings > API and copy your Project URL and anon key

4. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

### Historical era validation and physical data

```bash
npm run data:validate-eras
npm run test:eras
npm run data:basemap
```

The first two commands run offline against the checked-in catalog/content using the existing Vite/Node toolchain. The last reproduces the physical map from pinned Natural Earth v5.1.2 URLs; local source files can be passed as two arguments. See [historical source policy and exact manifest](docs/historical-era-sources.md) and [verification results](docs/historical-era-verification.md). No database migration is required.

The production service worker precaches era data and physical geography as versioned JavaScript chunks. Once cached, this static exploration can work without the application server. External modern map tiles are not reliably available offline. Personal Supabase content and uncached Bible text have their own availability limits.

### Refreshing the Historical-Place Catalog

The checked-in map snapshot is reproducible and does not require a network request in the browser. To regenerate it from the importer’s pinned OpenBible revision:

```bash
npm run data:openbible
```

The importer writes `src/data/generated/openBiblePlaces.json`. It keeps each ancient place as its own canonical record even when several records resolve to the same modern point; the map handles overlap through clustering rather than flattening distinct places into aliases.

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI primitives
│   │   ├── Button.tsx    # Variants: primary, secondary, danger, ghost
│   │   ├── Input.tsx     # Text input with error states
│   │   ├── Select.tsx    # Dropdown select
│   │   ├── Modal.tsx     # Overlay modal with sizes
│   │   └── ConfirmDialog.tsx
│   ├── graph/            # React Flow components
│   │   ├── VerseFlowCanvas.tsx    # Main graph canvas
│   │   ├── VerseNode.tsx          # Verse node renderer
│   │   ├── ConnectionEdge.tsx     # Edge with edit/delete
│   │   ├── CrossTopicEdge.tsx     # Cross-topic edge style
│   │   ├── ConnectionPopover.tsx  # Edge edit popup
│   │   └── VerseSidebar.tsx       # Add/edit verse panel
│   ├── layout/
│   │   ├── AppShell.tsx   # Main layout wrapper
│   │   ├── Header.tsx     # Navigation header
│   │   └── Sidebar.tsx    # Slide-out sidebar
│   └── topics/
│       ├── NewTopicModal.tsx
│       ├── TopicCard.tsx
│       ├── TopicGrid.tsx
│       └── TopicSearchBar.tsx
├── hooks/                 # Custom React hooks
│   ├── useTopics.ts       # Topic CRUD + real-time sync
│   ├── useVerses.ts       # Verse CRUD for a topic
│   ├── useConnections.ts  # Connection management
│   ├── useTopicLinks.ts   # Cross-topic link management
│   └── useDebounce.ts     # Debounce utility
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── supabase.ts        # Supabase client & queries
│   ├── bibleApi.ts        # bible-api.com integration
│   ├── bibleBooks.ts      # 66-book Bible metadata
│   └── edgeTypes.ts       # Type colors & constants
├── pages/
│   ├── Dashboard.tsx      # Topics listing
│   ├── TopicGraphView.tsx # Main graph view
│   ├── TopicsNetwork.tsx  # Topic network visualization
│   └── SearchPage.tsx     # Global search
└── styles/
    └── index.css          # Tailwind + custom styles
```

## Database Schema

### Tables

**topics**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| name | text | Topic name (e.g., "Faith") |
| description | text | Optional description |
| color | text | Hex color code |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last modification |

**verses**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| topic_id | uuid (FK) | Parent topic |
| book | text | Bible book name |
| chapter | integer | Chapter number |
| verse_start | integer | Starting verse |
| verse_end | integer | Ending verse (nullable) |
| text | text | KJV verse text |
| note | text | Personal notes |
| type | enum | main/supporting/contrast/context |
| position_x | float | Canvas X position |
| position_y | float | Canvas Y position |

**connections**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| from_verse_id | uuid (FK) | Source verse |
| to_verse_id | uuid (FK) | Target verse |
| type | enum | supports/contrasts/explains/fulfills/references |
| label | text | Optional label |

**topic_links**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique identifier |
| from_topic_id | uuid (FK) | Source topic |
| to_topic_id | uuid (FK) | Target topic |
| description | text | Relationship description |

## Usage Guide

### Creating Topics
1. From the Dashboard, click "New Topic"
2. Enter name, description, and pick a color
3. The topic appears in the grid with 0 verses count

### Working with Verses
1. Open a topic by clicking its card
2. Click "Add Verse" to open the sidebar
3. Select book, chapter, and verse(s)
4. The KJV text auto-loads from bible-api.com
5. Add a note and select verse type
6. Click "Add Verse" - it appears on the canvas

### Making Connections
1. Hover over a verse node to see connection handles
2. Drag from one node's output handle to another's input handle
3. The connection is created as "references" type
4. Click the connection label to change type or add custom text

### Topic Network
1. Click "Network" in the header
2. See all topics as nodes arranged in a grid
3. Drag from one topic to another to create a link
4. Enter a relationship description in the modal
5. Click any topic to navigate to its graph

### Searching
1. Click "Search" in the header
2. Type a book name ("John"), reference ("3:16"), or note content
3. Results group by topic - click to navigate to that verse

## Custom Hooks Reference

### useTopics()
```typescript
const {
  topics,           // Topic[] - all topics
  loading,          // boolean
  error,            // string | null
  createTopic,      // (data) => Promise<Topic>
  updateTopic,      // (id, data) => Promise<Topic>
  deleteTopic,      // (id) => Promise<void>
  refetch,          // () => void
} = useTopics();
```

### useVerses(topicId)
```typescript
const {
  verses,              // Verse[]
  loading,
  createVerse,         // (data) => Promise<Verse>
  updateVerse,         // (id, data) => Promise<Verse>
  deleteVerse,         // (id) => Promise<void>
  updateVersePosition, // (id, x, y) => Promise<void>
} = useVerses(topicId);
```

### useConnections(topicId)
```typescript
const {
  connections,       // Connection[]
  createConnection,  // (data) => Promise<Connection>
  updateConnection,  // (id, data) => Promise<Connection>
  deleteConnection,  // (id) => Promise<void>
} = useConnections(topicId);
```

## API Integration

### Supabase Real-time
All hooks use Supabase real-time subscriptions. Data syncs automatically across tabs:

```typescript
// Subscribes to topic changes
const channel = subscribeToTopics(callback);

// Subscribes to verses/connections in a topic
const channel = subscribeToTopic(topicId, callback);
```

### Bible API
Free Bible text lookup (no API key required):

```typescript
// Fetch single verse or range
const text = await fetchKjvVerse('John', 3, 16);
const rangeText = await fetchKjvVerseRange('Romans', 8, 28, 30);
```

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Type check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run the configured ESLint 9 checks |
| `npm run data:validate-eras` | Validate historical IDs, sources, scopes, references and geometry |
| `npm run test:eras` | Run historical resolver and invalid-data regression tests |
| `npm run data:basemap` | Reproduce pinned Natural Earth physical geography |

## Deployment

Build creates static files in `dist/`:

```bash
npm run build
```

Deploy to any static host:
- **Vercel**: `vercel --prod`
- **Netlify**: Connect Git repo or drag `dist/`
- **Cloudflare Pages**: Connect Git repo

## License

MIT - Use freely for personal, church, or commercial projects.

---

Built for studying and connecting God's Word. 📖✝️

### Performance migration and verification

Apply `supabase/migrations/009_performance.sql` after the existing migrations using the Supabase SQL editor. It adds the batched dashboard count function and indexes for the existing substring search, preserving caller permissions. The application retains a bounded legacy count fallback until the function is available. This migration has not been applied automatically; large existing tables may take time to build their indexes.

Run `node scripts/test-performance.mjs` for worker/map equivalence checks and diagnostic timings against Git HEAD, plus `npm run test:eras`, `npm run lint`, and `npm run build`. See `docs/performance-audit.md` for measurements and validation limits.
