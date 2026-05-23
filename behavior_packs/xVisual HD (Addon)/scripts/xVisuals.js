import { world, system } from "@minecraft/server";

let tick = 0;
export const players = new Set();

const IMPACT_MSGS = [];
const FLAME_MSGS = [];
const DROWN_MSGS = [];
for (let i = 0; i <= 33; i++) IMPACT_MSGS.push(`xVisImpact${i === 1 || i === 2 || i === 3 ? `Fixed${i}` : i}`);
for (let i = 0; i <= 7; i++) FLAME_MSGS.push(`xVisFlameImpact${i}`);
for (let i = 0; i <= 16; i++) DROWN_MSGS.push(`xVisDrowning${i === 1 ? `Fixed${i}` : i}`);

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
  "flyIntoWall",
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
  infested: "xVisInfested",
};

const randIdx = (array) => (Math.random() * array.length) | 0;

const updateLowHealth = (player, healthPercent, level, tick) => {
  const minHealth = level === 0 ? 25 : 0;
  const maxHealth = level === 0 ? 50 : 25;
  const isActive = healthPercent <= maxHealth && healthPercent > minHealth;
  const msgKey = `lowHealth${level}Msg`;
  const falseKey = `falseLowHealth${level}`;
  const msgSent = player.getDynamicProperty(msgKey) ?? false;
  const falseSent = player.getDynamicProperty(falseKey) ?? false;

  player.setDynamicProperty(`lowHealth${level}`, isActive);

  if (tick % 2 === 0) {
    if (isActive && !msgSent) {
      player.setDynamicProperty(msgKey, true);
      player.setDynamicProperty(falseKey, true);
      player.sendMessage(`xVisLowHealth${level}Blur`);
    } else if (!isActive && msgSent && falseSent) {
      player.setDynamicProperty(msgKey, false);
      player.setDynamicProperty(falseKey, false);
      player.sendMessage(`xVisFalseLowHealth${level}Blur`);
    }
  }
};

world.afterEvents.playerJoin.subscribe(({ playerId }) => players.add(playerId));
world.afterEvents.playerLeave.subscribe(({ playerId }) => players.delete(playerId));

system.afterEvents.scriptEventReceive.subscribe(({ id }) => {
  if (id === "xVisuals:addon") {
    system.sendScriptEvent("xVisualsAddon:activated", "Activated");
    system.clearRun(interval);
    players.clear();
  }
});

const interval = system.runInterval(() => {
  tick++;
  for (const playerId of players) {
    const player = world.getEntity(playerId);
    if (!player?.isValid()) continue;

    const healthComponent = player.getComponent("minecraft:health");
    if (!healthComponent) continue;

    const healthPercent = (healthComponent.currentValue / healthComponent.effectiveMax) * 100;
    updateLowHealth(player, healthPercent, 0, tick);
    updateLowHealth(player, healthPercent, 1, tick);
  }
});

world.afterEvents.entityHurt.subscribe(({ hurtEntity, damage, damageSource: { cause } }) => {
  if (damage === 0 || hurtEntity?.typeId !== "minecraft:player") return;

  if (damage < 7) hurtEntity.sendMessage("xVisWeakDamage");
  else if (damage < 14) hurtEntity.sendMessage("xVisHardDamage");
  else hurtEntity.sendMessage("xVisStrongDamage");

  if (IMPACT_CAUSES.includes(cause)) {
    hurtEntity.dimension.spawnParticle(BLOOD_PARTICLES[randIdx(BLOOD_PARTICLES)], hurtEntity.location);
    hurtEntity.sendMessage(IMPACT_MSGS[randIdx(IMPACT_MSGS)]);
  }

  if (EXPLOSION_CAUSES.includes(cause)) {
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

  if (FLAME_CAUSES.includes(cause)) hurtEntity.sendMessage(FLAME_MSGS[randIdx(FLAME_MSGS)]);
  if (cause === "drowning") hurtEntity.sendMessage(DROWN_MSGS[randIdx(DROWN_MSGS)]);
});

world.afterEvents.effectAdd.subscribe(({ entity, effect: { typeId } }) => {
  if (entity?.typeId !== "minecraft:player") return;
  const message = EFFECT_MAP[typeId];
  if (message) entity.sendMessage(message);
});

world.beforeEvents.playerLeave.subscribe(({ player }) => {
  player.setDynamicProperty("lowHealth0Msg", false);
  player.setDynamicProperty("lowHealth1Msg", false);
});
