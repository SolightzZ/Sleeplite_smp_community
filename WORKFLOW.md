# WORKFLOW.md (JS only)

## The dev loop

```
edit .js file → /reload all (in-game) → check Content Log or mc.log → repeat
```

No build step, no bundler, no test command. Minecraft's script engine loads `.js` files directly as ESModules.

## Debugging

- Enable **Content Log** (Settings → Creator → Content Log) to see script errors in-game
- Console output goes to `mc.log` in the world root folder (gitignored)
- All handler code should use try-catch with `console.warn` — this is the established pattern
- Content Log GUI shows script errors live. If a pack fails to load, the Content Log will show the syntax/import error

## How to add a new feature

### New plugin (simple, single-responsibility)

1. Create `plugin/MyFeature.js` exporting handler function(s)
2. Wire it in the appropriate `router/` file by importing it and adding to the handlers array
3. If it needs a new event, create a new `router/MyEvent.js` following the established handler pattern

### New module (complex, multi-file)

1. Create `module/MyFeature/` with the standard layout:
   - `index.js` — re-exports functions used by routers
   - `config.js` — tuning constants
   - `core/` — implementation files
   - `utils/` — helpers (optional)
   - `commands/` — command registrations (optional)
2. Wire exports into the appropriate `router/` file(s)

### New event subscription

Add a new file in `router/` following the standard handler pattern:

```js
import { world, system } from "@minecraft/server";

const handlers = [];
world.afterEvents.someEvent.subscribe((ev) => {
  try {
    if (!guardCondition) return;
    for (const handler of handlers) {
      handler(ev);
    }
  } catch (e) {
    console.warn("[ Router ] event_name", e.message);
  }
});

export function register(handler) { handlers.push(handler); }
```

Then import it in `main.js`.

## Import side-effect pattern

All packs use **import-by-side-effect** registration. `main.js` files are dependency graphs, not logic:

```js
// main.js — imports only, no code
import "./router/Startup.js";   // Startup.js side-effect: subscribes system.beforeEvents.startup
import "./router/PlayerJoin.js";
// ...
```

Each router/plugin/module file registers itself immediately on import. There is no `start()` or `init()` function called externally.

## Adding a new custom item/block component

Use the `registerCustomComponent` API:

```js
import { system, ItemComponentRegistry } from "@minecraft/server";

system.beforeEvents.startup.subscribe((ev) => {
  ev.itemComponentRegistry.registerCustomComponent("my:component", {
    onConsume({ source }) { /* ... */ },
  });
});
```

For block components, use `world.beforeEvents.worldInitialize` + `blockComponentRegistry.registerCustomComponent`.

## Multiplayer rules

- No per-player intervals — use the centralized tick orchestrator with rate-limited tasks
- No `runCommand` spam — prefer Script API methods (`player.sendMessage`, `dimension.runCommand` sparingly)
- Guard every handler with `if (!player || !player.isValid()) return;`
- Use dynamic properties per player for state, not global Maps that leak

## When you change code

1. Edit the `.js` file directly — no build step needed
2. Run `/reload all` in-game (or have players re-join the world)
3. Check Content Log for errors immediately after reload
4. If the pack fails to load entirely, check `mc.log` for the root cause
