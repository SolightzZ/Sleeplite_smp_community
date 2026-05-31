import { world } from "@minecraft/server";
import { TreeCapitatorBreakBlock } from "../module/treeCapitator/core/events.js";
import { VeinMiner } from "../module/veinMiner/core/events.js";
import { handleAutoReplant } from "../plugin/AutoReplant.js";
import { onBlockEdit } from "../module/protection/core/events.js";
import { runEventHandlersWithCancel } from "./utils.js";

const beforeHandlers = [onBlockEdit, VeinMiner];
const afterHandlers = [handleAutoReplant, TreeCapitatorBreakBlock];

world.beforeEvents.playerBreakBlock.subscribe((ev) => {
  const player = ev.player;
  const block = ev.block;
  if (!player || !player.isValid || !block) return;
  runEventHandlersWithCancel("PlayerBreakBlock", beforeHandlers, ev);
});

world.afterEvents.playerBreakBlock.subscribe((ev) => {
  const player = ev.player;
  const block = ev.block;
  if (!player || !player.isValid || !block) return;
  runEventHandlersWithCancel("PlayerBreakBlock", afterHandlers, ev);
});
