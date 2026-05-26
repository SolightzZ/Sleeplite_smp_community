import { world, system, Player } from '@minecraft/server';

const IMPACT_MSGS = [];
for (let i = 0; i <= 33; i++) {
    if (i === 1 || i === 2 || i === 3) {
        IMPACT_MSGS.push('xVisImpactFixed' + i);
    } else {
        IMPACT_MSGS.push('xVisImpact' + i);
    }
}

const FLAME_MSGS = [];
for (let i = 0; i <= 7; i++) {
    FLAME_MSGS.push('xVisFlameImpact' + i);
}

const DROWN_MSGS = [];
for (let i = 0; i <= 16; i++) {
    if (i === 1) {
        DROWN_MSGS.push('xVisDrowningFixed' + i);
    } else {
        DROWN_MSGS.push('xVisDrowning' + i);
    }
}

const IMPACT_CAUSES = [
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
];

const EXPLOSION_CAUSES = [
    'entityExplosion',
    'blockExplosion',
    'anvil',
    'maceSmash',
    'ramAttack',
    'sonicBoom',
    'flyIntoWall',
];

const FLAME_CAUSES = [
    'fire',
    'freTick',
    'fireworks',
    'lava',
    'lightning',
    'magma',
    'campfire',
    'soulCampfire',
];

const BLOOD_PARTICLES = ['xvisuals:blood_drop0', 'xvisuals:blood_drop1', 'xvisuals:blood_drop1'];

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

const getRandomElement = (array) => {
    const index = (Math.random() * array.length) | 0;
    return array[index];
};

const updateLowHealth = (player, healthPercent, level) => {
    const minHealth = level === 0 ? 25 : 0;
    const maxHealth = level === 0 ? 50 : 25;
    const isActive = healthPercent <= maxHealth && healthPercent > minHealth;

    const currentLowHealth = player.getDynamicProperty('lowHealth' + level) ?? false;
    if (currentLowHealth !== isActive) {
        player.setDynamicProperty('lowHealth' + level, isActive);
    }

    const msgKey = 'lowHealth' + level + 'Msg';
    const falseKey = 'falseLowHealth' + level;

    const msgSent = player.getDynamicProperty(msgKey) ?? false;
    if (isActive) {
        if (!msgSent) {
            player.setDynamicProperty(msgKey, true);
            player.setDynamicProperty(falseKey, true);
            player.sendMessage('xVisLowHealth' + level + 'Blur');
        }
    } else {
        const falseSent = player.getDynamicProperty(falseKey) ?? false;
        if (msgSent && falseSent) {
            player.setDynamicProperty(msgKey, false);
            player.setDynamicProperty(falseKey, false);
            player.sendMessage('xVisFalseLowHealth' + level + 'Blur');
        }
    }
};

const playerQueue = [];
let queueIndex = 0;

const rebuildQueue = () => {
    playerQueue.length = 0;
    const activePlayers = world.getAllPlayers();
    for (let i = 0; i < activePlayers.length; i++) {
        playerQueue.push(activePlayers[i].id);
    }
    queueIndex = 0;
};

rebuildQueue();

world.afterEvents.playerJoin.subscribe((event) => {
    playerQueue.push(event.playerId);
});

world.afterEvents.playerLeave.subscribe((event) => {
    const id = event.playerId;
    for (let i = playerQueue.length - 1; i >= 0; i--) {
        if (playerQueue[i] === id) {
            playerQueue.splice(i, 1);
            if (i <= queueIndex && queueIndex > 0) {
                queueIndex--;
            }
            break;
        }
    }
    if (playerQueue.length === 0) {
        queueIndex = 0;
    }
});

const interval = system.runInterval(() => {
    if (playerQueue.length === 0) {
        return;
    }

    if (queueIndex >= playerQueue.length) {
        queueIndex = 0;
    }

    const playerId = playerQueue[queueIndex];
    const entity = world.getEntity(playerId);
    if (!entity || !entity.isValid) {
        playerQueue.splice(queueIndex, 1);
        if (playerQueue.length === 0) {
            return;
        }
        queueIndex %= playerQueue.length;
        return;
    }

    const player = /** @type {Player} */ (entity);
    const healthComponent = player.getComponent('minecraft:health');
    if (healthComponent) {
        const healthPercent = (healthComponent.currentValue / healthComponent.effectiveMax) * 100;
        updateLowHealth(player, healthPercent, 0);
        updateLowHealth(player, healthPercent, 1);
    }

    queueIndex = (queueIndex + 1) % playerQueue.length;
}, 1);

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === 'xVisuals:addon') {
        system.sendScriptEvent('xVisualsAddon:activated', 'Activated');
        system.clearRun(interval);
    }
});

world.afterEvents.entityHurt.subscribe((event) => {
    const hurtEntity = event.hurtEntity;
    const damage = event.damage;
    const cause = event.damageSource.cause;

    if (damage === 0 || !hurtEntity || hurtEntity.typeId !== 'minecraft:player') {
        return;
    }

    const player = /** @type {Player} */ (hurtEntity);

    if (damage < 7) {
        player.sendMessage('xVisWeakDamage');
    } else if (damage < 14) {
        player.sendMessage('xVisHardDamage');
    } else {
        player.sendMessage('xVisStrongDamage');
    }

    let isImpactCause = false;
    for (let i = 0; i < IMPACT_CAUSES.length; i++) {
        if (IMPACT_CAUSES[i] === cause) {
            isImpactCause = true;
            break;
        }
    }

    if (isImpactCause) {
        player.dimension.spawnParticle(getRandomElement(BLOOD_PARTICLES), player.location);
        player.sendMessage(getRandomElement(IMPACT_MSGS));
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
            player.sendMessage('xVisWeakExplosion');
            player.playSound('x.visuals.ear_ring.0', { location: player.location, volume: 0.15 });
        } else if (damage >= 9 && damage < 14) {
            player.sendMessage('xVisHardExplosion');
            player.playSound('x.visuals.ear_ring.0', { location: player.location, volume: 0.35 });
        } else if (damage >= 14) {
            player.sendMessage('xVisStrongExplosion');
            player.playSound('x.visuals.ear_ring.1', { location: player.location, volume: 0.25 });
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
        player.sendMessage(getRandomElement(FLAME_MSGS));
    }

    if (cause === 'drowning') {
        player.sendMessage(getRandomElement(DROWN_MSGS));
    }
});

world.afterEvents.effectAdd.subscribe((event) => {
    const entity = event.entity;
    const typeId = event.effect.typeId;

    if (!entity || entity.typeId !== 'minecraft:player') {
        return;
    }

    const player = /** @type {Player} */ (entity);
    const message = EFFECT_MAP[typeId];
    if (message) {
        player.sendMessage(message);
    }
});

world.beforeEvents.playerLeave.subscribe((event) => {
    const player = event.player;
    player.setDynamicProperty('lowHealth0Msg', false);
    player.setDynamicProperty('lowHealth1Msg', false);
});
