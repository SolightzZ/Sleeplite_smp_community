import { system, world } from '@minecraft/server';
import { Config } from '../config.js';
import { openMenu } from '../ui/menu.js';
import { isContainerBlock } from '../utils/validation.js';
import { zoneDatabase } from './database.js';
import { clearVisuals, uiLocks } from './protection.js';
const isPlayer = (entity) => entity?.typeId?.startsWith('minecraft:player');

const checkFlag = (player, zone, flag) => {
    if (player.name === zone.owner || player.hasTag(Config.AdminTag)) return true;
    if (!zone.members?.includes(player.name)) return false;
    const val = zone.flags?.[flag];
    return val ?? Config.DefaultFlags[flag];
};

export const onBlockEdit = (ev) => {
    const player = ev.player;
    const block = ev.block;
    if (!player || !block) return;

    const zone = zoneDatabase.findByLocation(block.location, block.dimension.id);
    if (!zone) return;

    const action = 'brokenBlockPermutation' in ev ? 'break' : 'face' in ev ? 'interact' : 'place';
    let flag = action === 'break' ? 'break' : action === 'place' ? 'place' : 'interact';

    if (action === 'interact' && isContainerBlock(block.typeId)) {
        flag = 'container';
    }

    if (!checkFlag(player, zone, flag)) {
        ev.cancel = true;
    }
};

export const onEntityInteract = (ev) => {
    const player = ev.player;
    const target = ev.target;
    if (!player || !target) return;
    if (!isPlayer(target)) return;

    const zone = zoneDatabase.findByLocation(target.location, target.dimension.id);
    if (!zone) return;

    if (!checkFlag(player, zone, 'interact')) {
        ev.cancel = true;
    }
};

export const onEntityHurt = (ev) => {
    const target = ev.hurtEntity;
    if (!target) return;

    const zone = zoneDatabase.findByLocation(target.location, target.dimension.id);
    if (!zone) return;

    const attacker = ev.damageSource?.damagingEntity;

    if (attacker && isPlayer(attacker)) {
        const dmg = zone.flags?.damage ?? Config.DefaultFlags.damage;
        if (dmg) return;
        if (!zone.members?.includes(attacker.name)) {
            ev.cancel = true;
        }
    } else if (attacker) {
        ev.cancel = true;
    }
};

export const onExplosion = (ev) => {
    const loc = ev.source?.location;
    if (!loc) return;

    const zones = zoneDatabase.zones;
    const owners = Object.keys(zones);
    if (owners.length === 0) return;

    const dimId = ev.dimension?.id;
    let near = false;
    const radius = Config.ExplosionRadius;

    for (const z of Object.values(zones)) {
        if (!z?.start || !z?.end || !z.dimension) continue;
        if (z.dimension !== dimId) continue;

        if (loc.x >= z.start.x - radius && loc.x <= z.end.x + radius && loc.y >= z.start.y - radius && loc.y <= z.end.y + radius && loc.z >= z.start.z - radius && loc.z <= z.end.z + radius) {
            near = true;
            break;
        }
    }

    if (!near) return;

    for (const block of ev.getImpactedBlocks()) {
        if (zoneDatabase.findByLocation(block.location, block.dimension.id)) {
            ev.cancel = true;
            return;
        }
    }
};

export const onItemUse = (ev) => {
    const source = ev.source;
    if (source && source.isValid) {
        openMenu(source);
    }
};

export const onChat = (ev) => {
    const player = ev.sender;
    const msg = ev.message;
    if (msg !== '!json') return;

    ev.cancel = true;
    system.run(() => {
        if (!player.isValid) return;
        if (!player.hasTag(Config.AdminTag)) {
            player.sendMessage(`[x] เฉพาะผู้ดูแลระบบเท่านั้น`);
            return;
        }

        const zones = zoneDatabase.zones;
        const owners = Object.keys(zones);
        if (owners.length === 0) {
            player.sendMessage(`[x] ไม่มีโพรเทคในระบบ`);
            return;
        }

        const data = [];
        for (const z of Object.values(zones)) {
            if (!z?.start || !z?.end) continue;
            data.push({
                owner: z.owner,
                dimension: z.dimension,
                location: z.location,
                start: z.start,
                end: z.end,
                members: z.members,
                flags: z.flags,
            });
        }

        console.warn(`[/] Zones: ${JSON.stringify(data, null, 2)}`);
    });
};

export const onPlayerLeave = (event) => {
    const player = event.player;
    if (!player?.isValid) return;
    clearVisuals(player.name);
    uiLocks.delete(player.name);
};
