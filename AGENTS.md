# AGENTS.md — Sleeplite SMP (behavior_packs)

## What This Is

Minecraft Bedrock 1.26.30 SMP addon project. **22 behavior packs** under `behavior_packs/`.
Primary code: `Javascript For Bedrock BP` — the main script pack with ~189 JS files.
No build step, no tests, no bundler. Edit JSON/JS → reload in Minecraft.

## Tech Stack

- **Runtime**: Minecraft Bedrock 1.26.30
- **API**: `@minecraft/server` 2.10.0-beta, `@minecraft/server-ui` 2.2.0-beta, `@minecraft/server-admin` 1.0.0-beta
- **Language**: JavaScript (ES modules), mcfunction, JSON
- **No toolchain**: No npm, no bundler, no linter configured in this repo

## Key Packs (behavior_packs/)

| Pack | Has Scripts | Purpose |
|------|-------------|---------|
| `Javascript For Bedrock BP` | Yes (main) | Core server scripts: admin, QoL, economy, visual |
| `Economy-Addon` | Yes | Chest shop system, transactions, admin panel |
| `ArmoredElytras (Addon)` | Yes | Elytra + chestplate (Colytra) |
| `CampfireCreations BP` | Yes | Campfire cooking with effects |
| `CustomFrames (Addon)` | Yes | Custom paintings UI |
| `FoodExpanded (Addon)` | Yes | 200+ food items, effects |
| `VisualHD (Addon)` | Yes | Damage overlay, effect notifications |
| `Structure Mayhem` | No | 239 structures (largest structure pack) |
| `Structures Reds More BP` | No | 24 structures + mcfunctions |

## JavaScript Architecture (Javascript For Bedrock BP)

Entry: `scripts/main.js` → imports router + events

```
scripts/
├── main.js              # Entry point, imports all routers
├── events/              # Event system (registry, logger, interval)
│   └── registry.js      # Player registry with sweep/cleanup
├── router/              # Event routers (one file per event type)
│   ├── Startup.js, PlayerJoin.js, PlayerLeave.js
│   ├── ChatSend.js, ItemUse.js, PlayerBreakBlock.js
│   ├── EntityHurt.js, EntityDie.js, Explosion.js, etc.
├── shared/              # Shared utilities
│   ├── cache.js         # API cache (tick-based, avoids redundant calls)
│   ├── player.js        # Player validation helpers
│   ├── database.js      # Dynamic property storage
│   └── durability.js, enchant.js, block.js, etc.
├── module/              # Feature modules (self-contained features)
│   ├── AFKCinematic/    # AFK detection + cinematic camera
│   ├── flashlight/      # Flashlight system
│   ├── zoom/            # Zoom feature
│   ├── welcome/         # Welcome UI + day counter
│   ├── emotes/          # 170+ emotes
│   ├── biometype/       # Biome detection
│   ├── veinMiner/       # Vein mining
│   └── customCommands/  # Custom command system
└── plugin/              # Plugin scripts (simpler features)
    ├── AnvilRepair.js, AutoReplant.js, SpongeAbsorption.js
    ├── OpenDoor.js, nether.js, setting.js, title.js
    └── help/            # Help command system
```

## Conventions

- **Manifest format_version**: Always `2`. Modules use `data` + `script` types.
- **Script entry**: Always `scripts/main.js` per pack manifest.
- **UUIDs**: Each pack has unique `header.uuid` + `module.uuid`. Never reuse.
- **Version format**: `[major, minor, patch]` array in manifests.
- **JS style**: ES modules (`import/export`), no semicolons optional but consistent per file, arrow functions for short callbacks.
- **Cache pattern**: `cache.js` wraps API calls with per-tick caching. Use `cache.getPlayers()` not `world.getPlayers()`.
- **Player validation**: Always use `pcheck(player)` from `shared/player.js` before operating on players.
- **No comments in JSON**: Bedrock JSON is strict. No trailing commas, no comments.
- **mcfunction files**: In `functions/` dir, use `/` command prefix (e.g., `/summon`).

## Common Gotchas

- **Directory names have spaces**: e.g., `Javascript For Bedrock BP`, `ArmoredElytras (Addon)`. Quote paths in scripts.
- **Duplicated shared code**: `Economy-Addon` has its own copy of `shared/cache.js`, `shared/player.js`, etc. Changes to shared utilities may need updating in both packs.
- **No TypeScript**: All JS is plain ES modules. Types come from `@minecraft/server` npm package but aren't checked at build time.
- **world_behavior_packs.json**: Lists all active packs by UUID. Adding a new pack requires adding its UUID here.
- **Structures use mcstructure files**: Binary format, not editable as text. Feature rules JSON controls placement.
- **Loot tables**: In `loot_tables/chests/` for structure packs. JSON format, not Bedrock commands.

## Validation

Use `bedrock-json-validate` skill to check JSON files for schema errors before committing.
Command: run the skill against a pack directory to validate all JSON.

## File Counts (approximate)

- Total behavior pack files: ~3,452
- JSON files: ~2,799
- JS files: ~238
- mcfunction files: ~10 (in Structures Reds More BP)
