import { world, system } from '@minecraft/server';

// Section 1 — Message Tables

const MSG = {
    PREFIX: 'xVis',
    IMPACT_COUNT: 34,
    FLAME_COUNT: 8,
    DROWN_COUNT: 17,
};

const IMPACT_MSGS = Array.from({ length: MSG.IMPACT_COUNT }, (_, i) => (i >= 1 && i <= 3 ? `xVisImpactFixed${i}` : `xVisImpact${i}`));

const FLAME_MSGS = Array.from({ length: MSG.FLAME_COUNT }, (_, i) => `xVisFlameImpact${i}`);

const DROWN_MSGS = Array.from({ length: MSG.DROWN_COUNT }, (_, i) => (i === 1 ? `xVisDrowningFixed${i}` : `xVisDrowning${i}`));

// Section 2 — Damage Cause Classification

const DAMAGE_CAUSE = {
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
    EXPLOSION: new Set(['entityExplosion', 'blockExplosion', 'anvil', 'maceSmash', 'ramAttack', 'sonicBoom', 'flyIntoWall']),
    FLAME: new Set(['fire', 'fireTick', 'fireworks', 'lava', 'lightning', 'magma', 'campfire', 'soulCampfire']),
};

const BLOOD_PARTICLES = ['xvisuals:blood_drop0', 'xvisuals:blood_drop1'];

const getRandomElement = (array) => array[(Math.random() * array.length) | 0];

const EFFECT_MAP = {
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

// Section 3 — Low-Health Blur

const healthStates = new Map();

const getHealthState = (playerId) => {
    let state = healthStates.get(playerId);
    if (!state) {
        state = { active: [false, false], msgSent: [false, false] };
        healthStates.set(playerId, state);
    }
    return state;
};

const updateLowHealth = (player, healthPercent, level) => {
    const minHealth = level === 0 ? 25 : 0;
    const maxHealth = level === 0 ? 50 : 25;
    const isActive = healthPercent <= maxHealth && healthPercent > minHealth;

    const state = getHealthState(player.id);
    if (state.active[level] === isActive) return;

    state.active[level] = isActive;
    if (isActive) {
        if (state.msgSent[level]) return;
        state.msgSent[level] = true;
        player.sendMessage(`xVisLowHealth${level}Blur`);
    } else {
        if (!state.msgSent[level]) return;
        state.msgSent[level] = false;
        player.sendMessage(`xVisFalseLowHealth${level}Blur`);
    }
};

// Section 4 — Player Registry

const playerMap = new Map();
let playerIds = [];
let roundRobinIndex = 0;

const refreshIds = () => {
    playerIds = [...playerMap.keys()];
    roundRobinIndex = 0;
};

for (const p of world.getAllPlayers()) {
    playerMap.set(p.id, p);
}
refreshIds();

world.afterEvents.playerJoin.subscribe((event) => {
    system.run(() => {
        const entity = world.getEntity(event.playerId);
        if (entity && entity.isValid) {
            playerMap.set(event.playerId, entity);
            refreshIds();
        }
    });
});

const cleanupPlayer = (playerId) => {
    playerMap.delete(playerId);
    healthStates.delete(playerId);
    refreshIds();
};

world.beforeEvents.playerLeave.subscribe((event) => {
    cleanupPlayer(event.playerId);
});

// Section 5 — Health Monitor

const healthMonitor = () => {
    if (playerIds.length === 0) return;

    if (roundRobinIndex >= playerIds.length) {
        roundRobinIndex = 0;
    }

    const playerId = playerIds[roundRobinIndex];
    const player = playerMap.get(playerId);

    if (!player || !player.isValid) {
        cleanupPlayer(playerId);
        return;
    }

    try {
        const healthComponent = player.getComponent('minecraft:health');
        if (healthComponent) {
            const healthPercent = (healthComponent.currentValue / healthComponent.effectiveMax) * 100;
            updateLowHealth(player, healthPercent, 0);
            updateLowHealth(player, healthPercent, 1);
        }
    } catch (e) {
        console.warn('[xVisuals] health_monitor', String(e));
    }

    roundRobinIndex = (roundRobinIndex + 1) % playerIds.length;
};

const interval = system.runInterval(healthMonitor, 40);

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === 'xVisuals:addon') {
        system.sendScriptEvent('xVisualsAddon:activated', 'Activated');
        system.clearRun(interval);
    }
});

// Section 6 — Hurt Visuals Pipeline

const hurtPlayers = [];
const hurtDamages = [];
const hurtCauses = [];
let pendingLen = 0;

world.afterEvents.entityHurt.subscribe((event) => {
    const { hurtEntity, damage, damageSource } = event;
    if (damage === 0 || !hurtEntity || hurtEntity.typeId !== 'minecraft:player') return;

    hurtPlayers[pendingLen] = hurtEntity;
    hurtDamages[pendingLen] = damage;
    hurtCauses[pendingLen] = damageSource.cause;
    pendingLen++;
});

const MAX_HURT_PER_TICK = 3;

const buildHurtMessage = (damage, cause) => {
    const parts = [];

    if (damage < 7) {
        parts.push('xVisWeakDamage');
    } else if (damage < 14) {
        parts.push('xVisHardDamage');
    } else {
        parts.push('xVisStrongDamage');
    }

    const { IMPACT, EXPLOSION, FLAME } = DAMAGE_CAUSE;

    if (IMPACT.has(cause)) {
        parts.push(getRandomElement(IMPACT_MSGS));
    }

    if (EXPLOSION.has(cause)) {
        if (damage >= 4 && damage < 9) {
            parts.push('xVisWeakExplosion');
        } else if (damage >= 9 && damage < 14) {
            parts.push('xVisHardExplosion');
        } else if (damage >= 14) {
            parts.push('xVisStrongExplosion');
        }
    }

    if (FLAME.has(cause)) {
        parts.push(getRandomElement(FLAME_MSGS));
    }

    if (cause === 'drowning') {
        parts.push(getRandomElement(DROWN_MSGS));
    }

    return parts.join('\n');
};

const getExplosionSound = (damage) => {
    if (damage >= 4 && damage < 9) {
        return { id: 'x.visuals.ear_ring.0', volume: 0.15 };
    }
    if (damage >= 9 && damage < 14) {
        return { id: 'x.visuals.ear_ring.0', volume: 0.35 };
    }
    if (damage >= 14) {
        return { id: 'x.visuals.ear_ring.1', volume: 0.25 };
    }
    return null;
};

const shiftQueue = (count) => {
    const remaining = pendingLen - count;
    for (let i = 0; i < remaining; i++) {
        hurtPlayers[i] = hurtPlayers[i + count];
        hurtDamages[i] = hurtDamages[i + count];
        hurtCauses[i] = hurtCauses[i + count];
    }
    for (let i = remaining; i < pendingLen; i++) {
        hurtPlayers[i] = null;
        hurtDamages[i] = 0;
        hurtCauses[i] = null;
    }
    pendingLen = remaining;
};

const drainHurtQueue = () => {
    if (pendingLen === 0) return;

    const count = pendingLen < MAX_HURT_PER_TICK ? pendingLen : MAX_HURT_PER_TICK;

    for (let i = 0; i < count; i++) {
        const player = hurtPlayers[i];
        const damage = hurtDamages[i];
        const cause = hurtCauses[i];

        if (!player || !player.isValid) continue;

        const loc = player.location;
        const { IMPACT, EXPLOSION } = DAMAGE_CAUSE;

        if (IMPACT.has(cause)) {
            player.dimension.spawnParticle(getRandomElement(BLOOD_PARTICLES), loc);
        }

        const explosionSound = EXPLOSION.has(cause) ? getExplosionSound(damage) : null;
        if (explosionSound) {
            player.playSound(explosionSound.id, { location: loc, volume: explosionSound.volume });
        }

        const message = buildHurtMessage(damage, cause);
        player.sendMessage(message);
    }

    shiftQueue(count);
};

system.runInterval(() => {
    try {
        drainHurtQueue();
    } catch (e) {
        console.warn('[xVisuals] hurt_drain', String(e));
    }
}, 2);

// Section 7 — Status-Effect HUD Icons

world.afterEvents.effectAdd.subscribe((event) => {
    const { entity, effect } = event;
    if (!entity || entity.typeId !== 'minecraft:player') return;

    const message = EFFECT_MAP[effect.typeId];
    if (!message) return;

    try {
        entity.sendMessage(message);
    } catch (e) {
        console.warn('[xVisuals] effect_icon', String(e));
    }
});
