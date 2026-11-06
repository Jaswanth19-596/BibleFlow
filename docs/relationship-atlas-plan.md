# Relationship Atlas and Search — Implementation Plan

Status: implemented in the local application; migration 010 is locally verified and the user has confirmed applying it to the connected Supabase project. See relationship-atlas-verification.md for verification and limits.

## Intended result

Extend the People Atlas so users can record any named relationship, inspect its direction and evidence, find people and relationships quickly, and switch between a readable family presentation and a broader relationship network. Existing records and saved person positions remain usable.

The relationship vocabulary is extensible. Suggested labels help users get started; they never limit what can be recorded. A family junction is a presentation of confirmed parentage, not a new person or an assertion of marriage.

## What the current implementation establishes

- `src/lib/types.ts` and migration 005 already allow arbitrary relationship strings. Existing data stores source, target, label, description, and optional route order.
- `PeopleAtlas.tsx` displays only person entities and filters out relationships whose other endpoint is a place, nation, concept, or other entity.
- Its connection handler blocks every additional relationship between the same pair, regardless of label or direction. The database itself does not impose this pair restriction.
- Create and edit flows duplicate a short suggestion list. Creating a relationship lowercases its text and replaces spaces with hyphens.
- All edges share the same dashed appearance and lack an explicit directional arrow. Edge synchronization keys only include IDs, so edits and endpoint movement need more reliable synchronization.
- `EntityDetailSidebar.tsx` detects incoming connections but renders the same label next to the other entity. This can reverse a relationship's apparent meaning.
- The Atlas has a URL highlight parameter but no search control or explicit search-result camera navigation.
- `usePeopleAtlas()` also supplies relationships to the map. Shared changes must preserve route relationship types and `sort_order` behavior.
- Migration 003 enforces unique `(name, type)` entity pairs. Distinct biblical people sharing a name need a deliberate identity solution; search cannot solve this with labels alone.

## 1. Relationship meaning and storage

### Extensible definitions

Introduce reusable relationship definitions with a stable ID/key, display label, optional inverse label, category, directional/symmetric behavior, and optional explicit parentage semantics. Seed a useful starting vocabulary and include existing custom labels in the picker.

Suggested categories: family, religious/service roles, political/social roles, geography/movement, and other. Categories organize results and styling; they are not a closed set of allowed relationships. New labels can be saved immediately under Other, with optional categorization.

Keep distinct definitions for `priest of`, `prophet of`, `prophet to`, `concubine of`, and `married to`. Do not treat related wording as equivalent unless a definition explicitly declares that equivalence. Preserve user display spelling; normalize a separate comparison/search key.

Known definitions can supply inverse wording. Unknown custom relationships always remain readable as a complete `Source — relationship → Target` statement. Do not invent an inverse label or infer a person's gender from their name.

### Additive schema

Plan migration `010_relationship_atlas.sql`, following verification of the actual migration list during implementation:

- A `relationship_definitions` table with the fields described above; stable unique keys prevent accidental duplicate definitions.
- Nullable `definition_id` on existing `entity_relationships`, retaining the existing `type` text for legacy compatibility and consumers such as the map.
- Relationship metadata for optional period context, assertion status (`unspecified`, `explicit`, `inferred`, `disputed`), direct-versus-ancestral lineage scope, and parentage nature (`unspecified`, `biological`, `adoptive`, `legal`). These are user annotations, not automated judgments.
- A `relationship_evidence` table allowing multiple structured Scripture references per relationship, plus an optional explanation. References must work without first creating a saved topic verse.
- Indexes for endpoint/definition/evidence lookups, realtime configuration for new tables, and access rules consistent with the deployed app's existing access model. Do not alter unrelated access settings in this feature.
- A transactional operation for setting a child's selected parent relationships together. It must reuse matching records and preserve existing evidence rather than duplicating or replacing them silently.

Resolve legacy labels through an explicit dictionary and retain every unknown label unchanged. Matching a legacy `son-of` label may suggest a definition; it does not establish direct or biological parentage. Ambiguous migration matches remain unclassified for review. No automatic deletion or deduplication of legacy records.

### Entity identity and targets

Allow selection of existing people, places, nations, events, objects, and concepts. Add user-facing group/institution/divine-entity subtypes using explicit metadata on suitable existing entity types; do not automatically classify divine entities as people. Show the subtype clearly on cards and in pickers.

Permit distinct entities with the same name by replacing the blanket name/type uniqueness constraint in a reviewed additive migration. Identify records by UUID and show a short qualifier, description, period, or reference in search. A possible duplicate prompts the user to choose an existing record or deliberately create a distinct one; it never merges entities automatically. Support explicit aliases in entity metadata and audit existing name-based assumptions before relaxing the constraint.

Relationships involving more than two participants can use a named group or event entity with individually labeled participant connections. Do not infer connections among all members of a group.

## 2. Create and edit workflow

Use one shared relationship editor for drawing an edge, adding a relationship from a selected entity, and editing an existing relationship.

1. Search for the source and target, with entity type and qualifier visible.
2. Search suggested, previously used, and custom relationship labels; offer “Create relationship type” when no label matches.
3. Preview the full statement and provide a Swap direction action.
4. Optionally add notes, Scripture evidence, period context, and assertion status.
5. Save with visible progress and errors; keep the editor and entered values open if persistence fails.

Allow several different relationships between the same entities. Detect a potential duplicate using endpoints, explicit relationship semantics, and context, rather than rejecting an entity pair. Symmetric definitions compare unordered endpoint pairs; directed definitions preserve order. Known inverse wording can resolve to the same assertion without storing a second edge. Existing duplicate assertions remain separately inspectable until a user deliberately resolves them. Self-connections remain invalid.

“Set parents” is a dedicated shortcut from a child's details. Its searchable selectors use neutral parent slots with optional explicit role labels. It supports one known parent, two known parents, and separately recorded adoptive/legal/uncertain assertions. Choosing parents previews the statements and asks for direct-parentage confirmation as part of the form.

## 3. Family presentation

Offer Family and Relationships views over the same stored assertions. Family view starts with family relationships; other recorded relationships remain available through filters and details.

- For an exact confirmed direct-parent pair and compatible parentage context, render one small junction and branch to their shared children. A different parent pair produces a separate junction.
- One known parent stays a direct parent-to-child connection. Do not manufacture an unknown spouse or parent.
- Do not combine biological, adoptive/legal, disputed, and unspecified parentage into one unqualified trunk. Show separate labeled assertions when there is no unambiguous grouping.
- Marriage and concubinage remain independent labeled facts. Shared parenthood never creates either one, and neither one assigns children automatically.
- Ancestor/descendant relationships and unreviewed ambiguous legacy labels remain ordinary labeled edges.
- Use measured node dimensions and current dragged positions for junction placement and right-angle routing. Junctions have stable derived IDs, do not save as entities, and do not get assigned to timeline periods.
- A junction opens a list of the original assertions and their evidence. Deleting a visual branch must identify the affected assertions; it must never delete a person or a whole family implicitly.
- Preserve manual positions. Provide an explicit Arrange selected family action if needed; avoid automatic rearrangement of the full canvas or changes to period assignments.

## 4. General relationship presentation

- Default to people and expose connected non-person entities on selection, search, or an explicit related-entities toggle. Clearly distinguish entity types.
- Directional edges have arrows and readable labels; symmetric definitions use an appropriate non-directional connection.
- Use restrained category colors alongside text and line treatment, with a small legend. Color is never the only indicator of meaning or uncertainty.
- Several assertions between a pair can share a visual bundle labeled with a count. Opening it shows every original statement and direction; selected assertions can expand into separate offset paths. Bundling never merges stored assertions.
- At close zoom show useful labels; at distant zoom reduce label density. Selection, keyboard focus, search matches, and tap reveal the complete statement.
- Focusing an entity emphasizes its immediate neighbors and offers an explicit step to expand farther. A dense network does not automatically expand its entire connected component.
- Filters cover category, exact relationship type, entity type, optional period, and assertion status. Undated assertions are labeled separately and can remain visible; assigned timeline bands do not prove relationship dates.
- Counts distinguish total assertions, visible assertions, and visual bundles. Hidden endpoints never leave dangling edges.

## 5. Search

### Atlas search

Add a persistent search field with the placeholder “Search people, relationships, or references…”. Scope it to recorded Atlas entities and relationship evidence, including entities not currently displayed. This is not a promise of full-text search across the entire Bible or automatic biblical fact discovery.

Search indexes:

- Entity names, explicit aliases, qualifiers, and descriptions.
- Relationship labels, category names, notes, and both endpoint names.
- Structured Scripture evidence, normalized to familiar book names and abbreviations.

Example supported queries: `Rizpah`, `priest`, `concubine of`, and an attached reference such as `2 Sam 21:8`. Multiword matching is defined over the combined searchable fields; it does not guess arbitrary natural-language questions. Never combine same-name entities into one result.

Group results into Entities, Relationship types, Relationships, and References. Rank exact names/aliases first, then name prefixes, label matches, and descriptive text; use stable secondary ordering. Debounce typing, memoize the index, and limit initial visible rows with “Show more” while retaining an accurate total. Start with local indexing over the already loaded Atlas records; verify complete paginated loading so server row limits do not silently omit results. Measure before adding server-side search.

Result actions are explicit:

- Entity: center and highlight the card, then open its details and nearby relationships.
- Relationship: reveal both endpoints, fit those endpoints, select the exact assertion, and expand its visual bundle if necessary.
- Relationship type: apply a visible filter chip and offer Fit results.
- Reference: list its matching assertions; choosing an assertion follows the relationship behavior above.

If a result conflicts with active filters or Family view, show a labeled temporary reveal or offer a deliberate switch to Relationships view. Do not silently reset filters. Clearing the reveal restores the prior scope. Search typing does not pan the camera; selecting a result does. Clearing search removes its highlighting without repositioning nodes or resetting the camera.

Distinguish no matches, matches hidden by filters, loading, and load failure. Support Enter, arrow-key navigation, Escape, clear search, accessible result announcements, and touch operation. Cancel superseded async evidence searches if later measurement justifies server searching.

### Search while editing

Searchable source/target pickers and the relationship-type picker are part of the first usable release. Show existing entities before offering creation. An existing type with different spacing or case should be suggested without silently rewriting a user's custom meaning.

### Existing global search

Keep the existing verse search behavior intact. Atlas search is available directly on `/atlas`; an optional later global search tab can reuse the same search logic. It is not a prerequisite for this release.

## 6. Implementation sequence

1. **Semantic foundation and migration:** add definitions, evidence, contextual metadata, identity support, legacy resolver, and transactional parent updates. Keep old fields compatible; document migration application and rollback limits.
2. **Editor and searchable pickers:** centralize create/edit flows, support multiple assertions, correct direction rendering in entity details, and surface load/save errors. Preserve original text and evidence.
3. **Atlas search:** build the shared index, results panel, filter/reveal state, and explicit camera actions. Make URL highlights use the same reliable reveal/focus path.
4. **Family rendering:** add direct-parent confirmation and Set parents, derive junctions from eligible assertions, and implement measured routing without moving saved people.
5. **Relationship rendering:** add non-person endpoint cards, category/type filters, bundles, focus navigation, zoom-aware labels, and accessible details.
6. **Integration and verification:** verify legacy migration fixtures, map route behavior, realtime updates, narrow-screen workflows, and production checks; update project memory in the same changes as implementation.

Likely new modules: relationship definitions/legacy resolution, Atlas search, family graph derivation, shared relationship editor/type picker, Set parents editor, search/results/filter controls, family junction node, and related-entity card. Extract pure indexing and graph derivation from `PeopleAtlas.tsx`; keep rendering, interaction state, and persistence responsibilities separate.

Existing files affected: `PeopleAtlas.tsx`, `PersonNode.tsx`, `RelationshipEdge.tsx`, `EditRelationshipModal.tsx`, `usePeopleAtlas.ts`, shared relationship queries/types, and `EntityDetailSidebar.tsx`. Inspect the unused `CreateRelationshipModal.tsx` before deciding whether to replace or remove it. Preserve map consumers of the shared hook. Update `CODE_INDEX.md`, `KNOWLEDGE_GRAPH.md`, and SQL/setup sections of `README.md` with the corresponding code/migration work.

## 7. Completion checks

- Saul and Rizpah can share one eligible family branch to two children; another parent pair creates a separate branch, with no inferred marriage.
- Single-parent, ancestor, adoptive/legal, and disputed examples retain their correct distinctions. Unknown legacy labels remain visible.
- `priest of`, `prophet of`, `prophet to`, `concubine of`, and a newly invented custom label can all be created, edited, filtered, and searched without code changes.
- A person-to-nation or person-to-institution assertion displays both endpoints and the correct direction. Entity details read correctly from either endpoint.
- Two different assertions between the same entities persist independently. Bundling, filtering, and searching do not remove either assertion or its evidence.
- Same-name people with different identities remain separate in creation, search, connections, and reloads.
- Search finds names, aliases, custom labels, notes, and attached references; result selection reveals and focuses the correct records, even under restrictive filters.
- Editing a label, moving a node, changing evidence, and a realtime update all refresh the display without losing a drag or resetting the camera.
- Failed multi-parent saves are atomic; failed edits preserve input. Reloading preserves successful work and original positions. Search and filters never write node positions.
- Existing map route records, ordering, verse tagging, timeline resizing, and verse search continue to work.
- Keyboard and phone users can add, search, inspect, and edit without hover-only controls. Verify light/dark presentation and large-result scrolling.
- Run focused tests for semantic resolution, family eligibility/grouping, pair bundling, search/reference normalization, and transactional persistence; run `npm run lint` and `npm run build`, plus existing relevant regression checks. Verify representative interaction flows in the browser. Measure index/build interaction time on a representative large synthetic graph before claiming a capacity target.

The first usable release includes custom relationships, multiple assertions per pair, related entity targets, creation-time search, Atlas search, and shared-parent rendering. General natural-language querying, automatic Scripture fact extraction, automatic identity merging, and automatic biblical genealogy inference are separate future work.
