# Historical era slider — implementation plan

Status: implemented, verified 7 September 2026. See docs/historical-era-verification.md for results and limitations. The original planning brief below is retained for design context.

Implemented scope: twelve map-only presets, qualified narrative chronology, named snapshots, and a bundled physical backdrop with an optional Modern map. The released content and source policy are recorded in docs/historical-era-sources.md. Historical examples below remain the original design brief; the released manifest is authoritative.

## 1. Product outcome and recommended scope

On `/map`, a reader selects a named era and sees a coherent historical study view: relevant places, suitable names, geographical/political context, and curated journeys. Every historical assertion should be traceable to its evidence. Returning to **All eras** restores the general catalog experience.

Recommended first release:

- Twelve discrete era presets, with the user's seven requested eras included.
- Era-aware places, names, territory/context layers, and curated routes.
- A short era summary, evidence links, approximate date label, and layer controls.
- Responsive slider, previous/next controls, and a dropdown for direct selection.
- URL persistence for shareable era selection and browser back/forward.
- Existing book, passage, search, saved-place, drawn-path, and journey workflows retained with explicit interactions below.
- Curated static data shipped with the map; no Supabase migration for the recommended map-only scope.

Defer continuous year scrubbing, animated border morphing, autoplay, comparison maps, user-authored historical reconstructions, and automatic People Atlas synchronization. These introduce separate data or interaction problems and are not prerequisites for the requested feature.

The release should cover the selected eras fully as study presets, while describing its place selection as curated. It must not imply that all 1,335 catalog records have received historical dating research.

## 2. Findings from the current repository

| Existing capability | Location | Consequence for this feature |
|---|---|---|
| Imperative Leaflet map and layer effects | `src/components/map/BibleMap.tsx` | Reuse the map instance; update dedicated layer groups when an era changes. |
| 1,335 mappable catalog records | `src/data/biblicalPlaces.ts`, generated snapshot | Add an era annotation layer keyed by existing IDs. Preserve the importer output. |
| Book filtering and literal KJV matching | `BibleMap.tsx`, `src/lib/passagePlaces.ts` | Book occurrence is useful search evidence, but does not establish an occupation date. |
| Source outlines, confidence bands, site lenses, unresolved groups | `src/data/biblicalTerritories.ts` | Existing geometries have no era validity fields. Do not present them as dated imperial frontiers. |
| Approximate book-associated study polygons | `src/data/biblicalAreas.ts` | Suppress these generic polygons in era mode; supply curated era context instead. |
| Source-attributed place and territory panels | `HistoricalPlaceDetails.tsx`, `TerritoryEvidenceCard.tsx` | Extend these patterns with era relevance and snapshot evidence. |
| Catalog search | `MapSearchBar.tsx`, `src/lib/territorySearch.ts` | Add era-aware labels, ranking, and a deliberate broader-catalog escape. |
| Personal routes and drawing | `useMapPaths`, `CreatePathModal`, `PathDrawingToolbar`, `BibleMap.tsx` | Historical routes must remain separate from saved user work. |
| User-created timeline bands without dates | `TimelinePeriod` in `src/lib/types.ts` | These are organizational bands, not an existing historical era model. |
| OpenStreetMap.de raster tiles | `BibleMap.tsx` map initialization | Modern labels and borders are baked into images; CSS cannot selectively remove them. |
| Lazy `/map` route and PWA | `src/App.tsx`, `vite.config.ts` | Keep new data inside map chunks and verify caching of added assets. |

Specific integration traps found in code:

- Passage rendering currently bypasses the ordinary place filters. Adding an era condition only to `filteredBiblicalPlaces` would leave passage mode inconsistent.
- Tooltip names, cluster lists, search results, detail headings, travel selectors, and route drawing currently obtain labels independently. They need one shared resolver.
- `handleFlyTo` uses delayed timers. An old timer can recreate a stale search pin after an era change unless invalidated and cleaned up.
- Map background clicks during drawing search the full catalog for nearby names. In an era view they should snap only to eligible visible records and explicitly selected study overrides.
- The territory-rendering effect also fits the camera. Automatic era rendering must not inherit that camera jump on every update.
- The comment describing `BiblicalPlaceCluster.id` as a modern-location ID is stale. The importer groups by ancient record ID and emits `openbible-<ancient-id>`. Preserve the actual IDs and distinct ancient identities.
- `CODE_INDEX.md` only partly describes the newer path features. Verify real files before implementing.
- `package.json` has build/lint commands but no test script. No project test files or ESLint configuration were found in this inspection. Establish the validation baseline before implementation; do not assume lint is currently configured successfully.

## 3. Era catalog

Use an ordered category slider, not an evenly scaled date axis. Equal tick spacing means “next study period,” not equal elapsed time. **All eras** is a separate reset option, not a historical period.

Proposed presets and editorial briefs:

| ID | Display label | Geography/content to research | Route content to research |
|---|---|---|---|
| `patriarchs` | Patriarchs | Mesopotamia, Canaan, Egypt; Ur/Haran, Shechem, Bethel, Hebron, Beersheba | Abraham's movements; Jacob's journeys as separate narratives |
| `exodus` | Exodus & Wilderness | Egypt, wilderness traditions, Sinai candidates, Kadesh-barnea, Moab | Selected Exodus reconstruction with disputed segments and alternative notes |
| `conquest` | Conquest & Settlement | Jordan crossing, Jericho, Ai, Gilgal, Shechem; settlement context | Joshua narrative sequence, distinguished from a surveyed route |
| `judges` | Judges | Shiloh, tribal/settlement regions, relevant neighboring groups | One selected narrative itinerary where passage evidence supports it |
| `united-monarchy` | United Monarchy | Saul, David, Solomon; Jerusalem, Hebron, neighboring polities | A selected David narrative; dated/reign-specific context |
| `divided-monarchy` | Divided Monarchy | Israel/Judah, Samaria/Jerusalem, neighboring kingdoms and Assyrian context | Selected campaign or deportation itinerary with an event label |
| `exile` | Babylonian Exile | Judah and Babylonian centers; exile destinations | Selected deportation narrative/corridor, with reconstruction status |
| `return-persian` | Return & Persian Period | Yehud/Jerusalem, Persian context, Susa | Return from exile as a qualified itinerary |
| `hellenistic` | Hellenistic & Hasmonean Periods | Successor kingdoms and Judea; one clearly named political snapshot | Optional; no route drawn simply to fill the screen |
| `herodian` | Herodian & Early Roman Period | Judea and adjacent jurisdictions; distinguish reigns/phases | Infancy narrative itinerary, with source Gospel identified |
| `jesus-ministry` | Jesus' Ministry | Galilee, Samaria, Judea, Perea; relevant towns and regional authority | Specific Gospel journeys, not one asserted harmonized itinerary |
| `early-church` | Early Church | Jerusalem, Antioch, Asia Minor, Greece, Rome | Paul's journeys and voyage to Rome as separately selectable routes |

Dates are an editorial deliverable in phase 1. Do not encode exact beginning/end years from this table. Decide the chronology policy first; then attach a source and approximation/dispute note to each displayed range. Earlier narrative periods may use a qualified verbal label rather than unsupported numerical precision.

A broad era is not one unchanging political map. Each era has one default **named snapshot**; its caption identifies the narrower date/reign/event where applicable. Users can choose another reviewed snapshot within that era when content exists. Changing the snapshot changes its territory membership and any explicitly snapshot-specific annotations. Do not combine mutually incompatible frontiers from different reigns into one apparent simultaneous state.

For the broad Hellenistic and Herodian presets, this snapshot caption is particularly necessary. The era summary explains the wider span; the map explicitly shows the chosen moment or study context.

## 4. User experience

### Main control

Desktop: a compact timeline strip along the bottom of the unobstructed map area, offset from the sidebar and zoom controls. Include previous/next, current era and approximate date label, a native range input with named stops, a dropdown, **All eras**, and **Fit era**.

Mobile: a persistent compact current-era chip above the existing bottom rail. Tapping it expands the timeline controls inside the existing map dock. Avoid an additional full-screen modal or stacked competing bottom sheets. Put the era selector in the dock header so it remains discoverable while another accordion is open.

The selected era gets a short summary in the dock: why this era matters, the current map snapshot, relevant reading links, and a concise explanation of the evidence style. Layer toggles: **Places**, **Historical areas**, **Historical journeys**. **Names** controls persistent labels, not marker accessibility names or search text.

### Switching behavior

1. The thumb and current-era label respond immediately.
2. Coalesce rapid pointer changes with `requestAnimationFrame`; update the complete resolved view at each displayed discrete stop. Do not start competing asynchronous historical-data requests.
3. Remove obsolete historical areas, routes, labels, and temporary pins; add the selected era's eligible content together.
4. Keep the camera at its current position. **Fit era** explicitly uses that era's curated bounds and padding for the current panels. If the current viewport has no results, offer this action visibly.
5. Preserve saved records and ongoing route drawings. Their data does not acquire historical dates just because the slider moved.

Do not interpolate polygon vertices or move settlements between era ticks. Coordinate alternatives remain explicit evidence choices.

### Names and identity

- Resolve all historical display names with `resolvePlaceLabel(placeId, eraId, snapshotId, selectedBook)`.
- Priority: reviewed snapshot name, reviewed era name, existing book-lens name, canonical catalog name.
- If no dated name is known, retain the catalog name. Details identify it as the catalog label; do not invent an ancient spelling.
- Translation/spelling variants remain searchable, even when another name is displayed.
- Some names represent separate ancient records at one location. Preserve those IDs and use an explicit sourced related-identity link when warranted; never merge records just because coordinates match.
- Names like Jebus/Jerusalem or Laish/Dan are candidates for editorial review, not permission for unconditional string replacement across eras.
- Details show “During this era,” the reason for inclusion, relevant references, dated-name evidence, and the original catalog evidence separately.

## 5. Filter and selection contract

Era relevance means “included in this curated study period.” It does not mean “proven to exist only during these dates.” Archaeological occupation, scriptural mention, route membership, and editorial study relevance are different claims.

| User action/state | Required behavior |
|---|---|
| Era + book selected | Intersect reviewed era-place membership with current book results, then apply coverage and type. Never auto-switch eras merely because a book was selected. |
| Book spans multiple eras | Offer relevant-era suggestions only if a curated mapping exists. A book's writing date and narrated events must not be conflated. |
| Passage active | Preserve every passage result, regardless of era/coverage/type, as an explicit study override. Inside-era results use the era label; unmatched results say “Not classified for this era,” not “did not exist.” Show override counts separately. |
| Era changes with passage active | Keep the passage and update its membership badges; do not clear the user's reading selection. |
| Historical-place layer turned off | Hide historical pins and place labels, including passage pins; retain results in the dock. Era areas and curated routes have independent toggles. |
| Search in an era | Search era-eligible catalog places and era-compatible territory entries; also include saved places. Respect the current book lens for normal catalog results; coverage/type are map-density filters, not search exclusions. |
| Search has no suitable result | Offer an explicit “Search all eras and books” action. Broader results show classification status; viewing one adds a temporary study pin without switching the era. |
| Broad search selects an undated territory | Show its evidence note, but do not paint an undated polygon as era-valid. Offer a deliberate return to All eras to view its general outline. |
| Selected place becomes filtered out | Keep its evidence panel open, flag its current status, remove its ordinary map marker. An explicit “Show on map” adds a temporary study override. |
| Selected territory changes era | Resolve a compatible snapshot of the same polity if declared; otherwise clear the highlight with a brief status announcement. Do not display old geometry. |
| Curated route selected | Show its ordered stops and segments. Route stops are explicit study overrides if normal density/book filters exclude them. |
| Curated route no longer belongs to era | Clear its selection and overlay. Default routes for the new era appear only when Historical journeys is enabled. |
| Personal places/paths/person routes | Preserve existing visibility selections. Label them as personal study content; no inferred era assignment. |
| Travel estimate active | Preserve endpoints and estimates with a “Study estimate” label. The existing corridor generator is not a source for reconstructed biblical journeys. |
| Drawing a path during era change | Preserve existing draft points and names. New snapped points use the new resolved view. Never rename previously saved/drafted points as a side effect. |
| All eras selected | Restore ordinary catalog/book filtering and existing general territory search. Hide automatic era areas/journeys. Keep active passage and personal study work. |
| Nothing matches | Show the active filters, zero-result message, and separate actions to clear book/type/coverage, fit the era, or return to All eras. Never silently widen a filter. |

Counts distinguish the eligible catalog total, records currently represented by clusters, and explicit study overrides. Do not count the same source ID twice when it is both era-eligible and a passage/route stop.

## 6. Historical data contract

Keep an additive curated dataset alongside the generated OpenBible catalog. Use explicit IDs, not fuzzy joins or name-only matching. Recommended entities:

| Entity | Required fields and semantics |
|---|---|
| `HistoricalEra` | Stable ID, order, label, summary, date label, chronology note, source IDs, recommended bounds, default snapshot ID, allowed snapshot IDs, default route IDs. |
| `HistoricalSnapshot` | ID, era ID, label, date/reign description, source IDs, included area IDs; represents one coherent context within a broad era. |
| `EraPlaceAnnotation` | Place ID, era ID, optional snapshot scope, relevance reason, relevant structured scripture references, optional reviewed display name, evidence IDs, review status. |
| `HistoricalNameAssertion` | ID, place ID, name, explicit era/snapshot scope, kind (`period-name` or `translation-variant`), evidence IDs; references preserve distinct name evidence. |
| `HistoricalAreaSnapshot` | ID, polity/region ID, snapshot IDs, display name, evidence kind, optional GeoJSON or site list, source IDs, uncertainty note, label anchor, legend color. |
| `HistoricalRoute` | ID, era IDs, optional snapshot scope, title, narrative/source description, ordered stops, segments, interpretation label, evidence IDs, uncertainty note. |
| `RouteStop` | Stable stop ID, order, label, source place ID and optional identification ID, or explicit unresolved status. An unmapped stop has no fabricated coordinates. |
| `RouteSegment` | From/to stop IDs, mode (`land`, `sea`, `unknown`), kind (`reconstructed`, `schematic`, `unmapped`), optional LineString geometry, evidence IDs. |
| `HistoricalEvidence` | ID, supported claim, source title/URL, locator/page/reference, version or access date, attribution/license for reused assets, editorial note. |
| `EraReleaseManifest` | Schema/data version, pinned base catalog revision, reviewed era IDs, expected place/area/route IDs, unresolved items, source registry. |

Area evidence kinds: `dated-reconstruction`, `general-region`, `attested-sites`, `unresolved`. General regional extents may appear only as explicitly labeled context; never relabel them as political control. Retain existing isoband semantics when reusing qualified general context, instead of treating each confidence ring as a different territory.

Published features require reviewed membership and evidence. Draft annotations never enter the production resolver. Unclassified catalog records remain available through All eras and broader search; missing annotations do not assert historical absence.

Geometry uses standard GeoJSON `[longitude, latitude]`. Convert only at Leaflet APIs that require `[latitude, longitude]`; do not mix tuple conventions within a dataset. Separate reconstruction uncertainty from the catalog's location-identification score. OpenBible's “time-weighted” score refers to changing scholarly confidence, not the ancient lifetime of a place ([OpenBible methodology](https://github.com/openbibleinfo/Bible-Geocoding-Data#time-weighted-scores)).

If numerical dates are added, use an explicit `{ year: positiveInteger, era: 'BCE' | 'CE' }` representation with a tested ordinal conversion for comparisons. Display no year zero. V1 selection uses explicit era/snapshot membership, so dates are explanatory metadata rather than a mechanism for manufacturing membership.

## 7. Content preparation and sources

Content preparation is a real workstream. Building a slider does not produce trustworthy era maps. Complete a reviewed content manifest before asking the implementation model to fill every era.

Per-era minimum release checklist:

- One sourced summary, a chronology statement, recommended bounds, and one coherent default snapshot.
- A named list of required places resolved to exact catalog IDs, including identity ambiguities. Start with the anchor locations in section 3, then add the places necessary for the selected narratives.
- Explicit area outcomes: reviewed dated geometry, qualified regional context, attested sites, or an explained unresolved state. At least one meaningful geographic context layer per era; no minimum polygon quota.
- A reviewed route set where a meaningful itinerary is available. No artificial route quota for bridge periods.
- At least two reviewed demonstrations of names changing across the overall release, with evidence and related-identity handling. Most names can legitimately stay the same across several eras.
- Specific Scripture references attached to narrative claims and separate geographic/historical evidence for inferred coordinates, paths, and boundaries.

For the requested core eras, research anchor passages such as Genesis 12–13 for Abraham, the Exodus/Numbers wilderness narratives, selected Judges accounts, the Samuel/Kings monarchy narratives, Kings/Jeremiah/Ezekiel exile material, individual Gospel journeys, and Acts itineraries. These are research starting points. A chapter mention alone is not evidence for a modern coordinate, territorial extent, or exact route.

Use the existing pinned OpenBible catalog for stable place identities and candidate locations. Its documented data distinguishes ancient places, modern locations, alternate identifications, and geographic confidence ([dataset documentation](https://github.com/openbibleinfo/Bible-Geocoding-Data)). Preserve attribution already shipped with the application.

Pleiades is a candidate supplemental source for dated names and locations. It explicitly distinguishes temporal-attestation confidence and other controlled vocabularies; inspect individual records and snapshots before adopting their assertions ([Pleiades vocabularies](https://pleiades.stoa.org/vocabularies), [published datasets](https://github.com/isawnyu/pleiades.datasets)). A broad “Roman” period does not establish validity specifically during Jesus' ministry.

AWMC offers physical and cultural GeoJSON, including roads and regional names. Its repository identifies its license as ODbL; verify the exact asset's provenance and distribution obligations before bundling it. It is a candidate source, not a complete Bible-era boundary dataset ([AWMC geodata](https://github.com/AWMC/geodata)).

Do not trace proprietary atlas images or generate plausible-looking borders from memory. A bibliography link to a book without a specific supporting locator is insufficient for a reconstructed polygon. For newly prepared geometry, record the method and evidence behind its vertices/extent, not just the biblical event.

Exodus needs an explicit interpretation label and disputed-stop handling. A textually ordered itinerary can be shown as numbered known stops and dashed schematic segments; an unknown stop remains in the itinerary without a false pin. Never bridge an unknown segment in a way that appears to be a verified path. Alternative geographic identifications are not automatically alternative chronologies.

Gospel routes should name the selected account/passage. If a harmonized route is introduced later, identify it as an editorial synthesis. Paul's journeys should be separate selectable routes; v1 can display one featured route by default and expose the remainder in the dock.

## 8. Basemap decision

This choice is pending the user's response. It changes visual scope, not the era data model.

**Recommended clean backdrop:** retain Leaflet and render a simplified physical base using bundled land/coastline and selected natural-water geometries. Natural Earth provides physical layers and states that its map data is public domain ([physical data](https://www.naturalearthdata.com/downloads/10m-physical-vectors/), [terms](https://www.naturalearthdata.com/about/terms-of-use/)). Use only physical features: omit country lines, modern city labels, roads, and artificial reservoirs. Pin, simplify, and record the source version during preparation.

This is a schematic geographic backdrop, not a reconstruction of changing ancient coastlines or hydrology. Say so in map information. Use low-detail global land plus a more detailed biblical-region subset if necessary; do not introduce a rectangular blank edge when the user pans out. Keep a **Modern map** option for close inspection using the existing raster tiles. Switch basemaps only through the user's choice; do not silently reveal modern labels at a zoom threshold.

**Smaller release alternative:** retain current tiles and label them “Modern geographic reference.” The historical overlays and their names still change, but modern labels/borders remain visible underneath. Treat this as an explicit product compromise if selected.

Do not add a paid tile provider or replace Leaflet just to build the era slider. A high-detail terrain map without modern labels can be evaluated separately if the simple physical backdrop is insufficient.

## 9. Component and file plan

Paths here are proposed; create only the files needed for the accepted scope. Prefer a small shared resolver over duplicating rules in UI components.

| File | Responsibility |
|---|---|
| `src/lib/historicalEraTypes.ts` | New historical content types, selection types, and resolved-view contracts. |
| `src/data/historicalEras.ts` | Ordered era definitions, summary metadata, snapshot choices, default bounds and routes. |
| `src/data/historicalEraContent.ts` | Curated place annotations, name assertions, area snapshots, routes, and evidence registry; split by era if size/readability warrants. |
| `src/data/generated/historicalEraGeometry.json` | Reviewed geometry assets only; generated reproducibly from documented inputs when generation is appropriate. |
| `src/lib/historicalEraResolver.ts` | Pure membership, label, area, route, filter, override, and count resolution. No Leaflet or Supabase calls. |
| `src/hooks/useHistoricalEra.ts` | URL-backed era/snapshot selection, preference parsing, validated transitions, and layer toggles. |
| `src/hooks/useHistoricalEraLayers.ts` | Add/update/remove dedicated Leaflet era area/route/name layers and clean up listeners. Camera movement stays outside rendering effects. |
| `src/components/map/HistoricalEraControl.tsx` | Native slider, dropdown, previous/next, All eras, Fit era; same state for desktop and mobile. |
| `src/components/map/HistoricalEraPanel.tsx` | Era summary, snapshot choice, layers, curated route selection, evidence notes, and coverage information. |
| `src/components/map/BibleMap.tsx` | Compose resolved historical data with existing study overlays; reconcile selections and cancel stale timers. |
| `src/components/map/MapSidebar.tsx` | Era entry point and panel, current-era status, counts, layout/collapse measurements or callback. |
| `src/components/map/MapSearchBar.tsx` | Resolved names, era-aware search scope, explicit broader search, selection status. |
| `src/components/map/HistoricalPlaceDetails.tsx` | Resolved heading, era relevance/name evidence, full original catalog evidence. |
| `src/components/map/TerritoryEvidenceCard.tsx` | Accept dated snapshot evidence without breaking existing general territory selections. |
| `src/components/map/TravelInsightPanel.tsx` | Use resolved selector labels; preserve saved endpoint identity and estimate semantics. |
| `src/lib/territorySearch.ts` | Accept optional era-resolved candidates or an explicit scope; preserve All eras callers. |
| `src/styles/index.css` | Timeline layout, era labels/legend, focus states, reduced motion and mobile panel spacing. |
| `scripts/validate-historical-eras.ts` | Dataset integrity and manifest checks using the selected test/runtime toolchain. |
| `docs/historical-era-sources.md` | Reviewed content manifest, chronology decisions, sources, unresolved cases, and import provenance. |

Optional clean-backdrop branch adds `src/data/generated/historicalBaseMap.json`, `src/hooks/useHistoricalBaseMap.ts`, and a reproducible preparation script. Scope imports to `/map`; do not load geometry from the main app shell.

Public resolver contract, in plain language:

- Input: validated era/snapshot selection, base catalog, current book results, kind/coverage filters, passage results, explicit focus, and selected curated route.
- Output: normal eligible catalog records; deduplicated override records with reasons; resolved labels; applicable areas/routes; legend; selection status; and separate counts.
- Search gets the same label/membership helpers with its documented broader density scope.
- Identity remains the original place ID. Derived labels never mutate the catalog or a Supabase record.

When a hook renders layers, give it an explicit ready `L.Map | null` value (or a readiness signal), not just a ref whose mutation React cannot observe. This prevents the initial overlay from being missed because the hook ran before map initialization.

### Layer organization

Keep separate groups for physical base, era areas, era routes, persistent historical labels, ordinary places, and temporary study highlights. Existing saved paths and person routes remain independent. Use the existing non-intercepting territory pane pattern for polygons. Route selection can happen from the dock, so background route strokes need not steal place clicks.

Use normal GeoJSON semantics for Polygon/MultiPolygon and LineString; keep existing confidence-band rendering separate from ordinary multi-part polygons. Leaflet supports GeoJSON layers and layer-group lifecycle methods directly ([Leaflet reference](https://leafletjs.com/reference.html#geojson)).

Persistent labels should be limited by zoom, editorial priority, and simple collision avoidance. Hidden labels do not remove their underlying place records from clustering. Use text nodes or escaped content for any Leaflet HTML strings introduced or touched by this change.

## 10. State, persistence, and lifecycle

- First visit without saved preferences: **All eras**. Entering era mode requires a selection, preserving existing readers' starting experience.
- URL parameters: `era=<id>` and optional `snapshot=<id>`. `era=all` explicitly means All eras. A snapshot invalid for the era falls back to that era's declared default.
- Precedence on initial load: explicit valid URL selection, then valid local preference, then All eras. An explicitly invalid era URL resolves to All eras with a small status message, rather than silently choosing an unrelated saved era.
- Browser back/forward treats the URL as authoritative. Removing era parameters via history resolves to All eras; local preferences do not override history navigation.
- Preserve unrelated query parameters. Changing era drops an incompatible snapshot parameter.
- Commit one history entry for a completed pointer gesture; previous/next and dropdown selections each commit one. During dragging, preview in component state. Do not create an entry for every input event. Canceling a pointer gesture restores the last committed selection.
- Store only validated preferences under a versioned localStorage key. Catch disabled/unavailable storage errors; URL and in-memory state still work. Persist after a committed change, not during render.
- A shared era URL promises only era/snapshot state. It does not promise to recreate personal paths, a passage, camera position, or all layer preferences in v1.
- Reset action clears era/snapshot and their stored preference. Other existing study controls have their own explicit clear actions.
- Era changes perform no network write. Reusing the same enum strings as IDs is fine; never equate them with user-created timeline-period UUIDs.
- Invalidate delayed search pins and stale asynchronous passage/book results on relevant selection changes using an operation token or cleanup. Keep the latest requested book/passage state; an older response must not restore discarded selection state.

## 11. Accessibility, performance, and offline behavior

Accessibility requirements: named native range input; `aria-valuetext` containing era and approximate date label; visible keyboard focus; arrow/Home/End behavior; equivalent dropdown; buttons with large touch targets; polite status announcement after a committed change; uncertainty expressed in words and line style, not color alone. Prevent pointer and wheel events over timeline controls from panning or zooming the map. Respect reduced-motion settings.

Mobile requirements: verify at 390px wide and a short landscape viewport. The era entry point, map zoom, attribution, drawing toolbar, and close buttons must remain reachable. Derive camera-fit padding from actual dock/detail/timeline layout, replacing fixed desktop assumptions in touched era-fit paths. A single primary dock panel should expand at a time on phones.

Performance targets are proposed acceptance budgets, not measured claims: warmed era switching under 200 ms on desktop and 350 ms on a representative phone; keep map pan/zoom responsive during repeated changes. No new data fetch per slider tick, no remounting Leaflet, no additional main-route bundle payload from era data. Pre-index annotations once and memoize the resolved view. Do not add a worker unless measurement shows it is needed.

Start with bundled modest geometry and one default route per era where applicable. Measure compressed asset size and render cost; simplify oversized geometry during preparation, preserving topology. Track baseline versus changed `/map` chunk size in the implementation report.

PWA: metadata and bundled era geometry should remain available once cached. External modern raster tiles are not currently covered by the app's runtime cache policy, so do not claim a complete offline modern basemap. If new assets are fetched as `.json` rather than compiled into JS chunks, explicitly include/version them in precaching; current `globPatterns` do not include JSON. Test the chosen strategy with a production build. A Supabase outage must not prevent static era exploration from rendering.

## 12. Implementation sequence and exit criteria

Execute in order. Each task should be reviewable before the next task changes the same integration points.

| Task | Work | Exit criterion |
|---|---|---|
| 1. Freeze scope and content policy | Incorporate user answers; finalize era list, chronology conventions, snapshot policy, basemap choice, and required content manifest. Resolve exact IDs for the initial anchor places. | No unresolved architectural choice is delegated implicitly to the implementation model. Content gaps are named. |
| 2. Establish baseline and data validation | Record clean/dirty state and build/lint outcomes. Add types, manifest validator, and a minimal test setup if absent. | Baseline failures are documented; invalid content IDs, references, and geometry fail actionable checks. |
| 3. Build one end-to-end era | Use Jesus' ministry as the suggested first technical slice, backed by reviewed content. Add resolver, control, place selection, names, one context layer and one sourced itinerary. | All four requested dimensions work through the existing map; first slice is an internal checkpoint, not the completed release. |
| 4. Complete integration contracts | Implement book/passage/search rules, evidence panels, personal-path preservation, URL/history, stale-operation cleanup, counts and empty states. | Interaction fixtures and manual regression scenarios pass. |
| 5. Complete all selected era content | Add reviewed snapshots and routes using the same schema. Include a disputed case and a name-transition case. | Every selected era passes the named content manifest. Unresolved features are explained, never fabricated. |
| 6. Add clean backdrop if selected | Prepare pinned physical geometry, add basemap switch, responsive styling and asset caching. | Modern labels/borders are absent in clean mode; modern mode remains available; physical base renders offline when cached. |
| 7. Verify and document | Run targeted tests/build/lint; check mobile, keyboard, history, production caching, repeated switching and existing path operations. Update project memory docs. | Acceptance matrix passes; remaining baseline issues and content limits are reported precisely. |

Engineering effort is moderate; historical content preparation is the largest variable. The number of reviewed area snapshots and reconstructed routes drives cost more than the number of slider stops. Budget those items explicitly after task 1 rather than promising a date based solely on UI work.

If the user chooses People Atlas synchronization, revise the plan before task 2: define a separate mapping from user bands/entities to canonical eras, clarify whether selection is one-way or shared, and specify persistence/backfill behavior. Existing bands have no chronological dates; matching their names would be unreliable. That branch is not included in the map-only no-migration estimate.

## 13. Verification and acceptance matrix

Add focused tests for the rules that can produce a misleading map. Suggested setup: Vitest for pure resolver/data tests and a small DOM test layer for state/control behavior. Add a browser runner only if available or justified; otherwise document and execute browser QA with the available browser tooling. Record any new commands in README.

| Scenario | Expected result |
|---|---|
| Select every released era | Required places, default snapshot, labels and eligible routes match the content manifest. |
| Move from monarchy to Jesus | Previous political layers and journeys disappear; no anachronistic stale overlay survives. |
| Repeated rapid era changes | Latest selected view wins; no duplicate layers, event listeners, delayed pins or camera jumps. |
| Dated-name fixture changes era | Map label, cluster list, search, detail heading and new route-stop label agree; base IDs remain stable. |
| Two ancient records share a coordinate | Both identities remain selectable under the applicable filters. |
| No era annotation exists | Record is unclassified; broader search/All eras still reaches it. No claim of historical nonexistence appears. |
| Passage references a record outside curated era membership | Result remains as a labeled study override; counts are deduplicated. |
| Era plus incompatible book/type filters | Explicit zero-result state and filter-clear actions; no hidden widening. |
| General undated territory selected in era search | Evidence remains accessible; no falsely dated frontier is painted. |
| Route includes an unresolved stop | Itinerary keeps the stop and its uncertainty; no fabricated coordinate or misleading connecting segment. |
| Personal route edited/drawn while switching eras | Existing points, order, descriptions, visibility and database records remain intact. New snaps use visible eligible records. |
| Geographic alternative viewed | Camera focuses the chosen evidence location; no global catalog coordinate mutation occurs. |
| URL restored, back/forward used, bad values entered | Defined precedence/fallback holds and unrelated query parameters survive. |
| Slider drag committed/canceled | One history entry per completed gesture; canceled preview restores committed state. |
| Keyboard/reduced motion/mobile | Fully operable controls, readable labels/status, no obstructed map essentials. |
| Historical layer toggles used | Independent groups hide/show correctly; no stale place labels after pins are hidden. |
| Cached production app offline | Era data works; modern tile limitations are accurately represented. |

Data validator must reject: duplicate era/snapshot/feature IDs; missing source/target IDs; invalid snapshot membership; unknown place/identification references; contradictory duplicate preferred-name assertions at the same specificity; invalid numerical dates; out-of-range/non-finite coordinates; unclosed polygon rings; route segments with absent endpoints; mapped segments lacking valid geometry/evidence; draft content referenced by a released era; and manifest entries absent from the published bundle. Validate Scripture book/chapter/verse bounds using existing Bible metadata.

Use fixtures to test BCE/CE comparison boundaries if numerical dates are implemented. Tests for the resolver should assert user-visible outcomes, not snapshot large component markup or mirror every implementation branch.

Before completion, run `npm run build`, `npm run lint`, and the new targeted test/validation commands. If baseline lint is broken, distinguish that from new failures; repair the minimum configuration if needed for the planned validation and document it. No tests have been run for this planning-only document.

## 14. Project documentation and implementation handoff

When implementation changes files/exports, update `CODE_INDEX.md` in the same task. Update `KNOWLEDGE_GRAPH.md` for the era model, map layer behavior, and user-facing feature. Update `README.md` for the feature, any new data-preparation/validation commands, and offline scope. Do not describe planned functionality as already shipped. Preserve the reviewed source manifest separately from prose architecture docs.

Suggested prompt after this draft is finalized:

> Implement the accepted Historical Era feature from `HISTORICAL_ERA_PLAN.md`. Read the project instructions and the three project memory docs first. Treat `docs/historical-era-sources.md` and the approved content manifest as the authority for historical assertions. Complete the tasks sequentially, preserving existing saved paths, passage exploration, place identity and evidence behavior. Use the shared resolver and the specified filter/history rules. Do not invent chronology, coordinates, boundaries, name changes or routes to fill gaps. Report a missing content item by ID and proceed with independent engineering work. Complete the acceptance checks and update the project memory docs. Do not deploy unless deployment is separately requested.

This draft alone does not contain a finished researched content manifest. Finalizing that manifest is task 1 and is the remaining prerequisite for a reliable full-content implementation handoff.
