# Historical era sources and release policy

Release: 2026-09-06.1, schema 1. Scope: twelve discrete map-only study eras, thirteen narrative snapshots/site contexts and seventeen selected-stop itineraries. No People Atlas synchronization or database migration.

## Editorial policy

The implementation follows the draft’s recommended map-only scope and clean physical backdrop. Early chronology uses qualified verbal narrative periods; no disputed absolute dates, year-zero convention, or inferred occupation intervals are encoded. Equal slider spacing means the next study period, not equal elapsed time.

`src/data/historicalEraContent.ts` contains the frozen source-checked content and manifest. “reviewed” means an editorial check of the cited text, catalog identity and inclusion reason during this implementation; it does **not** mean independent specialist review. Every released era has site context. No reconstructed imperial or tribal frontiers are shipped. Site halos are screen symbols with no territorial extent; Scripture attests the narrative mention, while the separately pinned OpenBible record supplies candidate coordinates and uncertainty.

This is a small curated selection, not a historical dating of the entire 1,335-record catalog. Missing membership is “Not classified for this era,” never an assertion of nonexistence. The generated catalog is unchanged, including separate records at shared coordinates and its original numbered disambiguation labels.

## Identity and name decisions

- `openbible-a513646` is the catalog’s Dan identity. Judges 18:7 names Laish, and 18:29 describes its renaming. “Laish” applies only to the Danite scouting snapshot. A different Judges snapshot does not inherit this preferred name. This dataset does not contain a separate canonical Laish record to merge.
- `openbible-a041bb3` is **Samaria 1**, the city, not **Samaria 2**, the region. The Herodian study label “Sebaste” is supported by Josephus, *Antiquities* XV.8.5. John 4’s region was deliberately not joined to this city.
- `openbible-a403c45` (Jebus) and `openbible-a15257a` (Jerusalem) remain distinct. Judges 19:10 supports the related-identity link; the interface never merges their IDs.
- Ai 1, Bethel 1, Beersheba 2, Bethlehem 1, Jericho 1, Succoth 2, Antioch 1/2, Babylon 1 and Moab 2 are exact source joins. No runtime fuzzy/name-only join is used.
- Canonical/book-lens labels remain when no scoped name evidence exists. Original aliases remain searchable.

## Geometry and routes

Routes are textually ordered selections of stops. Dashed straight segments encode **schematic sequence**, not a reconstruction, road, sailing course, or distance estimate. A gap has an explicit unmapped itinerary stop and no connecting geometry. Some known but omitted intermediate locations are intentionally unmapped in this release; that is not a claim that scholarship cannot locate them. Exodus uses the catalog’s traditional southern Sinai candidate, with explicit disputed-identification wording and unbridged wilderness/sea-crossing gaps. Egypt is a regional representative point, not an identified dwelling. Paul’s first, second, third missions and voyage are separate selectable itineraries. No Gospel harmonization is inferred.

Judges has separate scouting and chapter 19 snapshots to keep the name assertion and routes scoped correctly. Their relative chronology is not asserted. Broader background places (for example Susa in Persian-period reading and Sebaste in Herodian reading) are described as context, not stops on the featured route or a claim of simultaneous events.

The physical backdrop uses Natural Earth v5.1.2 (public domain): unchanged global **50m land** geometry and the **10m Sea of Galilee and northern Dead Sea** geometries. The southern Dead Sea evaporation basin is excluded. This modern physical reference does not reconstruct ancient coastlines, reservoirs, or changing hydrology. No borders, roads, city labels, or proprietary traced maps are bundled. Modern OSM tiles remain an explicit alternative.

Run `npm run data:basemap` to reproduce the asset from pinned upstream URLs, or supply the two downloaded inputs: `npm run data:basemap -- /path/ne_50m_land.geojson /path/ne_10m_lakes.geojson`. Input SHA-256 values, filtering rules, version and exact URLs are recorded in `src/data/generated/historicalBaseMap.provenance.json`. Geometry is compiled into its own lazy map-only JS chunk and precached by the production service worker, avoiding an unversioned runtime JSON request.

## Required place manifest

The following exact IDs, snapshot/area IDs, route IDs and source IDs are frozen in the content’s `manifest`. The validator rejects missing or extra entries, invalid references, incompatible scopes, conflicting names, draft content, unsupported geometry, unknown stops and coordinate errors.

### Patriarchs (`patriarchs`)

Ancestral narratives. Genesis follows households between Mesopotamia, Canaan and Egypt. These selected places follow the narratives rather than a proposed occupation chronology.

Snapshots: `patriarchs-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Ur 1 | `openbible-a6cf75c` | Included for the selected narrative: Genesis 11:31. |
| Haran | `openbible-a6d9af3` | Included for the selected narrative: Genesis 12:4. |
| Shechem | `openbible-adf74d4` | Included for the selected narrative: Genesis 12:6. |
| Bethel 1 | `openbible-a64f355` | Included for the selected narrative: Genesis 12:8. |
| Hebron | `openbible-a85151a` | Included for the selected narrative: Genesis 13:18. |
| Beersheba 2 | `openbible-a075d61` | Included for the selected narrative: Genesis 21:31. |
| Egypt | `openbible-af301ca` | Included for the selected narrative: Genesis 12:10. |

Journeys: `abraham-canaan`, `jacob-return`.

### Exodus & Wilderness (`exodus`)

Before settlement; date disputed. Exodus and Numbers preserve a sequence of departure and wilderness traditions. Sinai and several stations have disputed identifications; the map keeps gaps visible.

Snapshots: `exodus-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Egypt | `openbible-af301ca` | Included for the selected narrative: Exodus 12:41. |
| Rameses | `openbible-a079b21` | Included for the selected narrative: Exodus 12:37. |
| Succoth 2 | `openbible-aa28709` | Included for the selected narrative: Exodus 12:37. |
| Mount Sinai | `openbible-abfba2a` | Included for the selected narrative: Exodus 19:2. |
| Kadesh-barnea | `openbible-ac2cef0` | Included for the selected narrative: Numbers 20:1. |
| Moab 2 | `openbible-aca767b` | Included for the selected narrative: Numbers 22:1. |

Journeys: `wilderness-stations`.

### Conquest & Settlement (`conquest`)

Joshua narrative period. Joshua connects the Jordan crossing, Jericho and Ai with assembly at Shechem and settlement at Shiloh. Candidate sites do not resolve archaeological debates about conquest.

Snapshots: `conquest-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Gilgal 1 | `openbible-ab94aea` | Included for the selected narrative: Joshua 4:19. |
| Jericho 1 | `openbible-a231f80` | Included for the selected narrative: Joshua 6:1. |
| Ai 1 | `openbible-a7e13e1` | Included for the selected narrative: Joshua 8:1. |
| Shechem | `openbible-adf74d4` | Included for the selected narrative: Joshua 24:1. |
| Shiloh | `openbible-aa4680a` | Included for the selected narrative: Joshua 18:1. |
| Bethel 1 | `openbible-a64f355` | Included for the selected narrative: Joshua 8:9. |

Journeys: `joshua-sequence`.

### Judges (`judges`)

Before the monarchy. Judges depicts local communities and shifting conflicts. Choose the Danite scouting scene (before Laish is renamed) or the Levite’s journey in chapter 19. Their relative dating is not asserted.

Snapshots: `judges-study`, `judges-levite`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Shiloh | `openbible-aa4680a` | Included for the selected narrative: Judges 18:31. |
| Dan | `openbible-a513646` | Included for the selected narrative: Judges 18:7. |
| Jebus | `openbible-a403c45` | Included for the selected narrative: Judges 19:10. |
| Gibeah 1 | `openbible-ac24f5f` | Included for the selected narrative: Judges 19:14. |
| Bethlehem 1 | `openbible-a112427` | Included for the selected narrative: Judges 19:1. |
| Zorah | `openbible-a08174b` | Departure communities of the Danite scouts in Judges 18:2. |
| Eshtaol | `openbible-a355b6e` | Departure communities of the Danite scouts in Judges 18:2. |

Journeys: `levite-journey`, `danite-scouts`.

### United Monarchy (`united-monarchy`)

Saul, David and Solomon narratives. Samuel places David first in Hebron and then in Jerusalem. These centers give context to the reign narrative without asserting the extent of a united kingdom.

Snapshots: `united-monarchy-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Hebron | `openbible-a85151a` | Included for the selected narrative: 2 Samuel 2:1. |
| Jerusalem | `openbible-a15257a` | Included for the selected narrative: 2 Samuel 5:6. |
| Bethlehem 1 | `openbible-a112427` | Included for the selected narrative: 1 Samuel 16:4. |

Journeys: `david-capitals`.

### Divided Monarchy (`divided-monarchy`)

Israel and Judah before the exile. Kings distinguishes the royal centers of Samaria and Jerusalem. This event snapshot centers on the fall of Samaria, with deportation destinations left unresolved here.

Snapshots: `divided-monarchy-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Samaria 1 | `openbible-a041bb3` | Included for the selected narrative: 2 Kings 17:6. |
| Jerusalem | `openbible-a15257a` | Included for the selected narrative: 2 Kings 18:2. |
| Bethel 1 | `openbible-a64f355` | Included for the selected narrative: 2 Kings 17:28. |
| Dan | `openbible-a513646` | Included for the selected narrative: 1 Kings 12:29. |

Journeys: `samaria-deportation`.

### Babylonian Exile (`exile`)

After Jerusalem’s fall. Kings describes Jerusalem’s fall and the transfer of captives to Babylon. A schematic link indicates the named endpoints; it is not a surveyed deportation corridor.

Snapshots: `exile-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Jerusalem | `openbible-a15257a` | Included for the selected narrative: 2 Kings 25:8. |
| Babylon 1 | `openbible-a217d18` | Included for the selected narrative: 2 Kings 25:21. |
| Egypt | `openbible-af301ca` | Included for the selected narrative: Jeremiah 43:7. |

Journeys: `babylon-deportation`.

### Return & Persian Period (`return-persian`)

Cyrus through the Persian restoration narratives. Ezra describes return from Babylon to Jerusalem. Susa is included as wider Persian-period reading context from Nehemiah, not as a stop on this return itinerary.

Snapshots: `return-persian-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Babylon 1 | `openbible-a217d18` | Included for the selected narrative: Ezra 2:1. |
| Jerusalem | `openbible-a15257a` | Included for the selected narrative: Ezra 2:1. |
| Susa | `openbible-a033b84` | Included for the selected narrative: Nehemiah 1:1. |

Journeys: `ezra-return`.

### Hellenistic & Hasmonean Periods (`hellenistic`)

Successor kingdoms and Hasmonean rule. The wider era covers changing successor kingdoms and Hasmonean rule. This site-only snapshot follows Josephus’s account of Hyrcanus and Samaria; no composite political boundary is implied.

Snapshots: `hellenistic-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Jerusalem | `openbible-a15257a` | Center in Josephus’s account of John Hyrcanus, Antiquities XIII.10.1–3. |
| Samaria 1 | `openbible-a041bb3` | Center in Josephus’s account of John Hyrcanus, Antiquities XIII.10.1–3. |

Journeys: None; no filler route.

### Herodian & Early Roman Period (`herodian`)

Herod’s later reign and succession. Matthew places the infancy narrative across Bethlehem, Egypt and Nazareth, around Herod’s death and Archelaus’s rule. Sebaste is wider reign context, separately sourced to Josephus.

Snapshots: `herodian-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Bethlehem 1 | `openbible-a112427` | Included for the selected narrative: Matthew 2:1. |
| Jerusalem | `openbible-a15257a` | Included for the selected narrative: Matthew 2:1. |
| Egypt | `openbible-af301ca` | Included for the selected narrative: Matthew 2:14. |
| Nazareth | `openbible-af5884f` | Included for the selected narrative: Matthew 2:23. |
| Samaria 1 | `openbible-a041bb3` | Herod’s renamed city, wider reign context; not an infancy route stop. |

Journeys: `matthew-infancy`.

### Jesus’ Ministry (`jesus-ministry`)

Early first century CE. John’s account connects Cana, Capernaum, Jerusalem and Sychar. The selected journeys retain John’s narrative order rather than harmonizing the Gospel itineraries.

Snapshots: `jesus-ministry-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Cana | `openbible-a031bda` | Included for the selected narrative: John 2:1. |
| Capernaum | `openbible-af2161c` | Included for the selected narrative: John 2:12. |
| Jerusalem | `openbible-a15257a` | Included for the selected narrative: John 2:13. |
| Sychar | `openbible-a27b472` | Included for the selected narrative: John 4:5. |
| Nazareth | `openbible-af5884f` | Included for the selected narrative: Luke 4:16. |

Journeys: `john-2`, `john-4`.

### Early Church (`early-church`)

First-century apostolic narratives. Acts follows the church from Jerusalem into the eastern Mediterranean and Rome. Paul’s missions and the voyage are separate selected-stop itineraries, with unrecorded paths kept schematic.

Snapshots: `early-church-study`.

| Catalog identity | Exact ID | Inclusion evidence |
|---|---|---|
| Jerusalem | `openbible-a15257a` | Included for the selected narrative: Acts 1:12. |
| Antioch 1 | `openbible-ae41ab4` | Included for the selected narrative: Acts 13:1. |
| Seleucia | `openbible-a6d306d` | Included for the selected narrative: Acts 13:4. |
| Salamis | `openbible-afa863b` | Included for the selected narrative: Acts 13:5. |
| Paphos | `openbible-a314765` | Included for the selected narrative: Acts 13:6. |
| Perga | `openbible-aff04b8` | Included for the selected narrative: Acts 13:13. |
| Antioch 2 | `openbible-a6c704a` | Included for the selected narrative: Acts 13:14. |
| Iconium | `openbible-ae425aa` | Included for the selected narrative: Acts 13:51. |
| Lystra | `openbible-af0719d` | Included for the selected narrative: Acts 14:6. |
| Derbe | `openbible-aa401a9` | Included for the selected narrative: Acts 14:20. |
| Troas | `openbible-a91c509` | Included for the selected narrative: Acts 16:8. |
| Philippi | `openbible-a49e1d0` | Included for the selected narrative: Acts 16:12. |
| Thessalonica | `openbible-afa9d8e` | Included for the selected narrative: Acts 17:1. |
| Berea | `openbible-a62fe31` | Included for the selected narrative: Acts 17:10. |
| Athens | `openbible-a1fe6e7` | Included for the selected narrative: Acts 17:15. |
| Corinth | `openbible-a6f437a` | Included for the selected narrative: Acts 18:1. |
| Ephesus | `openbible-a5feb15` | Included for the selected narrative: Acts 19:1. |
| Caesarea | `openbible-a58735e` | Included for the selected narrative: Acts 25:4. |
| Sidon | `openbible-a98e4d7` | Included for the selected narrative: Acts 27:3. |
| Myra | `openbible-aa4b3e2` | Included for the selected narrative: Acts 27:5. |
| Malta | `openbible-a57835d` | Included for the selected narrative: Acts 28:1. |
| Rome | `openbible-afc8e7a` | Included for the selected narrative: Acts 28:16. |

Journeys: `paul-first`, `paul-second`, `paul-third`, `paul-rome`.

## Primary sources

- [Pinned OpenBible catalog](https://github.com/openbibleinfo/Bible-Geocoding-Data/tree/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f): CC BY 4.0, ancient.jsonl; specific ancient IDs above. Existing location-confidence scores are identification confidence, not historical lifetimes.
- KJV narrative references are individually recorded as structured book/chapter/verse claims and source links in the evidence registry; verse bounds are validated against the local Bible metadata. Membership passages were checked against the bundled KJV text. Links go to the same KJV passages for reader inspection.
- [Josephus, Antiquities](https://www.gutenberg.org/files/2848/2848-h/2848-h.htm), XIII.10.1–3 (Hyrcanus/Samaria) and XV.8.5 (Sebaste naming). These support narrative context/name claims, not frontier geometry.
- [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/): public-domain physical data; exact assets and hashes in the provenance file.

## Remaining content limits

- No dated political frontiers are shipped; every era uses sourced narrative-site context.
- Absolute chronology of early narrative periods is intentionally unspecified.
- Sinai, Ai and other catalog candidates retain disputed-location evidence.
- Unmapped route stages are named in their itineraries; there are no inferred tracks.
- This is an editorial source check, not independent specialist historical review.

The first-release area outcome is explicitly **narrative sites**, not a substitute political frontier. Adding dated reconstruction polygons requires asset-level evidence and renewed manifest validation. No Pleiades or AWMC assets were imported.
