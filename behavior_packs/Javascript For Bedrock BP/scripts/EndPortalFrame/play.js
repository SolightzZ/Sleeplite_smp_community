import { door, key, boss, team, zone } from "./rules.js";
import { ask, forget } from "./brain.js";
import { count, fix } from "./tools.js";
import { see, eat, hit, say } from "./hand.js";

export function touch(event) {
  const player = event.player;
  const block = event.block;
  const item = event.itemStack;

  if (!player || !block) return;
  if (block.typeId !== door) return;
  if (item?.typeId !== key) return;
  if (player.hasTag(boss)) return;

  const friends = count(block);
  if (friends < team) {
    event.cancel = true;
    say(player, `§cNeed more friends! (${friends}/${team}) within ${zone} blocks.`);
    return;
  }

  const quest = ask(block);
  const want = quest.id;
  const pain = quest.hp;
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
}

console.warn("[Simple Portal] loaded successfully!");
