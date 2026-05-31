import { world } from "@minecraft/server";
import { helpmain } from "../help/help.js";
import { xz_main } from "../plugin/nether.js";
import { RewardchatSend } from "../module/rewards/system.js";
import { onChat } from "../module/protection/core/events.js";
import { runEventHandlersWithCancel } from "./utils.js";

const handlers = [helpmain, xz_main, RewardchatSend, onChat];

world.beforeEvents.chatSend.subscribe((ev) => {
  const sender = ev.sender;
  if (!sender || !sender.isValid) return;
  runEventHandlersWithCancel("ChatSend", handlers, ev);
});
