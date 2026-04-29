import { help_main } from "./Others/help";
import { xz_main } from "./plugins/nether";
import { RewardchatSend } from "./Reward/system";
import { ZoneProtection_OnChat } from "./Protection/system";
import { chatMessage } from "../plugin/Take_A_Seat";

const CHAT_HANDLERS = [
  help_main,
  xz_main,
  RewardchatSend,
  ZoneProtection_OnChat,
  chatMessage,
];

export function onChatMessage(event) {
  const sender = event.sender;
  if (!sender) return;

  for (let i = 0; i < CHAT_HANDLERS.length; i++) {
    const handler = CHAT_HANDLERS[i];
    if (!handler) continue;

    handler(event);

    if (event.cancel === true) break;
  }
}
world.beforeEvents.chatSend.subscribe(onChatMessage);
