import { system, world } from '@minecraft/server';
import { Config } from '../config.js';
import { openMenu } from '../ui/menu.js';
import { isContainerBlock, isPlayer } from '../utils/helpers.js';
import { zoneDatabase } from './database.js';
import { clearBorderVisuals } from './borders.js';
import { uiLockSet } from './protection.js';
import { cache } from '../../../shared/cache.js';
import { logWarn } from '../../../events/logger.js';
import { pcheck } from './../../../shared/player.js';

// ตรวจสอบสิทธิ์
const hasPermission = (player, zone, flag) => {
    if (player.hasTag(Config.AdminTag)) return true;
    if (player.name === zone.owner || zone.members?.includes(player.name)) {
        const flagValue = zone.flags?.[flag];
        return flagValue ?? Config.DefaultFlags[flag];
    }
    return false;
};

// จัดการอีเวนต์บล็อก (ทำลาย / วาง / ใช้งาน)
export const onBlockEdit = (event) => {
    const player = event.player;
    const block = event.block;
    if (!pcheck(player) || !block || !block.isValid) return;

    const zone = zoneDatabase.findByLocation(block.location, block.dimension.id);
    if (!zone) return;

    const action = 'face' in event ? 'place' : 'blockFace' in event ? 'interact' : 'break';
    let flag = action === 'break' ? 'break' : action === 'place' ? 'place' : 'interact';

    if (action === 'interact' && isContainerBlock(block.typeId)) {
        flag = 'container';
    }

    if (!hasPermission(player, zone, flag)) {
        event.cancel = true;
    }
};

// จัดการโต้ตอบกับเอนทิตี
export const onEntityInteract = (event) => {
    const player = event.player;
    const target = event.target;
    if (!pcheck(player) || !target || !target.isValid) return;
    if (!isPlayer(target)) return;

    const zone = zoneDatabase.findByLocation(target.location, target.dimension.id);
    if (!zone) return;

    if (!hasPermission(player, zone, 'interact')) {
        event.cancel = true;
    }
};

// จัดการ PvP
export const onEntityHurt = (event) => {
    const target = event.hurtEntity;
    if (!pcheck(target)) return;

    const zone = zoneDatabase.findByLocation(target.location, target.dimension.id);
    if (!zone) return;

    const attacker = event.damageSource?.damagingEntity;

    if (pcheck(attacker) && isPlayer(attacker) && isPlayer(target)) {
        const damageEnabled = zone.flags?.damage ?? Config.DefaultFlags.damage;
        if (!damageEnabled) {
            event.cancel = true;
        }
    }
};

// ป้องกันการระเบิด
export const onExplosion = (event) => {
    const location = event.source?.location;
    if (!location) return;

    const zoneCount = Object.keys(zoneDatabase.zones).length;
    if (zoneCount === 0) return;

    const dimensionId = event.dimension?.id;
    const radius = Config.ExplosionRadius;
    const nearbyZones = [];

    for (const zone of Object.values(zoneDatabase.zones)) {
        if (!zone?.start || !zone?.end || !zone.dimension) continue;
        if (zone.dimension !== dimensionId) continue;

        if (
            location.x >= zone.start.x - radius &&
            location.x <= zone.end.x + radius &&
            location.y >= zone.start.y - radius &&
            location.y <= zone.end.y + radius &&
            location.z >= zone.start.z - radius &&
            location.z <= zone.end.z + radius
        ) {
            nearbyZones.push(zone);
        }
    }

    if (nearbyZones.length === 0) return;

    for (const block of event.getImpactedBlocks()) {
        const bLoc = block.location;
        for (const zone of nearbyZones) {
            if (bLoc.x >= zone.start.x && bLoc.x <= zone.end.x && bLoc.y >= zone.start.y && bLoc.y <= zone.end.y && bLoc.z >= zone.start.z && bLoc.z <= zone.end.z) {
                event.cancel = true;
                return;
            }
        }
    }
};

// เรียกเมนู
export const onItemUse = (event) => {
    const source = event.source;
    if (pcheck(source)) {
        openMenu(source);
    }
};

// คำสั่งดีบักแอดมิน (!json)
export const onChat = (event) => {
    const player = event.sender;
    const message = event.message;
    if (message !== '!json') return;

    event.cancel = true;
    system.run(() => {
        if (!pcheck(player)) return;
        if (!player.hasTag(Config.AdminTag)) {
            cache.sendMessage(player, `[x] เฉพาะผู้ดูแลระบบเท่านั้น`);
            return;
        }

        const zones = zoneDatabase.zones;
        const ownerKeys = Object.keys(zones);
        if (ownerKeys.length === 0) {
            cache.sendMessage(player, `[x] ไม่มีโพรเทคในระบบ`);
            return;
        }

        const data = [];
        for (const zone of Object.values(zones)) {
            if (!zone?.start || !zone?.end) continue;
            data.push({
                owner: zone.owner,
                dimension: zone.dimension,
                location: zone.location,
                start: zone.start,
                end: zone.end,
                members: zone.members,
                flags: zone.flags,
            });
        }

        logWarn('Protection', `/ Zones: ${JSON.stringify(data, null, 2)}`);
    });
};

// ล้างข้อมูลเมื่อผู้เล่นออก
export const onPlayerLeave = (event) => {
    const player = event.player;
    if (!pcheck(player)) return;
    clearBorderVisuals(player.name);
    uiLockSet.delete(player.name);
};
