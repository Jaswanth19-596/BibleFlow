import type { HistoricalEraContent } from '../lib/historicalEraTypes';

/** Source-checked narrative presets. See docs/historical-era-sources.md. */
export const HISTORICAL_CONTENT: HistoricalEraContent = {
  "eras": [
    {
      "id": "patriarchs",
      "order": 0,
      "label": "Patriarchs",
      "summary": "Genesis follows households between Mesopotamia, Canaan and Egypt. These selected places follow the narratives rather than a proposed occupation chronology.",
      "dateLabel": "Ancestral narratives",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-Genesis-11-31",
        "bible-Genesis-12-4",
        "bible-Genesis-12-6",
        "bible-Genesis-12-8",
        "bible-Genesis-13-18",
        "bible-Genesis-21-31",
        "bible-Genesis-12-10"
      ],
      "bounds": [
        [
          25,
          28
        ],
        [
          49,
          39
        ]
      ],
      "defaultSnapshotId": "patriarchs-study",
      "snapshotIds": [
        "patriarchs-study"
      ],
      "defaultRouteIds": [
        "abraham-canaan"
      ]
    },
    {
      "id": "exodus",
      "order": 1,
      "label": "Exodus & Wilderness",
      "summary": "Exodus and Numbers preserve a sequence of departure and wilderness traditions. Sinai and several stations have disputed identifications; the map keeps gaps visible.",
      "dateLabel": "Before settlement; date disputed",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-Exodus-12-41",
        "bible-Exodus-12-37",
        "bible-Exodus-12-37",
        "bible-Exodus-19-2",
        "bible-Numbers-20-1",
        "bible-Numbers-22-1"
      ],
      "bounds": [
        [
          29,
          27
        ],
        [
          38,
          33
        ]
      ],
      "defaultSnapshotId": "exodus-study",
      "snapshotIds": [
        "exodus-study"
      ],
      "defaultRouteIds": [
        "wilderness-stations"
      ]
    },
    {
      "id": "conquest",
      "order": 2,
      "label": "Conquest & Settlement",
      "summary": "Joshua connects the Jordan crossing, Jericho and Ai with assembly at Shechem and settlement at Shiloh. Candidate sites do not resolve archaeological debates about conquest.",
      "dateLabel": "Joshua narrative period",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-Joshua-4-19",
        "bible-Joshua-6-1",
        "bible-Joshua-8-1",
        "bible-Joshua-24-1",
        "bible-Joshua-18-1",
        "bible-Joshua-8-9"
      ],
      "bounds": [
        [
          34,
          30
        ],
        [
          37,
          34
        ]
      ],
      "defaultSnapshotId": "conquest-study",
      "snapshotIds": [
        "conquest-study"
      ],
      "defaultRouteIds": [
        "joshua-sequence"
      ]
    },
    {
      "id": "judges",
      "order": 3,
      "label": "Judges",
      "summary": "Judges depicts local communities and shifting conflicts. Choose the Danite scouting scene (before Laish is renamed) or the Levite’s journey in chapter 19. Their relative dating is not asserted.",
      "dateLabel": "Before the monarchy",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-Judges-18-31",
        "bible-Judges-18-7",
        "bible-Judges-19-10",
        "bible-Judges-19-14",
        "bible-Judges-19-1",
        "bible-Judges-18-2",
        "bible-Judges-18-7",
        "openbible"
      ],
      "bounds": [
        [
          34,
          30
        ],
        [
          37,
          34
        ]
      ],
      "defaultSnapshotId": "judges-study",
      "snapshotIds": [
        "judges-study",
        "judges-levite"
      ],
      "defaultRouteIds": [
        "danite-scouts",
        "levite-journey"
      ]
    },
    {
      "id": "united-monarchy",
      "order": 4,
      "label": "United Monarchy",
      "summary": "Samuel places David first in Hebron and then in Jerusalem. These centers give context to the reign narrative without asserting the extent of a united kingdom.",
      "dateLabel": "Saul, David and Solomon narratives",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-2-Samuel-2-1",
        "bible-2-Samuel-5-6",
        "bible-1-Samuel-16-4"
      ],
      "bounds": [
        [
          34,
          30
        ],
        [
          37,
          34
        ]
      ],
      "defaultSnapshotId": "united-monarchy-study",
      "snapshotIds": [
        "united-monarchy-study"
      ],
      "defaultRouteIds": [
        "david-capitals"
      ]
    },
    {
      "id": "divided-monarchy",
      "order": 5,
      "label": "Divided Monarchy",
      "summary": "Kings distinguishes the royal centers of Samaria and Jerusalem. This event snapshot centers on the fall of Samaria, with deportation destinations left unresolved here.",
      "dateLabel": "Israel and Judah before the exile",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-2-Kings-17-6",
        "bible-2-Kings-18-2",
        "bible-2-Kings-17-28",
        "bible-1-Kings-12-29"
      ],
      "bounds": [
        [
          34,
          30
        ],
        [
          38,
          35
        ]
      ],
      "defaultSnapshotId": "divided-monarchy-study",
      "snapshotIds": [
        "divided-monarchy-study"
      ],
      "defaultRouteIds": [
        "samaria-deportation"
      ]
    },
    {
      "id": "exile",
      "order": 6,
      "label": "Babylonian Exile",
      "summary": "Kings describes Jerusalem’s fall and the transfer of captives to Babylon. A schematic link indicates the named endpoints; it is not a surveyed deportation corridor.",
      "dateLabel": "After Jerusalem’s fall",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-2-Kings-25-8",
        "bible-2-Kings-25-21",
        "bible-Jeremiah-43-7"
      ],
      "bounds": [
        [
          30,
          28
        ],
        [
          47,
          38
        ]
      ],
      "defaultSnapshotId": "exile-study",
      "snapshotIds": [
        "exile-study"
      ],
      "defaultRouteIds": [
        "babylon-deportation"
      ]
    },
    {
      "id": "return-persian",
      "order": 7,
      "label": "Return & Persian Period",
      "summary": "Ezra describes return from Babylon to Jerusalem. Susa is included as wider Persian-period reading context from Nehemiah, not as a stop on this return itinerary.",
      "dateLabel": "Cyrus through the Persian restoration narratives",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-Ezra-2-1",
        "bible-Ezra-2-1",
        "bible-Nehemiah-1-1"
      ],
      "bounds": [
        [
          33,
          28
        ],
        [
          50,
          38
        ]
      ],
      "defaultSnapshotId": "return-persian-study",
      "snapshotIds": [
        "return-persian-study"
      ],
      "defaultRouteIds": [
        "ezra-return"
      ]
    },
    {
      "id": "hellenistic",
      "order": 8,
      "label": "Hellenistic & Hasmonean Periods",
      "summary": "The wider era covers changing successor kingdoms and Hasmonean rule. This site-only snapshot follows Josephus’s account of Hyrcanus and Samaria; no composite political boundary is implied.",
      "dateLabel": "Successor kingdoms and Hasmonean rule",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "josephus-hyrcanus"
      ],
      "bounds": [
        [
          34,
          30
        ],
        [
          37,
          34
        ]
      ],
      "defaultSnapshotId": "hellenistic-study",
      "snapshotIds": [
        "hellenistic-study"
      ],
      "defaultRouteIds": []
    },
    {
      "id": "herodian",
      "order": 9,
      "label": "Herodian & Early Roman Period",
      "summary": "Matthew places the infancy narrative across Bethlehem, Egypt and Nazareth, around Herod’s death and Archelaus’s rule. Sebaste is wider reign context, separately sourced to Josephus.",
      "dateLabel": "Herod’s later reign and succession",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-Matthew-2-1",
        "bible-Matthew-2-1",
        "bible-Matthew-2-14",
        "bible-Matthew-2-23",
        "josephus-sebaste"
      ],
      "bounds": [
        [
          29,
          27
        ],
        [
          38,
          34
        ]
      ],
      "defaultSnapshotId": "herodian-study",
      "snapshotIds": [
        "herodian-study"
      ],
      "defaultRouteIds": [
        "matthew-infancy"
      ]
    },
    {
      "id": "jesus-ministry",
      "order": 10,
      "label": "Jesus’ Ministry",
      "summary": "John’s account connects Cana, Capernaum, Jerusalem and Sychar. The selected journeys retain John’s narrative order rather than harmonizing the Gospel itineraries.",
      "dateLabel": "Early first century CE",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-John-2-1",
        "bible-John-2-12",
        "bible-John-2-13",
        "bible-John-4-5",
        "bible-Luke-4-16"
      ],
      "bounds": [
        [
          34,
          30
        ],
        [
          37,
          34
        ]
      ],
      "defaultSnapshotId": "jesus-ministry-study",
      "snapshotIds": [
        "jesus-ministry-study"
      ],
      "defaultRouteIds": [
        "john-2"
      ]
    },
    {
      "id": "early-church",
      "order": 11,
      "label": "Early Church",
      "summary": "Acts follows the church from Jerusalem into the eastern Mediterranean and Rome. Paul’s missions and the voyage are separate selected-stop itineraries, with unrecorded paths kept schematic.",
      "dateLabel": "First-century apostolic narratives",
      "chronologyNote": "Ordered study periods, not an equal-scale date axis. Relative narrative chronology; no precise beginning or ending year is asserted.",
      "evidenceIds": [
        "bible-Acts-1-12",
        "bible-Acts-13-1",
        "bible-Acts-13-4",
        "bible-Acts-13-5",
        "bible-Acts-13-6",
        "bible-Acts-13-13",
        "bible-Acts-13-14",
        "bible-Acts-13-51",
        "bible-Acts-14-6",
        "bible-Acts-14-20",
        "bible-Acts-16-8",
        "bible-Acts-16-12",
        "bible-Acts-17-1",
        "bible-Acts-17-10",
        "bible-Acts-17-15",
        "bible-Acts-18-1",
        "bible-Acts-19-1",
        "bible-Acts-25-4",
        "bible-Acts-27-3",
        "bible-Acts-27-5",
        "bible-Acts-28-1",
        "bible-Acts-28-16"
      ],
      "bounds": [
        [
          10,
          29
        ],
        [
          39,
          43
        ]
      ],
      "defaultSnapshotId": "early-church-study",
      "snapshotIds": [
        "early-church-study"
      ],
      "defaultRouteIds": [
        "paul-first"
      ]
    }
  ],
  "snapshots": [
    {
      "id": "patriarchs-study",
      "eraId": "patriarchs",
      "label": "Abraham in Canaan; Jacob’s journeys",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-Genesis-11-31",
        "bible-Genesis-12-4",
        "bible-Genesis-12-6",
        "bible-Genesis-12-8",
        "bible-Genesis-13-18",
        "bible-Genesis-21-31",
        "bible-Genesis-12-10"
      ],
      "areaIds": [
        "patriarchs-sites"
      ]
    },
    {
      "id": "exodus-study",
      "eraId": "exodus",
      "label": "Selected wilderness stations",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-Exodus-12-41",
        "bible-Exodus-12-37",
        "bible-Exodus-12-37",
        "bible-Exodus-19-2",
        "bible-Numbers-20-1",
        "bible-Numbers-22-1"
      ],
      "areaIds": [
        "exodus-sites"
      ]
    },
    {
      "id": "conquest-study",
      "eraId": "conquest",
      "label": "Crossing and central hill-country narratives",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-Joshua-4-19",
        "bible-Joshua-6-1",
        "bible-Joshua-8-1",
        "bible-Joshua-24-1",
        "bible-Joshua-18-1",
        "bible-Joshua-8-9"
      ],
      "areaIds": [
        "conquest-sites"
      ]
    },
    {
      "id": "judges-study",
      "eraId": "judges",
      "label": "Danite scouting, before the renaming",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-Judges-18-31",
        "bible-Judges-18-7",
        "bible-Judges-19-10",
        "bible-Judges-19-14",
        "bible-Judges-19-1",
        "bible-Judges-18-2",
        "bible-Judges-18-7",
        "openbible"
      ],
      "areaIds": [
        "judges-sites"
      ]
    },
    {
      "id": "united-monarchy-study",
      "eraId": "united-monarchy",
      "label": "David establishes Jerusalem",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-2-Samuel-2-1",
        "bible-2-Samuel-5-6",
        "bible-1-Samuel-16-4"
      ],
      "areaIds": [
        "united-monarchy-sites"
      ]
    },
    {
      "id": "divided-monarchy-study",
      "eraId": "divided-monarchy",
      "label": "Samaria’s fall in the reign of Hoshea",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-2-Kings-17-6",
        "bible-2-Kings-18-2",
        "bible-2-Kings-17-28",
        "bible-1-Kings-12-29"
      ],
      "areaIds": [
        "divided-monarchy-sites"
      ]
    },
    {
      "id": "exile-study",
      "eraId": "exile",
      "label": "Deportation under Nebuchadnezzar",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-2-Kings-25-8",
        "bible-2-Kings-25-21",
        "bible-Jeremiah-43-7"
      ],
      "areaIds": [
        "exile-sites"
      ]
    },
    {
      "id": "return-persian-study",
      "eraId": "return-persian",
      "label": "Return described in Ezra 1–2",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-Ezra-2-1",
        "bible-Ezra-2-1",
        "bible-Nehemiah-1-1"
      ],
      "areaIds": [
        "return-persian-sites"
      ]
    },
    {
      "id": "hellenistic-study",
      "eraId": "hellenistic",
      "label": "John Hyrcanus: Samaria campaign",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "josephus-hyrcanus"
      ],
      "areaIds": [
        "hellenistic-sites"
      ]
    },
    {
      "id": "herodian-study",
      "eraId": "herodian",
      "label": "Matthew’s infancy narrative",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-Matthew-2-1",
        "bible-Matthew-2-1",
        "bible-Matthew-2-14",
        "bible-Matthew-2-23",
        "josephus-sebaste"
      ],
      "areaIds": [
        "herodian-sites"
      ]
    },
    {
      "id": "jesus-ministry-study",
      "eraId": "jesus-ministry",
      "label": "John 2–4: Judea, Samaria and Galilee",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-John-2-1",
        "bible-John-2-12",
        "bible-John-2-13",
        "bible-John-4-5",
        "bible-Luke-4-16"
      ],
      "areaIds": [
        "jesus-ministry-sites"
      ]
    },
    {
      "id": "early-church-study",
      "eraId": "early-church",
      "label": "Acts: Paul’s missions and voyage",
      "description": "Selected narrative/site context. Points identify catalog candidates, not borders or the full extent of political control.",
      "evidenceIds": [
        "bible-Acts-1-12",
        "bible-Acts-13-1",
        "bible-Acts-13-4",
        "bible-Acts-13-5",
        "bible-Acts-13-6",
        "bible-Acts-13-13",
        "bible-Acts-13-14",
        "bible-Acts-13-51",
        "bible-Acts-14-6",
        "bible-Acts-14-20",
        "bible-Acts-16-8",
        "bible-Acts-16-12",
        "bible-Acts-17-1",
        "bible-Acts-17-10",
        "bible-Acts-17-15",
        "bible-Acts-18-1",
        "bible-Acts-19-1",
        "bible-Acts-25-4",
        "bible-Acts-27-3",
        "bible-Acts-27-5",
        "bible-Acts-28-1",
        "bible-Acts-28-16"
      ],
      "areaIds": [
        "early-church-sites"
      ]
    },
    {
      "id": "judges-levite",
      "eraId": "judges",
      "label": "Levite’s journey: Judges 19",
      "description": "The chapter 19 itinerary; its relative chronology within Judges is not asserted. Shiloh is wider narrative context.",
      "evidenceIds": [
        "bible-Judges-19-1–14",
        "bible-Judges-18-31",
        "openbible"
      ],
      "areaIds": [
        "judges-levite-sites"
      ]
    }
  ],
  "annotations": [
    {
      "id": "patriarchs-ur",
      "placeId": "openbible-a6cf75c",
      "eraId": "patriarchs",
      "reason": "Included for the selected narrative: Genesis 11:31.",
      "references": [
        {
          "book": "Genesis",
          "chapter": 11,
          "verse": 31
        }
      ],
      "evidenceIds": [
        "bible-Genesis-11-31",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "patriarchs-haran",
      "placeId": "openbible-a6d9af3",
      "eraId": "patriarchs",
      "reason": "Included for the selected narrative: Genesis 12:4.",
      "references": [
        {
          "book": "Genesis",
          "chapter": 12,
          "verse": 4
        }
      ],
      "evidenceIds": [
        "bible-Genesis-12-4",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "patriarchs-shechem",
      "placeId": "openbible-adf74d4",
      "eraId": "patriarchs",
      "reason": "Included for the selected narrative: Genesis 12:6.",
      "references": [
        {
          "book": "Genesis",
          "chapter": 12,
          "verse": 6
        }
      ],
      "evidenceIds": [
        "bible-Genesis-12-6",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "patriarchs-bethel",
      "placeId": "openbible-a64f355",
      "eraId": "patriarchs",
      "reason": "Included for the selected narrative: Genesis 12:8.",
      "references": [
        {
          "book": "Genesis",
          "chapter": 12,
          "verse": 8
        }
      ],
      "evidenceIds": [
        "bible-Genesis-12-8",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "patriarchs-hebron",
      "placeId": "openbible-a85151a",
      "eraId": "patriarchs",
      "reason": "Included for the selected narrative: Genesis 13:18.",
      "references": [
        {
          "book": "Genesis",
          "chapter": 13,
          "verse": 18
        }
      ],
      "evidenceIds": [
        "bible-Genesis-13-18",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "patriarchs-beersheba",
      "placeId": "openbible-a075d61",
      "eraId": "patriarchs",
      "reason": "Included for the selected narrative: Genesis 21:31.",
      "references": [
        {
          "book": "Genesis",
          "chapter": 21,
          "verse": 31
        }
      ],
      "evidenceIds": [
        "bible-Genesis-21-31",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "patriarchs-egypt",
      "placeId": "openbible-af301ca",
      "eraId": "patriarchs",
      "reason": "Included for the selected narrative: Genesis 12:10.",
      "references": [
        {
          "book": "Genesis",
          "chapter": 12,
          "verse": 10
        }
      ],
      "evidenceIds": [
        "bible-Genesis-12-10",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exodus-egypt",
      "placeId": "openbible-af301ca",
      "eraId": "exodus",
      "reason": "Included for the selected narrative: Exodus 12:41.",
      "references": [
        {
          "book": "Exodus",
          "chapter": 12,
          "verse": 41
        }
      ],
      "evidenceIds": [
        "bible-Exodus-12-41",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exodus-rameses",
      "placeId": "openbible-a079b21",
      "eraId": "exodus",
      "reason": "Included for the selected narrative: Exodus 12:37.",
      "references": [
        {
          "book": "Exodus",
          "chapter": 12,
          "verse": 37
        }
      ],
      "evidenceIds": [
        "bible-Exodus-12-37",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exodus-succoth",
      "placeId": "openbible-aa28709",
      "eraId": "exodus",
      "reason": "Included for the selected narrative: Exodus 12:37.",
      "references": [
        {
          "book": "Exodus",
          "chapter": 12,
          "verse": 37
        }
      ],
      "evidenceIds": [
        "bible-Exodus-12-37",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exodus-sinai",
      "placeId": "openbible-abfba2a",
      "eraId": "exodus",
      "reason": "Included for the selected narrative: Exodus 19:2.",
      "references": [
        {
          "book": "Exodus",
          "chapter": 19,
          "verse": 2
        }
      ],
      "evidenceIds": [
        "bible-Exodus-19-2",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exodus-kadesh",
      "placeId": "openbible-ac2cef0",
      "eraId": "exodus",
      "reason": "Included for the selected narrative: Numbers 20:1.",
      "references": [
        {
          "book": "Numbers",
          "chapter": 20,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Numbers-20-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exodus-moab",
      "placeId": "openbible-aca767b",
      "eraId": "exodus",
      "reason": "Included for the selected narrative: Numbers 22:1.",
      "references": [
        {
          "book": "Numbers",
          "chapter": 22,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Numbers-22-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "conquest-gilgal",
      "placeId": "openbible-ab94aea",
      "eraId": "conquest",
      "reason": "Included for the selected narrative: Joshua 4:19.",
      "references": [
        {
          "book": "Joshua",
          "chapter": 4,
          "verse": 19
        }
      ],
      "evidenceIds": [
        "bible-Joshua-4-19",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "conquest-jericho",
      "placeId": "openbible-a231f80",
      "eraId": "conquest",
      "reason": "Included for the selected narrative: Joshua 6:1.",
      "references": [
        {
          "book": "Joshua",
          "chapter": 6,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Joshua-6-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "conquest-ai",
      "placeId": "openbible-a7e13e1",
      "eraId": "conquest",
      "reason": "Included for the selected narrative: Joshua 8:1.",
      "references": [
        {
          "book": "Joshua",
          "chapter": 8,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Joshua-8-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "conquest-shechem",
      "placeId": "openbible-adf74d4",
      "eraId": "conquest",
      "reason": "Included for the selected narrative: Joshua 24:1.",
      "references": [
        {
          "book": "Joshua",
          "chapter": 24,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Joshua-24-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "conquest-shiloh",
      "placeId": "openbible-aa4680a",
      "eraId": "conquest",
      "reason": "Included for the selected narrative: Joshua 18:1.",
      "references": [
        {
          "book": "Joshua",
          "chapter": 18,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Joshua-18-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "conquest-bethel",
      "placeId": "openbible-a64f355",
      "eraId": "conquest",
      "reason": "Included for the selected narrative: Joshua 8:9.",
      "references": [
        {
          "book": "Joshua",
          "chapter": 8,
          "verse": 9
        }
      ],
      "evidenceIds": [
        "bible-Joshua-8-9",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "judges-shiloh",
      "placeId": "openbible-aa4680a",
      "eraId": "judges",
      "reason": "Included for the selected narrative: Judges 18:31.",
      "references": [
        {
          "book": "Judges",
          "chapter": 18,
          "verse": 31
        }
      ],
      "evidenceIds": [
        "bible-Judges-18-31",
        "openbible"
      ],
      "status": "reviewed",
      "snapshotIds": [
        "judges-levite"
      ]
    },
    {
      "id": "judges-dan",
      "placeId": "openbible-a513646",
      "eraId": "judges",
      "reason": "Included for the selected narrative: Judges 18:7.",
      "references": [
        {
          "book": "Judges",
          "chapter": 18,
          "verse": 7
        }
      ],
      "evidenceIds": [
        "bible-Judges-18-7",
        "openbible"
      ],
      "status": "reviewed",
      "snapshotIds": [
        "judges-study"
      ]
    },
    {
      "id": "judges-jebus",
      "placeId": "openbible-a403c45",
      "eraId": "judges",
      "reason": "Included for the selected narrative: Judges 19:10.",
      "references": [
        {
          "book": "Judges",
          "chapter": 19,
          "verse": 10
        }
      ],
      "evidenceIds": [
        "bible-Judges-19-10",
        "openbible"
      ],
      "status": "reviewed",
      "snapshotIds": [
        "judges-levite"
      ]
    },
    {
      "id": "judges-gibeah",
      "placeId": "openbible-ac24f5f",
      "eraId": "judges",
      "reason": "Included for the selected narrative: Judges 19:14.",
      "references": [
        {
          "book": "Judges",
          "chapter": 19,
          "verse": 14
        }
      ],
      "evidenceIds": [
        "bible-Judges-19-14",
        "openbible"
      ],
      "status": "reviewed",
      "snapshotIds": [
        "judges-levite"
      ]
    },
    {
      "id": "judges-bethlehem",
      "placeId": "openbible-a112427",
      "eraId": "judges",
      "reason": "Included for the selected narrative: Judges 19:1.",
      "references": [
        {
          "book": "Judges",
          "chapter": 19,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Judges-19-1",
        "openbible"
      ],
      "status": "reviewed",
      "snapshotIds": [
        "judges-levite"
      ]
    },
    {
      "id": "united-monarchy-hebron",
      "placeId": "openbible-a85151a",
      "eraId": "united-monarchy",
      "reason": "Included for the selected narrative: 2 Samuel 2:1.",
      "references": [
        {
          "book": "2 Samuel",
          "chapter": 2,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-2-Samuel-2-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "united-monarchy-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "united-monarchy",
      "reason": "Included for the selected narrative: 2 Samuel 5:6.",
      "references": [
        {
          "book": "2 Samuel",
          "chapter": 5,
          "verse": 6
        }
      ],
      "evidenceIds": [
        "bible-2-Samuel-5-6",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "united-monarchy-bethlehem",
      "placeId": "openbible-a112427",
      "eraId": "united-monarchy",
      "reason": "Included for the selected narrative: 1 Samuel 16:4.",
      "references": [
        {
          "book": "1 Samuel",
          "chapter": 16,
          "verse": 4
        }
      ],
      "evidenceIds": [
        "bible-1-Samuel-16-4",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "divided-monarchy-samaria",
      "placeId": "openbible-a041bb3",
      "eraId": "divided-monarchy",
      "reason": "Included for the selected narrative: 2 Kings 17:6.",
      "references": [
        {
          "book": "2 Kings",
          "chapter": 17,
          "verse": 6
        }
      ],
      "evidenceIds": [
        "bible-2-Kings-17-6",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "divided-monarchy-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "divided-monarchy",
      "reason": "Included for the selected narrative: 2 Kings 18:2.",
      "references": [
        {
          "book": "2 Kings",
          "chapter": 18,
          "verse": 2
        }
      ],
      "evidenceIds": [
        "bible-2-Kings-18-2",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "divided-monarchy-bethel",
      "placeId": "openbible-a64f355",
      "eraId": "divided-monarchy",
      "reason": "Included for the selected narrative: 2 Kings 17:28.",
      "references": [
        {
          "book": "2 Kings",
          "chapter": 17,
          "verse": 28
        }
      ],
      "evidenceIds": [
        "bible-2-Kings-17-28",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "divided-monarchy-dan",
      "placeId": "openbible-a513646",
      "eraId": "divided-monarchy",
      "reason": "Included for the selected narrative: 1 Kings 12:29.",
      "references": [
        {
          "book": "1 Kings",
          "chapter": 12,
          "verse": 29
        }
      ],
      "evidenceIds": [
        "bible-1-Kings-12-29",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exile-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "exile",
      "reason": "Included for the selected narrative: 2 Kings 25:8.",
      "references": [
        {
          "book": "2 Kings",
          "chapter": 25,
          "verse": 8
        }
      ],
      "evidenceIds": [
        "bible-2-Kings-25-8",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exile-babylon",
      "placeId": "openbible-a217d18",
      "eraId": "exile",
      "reason": "Included for the selected narrative: 2 Kings 25:21.",
      "references": [
        {
          "book": "2 Kings",
          "chapter": 25,
          "verse": 21
        }
      ],
      "evidenceIds": [
        "bible-2-Kings-25-21",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "exile-egypt",
      "placeId": "openbible-af301ca",
      "eraId": "exile",
      "reason": "Included for the selected narrative: Jeremiah 43:7.",
      "references": [
        {
          "book": "Jeremiah",
          "chapter": 43,
          "verse": 7
        }
      ],
      "evidenceIds": [
        "bible-Jeremiah-43-7",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "return-persian-babylon",
      "placeId": "openbible-a217d18",
      "eraId": "return-persian",
      "reason": "Included for the selected narrative: Ezra 2:1.",
      "references": [
        {
          "book": "Ezra",
          "chapter": 2,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Ezra-2-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "return-persian-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "return-persian",
      "reason": "Included for the selected narrative: Ezra 2:1.",
      "references": [
        {
          "book": "Ezra",
          "chapter": 2,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Ezra-2-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "return-persian-susa",
      "placeId": "openbible-a033b84",
      "eraId": "return-persian",
      "reason": "Included for the selected narrative: Nehemiah 1:1.",
      "references": [
        {
          "book": "Nehemiah",
          "chapter": 1,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Nehemiah-1-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "hellenistic-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "hellenistic",
      "reason": "Center in Josephus’s account of John Hyrcanus, Antiquities XIII.10.1–3.",
      "references": [],
      "evidenceIds": [
        "josephus-hyrcanus",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "hellenistic-samaria",
      "placeId": "openbible-a041bb3",
      "eraId": "hellenistic",
      "reason": "Center in Josephus’s account of John Hyrcanus, Antiquities XIII.10.1–3.",
      "references": [],
      "evidenceIds": [
        "josephus-hyrcanus",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "herodian-bethlehem",
      "placeId": "openbible-a112427",
      "eraId": "herodian",
      "reason": "Included for the selected narrative: Matthew 2:1.",
      "references": [
        {
          "book": "Matthew",
          "chapter": 2,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Matthew-2-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "herodian-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "herodian",
      "reason": "Included for the selected narrative: Matthew 2:1.",
      "references": [
        {
          "book": "Matthew",
          "chapter": 2,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Matthew-2-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "herodian-egypt",
      "placeId": "openbible-af301ca",
      "eraId": "herodian",
      "reason": "Included for the selected narrative: Matthew 2:14.",
      "references": [
        {
          "book": "Matthew",
          "chapter": 2,
          "verse": 14
        }
      ],
      "evidenceIds": [
        "bible-Matthew-2-14",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "herodian-nazareth",
      "placeId": "openbible-af5884f",
      "eraId": "herodian",
      "reason": "Included for the selected narrative: Matthew 2:23.",
      "references": [
        {
          "book": "Matthew",
          "chapter": 2,
          "verse": 23
        }
      ],
      "evidenceIds": [
        "bible-Matthew-2-23",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "herodian-samaria",
      "placeId": "openbible-a041bb3",
      "eraId": "herodian",
      "reason": "Herod’s renamed city, wider reign context; not an infancy route stop.",
      "references": [],
      "evidenceIds": [
        "josephus-sebaste",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "jesus-ministry-cana",
      "placeId": "openbible-a031bda",
      "eraId": "jesus-ministry",
      "reason": "Included for the selected narrative: John 2:1.",
      "references": [
        {
          "book": "John",
          "chapter": 2,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-John-2-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "jesus-ministry-capernaum",
      "placeId": "openbible-af2161c",
      "eraId": "jesus-ministry",
      "reason": "Included for the selected narrative: John 2:12.",
      "references": [
        {
          "book": "John",
          "chapter": 2,
          "verse": 12
        }
      ],
      "evidenceIds": [
        "bible-John-2-12",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "jesus-ministry-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "jesus-ministry",
      "reason": "Included for the selected narrative: John 2:13.",
      "references": [
        {
          "book": "John",
          "chapter": 2,
          "verse": 13
        }
      ],
      "evidenceIds": [
        "bible-John-2-13",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "jesus-ministry-sychar",
      "placeId": "openbible-a27b472",
      "eraId": "jesus-ministry",
      "reason": "Included for the selected narrative: John 4:5.",
      "references": [
        {
          "book": "John",
          "chapter": 4,
          "verse": 5
        }
      ],
      "evidenceIds": [
        "bible-John-4-5",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "jesus-ministry-nazareth",
      "placeId": "openbible-af5884f",
      "eraId": "jesus-ministry",
      "reason": "Included for the selected narrative: Luke 4:16.",
      "references": [
        {
          "book": "Luke",
          "chapter": 4,
          "verse": 16
        }
      ],
      "evidenceIds": [
        "bible-Luke-4-16",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-jerusalem",
      "placeId": "openbible-a15257a",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 1:12.",
      "references": [
        {
          "book": "Acts",
          "chapter": 1,
          "verse": 12
        }
      ],
      "evidenceIds": [
        "bible-Acts-1-12",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-antioch",
      "placeId": "openbible-ae41ab4",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 13:1.",
      "references": [
        {
          "book": "Acts",
          "chapter": 13,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Acts-13-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-seleucia",
      "placeId": "openbible-a6d306d",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 13:4.",
      "references": [
        {
          "book": "Acts",
          "chapter": 13,
          "verse": 4
        }
      ],
      "evidenceIds": [
        "bible-Acts-13-4",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-salamis",
      "placeId": "openbible-afa863b",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 13:5.",
      "references": [
        {
          "book": "Acts",
          "chapter": 13,
          "verse": 5
        }
      ],
      "evidenceIds": [
        "bible-Acts-13-5",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-paphos",
      "placeId": "openbible-a314765",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 13:6.",
      "references": [
        {
          "book": "Acts",
          "chapter": 13,
          "verse": 6
        }
      ],
      "evidenceIds": [
        "bible-Acts-13-6",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-perga",
      "placeId": "openbible-aff04b8",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 13:13.",
      "references": [
        {
          "book": "Acts",
          "chapter": 13,
          "verse": 13
        }
      ],
      "evidenceIds": [
        "bible-Acts-13-13",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-pisidian_antioch",
      "placeId": "openbible-a6c704a",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 13:14.",
      "references": [
        {
          "book": "Acts",
          "chapter": 13,
          "verse": 14
        }
      ],
      "evidenceIds": [
        "bible-Acts-13-14",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-iconium",
      "placeId": "openbible-ae425aa",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 13:51.",
      "references": [
        {
          "book": "Acts",
          "chapter": 13,
          "verse": 51
        }
      ],
      "evidenceIds": [
        "bible-Acts-13-51",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-lystra",
      "placeId": "openbible-af0719d",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 14:6.",
      "references": [
        {
          "book": "Acts",
          "chapter": 14,
          "verse": 6
        }
      ],
      "evidenceIds": [
        "bible-Acts-14-6",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-derbe",
      "placeId": "openbible-aa401a9",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 14:20.",
      "references": [
        {
          "book": "Acts",
          "chapter": 14,
          "verse": 20
        }
      ],
      "evidenceIds": [
        "bible-Acts-14-20",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-troas",
      "placeId": "openbible-a91c509",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 16:8.",
      "references": [
        {
          "book": "Acts",
          "chapter": 16,
          "verse": 8
        }
      ],
      "evidenceIds": [
        "bible-Acts-16-8",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-philippi",
      "placeId": "openbible-a49e1d0",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 16:12.",
      "references": [
        {
          "book": "Acts",
          "chapter": 16,
          "verse": 12
        }
      ],
      "evidenceIds": [
        "bible-Acts-16-12",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-thessalonica",
      "placeId": "openbible-afa9d8e",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 17:1.",
      "references": [
        {
          "book": "Acts",
          "chapter": 17,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Acts-17-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-berea",
      "placeId": "openbible-a62fe31",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 17:10.",
      "references": [
        {
          "book": "Acts",
          "chapter": 17,
          "verse": 10
        }
      ],
      "evidenceIds": [
        "bible-Acts-17-10",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-athens",
      "placeId": "openbible-a1fe6e7",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 17:15.",
      "references": [
        {
          "book": "Acts",
          "chapter": 17,
          "verse": 15
        }
      ],
      "evidenceIds": [
        "bible-Acts-17-15",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-corinth",
      "placeId": "openbible-a6f437a",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 18:1.",
      "references": [
        {
          "book": "Acts",
          "chapter": 18,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Acts-18-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-ephesus",
      "placeId": "openbible-a5feb15",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 19:1.",
      "references": [
        {
          "book": "Acts",
          "chapter": 19,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Acts-19-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-caesarea",
      "placeId": "openbible-a58735e",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 25:4.",
      "references": [
        {
          "book": "Acts",
          "chapter": 25,
          "verse": 4
        }
      ],
      "evidenceIds": [
        "bible-Acts-25-4",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-sidon",
      "placeId": "openbible-a98e4d7",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 27:3.",
      "references": [
        {
          "book": "Acts",
          "chapter": 27,
          "verse": 3
        }
      ],
      "evidenceIds": [
        "bible-Acts-27-3",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-myra",
      "placeId": "openbible-aa4b3e2",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 27:5.",
      "references": [
        {
          "book": "Acts",
          "chapter": 27,
          "verse": 5
        }
      ],
      "evidenceIds": [
        "bible-Acts-27-5",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-malta",
      "placeId": "openbible-a57835d",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 28:1.",
      "references": [
        {
          "book": "Acts",
          "chapter": 28,
          "verse": 1
        }
      ],
      "evidenceIds": [
        "bible-Acts-28-1",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "early-church-rome",
      "placeId": "openbible-afc8e7a",
      "eraId": "early-church",
      "reason": "Included for the selected narrative: Acts 28:16.",
      "references": [
        {
          "book": "Acts",
          "chapter": 28,
          "verse": 16
        }
      ],
      "evidenceIds": [
        "bible-Acts-28-16",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "judges-zorah",
      "placeId": "openbible-a08174b",
      "eraId": "judges",
      "snapshotIds": [
        "judges-study"
      ],
      "reason": "Departure communities of the Danite scouts in Judges 18:2.",
      "references": [
        {
          "book": "Judges",
          "chapter": 18,
          "verse": 2
        }
      ],
      "evidenceIds": [
        "bible-Judges-18-2",
        "openbible"
      ],
      "status": "reviewed"
    },
    {
      "id": "judges-eshtaol",
      "placeId": "openbible-a355b6e",
      "eraId": "judges",
      "snapshotIds": [
        "judges-study"
      ],
      "reason": "Departure communities of the Danite scouts in Judges 18:2.",
      "references": [
        {
          "book": "Judges",
          "chapter": 18,
          "verse": 2
        }
      ],
      "evidenceIds": [
        "bible-Judges-18-2",
        "openbible"
      ],
      "status": "reviewed"
    }
  ],
  "names": [
    {
      "id": "laish-before-renaming",
      "placeId": "openbible-a513646",
      "name": "Laish",
      "eraIds": [
        "judges"
      ],
      "snapshotIds": [
        "judges-study"
      ],
      "kind": "period-name",
      "evidenceIds": [
        "bible-Judges-18-7",
        "bible-Judges-18-29"
      ],
      "status": "reviewed"
    },
    {
      "id": "sebaste-herodian",
      "placeId": "openbible-a041bb3",
      "name": "Sebaste",
      "eraIds": [
        "herodian"
      ],
      "kind": "period-name",
      "evidenceIds": [
        "josephus-sebaste"
      ],
      "status": "reviewed"
    },
    {
      "id": "jebus-identity",
      "placeId": "openbible-a403c45",
      "name": "Jebus",
      "eraIds": [
        "judges"
      ],
      "kind": "period-name",
      "evidenceIds": [
        "bible-Judges-19-10"
      ],
      "relatedPlaceIds": [
        "openbible-a15257a"
      ],
      "status": "reviewed"
    }
  ],
  "areas": [
    {
      "id": "patriarchs-sites",
      "polityId": "patriarchs-context",
      "snapshotIds": [
        "patriarchs-study"
      ],
      "name": "Patriarchs · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a6cf75c",
        "openbible-a6d9af3",
        "openbible-adf74d4",
        "openbible-a64f355",
        "openbible-a85151a",
        "openbible-a075d61",
        "openbible-af301ca"
      ],
      "evidenceIds": [
        "bible-Genesis-11-31",
        "bible-Genesis-12-4",
        "bible-Genesis-12-6",
        "bible-Genesis-12-8",
        "bible-Genesis-13-18",
        "bible-Genesis-21-31",
        "bible-Genesis-12-10",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        46.104444,
        30.962222
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "exodus-sites",
      "polityId": "exodus-context",
      "snapshotIds": [
        "exodus-study"
      ],
      "name": "Exodus & Wilderness · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-af301ca",
        "openbible-a079b21",
        "openbible-aa28709",
        "openbible-abfba2a",
        "openbible-ac2cef0",
        "openbible-aca767b"
      ],
      "evidenceIds": [
        "bible-Exodus-12-41",
        "bible-Exodus-12-37",
        "bible-Exodus-12-37",
        "bible-Exodus-19-2",
        "bible-Numbers-20-1",
        "bible-Numbers-22-1",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        31.3075,
        30.129444
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "conquest-sites",
      "polityId": "conquest-context",
      "snapshotIds": [
        "conquest-study"
      ],
      "name": "Conquest & Settlement · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-ab94aea",
        "openbible-a231f80",
        "openbible-a7e13e1",
        "openbible-adf74d4",
        "openbible-aa4680a",
        "openbible-a64f355"
      ],
      "evidenceIds": [
        "bible-Joshua-4-19",
        "bible-Joshua-6-1",
        "bible-Joshua-8-1",
        "bible-Joshua-24-1",
        "bible-Joshua-18-1",
        "bible-Joshua-8-9",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.459969,
        31.881883
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "judges-sites",
      "polityId": "judges-context",
      "snapshotIds": [
        "judges-study"
      ],
      "name": "Danite scouting: departure communities and Laish",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a08174b",
        "openbible-a355b6e",
        "openbible-a513646"
      ],
      "evidenceIds": [
        "bible-Judges-18-2",
        "bible-Judges-18-7",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.289536,
        32.055703
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "united-monarchy-sites",
      "polityId": "united-monarchy-context",
      "snapshotIds": [
        "united-monarchy-study"
      ],
      "name": "United Monarchy · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a85151a",
        "openbible-a15257a",
        "openbible-a112427"
      ],
      "evidenceIds": [
        "bible-2-Samuel-2-1",
        "bible-2-Samuel-5-6",
        "bible-1-Samuel-16-4",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.10222,
        31.525087
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "divided-monarchy-sites",
      "polityId": "divided-monarchy-context",
      "snapshotIds": [
        "divided-monarchy-study"
      ],
      "name": "Divided Monarchy · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a041bb3",
        "openbible-a15257a",
        "openbible-a64f355",
        "openbible-a513646"
      ],
      "evidenceIds": [
        "bible-2-Kings-17-6",
        "bible-2-Kings-18-2",
        "bible-2-Kings-17-28",
        "bible-1-Kings-12-29",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.195,
        32.276111
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "exile-sites",
      "polityId": "exile-context",
      "snapshotIds": [
        "exile-study"
      ],
      "name": "Babylonian Exile · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a15257a",
        "openbible-a217d18",
        "openbible-af301ca"
      ],
      "evidenceIds": [
        "bible-2-Kings-25-8",
        "bible-2-Kings-25-21",
        "bible-Jeremiah-43-7",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.234167,
        31.776667
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "return-persian-sites",
      "polityId": "return-persian-context",
      "snapshotIds": [
        "return-persian-study"
      ],
      "name": "Return & Persian Period · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a217d18",
        "openbible-a15257a",
        "openbible-a033b84"
      ],
      "evidenceIds": [
        "bible-Ezra-2-1",
        "bible-Ezra-2-1",
        "bible-Nehemiah-1-1",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        44.422222,
        32.543333
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "hellenistic-sites",
      "polityId": "hellenistic-context",
      "snapshotIds": [
        "hellenistic-study"
      ],
      "name": "Hellenistic & Hasmonean Periods · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a15257a",
        "openbible-a041bb3"
      ],
      "evidenceIds": [
        "josephus-hyrcanus",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.234167,
        31.776667
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "herodian-sites",
      "polityId": "herodian-context",
      "snapshotIds": [
        "herodian-study"
      ],
      "name": "Herodian & Early Roman Period · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a112427",
        "openbible-a15257a",
        "openbible-af301ca",
        "openbible-af5884f",
        "openbible-a041bb3"
      ],
      "evidenceIds": [
        "bible-Matthew-2-1",
        "bible-Matthew-2-1",
        "bible-Matthew-2-14",
        "bible-Matthew-2-23",
        "josephus-sebaste",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.207639,
        31.704306
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "jesus-ministry-sites",
      "polityId": "jesus-ministry-context",
      "snapshotIds": [
        "jesus-ministry-study"
      ],
      "name": "Jesus’ Ministry · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a031bda",
        "openbible-af2161c",
        "openbible-a15257a",
        "openbible-a27b472",
        "openbible-af5884f"
      ],
      "evidenceIds": [
        "bible-John-2-1",
        "bible-John-2-12",
        "bible-John-2-13",
        "bible-John-4-5",
        "bible-Luke-4-16",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.30269,
        32.8222
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "early-church-sites",
      "polityId": "early-church-context",
      "snapshotIds": [
        "early-church-study"
      ],
      "name": "Early Church · narrative sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a15257a",
        "openbible-ae41ab4",
        "openbible-a6d306d",
        "openbible-afa863b",
        "openbible-a314765",
        "openbible-aff04b8",
        "openbible-a6c704a",
        "openbible-ae425aa",
        "openbible-af0719d",
        "openbible-aa401a9",
        "openbible-a91c509",
        "openbible-a49e1d0",
        "openbible-afa9d8e",
        "openbible-a62fe31",
        "openbible-a1fe6e7",
        "openbible-a6f437a",
        "openbible-a5feb15",
        "openbible-a58735e",
        "openbible-a98e4d7",
        "openbible-aa4b3e2",
        "openbible-a57835d",
        "openbible-afc8e7a"
      ],
      "evidenceIds": [
        "bible-Acts-1-12",
        "bible-Acts-13-1",
        "bible-Acts-13-4",
        "bible-Acts-13-5",
        "bible-Acts-13-6",
        "bible-Acts-13-13",
        "bible-Acts-13-14",
        "bible-Acts-13-51",
        "bible-Acts-14-6",
        "bible-Acts-14-20",
        "bible-Acts-16-8",
        "bible-Acts-16-12",
        "bible-Acts-17-1",
        "bible-Acts-17-10",
        "bible-Acts-17-15",
        "bible-Acts-18-1",
        "bible-Acts-19-1",
        "bible-Acts-25-4",
        "bible-Acts-27-3",
        "bible-Acts-27-5",
        "bible-Acts-28-1",
        "bible-Acts-28-16",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.234167,
        31.776667
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    },
    {
      "id": "judges-levite-sites",
      "polityId": "judges-context",
      "snapshotIds": [
        "judges-levite"
      ],
      "name": "Levite journey: named sites",
      "kind": "attested-sites",
      "siteIds": [
        "openbible-a112427",
        "openbible-a403c45",
        "openbible-ac24f5f",
        "openbible-aa4680a"
      ],
      "evidenceIds": [
        "bible-Judges-19-1–14",
        "bible-Judges-18-31",
        "openbible"
      ],
      "uncertainty": "Attestation is in the cited text. Candidate locations follow OpenBible; site halos have no territorial or chronological extent.",
      "anchor": [
        35.289536,
        32.055703
      ],
      "color": "#2e6f7e",
      "status": "reviewed"
    }
  ],
  "routes": [
    {
      "id": "abraham-canaan",
      "eraIds": [
        "patriarchs"
      ],
      "title": "Abraham: Genesis 12–13",
      "description": "Selected ordered stops in Genesis 12:4–10, Genesis 13:3–18.",
      "stops": [
        {
          "id": "abraham-canaan-0",
          "order": 1,
          "label": "Haran",
          "placeId": "openbible-a6d9af3"
        },
        {
          "id": "abraham-canaan-1",
          "order": 2,
          "label": "Shechem",
          "placeId": "openbible-adf74d4"
        },
        {
          "id": "abraham-canaan-2",
          "order": 3,
          "label": "Bethel 1",
          "placeId": "openbible-a64f355"
        },
        {
          "id": "abraham-canaan-3",
          "order": 4,
          "label": "Egypt",
          "placeId": "openbible-af301ca"
        },
        {
          "id": "abraham-canaan-4",
          "order": 5,
          "label": "Bethel 1",
          "placeId": "openbible-a64f355"
        },
        {
          "id": "abraham-canaan-5",
          "order": 6,
          "label": "Hebron",
          "placeId": "openbible-a85151a"
        }
      ],
      "segments": [
        {
          "id": "abraham-canaan-segment-0",
          "from": "abraham-canaan-0",
          "to": "abraham-canaan-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Genesis-12-4–10",
            "bible-Genesis-13-3–18",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                39.032778,
                36.864444
              ],
              [
                35.281944,
                32.213611
              ]
            ]
          }
        },
        {
          "id": "abraham-canaan-segment-1",
          "from": "abraham-canaan-1",
          "to": "abraham-canaan-2",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Genesis-12-4–10",
            "bible-Genesis-13-3–18",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.281944,
                32.213611
              ],
              [
                35.241389,
                31.922778
              ]
            ]
          }
        },
        {
          "id": "abraham-canaan-segment-2",
          "from": "abraham-canaan-2",
          "to": "abraham-canaan-3",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Genesis-12-4–10",
            "bible-Genesis-13-3–18",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.241389,
                31.922778
              ],
              [
                31.3075,
                30.129444
              ]
            ]
          }
        },
        {
          "id": "abraham-canaan-segment-3",
          "from": "abraham-canaan-3",
          "to": "abraham-canaan-4",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Genesis-12-4–10",
            "bible-Genesis-13-3–18",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                31.3075,
                30.129444
              ],
              [
                35.241389,
                31.922778
              ]
            ]
          }
        },
        {
          "id": "abraham-canaan-segment-4",
          "from": "abraham-canaan-4",
          "to": "abraham-canaan-5",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Genesis-12-4–10",
            "bible-Genesis-13-3–18",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.241389,
                31.922778
              ],
              [
                35.10222,
                31.525087
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Genesis-12-4–10",
        "bible-Genesis-13-3–18",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "jacob-return",
      "eraIds": [
        "patriarchs"
      ],
      "title": "Jacob’s return: Genesis 31–35",
      "description": "Selected ordered stops in Genesis 31:18, Genesis 33:18, Genesis 35:6.",
      "stops": [
        {
          "id": "jacob-return-0",
          "order": 1,
          "label": "Haran",
          "placeId": "openbible-a6d9af3"
        },
        {
          "id": "jacob-return-1",
          "order": 2,
          "label": "Mahanaim and intervening stages",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "jacob-return-2",
          "order": 3,
          "label": "Shechem",
          "placeId": "openbible-adf74d4"
        },
        {
          "id": "jacob-return-3",
          "order": 4,
          "label": "Bethel 1",
          "placeId": "openbible-a64f355"
        }
      ],
      "segments": [
        {
          "id": "jacob-return-segment-0",
          "from": "jacob-return-0",
          "to": "jacob-return-1",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Genesis-31-18",
            "bible-Genesis-33-18",
            "bible-Genesis-35-6",
            "openbible"
          ]
        },
        {
          "id": "jacob-return-segment-1",
          "from": "jacob-return-1",
          "to": "jacob-return-2",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Genesis-31-18",
            "bible-Genesis-33-18",
            "bible-Genesis-35-6",
            "openbible"
          ]
        },
        {
          "id": "jacob-return-segment-2",
          "from": "jacob-return-2",
          "to": "jacob-return-3",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Genesis-31-18",
            "bible-Genesis-33-18",
            "bible-Genesis-35-6",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.281944,
                32.213611
              ],
              [
                35.241389,
                31.922778
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Genesis-31-18",
        "bible-Genesis-33-18",
        "bible-Genesis-35-6",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "wilderness-stations",
      "eraIds": [
        "exodus"
      ],
      "title": "Exodus: selected stations with gaps",
      "description": "Selected ordered stops in Exodus 12:37, Exodus 19:2, Numbers 20:1, Numbers 22:1.",
      "stops": [
        {
          "id": "wilderness-stations-0",
          "order": 1,
          "label": "Rameses",
          "placeId": "openbible-a079b21"
        },
        {
          "id": "wilderness-stations-1",
          "order": 2,
          "label": "Succoth 2",
          "placeId": "openbible-aa28709"
        },
        {
          "id": "wilderness-stations-2",
          "order": 3,
          "label": "Sea crossing and wilderness stages",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "wilderness-stations-3",
          "order": 4,
          "label": "Mount Sinai",
          "placeId": "openbible-abfba2a"
        },
        {
          "id": "wilderness-stations-4",
          "order": 5,
          "label": "Intervening wilderness stations",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "wilderness-stations-5",
          "order": 6,
          "label": "Kadesh-barnea",
          "placeId": "openbible-ac2cef0"
        },
        {
          "id": "wilderness-stations-6",
          "order": 7,
          "label": "Journey around Edom",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "wilderness-stations-7",
          "order": 8,
          "label": "Moab 2",
          "placeId": "openbible-aca767b"
        }
      ],
      "segments": [
        {
          "id": "wilderness-stations-segment-0",
          "from": "wilderness-stations-0",
          "to": "wilderness-stations-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Exodus-12-37",
            "bible-Exodus-19-2",
            "bible-Numbers-20-1",
            "bible-Numbers-22-1",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                31.834217,
                30.79937
              ],
              [
                32.099,
                30.5527
              ]
            ]
          }
        },
        {
          "id": "wilderness-stations-segment-1",
          "from": "wilderness-stations-1",
          "to": "wilderness-stations-2",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Exodus-12-37",
            "bible-Exodus-19-2",
            "bible-Numbers-20-1",
            "bible-Numbers-22-1",
            "openbible"
          ]
        },
        {
          "id": "wilderness-stations-segment-2",
          "from": "wilderness-stations-2",
          "to": "wilderness-stations-3",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Exodus-12-37",
            "bible-Exodus-19-2",
            "bible-Numbers-20-1",
            "bible-Numbers-22-1",
            "openbible"
          ]
        },
        {
          "id": "wilderness-stations-segment-3",
          "from": "wilderness-stations-3",
          "to": "wilderness-stations-4",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Exodus-12-37",
            "bible-Exodus-19-2",
            "bible-Numbers-20-1",
            "bible-Numbers-22-1",
            "openbible"
          ]
        },
        {
          "id": "wilderness-stations-segment-4",
          "from": "wilderness-stations-4",
          "to": "wilderness-stations-5",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Exodus-12-37",
            "bible-Exodus-19-2",
            "bible-Numbers-20-1",
            "bible-Numbers-22-1",
            "openbible"
          ]
        },
        {
          "id": "wilderness-stations-segment-5",
          "from": "wilderness-stations-5",
          "to": "wilderness-stations-6",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Exodus-12-37",
            "bible-Exodus-19-2",
            "bible-Numbers-20-1",
            "bible-Numbers-22-1",
            "openbible"
          ]
        },
        {
          "id": "wilderness-stations-segment-6",
          "from": "wilderness-stations-6",
          "to": "wilderness-stations-7",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Exodus-12-37",
            "bible-Exodus-19-2",
            "bible-Numbers-20-1",
            "bible-Numbers-22-1",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Exodus-12-37",
        "bible-Exodus-19-2",
        "bible-Numbers-20-1",
        "bible-Numbers-22-1",
        "openbible"
      ],
      "uncertainty": "Traditional southern-Sinai catalog candidate, not a settled identification. Unknown stages stay unmapped; no line bridges the sea crossing or the wilderness gaps.",
      "status": "reviewed"
    },
    {
      "id": "joshua-sequence",
      "eraIds": [
        "conquest"
      ],
      "title": "Joshua: selected narrative sequence",
      "description": "Selected ordered stops in Joshua 4:19, Joshua 6:1, Joshua 8:1, Joshua 24:1.",
      "stops": [
        {
          "id": "joshua-sequence-0",
          "order": 1,
          "label": "Gilgal 1",
          "placeId": "openbible-ab94aea"
        },
        {
          "id": "joshua-sequence-1",
          "order": 2,
          "label": "Jericho 1",
          "placeId": "openbible-a231f80"
        },
        {
          "id": "joshua-sequence-2",
          "order": 3,
          "label": "Ai 1",
          "placeId": "openbible-a7e13e1"
        },
        {
          "id": "joshua-sequence-3",
          "order": 4,
          "label": "Intervening campaigns",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "joshua-sequence-4",
          "order": 5,
          "label": "Shechem",
          "placeId": "openbible-adf74d4"
        }
      ],
      "segments": [
        {
          "id": "joshua-sequence-segment-0",
          "from": "joshua-sequence-0",
          "to": "joshua-sequence-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Joshua-4-19",
            "bible-Joshua-6-1",
            "bible-Joshua-8-1",
            "bible-Joshua-24-1",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.459969,
                31.881883
              ],
              [
                35.444564,
                31.871719
              ]
            ]
          }
        },
        {
          "id": "joshua-sequence-segment-1",
          "from": "joshua-sequence-1",
          "to": "joshua-sequence-2",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Joshua-4-19",
            "bible-Joshua-6-1",
            "bible-Joshua-8-1",
            "bible-Joshua-24-1",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.444564,
                31.871719
              ],
              [
                35.261111,
                31.916944
              ]
            ]
          }
        },
        {
          "id": "joshua-sequence-segment-2",
          "from": "joshua-sequence-2",
          "to": "joshua-sequence-3",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Joshua-4-19",
            "bible-Joshua-6-1",
            "bible-Joshua-8-1",
            "bible-Joshua-24-1",
            "openbible"
          ]
        },
        {
          "id": "joshua-sequence-segment-3",
          "from": "joshua-sequence-3",
          "to": "joshua-sequence-4",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Joshua-4-19",
            "bible-Joshua-6-1",
            "bible-Joshua-8-1",
            "bible-Joshua-24-1",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Joshua-4-19",
        "bible-Joshua-6-1",
        "bible-Joshua-8-1",
        "bible-Joshua-24-1",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "levite-journey",
      "eraIds": [
        "judges"
      ],
      "title": "Levite’s journey: Judges 19",
      "description": "Selected ordered stops in Judges 19:1–14.",
      "stops": [
        {
          "id": "levite-journey-0",
          "order": 1,
          "label": "Bethlehem 1",
          "placeId": "openbible-a112427"
        },
        {
          "id": "levite-journey-1",
          "order": 2,
          "label": "Jebus",
          "placeId": "openbible-a403c45"
        },
        {
          "id": "levite-journey-2",
          "order": 3,
          "label": "Gibeah 1",
          "placeId": "openbible-ac24f5f"
        }
      ],
      "segments": [
        {
          "id": "levite-journey-segment-0",
          "from": "levite-journey-0",
          "to": "levite-journey-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Judges-19-1–14",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.207639,
                31.704306
              ],
              [
                35.234167,
                31.776667
              ]
            ]
          }
        },
        {
          "id": "levite-journey-segment-1",
          "from": "levite-journey-1",
          "to": "levite-journey-2",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Judges-19-1–14",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.234167,
                31.776667
              ],
              [
                35.230718,
                31.823113
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Judges-19-1–14",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed",
      "snapshotIds": [
        "judges-levite"
      ]
    },
    {
      "id": "david-capitals",
      "eraIds": [
        "united-monarchy"
      ],
      "title": "David: Hebron to Jerusalem",
      "description": "Selected ordered stops in 2 Samuel 2:1, 2 Samuel 5:6–9.",
      "stops": [
        {
          "id": "david-capitals-0",
          "order": 1,
          "label": "Hebron",
          "placeId": "openbible-a85151a"
        },
        {
          "id": "david-capitals-1",
          "order": 2,
          "label": "Jerusalem",
          "placeId": "openbible-a15257a"
        }
      ],
      "segments": [
        {
          "id": "david-capitals-segment-0",
          "from": "david-capitals-0",
          "to": "david-capitals-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-2-Samuel-2-1",
            "bible-2-Samuel-5-6–9",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.10222,
                31.525087
              ],
              [
                35.234167,
                31.776667
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-2-Samuel-2-1",
        "bible-2-Samuel-5-6–9",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "samaria-deportation",
      "eraIds": [
        "divided-monarchy"
      ],
      "title": "Samaria deportation: unresolved destinations",
      "description": "Selected ordered stops in 2 Kings 17:6.",
      "stops": [
        {
          "id": "samaria-deportation-0",
          "order": 1,
          "label": "Samaria 1",
          "placeId": "openbible-a041bb3"
        },
        {
          "id": "samaria-deportation-1",
          "order": 2,
          "label": "Halah, Habor and cities of the Medes",
          "unresolved": "Location or intervening course is not established in this release."
        }
      ],
      "segments": [
        {
          "id": "samaria-deportation-segment-0",
          "from": "samaria-deportation-0",
          "to": "samaria-deportation-1",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-2-Kings-17-6",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-2-Kings-17-6",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "babylon-deportation",
      "eraIds": [
        "exile"
      ],
      "title": "Jerusalem to Babylon: named endpoints",
      "description": "Selected ordered stops in 2 Kings 25:8–21.",
      "stops": [
        {
          "id": "babylon-deportation-0",
          "order": 1,
          "label": "Jerusalem",
          "placeId": "openbible-a15257a"
        },
        {
          "id": "babylon-deportation-1",
          "order": 2,
          "label": "Deportation corridor",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "babylon-deportation-2",
          "order": 3,
          "label": "Babylon 1",
          "placeId": "openbible-a217d18"
        }
      ],
      "segments": [
        {
          "id": "babylon-deportation-segment-0",
          "from": "babylon-deportation-0",
          "to": "babylon-deportation-1",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-2-Kings-25-8–21",
            "openbible"
          ]
        },
        {
          "id": "babylon-deportation-segment-1",
          "from": "babylon-deportation-1",
          "to": "babylon-deportation-2",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-2-Kings-25-8–21",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-2-Kings-25-8–21",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "ezra-return",
      "eraIds": [
        "return-persian"
      ],
      "title": "Return described in Ezra 2",
      "description": "Selected ordered stops in Ezra 2:1.",
      "stops": [
        {
          "id": "ezra-return-0",
          "order": 1,
          "label": "Babylon 1",
          "placeId": "openbible-a217d18"
        },
        {
          "id": "ezra-return-1",
          "order": 2,
          "label": "Return corridor",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "ezra-return-2",
          "order": 3,
          "label": "Jerusalem",
          "placeId": "openbible-a15257a"
        }
      ],
      "segments": [
        {
          "id": "ezra-return-segment-0",
          "from": "ezra-return-0",
          "to": "ezra-return-1",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Ezra-2-1",
            "openbible"
          ]
        },
        {
          "id": "ezra-return-segment-1",
          "from": "ezra-return-1",
          "to": "ezra-return-2",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Ezra-2-1",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Ezra-2-1",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "matthew-infancy",
      "eraIds": [
        "herodian"
      ],
      "title": "Matthew 2: infancy narrative",
      "description": "Selected ordered stops in Matthew 2:13–23.",
      "stops": [
        {
          "id": "matthew-infancy-0",
          "order": 1,
          "label": "Bethlehem 1",
          "placeId": "openbible-a112427"
        },
        {
          "id": "matthew-infancy-1",
          "order": 2,
          "label": "Egypt",
          "placeId": "openbible-af301ca"
        },
        {
          "id": "matthew-infancy-2",
          "order": 3,
          "label": "Nazareth",
          "placeId": "openbible-af5884f"
        }
      ],
      "segments": [
        {
          "id": "matthew-infancy-segment-0",
          "from": "matthew-infancy-0",
          "to": "matthew-infancy-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Matthew-2-13–23",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.207639,
                31.704306
              ],
              [
                31.3075,
                30.129444
              ]
            ]
          }
        },
        {
          "id": "matthew-infancy-segment-1",
          "from": "matthew-infancy-1",
          "to": "matthew-infancy-2",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Matthew-2-13–23",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                31.3075,
                30.129444
              ],
              [
                35.29769,
                32.70214
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Matthew-2-13–23",
        "openbible"
      ],
      "uncertainty": "Egypt is a regional catalog point, not a known residence. Dashed links do not identify the family’s road or dwelling.",
      "status": "reviewed"
    },
    {
      "id": "john-2",
      "eraIds": [
        "jesus-ministry"
      ],
      "title": "John 2: Cana to Jerusalem",
      "description": "Selected ordered stops in John 2:1–13.",
      "stops": [
        {
          "id": "john-2-0",
          "order": 1,
          "label": "Cana",
          "placeId": "openbible-a031bda"
        },
        {
          "id": "john-2-1",
          "order": 2,
          "label": "Capernaum",
          "placeId": "openbible-af2161c"
        },
        {
          "id": "john-2-2",
          "order": 3,
          "label": "Jerusalem",
          "placeId": "openbible-a15257a"
        }
      ],
      "segments": [
        {
          "id": "john-2-segment-0",
          "from": "john-2-0",
          "to": "john-2-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-John-2-1–13",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.30269,
                32.8222
              ],
              [
                35.575,
                32.881111
              ]
            ]
          }
        },
        {
          "id": "john-2-segment-1",
          "from": "john-2-1",
          "to": "john-2-2",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-John-2-1–13",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.575,
                32.881111
              ],
              [
                35.234167,
                31.776667
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-John-2-1–13",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "john-4",
      "eraIds": [
        "jesus-ministry"
      ],
      "title": "John 4: through Samaria to Cana",
      "description": "Selected ordered stops in John 4:5, John 4:43–46.",
      "stops": [
        {
          "id": "john-4-0",
          "order": 1,
          "label": "Sychar",
          "placeId": "openbible-a27b472"
        },
        {
          "id": "john-4-1",
          "order": 2,
          "label": "Cana",
          "placeId": "openbible-a031bda"
        }
      ],
      "segments": [
        {
          "id": "john-4-segment-0",
          "from": "john-4-0",
          "to": "john-4-1",
          "mode": "land",
          "kind": "schematic",
          "evidenceIds": [
            "bible-John-4-5",
            "bible-John-4-43–46",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.28897,
                32.21776
              ],
              [
                35.30269,
                32.8222
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-John-4-5",
        "bible-John-4-43–46",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "paul-first",
      "eraIds": [
        "early-church"
      ],
      "title": "Paul’s first mission: Acts 13–14",
      "description": "Selected ordered stops in Acts 13:1–14, Acts 13:51, Acts 14:1–28.",
      "stops": [
        {
          "id": "paul-first-0",
          "order": 1,
          "label": "Antioch 1",
          "placeId": "openbible-ae41ab4"
        },
        {
          "id": "paul-first-1",
          "order": 2,
          "label": "Seleucia",
          "placeId": "openbible-a6d306d"
        },
        {
          "id": "paul-first-2",
          "order": 3,
          "label": "Salamis",
          "placeId": "openbible-afa863b"
        },
        {
          "id": "paul-first-3",
          "order": 4,
          "label": "Paphos",
          "placeId": "openbible-a314765"
        },
        {
          "id": "paul-first-4",
          "order": 5,
          "label": "Perga",
          "placeId": "openbible-aff04b8"
        },
        {
          "id": "paul-first-5",
          "order": 6,
          "label": "Antioch 2",
          "placeId": "openbible-a6c704a"
        },
        {
          "id": "paul-first-6",
          "order": 7,
          "label": "Iconium",
          "placeId": "openbible-ae425aa"
        },
        {
          "id": "paul-first-7",
          "order": 8,
          "label": "Lystra",
          "placeId": "openbible-af0719d"
        },
        {
          "id": "paul-first-8",
          "order": 9,
          "label": "Derbe",
          "placeId": "openbible-aa401a9"
        },
        {
          "id": "paul-first-9",
          "order": 10,
          "label": "Lystra",
          "placeId": "openbible-af0719d"
        },
        {
          "id": "paul-first-10",
          "order": 11,
          "label": "Iconium",
          "placeId": "openbible-ae425aa"
        },
        {
          "id": "paul-first-11",
          "order": 12,
          "label": "Antioch 2",
          "placeId": "openbible-a6c704a"
        },
        {
          "id": "paul-first-12",
          "order": 13,
          "label": "Perga",
          "placeId": "openbible-aff04b8"
        },
        {
          "id": "paul-first-13",
          "order": 14,
          "label": "Attalia",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "paul-first-14",
          "order": 15,
          "label": "Antioch 1",
          "placeId": "openbible-ae41ab4"
        }
      ],
      "segments": [
        {
          "id": "paul-first-segment-0",
          "from": "paul-first-0",
          "to": "paul-first-1",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                36.171743,
                36.226691
              ],
              [
                35.922,
                36.124
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-1",
          "from": "paul-first-1",
          "to": "paul-first-2",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.922,
                36.124
              ],
              [
                33.901944,
                35.184944
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-2",
          "from": "paul-first-2",
          "to": "paul-first-3",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                33.901944,
                35.184944
              ],
              [
                32.404167,
                34.755667
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-3",
          "from": "paul-first-3",
          "to": "paul-first-4",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                32.404167,
                34.755667
              ],
              [
                30.853686,
                36.960353
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-4",
          "from": "paul-first-4",
          "to": "paul-first-5",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                30.853686,
                36.960353
              ],
              [
                31.189167,
                38.306111
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-5",
          "from": "paul-first-5",
          "to": "paul-first-6",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                31.189167,
                38.306111
              ],
              [
                32.492331,
                37.872202
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-6",
          "from": "paul-first-6",
          "to": "paul-first-7",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                32.492331,
                37.872202
              ],
              [
                32.3384,
                37.6017
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-7",
          "from": "paul-first-7",
          "to": "paul-first-8",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                32.3384,
                37.6017
              ],
              [
                33.361453,
                37.348569
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-8",
          "from": "paul-first-8",
          "to": "paul-first-9",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                33.361453,
                37.348569
              ],
              [
                32.3384,
                37.6017
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-9",
          "from": "paul-first-9",
          "to": "paul-first-10",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                32.3384,
                37.6017
              ],
              [
                32.492331,
                37.872202
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-10",
          "from": "paul-first-10",
          "to": "paul-first-11",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                32.492331,
                37.872202
              ],
              [
                31.189167,
                38.306111
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-11",
          "from": "paul-first-11",
          "to": "paul-first-12",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                31.189167,
                38.306111
              ],
              [
                30.853686,
                36.960353
              ]
            ]
          }
        },
        {
          "id": "paul-first-segment-12",
          "from": "paul-first-12",
          "to": "paul-first-13",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ]
        },
        {
          "id": "paul-first-segment-13",
          "from": "paul-first-13",
          "to": "paul-first-14",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-13-1–14",
            "bible-Acts-13-51",
            "bible-Acts-14-1–28",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Acts-13-1–14",
        "bible-Acts-13-51",
        "bible-Acts-14-1–28",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "paul-second",
      "eraIds": [
        "early-church"
      ],
      "title": "Paul’s second mission: selected Aegean stops",
      "description": "Selected ordered stops in Acts 16:8–12, Acts 17:1–15, Acts 18:1–22.",
      "stops": [
        {
          "id": "paul-second-0",
          "order": 1,
          "label": "Troas",
          "placeId": "openbible-a91c509"
        },
        {
          "id": "paul-second-1",
          "order": 2,
          "label": "Samothrace and Neapolis",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "paul-second-2",
          "order": 3,
          "label": "Philippi",
          "placeId": "openbible-a49e1d0"
        },
        {
          "id": "paul-second-3",
          "order": 4,
          "label": "Thessalonica",
          "placeId": "openbible-afa9d8e"
        },
        {
          "id": "paul-second-4",
          "order": 5,
          "label": "Berea",
          "placeId": "openbible-a62fe31"
        },
        {
          "id": "paul-second-5",
          "order": 6,
          "label": "Athens",
          "placeId": "openbible-a1fe6e7"
        },
        {
          "id": "paul-second-6",
          "order": 7,
          "label": "Corinth",
          "placeId": "openbible-a6f437a"
        },
        {
          "id": "paul-second-7",
          "order": 8,
          "label": "Ephesus",
          "placeId": "openbible-a5feb15"
        },
        {
          "id": "paul-second-8",
          "order": 9,
          "label": "Caesarea",
          "placeId": "openbible-a58735e"
        },
        {
          "id": "paul-second-9",
          "order": 10,
          "label": "Antioch 1",
          "placeId": "openbible-ae41ab4"
        }
      ],
      "segments": [
        {
          "id": "paul-second-segment-0",
          "from": "paul-second-0",
          "to": "paul-second-1",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ]
        },
        {
          "id": "paul-second-segment-1",
          "from": "paul-second-1",
          "to": "paul-second-2",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ]
        },
        {
          "id": "paul-second-segment-2",
          "from": "paul-second-2",
          "to": "paul-second-3",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                24.284576,
                41.012072
              ],
              [
                22.945767,
                40.637771
              ]
            ]
          }
        },
        {
          "id": "paul-second-segment-3",
          "from": "paul-second-3",
          "to": "paul-second-4",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                22.945767,
                40.637771
              ],
              [
                22.2,
                40.518333
              ]
            ]
          }
        },
        {
          "id": "paul-second-segment-4",
          "from": "paul-second-4",
          "to": "paul-second-5",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                22.2,
                40.518333
              ],
              [
                23.726738,
                37.971851
              ]
            ]
          }
        },
        {
          "id": "paul-second-segment-5",
          "from": "paul-second-5",
          "to": "paul-second-6",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                23.726738,
                37.971851
              ],
              [
                22.878741,
                37.905785
              ]
            ]
          }
        },
        {
          "id": "paul-second-segment-6",
          "from": "paul-second-6",
          "to": "paul-second-7",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                22.878741,
                37.905785
              ],
              [
                27.3407,
                37.939125
              ]
            ]
          }
        },
        {
          "id": "paul-second-segment-7",
          "from": "paul-second-7",
          "to": "paul-second-8",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                27.3407,
                37.939125
              ],
              [
                34.891667,
                32.5
              ]
            ]
          }
        },
        {
          "id": "paul-second-segment-8",
          "from": "paul-second-8",
          "to": "paul-second-9",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-16-8–12",
            "bible-Acts-17-1–15",
            "bible-Acts-18-1–22",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                34.891667,
                32.5
              ],
              [
                36.171743,
                36.226691
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Acts-16-8–12",
        "bible-Acts-17-1–15",
        "bible-Acts-18-1–22",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "paul-third",
      "eraIds": [
        "early-church"
      ],
      "title": "Paul’s third mission: selected stops",
      "description": "Selected ordered stops in Acts 19:1, Acts 20:1–6, Acts 21:8–17.",
      "stops": [
        {
          "id": "paul-third-0",
          "order": 1,
          "label": "Ephesus",
          "placeId": "openbible-a5feb15"
        },
        {
          "id": "paul-third-1",
          "order": 2,
          "label": "Macedonia and Greece",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "paul-third-2",
          "order": 3,
          "label": "Philippi",
          "placeId": "openbible-a49e1d0"
        },
        {
          "id": "paul-third-3",
          "order": 4,
          "label": "Troas",
          "placeId": "openbible-a91c509"
        },
        {
          "id": "paul-third-4",
          "order": 5,
          "label": "Coastal stops and Miletus",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "paul-third-5",
          "order": 6,
          "label": "Caesarea",
          "placeId": "openbible-a58735e"
        },
        {
          "id": "paul-third-6",
          "order": 7,
          "label": "Jerusalem",
          "placeId": "openbible-a15257a"
        }
      ],
      "segments": [
        {
          "id": "paul-third-segment-0",
          "from": "paul-third-0",
          "to": "paul-third-1",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-19-1",
            "bible-Acts-20-1–6",
            "bible-Acts-21-8–17",
            "openbible"
          ]
        },
        {
          "id": "paul-third-segment-1",
          "from": "paul-third-1",
          "to": "paul-third-2",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-19-1",
            "bible-Acts-20-1–6",
            "bible-Acts-21-8–17",
            "openbible"
          ]
        },
        {
          "id": "paul-third-segment-2",
          "from": "paul-third-2",
          "to": "paul-third-3",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-19-1",
            "bible-Acts-20-1–6",
            "bible-Acts-21-8–17",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                24.284576,
                41.012072
              ],
              [
                26.158611,
                39.751944
              ]
            ]
          }
        },
        {
          "id": "paul-third-segment-3",
          "from": "paul-third-3",
          "to": "paul-third-4",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-19-1",
            "bible-Acts-20-1–6",
            "bible-Acts-21-8–17",
            "openbible"
          ]
        },
        {
          "id": "paul-third-segment-4",
          "from": "paul-third-4",
          "to": "paul-third-5",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-19-1",
            "bible-Acts-20-1–6",
            "bible-Acts-21-8–17",
            "openbible"
          ]
        },
        {
          "id": "paul-third-segment-5",
          "from": "paul-third-5",
          "to": "paul-third-6",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-19-1",
            "bible-Acts-20-1–6",
            "bible-Acts-21-8–17",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                34.891667,
                32.5
              ],
              [
                35.234167,
                31.776667
              ]
            ]
          }
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Acts-19-1",
        "bible-Acts-20-1–6",
        "bible-Acts-21-8–17",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "paul-rome",
      "eraIds": [
        "early-church"
      ],
      "title": "Paul’s voyage to Rome: Acts 27–28",
      "description": "Selected ordered stops in Acts 25:4, Acts 27:1–8, Acts 28:1–16.",
      "stops": [
        {
          "id": "paul-rome-0",
          "order": 1,
          "label": "Caesarea",
          "placeId": "openbible-a58735e"
        },
        {
          "id": "paul-rome-1",
          "order": 2,
          "label": "Sidon",
          "placeId": "openbible-a98e4d7"
        },
        {
          "id": "paul-rome-2",
          "order": 3,
          "label": "Myra",
          "placeId": "openbible-aa4b3e2"
        },
        {
          "id": "paul-rome-3",
          "order": 4,
          "label": "Crete and storm-driven voyage",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "paul-rome-4",
          "order": 5,
          "label": "Malta",
          "placeId": "openbible-a57835d"
        },
        {
          "id": "paul-rome-5",
          "order": 6,
          "label": "Syracuse, Rhegium and Puteoli",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "paul-rome-6",
          "order": 7,
          "label": "Rome",
          "placeId": "openbible-afc8e7a"
        }
      ],
      "segments": [
        {
          "id": "paul-rome-segment-0",
          "from": "paul-rome-0",
          "to": "paul-rome-1",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-25-4",
            "bible-Acts-27-1–8",
            "bible-Acts-28-1–16",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                34.891667,
                32.5
              ],
              [
                35.371944,
                33.560985
              ]
            ]
          }
        },
        {
          "id": "paul-rome-segment-1",
          "from": "paul-rome-1",
          "to": "paul-rome-2",
          "mode": "unknown",
          "kind": "schematic",
          "evidenceIds": [
            "bible-Acts-25-4",
            "bible-Acts-27-1–8",
            "bible-Acts-28-1–16",
            "openbible"
          ],
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [
                35.371944,
                33.560985
              ],
              [
                29.985278,
                36.259167
              ]
            ]
          }
        },
        {
          "id": "paul-rome-segment-2",
          "from": "paul-rome-2",
          "to": "paul-rome-3",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-25-4",
            "bible-Acts-27-1–8",
            "bible-Acts-28-1–16",
            "openbible"
          ]
        },
        {
          "id": "paul-rome-segment-3",
          "from": "paul-rome-3",
          "to": "paul-rome-4",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-25-4",
            "bible-Acts-27-1–8",
            "bible-Acts-28-1–16",
            "openbible"
          ]
        },
        {
          "id": "paul-rome-segment-4",
          "from": "paul-rome-4",
          "to": "paul-rome-5",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-25-4",
            "bible-Acts-27-1–8",
            "bible-Acts-28-1–16",
            "openbible"
          ]
        },
        {
          "id": "paul-rome-segment-5",
          "from": "paul-rome-5",
          "to": "paul-rome-6",
          "mode": "unknown",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Acts-25-4",
            "bible-Acts-27-1–8",
            "bible-Acts-28-1–16",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Acts-25-4",
        "bible-Acts-27-1–8",
        "bible-Acts-28-1–16",
        "openbible"
      ],
      "uncertainty": "Intermediate stops may be omitted. Straight links show narrative order only; coordinates inherit catalog identification uncertainty.",
      "status": "reviewed"
    },
    {
      "id": "danite-scouts",
      "eraIds": [
        "judges"
      ],
      "title": "Danite scouts: selected departure and destination",
      "description": "Selected ordered stops in Judges 18:2–7.",
      "stops": [
        {
          "id": "danite-scouts-0",
          "order": 1,
          "label": "Zorah",
          "placeId": "openbible-a08174b"
        },
        {
          "id": "danite-scouts-1",
          "order": 2,
          "label": "Hill country of Ephraim",
          "unresolved": "Location or intervening course is not established in this release."
        },
        {
          "id": "danite-scouts-2",
          "order": 3,
          "label": "Dan",
          "placeId": "openbible-a513646"
        }
      ],
      "segments": [
        {
          "id": "danite-scouts-segment-0",
          "from": "danite-scouts-0",
          "to": "danite-scouts-1",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Judges-18-2–7",
            "openbible"
          ]
        },
        {
          "id": "danite-scouts-segment-1",
          "from": "danite-scouts-1",
          "to": "danite-scouts-2",
          "mode": "land",
          "kind": "unmapped",
          "evidenceIds": [
            "bible-Judges-18-2–7",
            "openbible"
          ]
        }
      ],
      "interpretation": "Dashed schematic links; not a reconstructed road or sailing track.",
      "evidenceIds": [
        "bible-Judges-18-2–7",
        "openbible"
      ],
      "uncertainty": "The scouts came from Zorah and Eshtaol; only Zorah is used as a departure marker. Micah’s house and the intervening course remain unmapped.",
      "status": "reviewed",
      "snapshotIds": [
        "judges-study"
      ]
    }
  ],
  "evidence": [
    {
      "id": "openbible",
      "claim": "Candidate locations and distinct ancient identities, not historical lifetimes.",
      "title": "OpenBible.info Bible Geocoding Data",
      "url": "https://github.com/openbibleinfo/Bible-Geocoding-Data/tree/7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f",
      "locator": "data/ancient.jsonl; primary and alternative resolutions",
      "accessed": "2026-09-06",
      "license": "CC BY 4.0"
    },
    {
      "id": "josephus-hyrcanus",
      "claim": "Samaria and Jerusalem as centers in the account of John Hyrcanus.",
      "title": "Josephus, Antiquities of the Jews",
      "url": "https://www.gutenberg.org/files/2848/2848-h/2848-h.htm",
      "locator": "Book XIII, chapter 10, sections 1–3",
      "accessed": "2026-09-06"
    },
    {
      "id": "josephus-sebaste",
      "claim": "Herod renamed the city of Samaria Sebaste.",
      "title": "Josephus, Antiquities of the Jews",
      "url": "https://www.gutenberg.org/files/2848/2848-h/2848-h.htm",
      "locator": "Book XV, chapter 8, section 5",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-11-31",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2011:31&version=KJV",
      "locator": "Genesis 11:31",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-12-4",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2012:4&version=KJV",
      "locator": "Genesis 12:4",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-12-6",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2012:6&version=KJV",
      "locator": "Genesis 12:6",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-12-8",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2012:8&version=KJV",
      "locator": "Genesis 12:8",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-13-18",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2013:18&version=KJV",
      "locator": "Genesis 13:18",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-21-31",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2021:31&version=KJV",
      "locator": "Genesis 21:31",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-12-10",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2012:10&version=KJV",
      "locator": "Genesis 12:10",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Exodus-12-41",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Exodus%2012:41&version=KJV",
      "locator": "Exodus 12:41",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Exodus-12-37",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Exodus%2012:37&version=KJV",
      "locator": "Exodus 12:37",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Exodus-19-2",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Exodus%2019:2&version=KJV",
      "locator": "Exodus 19:2",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Numbers-20-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Numbers%2020:1&version=KJV",
      "locator": "Numbers 20:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Numbers-22-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Numbers%2022:1&version=KJV",
      "locator": "Numbers 22:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Joshua-4-19",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Joshua%204:19&version=KJV",
      "locator": "Joshua 4:19",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Joshua-6-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Joshua%206:1&version=KJV",
      "locator": "Joshua 6:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Joshua-8-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Joshua%208:1&version=KJV",
      "locator": "Joshua 8:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Joshua-24-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Joshua%2024:1&version=KJV",
      "locator": "Joshua 24:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Joshua-18-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Joshua%2018:1&version=KJV",
      "locator": "Joshua 18:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Joshua-8-9",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Joshua%208:9&version=KJV",
      "locator": "Joshua 8:9",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-18-31",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2018:31&version=KJV",
      "locator": "Judges 18:31",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-18-7",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2018:7&version=KJV",
      "locator": "Judges 18:7",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-19-10",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2019:10&version=KJV",
      "locator": "Judges 19:10",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-19-14",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2019:14&version=KJV",
      "locator": "Judges 19:14",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-19-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2019:1&version=KJV",
      "locator": "Judges 19:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Samuel-2-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Samuel%202:1&version=KJV",
      "locator": "2 Samuel 2:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Samuel-5-6",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Samuel%205:6&version=KJV",
      "locator": "2 Samuel 5:6",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-1-Samuel-16-4",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=1%20Samuel%2016:4&version=KJV",
      "locator": "1 Samuel 16:4",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Kings-17-6",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Kings%2017:6&version=KJV",
      "locator": "2 Kings 17:6",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Kings-18-2",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Kings%2018:2&version=KJV",
      "locator": "2 Kings 18:2",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Kings-17-28",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Kings%2017:28&version=KJV",
      "locator": "2 Kings 17:28",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-1-Kings-12-29",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=1%20Kings%2012:29&version=KJV",
      "locator": "1 Kings 12:29",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Kings-25-8",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Kings%2025:8&version=KJV",
      "locator": "2 Kings 25:8",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Kings-25-21",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Kings%2025:21&version=KJV",
      "locator": "2 Kings 25:21",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Jeremiah-43-7",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Jeremiah%2043:7&version=KJV",
      "locator": "Jeremiah 43:7",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Ezra-2-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Ezra%202:1&version=KJV",
      "locator": "Ezra 2:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Nehemiah-1-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Nehemiah%201:1&version=KJV",
      "locator": "Nehemiah 1:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Matthew-2-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Matthew%202:1&version=KJV",
      "locator": "Matthew 2:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Matthew-2-14",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Matthew%202:14&version=KJV",
      "locator": "Matthew 2:14",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Matthew-2-23",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Matthew%202:23&version=KJV",
      "locator": "Matthew 2:23",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-John-2-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=John%202:1&version=KJV",
      "locator": "John 2:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-John-2-12",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=John%202:12&version=KJV",
      "locator": "John 2:12",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-John-2-13",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=John%202:13&version=KJV",
      "locator": "John 2:13",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-John-4-5",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=John%204:5&version=KJV",
      "locator": "John 4:5",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Luke-4-16",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Luke%204:16&version=KJV",
      "locator": "Luke 4:16",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-John-4-4",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=John%204:4&version=KJV",
      "locator": "John 4:4",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-1-12",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%201:12&version=KJV",
      "locator": "Acts 1:12",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:1&version=KJV",
      "locator": "Acts 13:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-4",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:4&version=KJV",
      "locator": "Acts 13:4",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-5",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:5&version=KJV",
      "locator": "Acts 13:5",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-6",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:6&version=KJV",
      "locator": "Acts 13:6",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-13",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:13&version=KJV",
      "locator": "Acts 13:13",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-14",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:14&version=KJV",
      "locator": "Acts 13:14",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-51",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:51&version=KJV",
      "locator": "Acts 13:51",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-14-6",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2014:6&version=KJV",
      "locator": "Acts 14:6",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-14-20",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2014:20&version=KJV",
      "locator": "Acts 14:20",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-16-8",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2016:8&version=KJV",
      "locator": "Acts 16:8",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-16-12",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2016:12&version=KJV",
      "locator": "Acts 16:12",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-17-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2017:1&version=KJV",
      "locator": "Acts 17:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-17-10",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2017:10&version=KJV",
      "locator": "Acts 17:10",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-17-15",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2017:15&version=KJV",
      "locator": "Acts 17:15",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-18-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2018:1&version=KJV",
      "locator": "Acts 18:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-19-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2019:1&version=KJV",
      "locator": "Acts 19:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-25-4",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2025:4&version=KJV",
      "locator": "Acts 25:4",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-27-3",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2027:3&version=KJV",
      "locator": "Acts 27:3",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-27-5",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2027:5&version=KJV",
      "locator": "Acts 27:5",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-28-1",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2028:1&version=KJV",
      "locator": "Acts 28:1",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-28-16",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2028:16&version=KJV",
      "locator": "Acts 28:16",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-12-4–10",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2012:4-10&version=KJV",
      "locator": "Genesis 12:4–10",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-13-3–18",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2013:3-18&version=KJV",
      "locator": "Genesis 13:3–18",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-31-18",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2031:18&version=KJV",
      "locator": "Genesis 31:18",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-33-18",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2033:18&version=KJV",
      "locator": "Genesis 33:18",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Genesis-35-6",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Genesis%2035:6&version=KJV",
      "locator": "Genesis 35:6",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-19-1–14",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2019:1-14&version=KJV",
      "locator": "Judges 19:1–14",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Samuel-5-6–9",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Samuel%205:6-9&version=KJV",
      "locator": "2 Samuel 5:6–9",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-2-Kings-25-8–21",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=2%20Kings%2025:8-21&version=KJV",
      "locator": "2 Kings 25:8–21",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Matthew-2-13–23",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Matthew%202:13-23&version=KJV",
      "locator": "Matthew 2:13–23",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-John-2-1–13",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=John%202:1-13&version=KJV",
      "locator": "John 2:1–13",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-John-4-43–46",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=John%204:43-46&version=KJV",
      "locator": "John 4:43–46",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-13-1–14",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2013:1-14&version=KJV",
      "locator": "Acts 13:1–14",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-14-1–28",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2014:1-28&version=KJV",
      "locator": "Acts 14:1–28",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-16-8–12",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2016:8-12&version=KJV",
      "locator": "Acts 16:8–12",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-17-1–15",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2017:1-15&version=KJV",
      "locator": "Acts 17:1–15",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-18-1–22",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2018:1-22&version=KJV",
      "locator": "Acts 18:1–22",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-20-1–6",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2020:1-6&version=KJV",
      "locator": "Acts 20:1–6",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-21-8–17",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2021:8-17&version=KJV",
      "locator": "Acts 21:8–17",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-27-1–8",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2027:1-8&version=KJV",
      "locator": "Acts 27:1–8",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Acts-28-1–16",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Acts%2028:1-16&version=KJV",
      "locator": "Acts 28:1–16",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-18-29",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2018:29&version=KJV",
      "locator": "Judges 18:29",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-18-2",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2018:2&version=KJV",
      "locator": "Judges 18:2",
      "accessed": "2026-09-06"
    },
    {
      "id": "bible-Judges-18-2–7",
      "claim": "Narrative mention or sequence; does not establish a modern coordinate.",
      "title": "King James Version",
      "url": "https://www.biblegateway.com/passage/?search=Judges%2018:2-7&version=KJV",
      "locator": "Judges 18:2–7",
      "accessed": "2026-09-06"
    }
  ],
  "manifest": {
    "schemaVersion": 1,
    "dataVersion": "2026-09-06.1",
    "catalogRevision": "7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f",
    "reviewedEraIds": [
      "patriarchs",
      "exodus",
      "conquest",
      "judges",
      "united-monarchy",
      "divided-monarchy",
      "exile",
      "return-persian",
      "hellenistic",
      "herodian",
      "jesus-ministry",
      "early-church"
    ],
    "expectedPlaceIds": [
      "openbible-a031bda",
      "openbible-a033b84",
      "openbible-a041bb3",
      "openbible-a075d61",
      "openbible-a079b21",
      "openbible-a08174b",
      "openbible-a112427",
      "openbible-a15257a",
      "openbible-a1fe6e7",
      "openbible-a217d18",
      "openbible-a231f80",
      "openbible-a27b472",
      "openbible-a314765",
      "openbible-a355b6e",
      "openbible-a403c45",
      "openbible-a49e1d0",
      "openbible-a513646",
      "openbible-a57835d",
      "openbible-a58735e",
      "openbible-a5feb15",
      "openbible-a62fe31",
      "openbible-a64f355",
      "openbible-a6c704a",
      "openbible-a6cf75c",
      "openbible-a6d306d",
      "openbible-a6d9af3",
      "openbible-a6f437a",
      "openbible-a7e13e1",
      "openbible-a85151a",
      "openbible-a91c509",
      "openbible-a98e4d7",
      "openbible-aa28709",
      "openbible-aa401a9",
      "openbible-aa4680a",
      "openbible-aa4b3e2",
      "openbible-ab94aea",
      "openbible-abfba2a",
      "openbible-ac24f5f",
      "openbible-ac2cef0",
      "openbible-aca767b",
      "openbible-adf74d4",
      "openbible-ae41ab4",
      "openbible-ae425aa",
      "openbible-af0719d",
      "openbible-af2161c",
      "openbible-af301ca",
      "openbible-af5884f",
      "openbible-afa863b",
      "openbible-afa9d8e",
      "openbible-afc8e7a",
      "openbible-aff04b8"
    ],
    "expectedAreaIds": [
      "patriarchs-sites",
      "exodus-sites",
      "conquest-sites",
      "judges-sites",
      "united-monarchy-sites",
      "divided-monarchy-sites",
      "exile-sites",
      "return-persian-sites",
      "hellenistic-sites",
      "herodian-sites",
      "jesus-ministry-sites",
      "early-church-sites",
      "judges-levite-sites"
    ],
    "expectedRouteIds": [
      "abraham-canaan",
      "jacob-return",
      "wilderness-stations",
      "joshua-sequence",
      "levite-journey",
      "david-capitals",
      "samaria-deportation",
      "babylon-deportation",
      "ezra-return",
      "matthew-infancy",
      "john-2",
      "john-4",
      "paul-first",
      "paul-second",
      "paul-third",
      "paul-rome",
      "danite-scouts"
    ],
    "unresolved": [
      "No dated political frontiers are shipped; every era uses sourced narrative-site context.",
      "Absolute chronology of early narrative periods is intentionally unspecified.",
      "Sinai, Ai and other catalog candidates retain disputed-location evidence.",
      "Unmapped route stages are named in their itineraries; there are no inferred tracks.",
      "This is an editorial source check, not independent specialist historical review."
    ],
    "sourceIds": [
      "openbible",
      "josephus-hyrcanus",
      "josephus-sebaste",
      "bible-Genesis-11-31",
      "bible-Genesis-12-4",
      "bible-Genesis-12-6",
      "bible-Genesis-12-8",
      "bible-Genesis-13-18",
      "bible-Genesis-21-31",
      "bible-Genesis-12-10",
      "bible-Exodus-12-41",
      "bible-Exodus-12-37",
      "bible-Exodus-19-2",
      "bible-Numbers-20-1",
      "bible-Numbers-22-1",
      "bible-Joshua-4-19",
      "bible-Joshua-6-1",
      "bible-Joshua-8-1",
      "bible-Joshua-24-1",
      "bible-Joshua-18-1",
      "bible-Joshua-8-9",
      "bible-Judges-18-31",
      "bible-Judges-18-7",
      "bible-Judges-19-10",
      "bible-Judges-19-14",
      "bible-Judges-19-1",
      "bible-2-Samuel-2-1",
      "bible-2-Samuel-5-6",
      "bible-1-Samuel-16-4",
      "bible-2-Kings-17-6",
      "bible-2-Kings-18-2",
      "bible-2-Kings-17-28",
      "bible-1-Kings-12-29",
      "bible-2-Kings-25-8",
      "bible-2-Kings-25-21",
      "bible-Jeremiah-43-7",
      "bible-Ezra-2-1",
      "bible-Nehemiah-1-1",
      "bible-Matthew-2-1",
      "bible-Matthew-2-14",
      "bible-Matthew-2-23",
      "bible-John-2-1",
      "bible-John-2-12",
      "bible-John-2-13",
      "bible-John-4-5",
      "bible-Luke-4-16",
      "bible-John-4-4",
      "bible-Acts-1-12",
      "bible-Acts-13-1",
      "bible-Acts-13-4",
      "bible-Acts-13-5",
      "bible-Acts-13-6",
      "bible-Acts-13-13",
      "bible-Acts-13-14",
      "bible-Acts-13-51",
      "bible-Acts-14-6",
      "bible-Acts-14-20",
      "bible-Acts-16-8",
      "bible-Acts-16-12",
      "bible-Acts-17-1",
      "bible-Acts-17-10",
      "bible-Acts-17-15",
      "bible-Acts-18-1",
      "bible-Acts-19-1",
      "bible-Acts-25-4",
      "bible-Acts-27-3",
      "bible-Acts-27-5",
      "bible-Acts-28-1",
      "bible-Acts-28-16",
      "bible-Genesis-12-4–10",
      "bible-Genesis-13-3–18",
      "bible-Genesis-31-18",
      "bible-Genesis-33-18",
      "bible-Genesis-35-6",
      "bible-Judges-19-1–14",
      "bible-2-Samuel-5-6–9",
      "bible-2-Kings-25-8–21",
      "bible-Matthew-2-13–23",
      "bible-John-2-1–13",
      "bible-John-4-43–46",
      "bible-Acts-13-1–14",
      "bible-Acts-14-1–28",
      "bible-Acts-16-8–12",
      "bible-Acts-17-1–15",
      "bible-Acts-18-1–22",
      "bible-Acts-20-1–6",
      "bible-Acts-21-8–17",
      "bible-Acts-27-1–8",
      "bible-Acts-28-1–16",
      "bible-Judges-18-29",
      "bible-Judges-18-2",
      "bible-Judges-18-2–7"
    ]
  }
};
