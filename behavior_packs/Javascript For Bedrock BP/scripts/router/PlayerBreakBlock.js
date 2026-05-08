import { world } from "@minecraft/server";

import { TreeCapitatorBreakBlock } from "../module/treeCapitator/index";
import { VeinMiner } from "../module/veinMiner/index";
import { handleAutoReplant } from "../plugin/AutoReplant";
import { handleBlockEditPreEvent } from "../module/protection/core/events";

const handlerAfterEvents = [
  handleBlockEditPreEvent,
  handleAutoReplant,
  TreeCapitatorBreakBlock,
];

const handlerBeforeEvents = [VeinMiner];

function beforeEventsBreak(event) {
  try {
    if (!event.player || !event.block) return;
    const length = handlerBeforeEvents.length;
    for (let i = 0; i < length; i++) {
      const handler = handlerBeforeEvents[i];
      handler(event);
      if (event.cancel) return;
    }
  } catch (error) {
    console.warn("beforeEventsBreak", error.message);
  }
}

function afterEventsBreak(event) {
  try {
    if (!event.player || !event.block) return;
    const length = handlerAfterEvents.length;
    for (let i = 0; i < length; i++) {
      const handler = handlerAfterEvents[i];
      handler(event);
      if (event.cancel) return;
    }
  } catch (error) {
    console.warn("afterEventsBreak", error.message);
  }
}

world.beforeEvents.playerBreakBlock.subscribe(beforeEventsBreak);
world.afterEvents.playerBreakBlock.subscribe(afterEventsBreak);
