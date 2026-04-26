// scripts/main.ts
import { system, EntityDamageCause } from "@minecraft/server";

// scripts/utils.ts
var Utils = class {
  static diceRoll(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
};

// scripts/main.ts
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "vf_campfire_creations:eat_raw_cactus_skewer",
    {
      onConsume(event) {
        const player = event.source;
        player.applyDamage(4, { cause: EntityDamageCause.thorns });
      },
    },
  );
  itemComponentRegistry.registerCustomComponent(
    "vf_campfire_creations:give_water_breating",
    {
      onConsume(event) {
        const player = event.source;
        player.addEffect("water_breathing", 240, { amplifier: 1 });
      },
    },
  );
  itemComponentRegistry.registerCustomComponent(
    "vf_campfire_creations:eat_hearty_item",
    {
      onConsume(event) {
        const player = event.source;
        player.addEffect("absorption", 240, { amplifier: 2 });
        player.addEffect("regeneration", 240, { amplifier: 1 });
      },
    },
  );
  itemComponentRegistry.registerCustomComponent(
    "vf_campfire_creations:eat_raw_suspicious_skewer",
    {
      onConsume(event) {
        const player = event.source;
        player.addEffect("hunger", 240, { amplifier: 0 });
        if (Utils.diceRoll(1, 10) <= 5) {
          if (Utils.diceRoll(1, 10) <= 5) {
            player.addEffect("poison", 240, { amplifier: 0 });
          } else {
            player.addEffect("nausea", 240, { amplifier: 0 });
          }
        }
      },
    },
  );
  itemComponentRegistry.registerCustomComponent(
    "vf_campfire_creations:eat_cooked_suspicious_skewer",
    {
      onConsume(event) {
        const player = event.source;
        if (Utils.diceRoll(1, 10) <= 5) {
          player.addEffect("hunger", 240, { amplifier: 0 });
        }
      },
    },
  );
});

//# sourceMappingURL=../debug/main.js.map
