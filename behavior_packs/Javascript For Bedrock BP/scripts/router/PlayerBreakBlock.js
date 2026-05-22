import { world } from "@minecraft/server";
import { TreeCapitatorBreakBlock } from "../module/treeCapitator/index.js";
import { VeinMiner } from "../module/veinMiner/index.js";
import { handleAutoReplant } from "../plugin/AutoReplant.js";
import { onBlockEdit } from "../module/protection/index.js";

const beforeHandlers = [onBlockEdit, VeinMiner];
const afterHandlers = [handleAutoReplant, TreeCapitatorBreakBlock];

const runHandlers = (handlers, ev) => {
  try {
    const player = ev.player;
    const block = ev.block;
    if (!player || !player.isValid || !block) return;

    const len = handlers.length;
    for (let i = 0; i < len; i++) {
      handlers[i](ev);
      if (ev.cancel) return;
    }
  } catch (e) {
    console.warn("[ PlayerBreakBlock ] player_break_block", e.message);
  }
};

world.beforeEvents.playerBreakBlock.subscribe((ev) => runHandlers(beforeHandlers, ev));
world.afterEvents.playerBreakBlock.subscribe((ev) => runHandlers(afterHandlers, ev));
