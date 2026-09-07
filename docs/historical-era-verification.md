# Historical era release verification

Completed 7 September 2026. Scope: twelve map-only eras, 73 place annotations, 13 site contexts and 17 separate itineraries. No database migration or deployment is part of this change. The exact content manifest and evidence policy are in [historical-era-sources.md](historical-era-sources.md).

## Final automated checks

- `npm run build`: passed, including TypeScript and production service-worker generation.
- `npm run lint`: passed. Added the missing ESLint configuration during implementation; the original baseline could not run lint.
- `npm run test:eras`: all 24 tests passed. Covers all eras, scoped names and separate co-located identities, incompatible filters, deduplicated passage/route overrides, snapshot transitions, stale routes, unresolved segments, URL preservation, and malformed content rejection.
- `npm run data:validate-eras`: passed for the complete release manifest.
- `git diff --check`: passed.

## Browser checks

Earlier implementation sessions reported exercising all twelve presets in production, keyboard selection and browser Back with snapshot restoration, phone controls, layer toggles, passage camera fitting, and preservation of an existing Laish draft point while new points use the current name. They also reported reopening the cached production map with the preview server stopped and successfully changing its layers. These checks are recorded from the continuation history, rather than claimed as fresh runs on this date.

The final continuation reopened the production Judges view and verified the path creation dialog visually at the available narrow viewport. The dialog now renders above both the study dock and timeline (`z-index: 1300`, versus dock 1200 and timeline 1190); its fields, Cancel and Save remain visible. An initial load served the older service-worker cache; reloading picked up the current build and confirmed the correction. No personal records were saved or deleted during this final check.

## Bundle and performance evidence

The previous checked-in map JavaScript was 1,614,153 bytes uncompressed (287.79 kB gzip). The final map chunk is 1,730.66 kB (310.47 kB gzip), and the separate physical geography chunk is 1,519.07 kB (508.67 kB gzip). Era content stays in the lazy map dependency graph. Production precaching includes 17 entries totaling 3,994.29 KiB, including the physical geography chunk.

The final test run completed 1,200 pure resolver switches in 211 ms. This is not a browser render benchmark: the proposed desktop/phone rendering latency budgets have not been established on representative hardware. Vite still warns about large chunks, and Browserslist reports an aging compatibility dataset; neither fails the build.

## Deliberate limits

This is curated narrative relevance, not exhaustive dating of all 1,335 catalog places. Context halos are site lenses, not imperial boundaries. Journey lines indicate schematic narrative sequence, not surveyed roads; unresolved stops and disputed identifications remain explicit. The Hellenistic bridge period does not invent an itinerary to fill a quota.

Cached era content and physical geography can work without the application server. Modern raster tiles, uncached Bible text, and personal Supabase data have separate availability constraints. Live database save/edit persistence was not re-tested in this final continuation. Continuous dates, animated borders and People Atlas synchronization remain outside the accepted first-release scope.
