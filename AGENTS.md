# AGENTS.md

Minecraft Bedrock world save (Sleeplite SMP 2026) + live add-on workspace. Git root is the world folder.

## Before editing — read these

Each is concise and answers a specific need:

| File | What it covers |
|------|----------------|
| `CODEX.md` | Workspace rules, git safety, coding conventions, pack structure |
| `ARCHITECTURE.md` | JS wiring, 8 scripting packs, import-side-effect pattern, event routing |
| `WORKFLOW.md` | Dev loop, how to add features, multiplayer rules, `/reload all` |
| `SCHEMA.md` | Dynamic properties, commands, custom components, data shapes |
| `CONTEXT.md` | Complete file tree of every `.js` file in the workspace |

## Facts an agent is likely to miss

- **No build/test/lint/CI.** Edit `.js` or `.json`, then `/reload all` in-game (or rejoin world). Check Content Log or `mc.log` for errors.
- **`node --check <file>`** catches JS syntax errors. **`python skills/validate_json.py`** validates JSON.
- **All JS registers via import side-effects.** `main.js` is an import-only file — no `start()`/`init()` called from outside. Every router/plugin/module subscribes itself on import.
- **Main pack has a single `system.runInterval`** (`router/System.RunInterval.js`) with a rate-limited task queue. Other packs (VisualHD, ArmoredElytras) have their own `runInterval`.
- **Router handler pattern** (16 files): each subscribes one event, forwards to an array of handlers inside `try-catch` + `console.warn`. Standard guard: `if (!player || !player.isValid()) return;`.
- **Modules** (20 subdirs under `module/`) use a consistent layout: `{index,config,constants,core/,utils/,commands/}`. **Plugins** (8 single-file features under `plugin/`) wire directly to router events.
- **ArmoredElytras is the only obfuscated pack** (string shuffling + var renaming in `system.js`, `utils.js`). All other packs are plain readable JS.
- **Performance target: 20–30 players.** High-risk patterns: per-player intervals, every-tick `runCommand`, broad `dimension.getEntities()`, `world.getAllPlayers()` in hot loops, unbounded dynamic-property JSON.

## 8 scripting packs at a glance

| Pack | Entry | `@minecraft/server` |
|------|-------|-------------------|
| Javascript For Bedrock BP | `scripts/main.js` | 2.8.0-beta |
| ArmoredElytras | `scripts/index.js` | (implicit, manifest: 2.2.0) |
| SilentHill | `scripts/main.js` | (implicit, manifest: 2.6.0) |
| VisualHD | `scripts/xVisuals.js` | (implicit, manifest: 1.19.0) |
| CustomFrames | `scripts/CustomFrames.js` | (implicit, manifest: 1.12.0) |
| FoodExpanded | `scripts/Foods.js` | (implicit, manifest: 1.17.0) |
| CampfireCreations | `scripts/main.js` | (implicit, manifest: 2.6.0) |
| PlayerHeads | `scripts/playerHeads.js` | (implicit, manifest: 2.1.0) |

No pack depends on another — all are fully independent.

## Git

- No forceful or destructive commands.
- Do not touch `db/`, `level.dat*`, `levelname.txt`, `world_icon.jpeg`, `mc.log` (all gitignored).
- Keep commits scoped to the pack or file being changed.

## OpenCode config

`./.opencode/package.json` declares a single dependency: `@opencode-ai/plugin` 1.15.11. The `.opencode/` directory also has an active memory store at `memorys/`.
