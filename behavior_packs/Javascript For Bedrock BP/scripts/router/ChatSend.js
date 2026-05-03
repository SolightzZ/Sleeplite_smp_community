import { world } from "@minecraft/server";
import { chatMessage } from "../module/simpleSit/index";
import { helpmain } from "../help/help";
import { xz_main } from "../plugin/nether";
import { RewardchatSend } from "../module/rewards/system";
import { ZoneProtection_OnChat } from "../module/protection/system";

const CHAT_HANDLERS = [
  helpmain,
  xz_main,
  RewardchatSend,
  ZoneProtection_OnChat,
];

world.beforeEvents.chatSend.subscribe((event) => {
  try {
    const sender = event.sender;
    if (!sender) return;

    for (let i = 0; i < CHAT_HANDLERS.length; i++) {
      const handler = CHAT_HANDLERS[i];
      if (!handler) continue;

      handler(event);

      if (event.cancel === true) break;
    }
  } catch (error) {
    console.warn("onChatMessage", error.message);
  }
});
