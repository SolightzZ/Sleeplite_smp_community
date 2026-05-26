# CONTEXT.md — scripts/ folders (.js files only)

## `Javascript For Bedrock BP/scripts/` (72 files)

```
main.js                          — entry: imports 15 routers
index.js                         — ASCII art banner

router/
  Startup.js                     — system.beforeEvents.startup
  System.RunInterval.js           — system.runInterval(fn, 1) tick orchestrator
  PlayerJoin.js                  — afterEvents.playerSpawn (uses spawn for join)
  PlayerLeave.js                 — afterEvents.playerLeave
  PlayerSpawn.js                 — afterEvents.playerSpawn
  PlayerDimensionChange.js       — afterEvents.playerDimensionChange
  ChatSend.js                    — beforeEvents.chatSend
  ItemUse.js                     — afterEvents.itemUse
  PlayerInteractWithBlock.js     — before + after
  PlayerInteractWithEntity.js    — beforeEvents
  PlayerPlaceBlock.js            — beforeEvents
  PlayerBreakBlock.js            — before + after
  EntitySpawn.js                 — afterEvents.entitySpawn
  EntityDie.js                   — afterEvents.entityDie
  EntityHurt.js                  — beforeEvents.entityHurt
  Explosion.js                   — beforeEvents.explosion

plugin/
  Welcome.js                     — welcome on first spawn
  title.js                       — boss spawn cinematic (dragon/wither)
  SpongeAbsorption.js            — sponge water absorption
  setting.js                     — HUD/scoreboard toggle menu
  OpenDoor.js                    — sync double-door state
  nether.js                      — !xz nether coordinate calculator
  AutoReplant.js                 — auto-replant mature crops
  AnvilRepair.js                 — iron ingot + anvil repair

help/
  help.js                        — !help, !d commands
  help_function.js               — damage reduction calculator
  help_Durability.js             — durability/armor lore updater
  help_ armorData.js             — armor stats dictionary

module/
  zoom/
    index.js, Config.js, Command.js, Effect.js, Storage.js
  veinMiner/
    index.js, config.js, constants.js
    data/ores.js
    core/scanner.js, queue.js, processor.js, lifecycle.js
    utils/block.js, durability.js, enchant.js, player.js
  treeCapitator/
    index.js, config.js, constants.js
    data/trees.js
    core/detector.js, state.js, processor.js, lifecycle.js
    utils/block.js, drops.js, durability.js, inventory.js
  simpleSit/
    index.js, config.js, constants.js
    data/breathable.js
    core/sit-handler.js, seat-manager.js, seat-checker.js, cleanup.js
    commands/sit-command.js
    utils/validation.js, location.js, block.js, rotation.js
  rewards/
    system.js, logic.js, functions.js, database.js, constants.js
  report/
    index.js, config.js
    data/patch-notes.js
    core/database.js
    ui/report-menu.js, admin-panel.js, patch-note-menu.js, main-menu.js
    utils/ui.js, permission.js, date.js
  inventorySorter/
    index.js, config.js
    data/rarity.js
    core/sorter.js
    commands/sort-command.js
    patterns/index.js
    utils/mode.js, item.js, formatter.js, container.js
  emotes/
    system.js, functions.js, database.js
  dropheads/
    util.js, score.js, event.js, drop.js, data.js
  fullBright/
    events.js, state.js, ui.js
  nameteg/
    index.js, events.js
    constants/index.js
    core/tagManager.js, nametag.js
    ui/forms.js
    utils/player.js
  protection/
    index.js, config.js
    core/protection.js, events.js, database.js
    ui/menu.js
    utils/validation.js
  AFKCinematic/
    index.js, config.js
    core/state.js, stateManager.js, scheduler.js, poller.js, block.js, afk.js
    commands/afk-command.js
    utils/math.js
  flashlight/
    index.js, config.js
    core/engine.js, light-manager.js, queue.js, state.js
  graveStones/
    index.js, config.js
    core/spawner.js, interact.js, container.js
    utils/location.js
  biometype/
    system.js, functions.js, database.js
  endPortalFrame/
    brain.js, hand.js, play.js, rules.js, tools.js
  magNet/
    index.js, config.js
    core/toggle.js, state.js, puller.js, loop.js
    ui/menu.js
  jobs/
    Job.js, CreateJob.js, EditJob.js, ViewJob.js, Menu.js, CompleteJob.js
  customCommands/
    Register.js, Source.js, Transfer.js
```

## `ArmoredElytras (Addon)/scripts/` (5 files)

```
index.js                     — entry: imports ./elytra/system
elytra/
  system.js                  — CustomElytraManager class (obfuscated)
  armor.js                   — calculateArmorDamage()
  utils.js                   — currentElytra, getColytraData, etc. (obfuscated)
  consts.js                  — ARMOR_ENCHANT_LORE Map, ELYTRA_ENCHANTS Set
```

## `CampfireCreations (Addon)/scripts/` (1 file)

```
main.js                      — registers 5 custom item components
```

## `CustomFrames (Addon)/scripts/` (1 file)

```
CustomFrames.js              — registers custom:frame_interact block component
```

## `FoodExpanded (Addon)/scripts/` (1 file)

```
Foods.js                     — registers 5 custom item components (food effects)
```

## `PlayerHeads (Addon)/scripts/` (1 file)

```
playerHeads.js               — registers bluefirefroggy:rotation_comp block component
```

## `SilentHill (Addon)/scripts/` (5 files)

```
main.js                      — entry: imports item_trigger + durability_manager
durability_manager.js        — DurabilityManager class, custom item durability
item_trigger.js              — registers 5 custom item components
utils/
  helper.js                  — randomFunction, decrementStack, getOppositeDirection
  math.js                    — areVectorsEqual, clamp, directionToVector3, lerp
```

## `VisualHD (Addon)/scripts/` (1 file)

```
xVisuals.js                  — low-health blur, damage visuals, effect HUD messages
```

## Total: 184 .js files across 8 scripting packs
