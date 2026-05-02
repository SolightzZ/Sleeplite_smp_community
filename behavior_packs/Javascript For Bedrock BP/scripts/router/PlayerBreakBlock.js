import { world } from "@minecraft/server";
import { onHammerBreak } from "../module/hammer/index";
import { handleBlockEditPreEvent } from "../module/protection/system";
import { handleAutoReplant } from "../plugin/AutoReplant";
import { VeinMiner } from "../module/veinMiner/index";

const handlerAfterEvents = [
  onHammerBreak,
  handleBlockEditPreEvent,
  handleAutoReplant,
];

const handlerBeforeEvents = [VeinMiner];

function beforeEventsBreak(event) {
  if (!event.player || !event.block) return;
  for (let i = 0; i < handlerBeforeEvents.length; i++) {
    handlerBeforeEvents[i](event);
    if (event.cancel) return;
  }
}

function afterEventsBreak(event) {
  if (!event.player || !event.block) return;
  for (let i = 0; i < handlerAfterEvents.length; i++) {
    handlerAfterEvents[i](event);
    if (event.cancel) return;
  }
}

world.beforeEvents.playerBreakBlock.subscribe(beforeEventsBreak);
world.afterEvents.playerBreakBlock.subscribe(afterEventsBreak);
