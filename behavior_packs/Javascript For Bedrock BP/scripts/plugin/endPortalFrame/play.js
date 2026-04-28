import { door, key, boss, team, zone } from "./rules.js";
import { ask, forget } from "./brain.js";
import { count, fix } from "./tools.js";
import { see, eat, hit, say } from "./hand.js";

export const touch = (event) => {
  const { player, block, itemStack: item } = event;

  if (!player || !block) return;
  if (block.typeId !== door) return;
  if (item?.typeId !== key) return;
  if (player.hasTag(boss)) return;

  const friends = count(block);
  if (friends < team) {
    event.cancel = true;
    say(
      player,
      `§cNeed more friends! (${friends}/${team}) within ${zone} blocks.`,
    );
    return;
  }

  const { id: want, hp: pain } = ask(block);
  const name = fix(want);

  if (!see(player, want)) {
    event.cancel = true;
    say(player, `§d[Portal] §7Need: ${name}`);
    return;
  }

  eat(player, want);
  hit(player, pain);
  forget(block);

  player.sendMessage(`§d[Portal Success] §7Used: ${name} | Damage: ${pain}`);
};
