import { world } from "@minecraft/server";
import { onHammerBreak } from "../module/hammer/index";
import { handleBlockEditPreEvent } from "../module/protection/system";
import { handleAutoReplant } from "../plugin/AutoReplant";
import { VeinMiner } from "../module/veinMiner/index";
import { TreeCapitatorBreakBlock } from "../module/treeCapitator/index";

const handlerAfterEvents = [
  onHammerBreak,
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
