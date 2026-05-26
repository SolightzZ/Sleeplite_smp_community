# SCHEMA.md (JS only)

## World Dynamic Properties (Global)

| Key | Shape | Module |
|-----|-------|--------|
| `ZONE_DATA` | `Array<[owner, [startX, startY, startZ, endX, endY, endZ, ...friends]]>` | protection |
| `server_reports_data` | `{ [playerName]: [{ t, b, d, r }] }` | report |
| `jobs_data_jobs` | `[{ id, owner, ownerName, items: [{ id, amount, diamond }], status, takenBy }]` | jobs |
| `jobs_data_jobId` | `number` | jobs |
| `jobs_data_riderMap` | `{ [playerId]: jobId }` | jobs |
| `jobs_data_timers` | `[{ riderId, startTick }]` | jobs |
| `jobs_data_pending` | `{ [jobId]: { ownerName, items: [{ id, amount }] } }` | jobs |
| `jobs_data_notify` | `{ [ownerId]: [jobId] }` | jobs |

## Player Dynamic Properties

| Key | Shape | Module |
|-----|-------|--------|
| `reward:one1` | `{ last: string\|null, count: number }` | rewards |
| `zoom` | `{ playSound: boolean, hideHud: boolean }` | zoom |
| `lowHealth0` / `1` | `boolean` | VisualHD |
| `lowHealth0Msg` / `1Msg` | `boolean` | VisualHD |
| `falseLowHealth0` / `1` | `boolean` | VisualHD |

## Player Tags

| Pattern | Module | Purpose |
|---------|--------|---------|
| `bright` | fullBright | Full bright ON |
| `boss` | title | Boss announced |
| `rank:<name>` | nameteg | Owned rank |
| `active:<name>` | nameteg | Active rank |
| `hud.<element>` | setting | HUD toggle |
| `admin` | Many | Admin permission |

## Ore Maps (veinMiner)

`data/ores.js` exports three maps keyed by block ID:

**`PICKAXE_BREAKS`**: `{ [pickaxeItemId]: Set<oreBlockId> }`
- wood → coal variants + nether gold/quartz
- stone → + iron, copper, lapis
- iron → + redstone, gold, diamond, emerald
- diamond/netherite → all ores including deepslate variants

**`ORE_DROP`**: `{ [oreBlockId]: droppedItemId }`
- Maps vanilla + deepslate ores to raw drops / gems / nuggets

**`ORE_XP`**: `{ [oreBlockId]: number[] }`
- Array of possible XP orb amounts per ore type

## Tree Map (treeCapitator)

`data/trees.js` exports **`LOG_TO_LEAF`**: `Map<logId, leafId>`
- All 10 vanilla log types → matching leaves
- Crimson/warped stems → nether/warped wart blocks

## Job Schema (jobs)

```js
{
  id: number,
  owner: string,          // player ID
  ownerName: string,
  items: [{ id: string, amount: number, diamond: number }],
  status: "open" | "taken" | "done",
  takenBy: string | null  // rider player ID
}
```

## Armor Stats (help)

`help_ armorData.js` exports **`armorData`**: `{ [itemId]: { armor, toughness, slot, maxReduction } }`
- All leather/gold/chain/iron/diamond/netherite helmet/chestplate/leggings/boots + turtle shell

## Rarity Tiers (inventorySorter)

`data/rarity.js` exports **`RarityTiers`**: `{ [itemId]: 0|1|2|3 }` and **`ItemCategories`**: `{ [category]: sortOrder }`

## Sort Modes (inventorySorter)

```js
{ type, asc, desc, rarity, stack, tool, name, durability, enchant, material, chess, line, column }
// Each: { value: string, description: string }
```

## Colytra Data (ArmoredElytras)

Stored as item dynamic property `"rme:elytra_data"`:
```js
{
  id: string,
  maxDurability: number,
  armorData: { armor, toughness, knockback_resistance },
  enchantments: [{ type, level }],
  type: "vanilla" | "custom" | "placeholder" | "broken"
}
```

## Protection Zone (in-memory / cached)

```js
{
  owner: string,
  start: { x, y, z },
  end:   { x, y, z },
  friends: string[]
}
```

## Report Entry

```js
{ t: string, b: string, d: string, r: string }
// title, body, date/time, reply
```

## AFK Cinematic Shot Definition

```js
{
  id: string,
  yawOffset?: number,
  distance: number, height: number,
  slide: number, bob: number, duration: number,
  targetUp: number,
  endDistance?: number, startHeight?: number,
  endHeight?: number, arc?: number,
  targetForward?: number, targetRight?: number,
  followVelocity?: boolean
}
```

## Emote Schema

```js
// Group:
{ id, type: "GROUP", name, title, icon, items: [{ name, anim, icon }] }
// Button:
{ id, type: "BUTTON", name, title: null, icon, cmd }
```

## Custom Frame Texture/Sizes (CustomFrames)

```js
// TEXTURE_OPTIONS: [{ name, index, icon }] — 13 entries
// SIZES: [{ name: "1x1"|"1x2"|"2x1"|"2x2", w, h }]
```

## Chat Commands

| Trigger | Module |
|---------|--------|
| `!help` | help |
| `!d` | help |
| `!xz [<x> <z>]` | nether |

## Slash Commands (all `/addon:*`)

| Command | Cheats | Module |
|---------|--------|--------|
| `/addon:help` | false | help |
| `/addon:zoom` | false | zoom |
| `/addon:afk` | false | AFKCinematic |
| `/addon:server` | any | customCommands |
| `/addon:rw` | (via chat) | rewards |
| `/addon:sit` | (via chat) | simpleSit |
| `/r` | (via chat) | inventorySorter (player) |
| `/c` | (via chat) | inventorySorter (container) |

## Scoreboard Objectives

| Objective | Display Slot | Module |
|-----------|-------------|--------|
| `Deaths` | Sidebar | dropheads, setting |
| `DeathsPlus` | BelowName | dropheads, setting |

## Custom Components (Item & Block)

**Item components:** CampfireCreations (5), FoodExpanded (5), SilentHill (5), ArmoredElytras (1)
**Block components:** CustomFrames (`custom:frame_interact`), PlayerHeads (`bluefirefroggy:rotation_comp`)
**Shared item component pattern:** `system.beforeEvents.startup` → `itemComponentRegistry.registerCustomComponent`
**Shared block component pattern:** `world.beforeEvents.worldInitialize` → `blockComponentRegistry.registerCustomComponent`

## Item Use Handler Map (router/ItemUse.js)

```js
// 11 items routed to their handler modules:
minecraft:compass     → setting
addon:protection      → protection
addon:trade           → rewards
addon:emote           → emotes
minecraft:paper       → report
minecraft:command_block → nameteg
addon:magnet_         → magNet
addon:fullbright_     → fullBright
addon:job             → jobs
minecraft:sponge      → plugin/SpongeAbsorption
gao:flashlight        → flashlight (module)
```
