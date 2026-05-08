import { system, world } from "@minecraft/server";
import { check, dig, limit, shine } from "./act.js";

const max = 3;
const wait = 150;
const gang = new Set();
const list = new Set(
  Array.from({ length: 16 }, (_, i) => `minecraft:light_block_${i}`),
);

function clean() {
  const all = new Map(world.getAllPlayers().map((p) => [p.id, p]));

  for (const id of gang) {
    const boy = all.get(id);
    if (!boy || boy.getItemCooldown("light_search") <= 0) {
      gang.delete(id);
    }
  }
}

function run(boy) {
  system.runTimeout(() => {
    try {
      clean();

      if (gang.size >= max && !gang.has(boy.id)) {
        boy.onScreenDisplay.setTitle(`§cSystem Full! (${gang.size}/${max})`);
        return;
      }

      const cool = boy.getItemCooldown("light_search");
      if (cool > 0) {
        const sec = Math.ceil(cool / 20);
        boy.onScreenDisplay.setActionBar(`§bWait: ${sec}s`);
        return;
      }

      gang.add(boy.id);

      const found = shine(boy);

      if (found >= limit) {
        boy.onScreenDisplay.setActionBar(`§eLimit Reached! (${limit})`);
      } else {
        boy.onScreenDisplay.setActionBar(`§aFound: ${found} blocks`);
      }

      boy.startItemCooldown("light_search", wait);
    } catch (err) {
      boy.sendMessage("§cSystem Glitch!");
      console.log(err);
    }
  }, 2);
}

function LlightentityHitBlock(evt) {
  const boy = evt.damagingEntity;
  const spot = evt.hitBlock;

  if (
    boy?.typeId === "minecraft:player" &&
    spot?.typeId.includes("light_block")
  ) {
    dig(boy, spot);
  }
}

function LligitemUse(evt) {
  const boy = evt.source;
  const tool = evt.itemStack;

  if (!check(tool)) return;

  evt.cancel = true;
  run(boy);
}

export { list, LlightentityHitBlock, LligitemUse };

