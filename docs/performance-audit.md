# Performance audit — 2026-09-07

This pass inspected startup, React Flow canvases, dashboard/query loading, Bible worker access, search, map clustering and passage/book matching. Existing historical-era work was preserved. No production database or deployed site was modified. The repository had no built graphify graph; the code index, architecture document and source were used for inspection.

## Fixes

| Bottleneck | Change |
| --- | --- |
| All graph pages and React Flow loaded on dashboard startup | Lazy route imports; topic-scoped provider; graph CSS included on each graph route |
| PNG export library loaded before export | Dynamic import at export time |
| Up to three count requests per topic | One batched count RPC; React Query cache keyed by topic IDs; bounded legacy fallback |
| Entity mention request for every verse | Topic-filtered joined query, paged at 500 rows |
| Every Bible selection scans 31,102 verses | One-time book/chapter indexes in the existing worker |
| Map book matching repeatedly normalizes every name and verse | Cached name normalization, single verse normalization, first-word candidate index with exact phrase matching |
| Cluster insertion copies its entire growing bucket | Append into locally owned buckets |
| Zoom generates both zoomend and moveend redraws | Coalesce marker and persistent-name rendering with requestAnimationFrame |
| People edges scan every person repeatedly; network edges repeatedly scan links | ID maps for graph joins; memoized filtered people |
| Verse canvas builds nodes/edges in memo and then again in effects | Reuse memoized results; preserve pending anchor and mention/callback updates |
| Shared debounce drops distinct node saves | Save each verse/person once at drag-stop |
| Obsolete global searches continue and overwrite newer results | AbortSignal and late-result guard |
| Existing full-text index does not support ILIKE substring query | Migration adds trigram indexes preserving current search behavior |

## Measurements

Production entry JavaScript: **739.10 KB → approximately 439.6 KB** (about 41% smaller); gzip **218.31 KB → approximately 127.8 KB**. These are Vite output sizes, not measured page-load latency. Lazy loading reduces startup parsing; the PWA still precaches all route chunks for offline use. Large map/catalog and physical-geography assets remain (approximately 1.73 MB and 1.52 MB uncompressed).

Local diagnostic run with the real bundled KJV and catalog:

- 500 warm verse-range worker requests: **330.2 ms → 4.9 ms**.
- Judges full-book catalog matching: **7278.0 ms → 79.1 ms**.

These are single-run Node timings, not mobile/browser latency promises. The baseline implementations run in a VM; exact speedup ratios should not be treated as controlled browser benchmarks. Output equivalence is asserted, including missing books, range bounds, duplicate/custom selections, full-book text, passage/name matches and preservation of every catalog identity across four zoom levels.

## Verification and deployment

- Production TypeScript/Vite build and ESLint pass.
- All 24 historical-era regression tests pass.
- Local production-preview smoke test: network rendered 21 topics, People Atlas rendered 14 people and 8 relationships, and map rendered catalog clusters and physical geography. No browser console errors were captured on those routes. Drag persistence, export, and the new database RPC were not exercised against live user data.
- `node scripts/test-performance.mjs` passes worker/map regression checks. It compares source against Git HEAD, so run before committing to measure this change; it is a diagnostic, not a permanent frozen baseline.
- Builds use temporary output directories to preserve pre-existing tracked `dist` changes.
- Apply `supabase/migrations/009_performance.sql` to activate the count RPC and search indexes. It uses SECURITY INVOKER and preserves caller permissions. The fallback keeps older databases usable. SQL has been reviewed against the schema but has not been executed against a local or production Postgres instance; query plans and real-network improvements remain unmeasured.
- Large-map rendering, crowded graph drag frame rates, production database plans and low-end mobile behavior require representative browser/database profiling. This pass does not establish that every possible performance bottleneck has been eliminated.
