import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { ask, forget } from "./brain.js";
import { eat, hit, say, see, sound } from "./hand.js";
import { boss, door, key, shop, team, zone } from "./rules.js";
import { count, fix } from "./tools.js";

function showiconstest(player, title, message, icon) {
  const form = new ActionFormData();
  form.title(title);
  form.body(message);

  if (icon) {
    form.button(message, icon);
  } else {
    form.button(message);
  }

  form.button("Close");
  form.label("                 @Sleeplite SMP");

  system.run(() => {
    form
      .show(player)
      .then(() => {})
      .catch((e) => console.error("[ EndPortalFrame ] showiconstest: " + e));
  });
}

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
    if (block.permutation.getState("end_portal_eye_bit")) return;

    const friends = count(block);
    if (friends < team) {
      ev.cancel = true;
      say(
        player,
        `§cNeed more friends! (${friends}/${team}) within ${zone} blocks.`,
      );
      return;
    }

    const gift = ask(block);
    const name = fix(gift.id);

    if (!see(player, gift.id)) {
      ev.cancel = true;
      const itemData = shop.find((i) => i.id === gift.id);
      sound(player, "random.click");
      showiconstest(player, "Portal Frame", `Need: ${name}`, itemData?.icon);
      return;
    }

    eat(player, gift.id);
    hit(player, gift.hp);
    forget(block);
    sound(player, "block.end_portal_frame.fill");

    player.sendMessage(
      `§d[Portal Success] §7Used: ${name} | Damage: ${gift.hp}`,
    );
  } catch (e) {
    console.error("[EndPortalFrame]  touch: ", e.message);
  }
};
