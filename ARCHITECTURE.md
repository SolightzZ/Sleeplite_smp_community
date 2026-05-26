# ARCHITECTURE.md (JS only)

## Overview

8 independent scripting packs, each with its own `@minecraft/server` version and entry script. No cross-pack dependencies. All JS is vanilla ESModules — no TypeScript, no bundler, no build step.

## Pack breakdown

| Pack | Entry | Dep ver | Files |
|------|-------|---------|-------|
| **Javascript For Bedrock BP** | `scripts/main.js` | 2.8.0-beta | 169 |
| **ArmoredElytras** | `scripts/index.js` | 2.2.0 | 5 |
| **SilentHill** | `scripts/main.js` | 2.6.0 | 5 |
| **VisualHD** | `scripts/xVisuals.js` | 1.19.0 | 1 |
| **CustomFrames** | `scripts/CustomFrames.js` | 1.12.0 | 1 |
| **FoodExpanded** | `scripts/Foods.js` | 1.17.0 | 1 |
| **CampfireCreations** | `scripts/main.js` | 2.6.0 | 1 |
| **PlayerHeads** | `scripts/playerHeads.js` | 2.1.0 | 1 |

## The main pack: Javascript For Bedrock BP

### Wiring pattern

All registration happens via **import side-effects** — `main.js` is an import list only (no logic):

```
scripts/main.js
  → imports 15 router/ files
  → each router/ file subscribes events and imports plugin/module files
```

No explicit `start()` or `init()` function is ever called from outside.

### Event routing (`router/`)

16 router files, each subscribes one `world.afterEvents.*` / `world.beforeEvents.*` / `system.beforeEvents.*`. Common handler pattern:

```js
const handlers = [fn1, fn2, ...];
world.afterEvents.someEvent.subscribe((ev) => {
  try {
    if (!guardCondition) return;
    for (const handler of handlers) {
      handler(ev);
      if (ev.cancel) break;
    }
  } catch (e) {
    console.warn("[ Router ] event_name", e.message);
  }
});
```

Standard guard: `if (!player || !player.isValid()) return` in nearly every handler.

Routers using **both** before + after: `PlayerInteractWithBlock.js`, `PlayerBreakBlock.js`.

### Tick orchestrator (`router/System.RunInterval.js`)

The main pack's single `system.runInterval` — other packs (VisualHD, ArmoredElytras) have their own. Uses a task queue with rate-limited tasks:

```js
const tasks = [
  { fn: FlashlightRunInterval, rate: 2, next: 0 },
  { fn: handleIdlePoller, rate: 20, next: 0 },
];
system.runInterval(() => {
  tick++;
  for (const t of tasks) {
    if (tick < t.next) continue;
    t.next = tick + t.rate;
    t.fn();
  }
}, 1);
```

### Module pattern (`module/`)

Each feature is a subdirectory under `module/` with a consistent layout:

```
module/ModuleName/
  index.js        — re-exports used by routers
  config.js       — tuning constants
  constants.js    — game constants
  core/           — implementation
  utils/          — helpers
  commands/       — custom command registrations
```

Modules list (20 total): zoom, veinMiner, treeCapitator, simpleSit, rewards, report, inventorySorter, emotes, dropheads, fullBright, nameteg, protection, AFKCinematic, flashlight, graveStones, biometype, endPortalFrame, magNet, jobs, customCommands.

### Plugin layer (`plugin/`)

8 single-responsibility files wired directly to router events (not using the module pattern):
Welcome, title, SpongeAbsorption, setting, OpenDoor, nether, AutoReplant, AnvilRepair.

### Persistence

- **Dynamic properties per player**: zoom, rewards, report, protection, magNet, AFKCinematic
- **World dynamic properties**: protection (claim database), jobs (job data)
- **Scoreboards**: dropheads (`Deaths`, `DeathsPlus`), nameteg (rank tags)

## Smaller packs — key patterns

| Pattern | Packs |
|---------|-------|
| `beforeEvents.startup` + `itemComponentRegistry.registerCustomComponent` | CampfireCreations, FoodExpanded, SilentHill, ArmoredElytras |
| `beforeEvents.worldInitialize` + `blockComponentRegistry.registerCustomComponent` | CustomFrames, PlayerHeads |
| `system.runInterval` every tick | VisualHD (blur detection), ArmoredElytras (elytra update) |
| Obfuscated code | ArmoredElytras only (`system.js`, `utils.js`) — string array shuffling + var renaming |

## Cross-cutting concerns

- **No cross-pack communication.** Each pack is fully independent.
- **`@minecraft/server-admin`**: used only by the main pack's `customCommands` module (`/addon:server` for server transfer).
- **`@minecraft/server-ui`**: used by main pack (reports, rewards, settings, emote menu, rank admin), CustomFrames (frame UI), SilentHill (item UI).
- **Obfuscation**: only ArmoredElytras is obfuscated; all other packs are readable.
