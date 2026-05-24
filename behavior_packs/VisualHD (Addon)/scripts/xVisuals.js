import { world, system } from "@minecraft/server";

let tick = 0;
export const players = new Set();

const IMPACT_MSGS = [];
for (let i = 0; i <= 33; i++) {
  if (i === 1 || i === 2 || i === 3) {
    IMPACT_MSGS.push("xVisImpactFixed" + i);
  } else {
    IMPACT_MSGS.push("xVisImpact" + i);
  }
}

const FLAME_MSGS = [];
for (let i = 0; i <= 7; i++) {
  FLAME_MSGS.push("xVisFlameImpact" + i);
}

const DROWN_MSGS = [];
for (let i = 0; i <= 16; i++) {
  if (i === 1) {
    DROWN_MSGS.push("xVisDrowningFixed" + i);
  } else {
    DROWN_MSGS.push("xVisDrowning" + i);
  }
}

const IMPACT_CAUSES = [
  "contact",
  "entityAttack",
  "fall",
  "magic",
  "projectile",
  "stalactite",
  "stalagmite",
  "entityExplosion",
  "blockExplosion",
  "anvil",
  "maceSmash",
  "ramAttack",
  "sonicBoom",
  "flyIntoWall"
];
const EXPLOSION_CAUSES = ["entityExplosion", "blockExplosion", "anvil", "maceSmash", "ramAttack", "sonicBoom", "flyIntoWall"];
const FLAME_CAUSES = ["fire", "freTick", "fireworks", "lava", "lightning", "magma", "campfire", "soulCampfire"];
const BLOOD_PARTICLES = ["xvisuals:blood_drop0", "xvisuals:blood_drop1", "xvisuals:blood_drop1"];

const EFFECT_MAP = {
  poison: "xVisPoison",
  fire_resistance: "xVisFireResistance",
  resistance: "xVisResistance",
  regeneration: "xVisRegeneration",
  slow_falling: "xVisSlowFalling",
  speed: "xVisSpeed",
  strength: "xVisStrength",
  slowness: "xVisSlowness",
  jump_boost: "xVisJumpBoost",
  night_vision: "xVisNightVision",
  invisibility: "xVisInvisibility",
  water_breathing: "xVisWaterBreathing",
  weakness: "xVisWeakness",
  wither: "xVisWither",
  levitation: "xVisLevitation",
  wind_charged: "xVisWindCharged",
  weaving: "xVisWeaving",
  oozing: "xVisOozing",
  infested: "xVisInfested"
};

const getRandomElement = (array) => {
  const index = (Math.random() * array.length) | 0;
  return array[index];
};

const updateLowHealth = (player, healthPercent, level, tick) => {
  const minHealth = level === 0 ? 25 : 0;
  const maxHealth = level === 0 ? 50 : 25;
  const isActive = healthPercent <= maxHealth && healthPercent > minHealth;

  const currentLowHealth = player.getDynamicProperty("lowHealth" + level) ?? false;
  if (currentLowHealth !== isActive) {
    player.setDynamicProperty("lowHealth" + level, isActive);
  }

  if (tick % 2 === 0) {
    const msgKey = "lowHealth" + level + "Msg";
    const falseKey = "falseLowHealth" + level;

    if (isActive) {
      const msgSent = player.getDynamicProperty(msgKey) ?? false;
      if (!msgSent) {
        player.setDynamicProperty(msgKey, true);
        player.setDynamicProperty(falseKey, true);
        player.sendMessage("xVisLowHealth" + level + "Blur");
      }
    } else {
      const msgSent = player.getDynamicProperty(msgKey) ?? false;
      const falseSent = player.getDynamicProperty(falseKey) ?? false;
      if (msgSent && falseSent) {
        player.setDynamicProperty(msgKey, false);
        player.setDynamicProperty(falseKey, false);
        player.sendMessage("xVisFalseLowHealth" + level + "Blur");
      }
    }
  }
};

const initializePlayers = () => {
  const activePlayers = world.getAllPlayers();
  for (let i = 0; i < activePlayers.length; i++) {
    players.add(activePlayers[i].id);
  }
};
initializePlayers();

world.afterEvents.playerJoin.subscribe((event) => {
  players.add(event.playerId);
});

world.afterEvents.playerLeave.subscribe((event) => {
  players.delete(event.playerId);
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "xVisuals:addon") {
    system.sendScriptEvent("xVisualsAddon:activated", "Activated");
    system.clearRun(interval);
    players.clear();
  }
});

const interval = system.runInterval(() => {
  tick++;
  const activePlayers = world.getAllPlayers();
  for (let i = 0; i < activePlayers.length; i++) {
    const player = activePlayers[i];
    if (!player.isValid()) {
      continue;
    }

    const healthComponent = player.getComponent("minecraft:health");
    if (!healthComponent) {
      continue;
    }

    const healthPercent = (healthComponent.currentValue / healthComponent.effectiveMax) * 100;
    updateLowHealth(player, healthPercent, 0, tick);
    updateLowHealth(player, healthPercent, 1, tick);
  }
});

world.afterEvents.entityHurt.subscribe((event) => {
  const hurtEntity = event.hurtEntity;
  const damage = event.damage;
  const cause = event.damageSource.cause;

  if (damage === 0 || !hurtEntity || hurtEntity.typeId !== "minecraft:player") {
    return;
  }

  if (damage < 7) {
    hurtEntity.sendMessage("xVisWeakDamage");
  } else if (damage < 14) {
    hurtEntity.sendMessage("xVisHardDamage");
  } else {
    hurtEntity.sendMessage("xVisStrongDamage");
  }

  let isImpactCause = false;
  for (let i = 0; i < IMPACT_CAUSES.length; i++) {
    if (IMPACT_CAUSES[i] === cause) {
      isImpactCause = true;
      break;
    }
  }

  if (isImpactCause) {
    hurtEntity.dimension.spawnParticle(getRandomElement(BLOOD_PARTICLES), hurtEntity.location);
    hurtEntity.sendMessage(getRandomElement(IMPACT_MSGS));
  }

  let isExplosionCause = false;
  for (let i = 0; i < EXPLOSION_CAUSES.length; i++) {
    if (EXPLOSION_CAUSES[i] === cause) {
      isExplosionCause = true;
      break;
    }
  }

  if (isExplosionCause) {
    if (damage >= 4 && damage < 9) {
      hurtEntity.sendMessage("xVisWeakExplosion");
      hurtEntity.playSound("x.visuals.ear_ring.0", { location: hurtEntity.location, volume: 0.15 });
    } else if (damage >= 9 && damage < 14) {
      hurtEntity.sendMessage("xVisHardExplosion");
      hurtEntity.playSound("x.visuals.ear_ring.0", { location: hurtEntity.location, volume: 0.35 });
    } else if (damage >= 14) {
      hurtEntity.sendMessage("xVisStrongExplosion");
      hurtEntity.playSound("x.visuals.ear_ring.1", { location: hurtEntity.location, volume: 0.25 });
    }
  }

  let isFlameCause = false;
  for (let i = 0; i < FLAME_CAUSES.length; i++) {
    if (FLAME_CAUSES[i] === cause) {
      isFlameCause = true;
      break;
    }
  }

  if (isFlameCause) {
    hurtEntity.sendMessage(getRandomElement(FLAME_MSGS));
  }

  if (cause === "drowning") {
    hurtEntity.sendMessage(getRandomElement(DROWN_MSGS));
  }
});

world.afterEvents.effectAdd.subscribe((event) => {
  const entity = event.entity;
  const typeId = event.effect.typeId;

  if (!entity || entity.typeId !== "minecraft:player") {
    return;
  }

  const message = EFFECT_MAP[typeId];
  if (message) {
    entity.sendMessage(message);
  }
});

world.beforeEvents.playerLeave.subscribe((event) => {
  const player = event.player;
  player.setDynamicProperty("lowHealth0Msg", false);
  player.setDynamicProperty("lowHealth1Msg", false);
});
