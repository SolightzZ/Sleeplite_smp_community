# AGENTS.md

This is a **Minecraft Bedrock world save** (Sleeplite SMP 2026) that is also the live add-on development workspace. Git root is the world folder itself.

## Project structure

- `behavior_packs/` — 21 raw (unarchived) behavior packs
- `resource_packs/` — 20 raw resource packs
- `skills/` — AI knowledge base (gitignored via `.gitignore`), see below
- `db/` — LevelDB world data (gitignored)

No `package.json`, no bundler, no TypeScript, no linter, no test framework, no CI.

## Script API

All JS is **vanilla ESModules** run directly by Minecraft's script engine — no build step.

**Main scripting pack:** `behavior_packs/Javascript For Bedrock BP/`
- Entry: `scripts/main.js` — imports 15+ router modules
- Modules: router/, plugin/, module/ (zoom, veinMiner, treeCapitator, simpleSit, rewards, report, inventorySorter, emotes, dropheads)
- Dependencies: `@minecraft/server` 2.8.0-beta, `@minecraft/server-ui` 2.1.0-beta, `@minecraft/server-admin` 1.0.0-beta
- `min_engine_version`: 1.26.10

Other scripting packs (7 total): ArmoredElytras, CampfireCreations, CustomFrames, FoodExpanded, PlayerHeads, SilentHill, VisualHD.

Each scripting pack's `manifest.json` declares its own entry script and `@minecraft/server` dependency version.

## Development workflow

- **No build/test commands exist.** Edit a JS or JSON file, then `/reload all` in-game (or re-join the world).
- Enable **Content Log** (Settings → Creator) to debug JSON/script errors. Check `mc.log` for errors.
- All packs are raw directories — no `.mcpack`/`.mcaddon` archiving needed.
- Python validators in `skills/`: `validate_json.py` (duplicate keys, syntax), `inspect_animations.py` (animation structure). Not in PATH; run via `python skills/validate_json.py`.

## Knowledge base (skills/)

The `skills/` directory is an Obsidian-style vault with wiki links (`[[...]]`). It is gitignored.

- `SKILL.md` — Top-level skill entry; paths to `bedrock-wiki`, `bedrock-script-api`, `jsonui` skills
- `skills/bedrock-wiki/SKILL.md` — Bedrock Wiki reference (JSON definitions, packs, commands, world gen)
- `skills/bedrock-script-api/SKILL.md` — Script API reference (ESModules rules, `.d.ts` types, templates)
  - Code rules: ESModules, multiplayer-safe patterns, no deprecated APIs, no `runCommand` spam, no per-player intervals
  - Has 801KB `@minecraft/server` `.d.ts` and vanilla-data runtime JS at `skills/bedrock-script-api/references/`
- `skills/jsonui/SKILL.md` — JSON UI property reference

## Key conventions

- All manifests use `format_version: 2`
- Namespace custom identifiers (`my_pack:custom_block`)
- Unique UUIDs per pack (header + each module)
- `/reload all` reloads all packs in a development world
- Never reuse UUIDs across packs
- `min_engine_version` should match target Minecraft version (currently 1.26.x)

## .gitignore

Ignores: `db/`, `level.dat*`, `levelname.txt`, `world_icon.jpeg`, `mc.log`, `.agents`, `SKILL.md`, `README.md`, `skills/`, `error.md`. These are development metadata, not world data.
