export const ENTITY_IDS = {
   PLAYER: 'minecraft:player',
};

export const BLOOD_PARTICLES = ['xvisuals:blood_drop0', 'xvisuals:blood_drop1', 'xvisuals:blood_drop2'];

export const IMPACT_MSGS = Array.from({ length: 34 }, (_, i) => (i >= 1 && i <= 3 ? `xVisImpactFixed${i}` : `xVisImpact${i}`));
export const FLAME_MSGS = Array.from({ length: 8 }, (_, i) => `xVisFlameImpact${i}`);
export const DROWN_MSGS = Array.from({ length: 17 }, (_, i) => (i === 1 ? `xVisDrowningFixed${i}` : `xVisDrowning${i}`));

export const EFFECT_MAP = {
   poison: 'xVisPoison',
   fire_resistance: 'xVisFireResistance',
   resistance: 'xVisResistance',
   regeneration: 'xVisRegeneration',
   slow_falling: 'xVisSlowFalling',
   speed: 'xVisSpeed',
   strength: 'xVisStrength',
   slowness: 'xVisSlowness',
   jump_boost: 'xVisJumpBoost',
   night_vision: 'xVisNightVision',
   invisibility: 'xVisInvisibility',
   water_breathing: 'xVisWaterBreathing',
   weakness: 'xVisWeakness',
   wither: 'xVisWither',
   levitation: 'xVisLevitation',
   wind_charged: 'xVisWindCharged',
   weaving: 'xVisWeaving',
   oozing: 'xVisOozing',
   infested: 'xVisInfested',
};

export const SEV_MSGS = ['xVisWeakDamage', 'xVisHardDamage', 'xVisStrongDamage'];
export const EXP_MSGS = ['xVisWeakExplosion', 'xVisHardExplosion', 'xVisStrongExplosion'];

export const LOW_HEALTH_MSG = 'xVisLowHealth0Blur';
export const FALSE_LOW_HEALTH_MSG = 'xVisFalseLowHealth0Blur';

export const EXP_SOUNDS = [
   { id: 'x.visuals.ear_ring.0', volume: 0.15 },
   { id: 'x.visuals.ear_ring.0', volume: 0.35 },
   { id: 'x.visuals.ear_ring.1', volume: 0.25 },
];
export const DROWN_SOUND = { id: 'mob.drowned.death', volume: 0.8 };
export const HEARTBEAT_SOUND = { id: 'mob.warden.heartbeat', volume: 0.8 };

export const COMPONENT_IDS = {
   HEALTH: 'minecraft:health',
};

export const TICK_INTERVAL = 3;
export const WARMUP_TICKS = 100;
export const ERROR_DECAY = 2;

export const COOLDOWNS = {
   EFFECT: 20,
   HURT: 10,
   HEARTBEAT: 10,
};

export const SPAWN_LIMITS = {
   EFFECT_PER_TICK: 12,
   HURT_PER_TICK: 8,
   HEARTBEATS_PER_TICK: 5,
};

export const QUEUE = {
   MAX_HURT: 128,
   HURT_MASK: 127,
   MAX_EFF: 64,
   EFF_MASK: 63,
};

export const HEALTH = {
   BATCH: 15,
   LOW_THRESHOLD: 50,
   CRITICAL_THRESHOLD: 30,
};

export const THRESHOLDS = {
   EXP_TIER_LOW: 4,
   EXP_TIER_MED: 9,
   EXP_TIER_HIGH: 14,
   DMG_SEV_WEAK: 7,
   DMG_SEV_HARD: 14,
};

export const ERROR_LIMITS = {
   MAX_ERROR_RATE: 50,
   MAX_QUEUE_ERRORS: 10,
   MAX_HEALTH_ERRORS: 10,
};

export const EXPLOSION_CAUSES = ['entityExplosion', 'blockExplosion', 'anvil', 'maceSmash', 'ramAttack', 'sonicBoom', 'flyIntoWall'];

export const DAMAGE_CAUSE = {
   IMPACT: new Set([
      'contact',
      'entityAttack',
      'fall',
      'magic',
      'projectile',
      'stalactite',
      'stalagmite',
      'entityExplosion',
      'blockExplosion',
      'anvil',
      'maceSmash',
      'ramAttack',
      'sonicBoom',
      'flyIntoWall',
   ]),
   EXPLOSION: new Set(EXPLOSION_CAUSES),
   FLAME: new Set(['fire', 'fireTick', 'fireworks', 'lava', 'lightning', 'magma', 'campfire', 'soulCampfire']),
   DROWNING: 'drowning',
};
