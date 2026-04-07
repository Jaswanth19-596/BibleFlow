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
| `npm run lint` | Run ESLint on all files |

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
