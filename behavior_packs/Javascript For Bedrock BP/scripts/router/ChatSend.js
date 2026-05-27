import { world } from "@minecraft/server";
import { helpmain } from "../help/help.js";
import { xz_main } from "../plugin/nether.js";
import { RewardchatSend } from "../module/rewards/system.js";
import { onChat } from "../module/protection/index.js";

const handlers = [helpmain, xz_main, RewardchatSend, onChat];

world.beforeEvents.chatSend.subscribe((ev) => {
  try {
    const sender = ev.sender;
    if (!sender || !sender.isValid) return;

    const len = handlers.length;
    for (let i = 0; i < len; i++) {
      const fn = handlers[i];
      if (!fn) continue;
      fn(ev);
      if (ev.cancel) break;
    }
  } catch (e) {
    console.warn("[ ChatSend ] chat_send", String(e));
  }
});
