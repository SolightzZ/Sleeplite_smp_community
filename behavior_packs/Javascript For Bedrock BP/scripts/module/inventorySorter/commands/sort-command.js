import {
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
  system,
} from "@minecraft/server";
import { sortBlockContainer, sortPlayerInventory } from "../core/sorter.js";

// ─── Enum values (matches SORTING_MODES keys in config.js) ────────────────
const SORT_MODE_ENUM = /** @type {string[]} */ ([
  "type",
  "low",
  "max",
  "rarity",
  "stack",
  "tool",
  "name",
  "durability",
  "chess",
  "line",
  "column",
]);

// ─── Command handlers ─────────────────────────────────────────────────────

/**
 * /addon:r <mode> — sort the player's main inventory.
 * @param {import("@minecraft/server").CustomCommandOrigin} origin
 * @param {string} mode
 * @returns {import("@minecraft/server").CustomCommandResult}
 */
const sortInventoryCommand = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player?.isValid()) return { status: CustomCommandStatus.Failure };

  system.run(() => {
    if (!player.isValid()) return;
    const res = sortPlayerInventory(player, mode);
    if (res.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
};

/**
 * /addon:c <mode> — sort the container the player is looking at.
 * @param {import("@minecraft/server").CustomCommandOrigin} origin
 * @param {string} mode
 * @returns {import("@minecraft/server").CustomCommandResult}
 */
const sortContainerCommand = (origin, mode) => {
  const player = origin.sourceEntity;
  if (!player?.isValid()) return { status: CustomCommandStatus.Failure };

  system.run(() => {
    if (!player.isValid()) return;
    const res = sortBlockContainer(player, mode);
    if (res.msg) player.sendMessage(res.msg);
  });

  return { status: CustomCommandStatus.Success };
};

// ─── Registration ─────────────────────────────────────────────────────────

/**
 * Register /addon:r and /addon:c with the Custom Command API.
 * Call this once from the worldInitialize event.
 * @param {import("@minecraft/server").WorldInitializeAfterEvent} init
 */
export function registerCustomCommandIventory(init) {
  init.customCommandRegistry.registerEnum("addon:SortingMode", SORT_MODE_ENUM);

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:r",
      description: "Sort player inventory — จัดเรียงไอเทมของผู้เล่น",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      mandatoryParameters: [
        {
          name: "mode",
          type: CustomCommandParamType.Enum,
          enumName: "addon:SortingMode",
        },
      ],
    },
    sortInventoryCommand,
  );

  init.customCommandRegistry.registerCommand(
    {
      name: "addon:c",
      description: "Sort container inventory — จัดเรียงไอเทมในกล่อง",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
      mandatoryParameters: [
        {
          name: "mode",
          type: CustomCommandParamType.Enum,
          enumName: "addon:SortingMode",
        },
      ],
    },
    sortContainerCommand,
  );
}
