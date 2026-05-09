import { ask, forget } from "./brain.js";
import { eat, hit, say, see } from "./hand.js";
import { boss, door, key, team, zone } from "./rules.js";
import { count, fix } from "./tools.js";

export const touch = (ev) => {
  try {
    const player = ev.player;
    const block = ev.block;
    const item = ev.itemStack;

    if (!player || !player.isValid) return;
    if (!block || !block.isValid) return;
    if (block.typeId !== door) return;
    if (!item || item.typeId !== key) return;
    if (player.hasTag(boss)) return;

    const friends = count(block);
    if (friends < team) {
      ev.cancel = true;
      say(player, `§cNeed more friends! (${friends}/${team}) within ${zone} blocks.`);
      return;
    }

    const gift = ask(block);
    const name = fix(gift.id);

    if (!see(player, gift.id)) {
      ev.cancel = true;
      say(player, `§d[Portal] §7Need: ${name}`);
      return;
    }

    eat(player, gift.id);
    hit(player, gift.hp);
    forget(block);

    player.sendMessage(`§d[Portal Success] §7Used: ${name} | Damage: ${gift.hp}`);
  } catch (e) {
    console.error("[EndPortalFrame]", e.message);
  }
};
