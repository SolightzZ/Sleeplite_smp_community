import { system, EntityDamageCause } from "@minecraft/server";

const EFFECT_DURATION = 240;

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const chance = (percent) => randomInt(1, 100) <= percent;

const addEffect = (
  player,
  effectType,
  amplifier = 0,
  duration = EFFECT_DURATION,
) => {
  if (!player?.isValid()) return;

  player.addEffect(effectType, duration, { amplifier });
};

const applyDamage = (player, amount, cause = EntityDamageCause.none) => {
  if (!player?.isValid()) return;
  player.applyDamage(amount, { cause });
};

const componentHandlers = {
  "vf_campfire_creations:eat_raw_cactus_skewer"(player) {
    applyDamage(player, 4, EntityDamageCause.thorns);
  },

  "vf_campfire_creations:give_water_breating"(player) {
    addEffect(player, "water_breathing", 1);
  },

  "vf_campfire_creations:eat_hearty_item"(player) {
    addEffect(player, "absorption", 2);
    addEffect(player, "regeneration", 1);
  },

  "vf_campfire_creations:eat_raw_suspicious_skewer"(player) {
    addEffect(player, "hunger");

    if (!chance(50)) return;
    if (chance(50)) {
      addEffect(player, "poison");
      return;
    }

    addEffect(player, "nausea");
  },

  "vf_campfire_creations:eat_cooked_suspicious_skewer"(player) {
    if (!chance(50)) return;
    addEffect(player, "hunger");
  },
};

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  const entries = Object.entries(componentHandlers);
  for (let i = 0; i < entries.length; i++) {
    const [componentId, handler] = entries[i];

    itemComponentRegistry.registerCustomComponent(componentId, {
      onConsume(event) {
        const player = event.source;
        if (!player?.isValid) return;
        handler(player);
      },
    });
  }
});
