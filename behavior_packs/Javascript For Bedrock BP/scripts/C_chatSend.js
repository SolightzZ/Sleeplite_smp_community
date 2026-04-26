import { help_main } from "./Others/help";
import { xz_main } from "./plugins/nether";
import { RewardchatSend } from "./Reward/system";
import { ZoneProtection_OnChat } from "./Protection/system";

const CHAT_HANDLERS = [
  help_main,
  xz_main,
  RewardchatSend,
  ZoneProtection_OnChat,
];

export function onChatMessage(event) {
  const sender = event.sender;
  if (!sender) return;

  CHAT_HANDLERS.forEach((handler) => handler(event));
}
console.warn("[world beforeEvents chatSend] loaded successfully");
