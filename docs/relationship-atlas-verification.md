# Relationship Atlas verification

Implementation completed locally; verification finalized November 6, 2026. The user subsequently confirmed that migration 010 was applied to the connected Supabase project. No production database writes were made during verification.

## Delivered

- Extensible relationship definitions and one create/edit editor with searchable endpoints, custom labels, categories, direction/symmetry, notes, period/status context and validated Scripture evidence.
- Multiple assertions per entity pair, expandable visual bundles, complete directional statements, non-person targets, category/type/entity/period/status filters and immediate-neighbor focus.
- Exact confirmed direct-parent pairs form derived shared junctions. Single-parent, ancestral, ambiguous and uncertain assertions stay distinct; marriage and concubinage remain independent.
- Atlas search covers recorded entity names/aliases/qualifiers, relationship labels/endpoints/notes and evidence references. Search selection explicitly reveals and fits the result while preserving filters.
- Same-name identity support through UUIDs and qualifiers; deliberate duplicate creation in Atlas and verse tagging. Existing raw relationship strings and route order survive editing/migration.
- Retained input on save failure, atomic multi-parent saves, duplicate/cycle checks, optimistic position saves, paginated reads and realtime invalidation. Existing pre-migration reads remain supported.
- Desktop details pane and phone lower pane, collapsible phone filters, keyboard-search controls and shared accessible dialogs. Dialog close handlers no longer reinitialize focus as save state changes.

## Automated checks

- `npm run test:relationships`: 22 pure regression checks passed. Covers exact shared pairs, different pairs, single parents, legacy text, ancestor/uncertainty exclusions, biological/adoptive and period separation, ambiguous three-parent contexts, inverse wording, custom types, duplicate identity, bundles, reference validation, aliases, same-name identities, ranking and search.
- `npm run test:relationships:database`: passed against disposable local PostgreSQL. Applied the existing base/entity/Atlas schema and migration 010, then checked definitions, evidence preservation, idempotent parent confirmation, ancestry cycles, two-parent rollback, custom definitions, symmetric/inverse duplicates, failed evidence rollback, same-name identities, migration reapplication, raw legacy labels/route order, and successful invoker calls as `anon`. The test never reads project connection credentials.
- `npm run test:eras`: all 24 existing historical-era checks passed.
- `node scripts/test-performance.mjs`: worker and map checks passed. The comparison harness now targets ES2020, matching the application; its former default downlevel compilation incorrectly traversed Maps/Sets and produced an empty baseline matcher result.
- `npm run lint`: passed.
- `npm run build -- --outDir /private/tmp/bibleflow-relationship-build`: passed, including TypeScript and production/PWA generation. Output was directed outside the repository to preserve the pre-existing changes in `dist/`. Existing large map-chunk and stale Browserslist warnings remain.

Pure utility diagnostic with 3,000 entities and 6,000 assertions: index creation measured 64–242 ms and one multiword search measured 1–4 ms across runs, including a run alongside other checks. These are local utility measurements, not a browser rendering capacity guarantee.

## Browser checks

Used `/scripts/relationship-preview.html`, a disposable in-memory fixture with Supabase application reads/writes intercepted and realtime transport disabled. Verified:

- Shared-parent junction and branches for two children, with a separate concubine relationship.
- Junction inspection opens all underlying assertions.
- New custom relationship to a nation, Scripture reference parsing, successful save and subsequent search.
- Hidden relationship search result reveals both endpoints from Family view, displays evidence and fits the requested result at readable scale.
- Keyboard Enter selects a search result.
- Same-name people have separate IDs and distinguishing descriptions in selectors/results.
- `?failSave=1` reports a simulated connection error while retaining source, target, relationship label and notes.
- Set parents requires direct-parent confirmation, saves both selected parents and does not duplicate the compatible existing assertions.
- Desktop layout at 1280×900 and phone layout at 390×844, including Fit View and the phone detail pane. Temporary viewport changes were reset afterward.
- Fresh fixture startup produced no runtime errors after fixing unstable empty-data defaults and synthetic-node dimensions. Fixed junction pointer interaction and camera-fit initialization during these checks.

The original `/atlas` was reloaded afterward and successfully displayed the user's existing study records with the migration-required notice. Existing records were read only. Screenshot previews use synthetic fixture data, not modified user records.

## Database activation and limits

The user confirmed application of `supabase/migrations/010_relationship_atlas.sql` after local verification; reload `/atlas` after the application code update. Only `VITE_SUPABASE_URL` and the public `VITE_SUPABASE_ANON_KEY` are configured locally; no database-management connection or admin connector is available. Remote application is user-confirmed; cross-client realtime writes have not been independently tested against the deployed project.

The migration does not delete entities or relationships. It removes blanket `(name,type)` uniqueness to permit distinct same-name people. Reintroducing that constraint after such records have been created requires deliberate identity resolution first. Legacy labels remain unconfirmed for direct-parent grouping until a user reviews them.

Scope does not include automatic fact extraction from Scripture, unrestricted natural-language questions, automatic identity merging, inferred genealogy, automatic whole-canvas rearrangement, or integration of Atlas results into the existing global verse-search page. Custom types can be categorized when created; changing a shared type definition's semantics later is not exposed as a bulk editing UI.
