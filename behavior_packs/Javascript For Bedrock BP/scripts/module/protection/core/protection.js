import { system, world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { Colors, Config, HalfZoneSize } from '../config.js';
import { buildBorderPoints, buildZone, consumeBlock, isFormValid, isZoneOverlap, validateZoneCreate } from '../utils/validation.js';
import { zoneDatabase } from './database.js';

export const uiLocks = new Set();
const activeBorders = new Map();
let particleHandle = null;

const startParticles = () => {
    if (particleHandle !== null) return;
    particleHandle = system.runInterval(renderBorders, 40);
};

const stopParticlesIfIdle = () => {
    if (activeBorders.size === 0 && particleHandle !== null) {
        system.clearRun(particleHandle);
        particleHandle = null;
    }
};

const forceStopParticles = () => {
    if (particleHandle !== null) {
        system.clearRun(particleHandle);
        particleHandle = null;
    }
};

const renderBorders = () => {
    try {
        stopParticlesIfIdle();
        if (activeBorders.size === 0) return;

        const players = world.getPlayers();
        const onlineNames = new Set();
        const playersLen = players.length;
        for (let i = 0; i < playersLen; i++) {
            onlineNames.add(players[i].name);
        }

        const toRemove = [];

        for (const [name, state] of activeBorders) {
            try {
                if (!onlineNames.has(name) || state.ticks >= Config.BorderDuration) {
                    toRemove.push(name);
                    continue;
                }

                const pts = state.points;
                const ptsLen = pts.length;
                for (let j = 0; j < ptsLen; j++) {
                    state.dim.spawnParticle(Config.ParticleId, pts[j]);
                }
                state.ticks += 1;
            } catch (e) {
                console.warn(` [ Protection ] Border error ${name}: ${e}`);
                toRemove.push(name);
            }
        }

        const removeLen = toRemove.length;
        for (let i = 0; i < removeLen; i++) {
            activeBorders.delete(toRemove[i]);
        }
        stopParticlesIfIdle();
    } catch (e) {
        console.warn(`[ Protection ] Particle loop: ${e}`);
        forceStopParticles();
        activeBorders.clear();
    }
};

export const showBorder = async (player) => {
    try {
        const zone = zoneDatabase.zones[player.name];
        if (!zone) return player.sendMessage(`[x] ไม่มีโซน!`);

        const points = buildBorderPoints(zone.start, Config.ParticleStep);
        activeBorders.set(player.name, {
            points: points,
            dim: player.dimension,
            ticks: 0,
        });
        startParticles();
    } catch (e) {
        player.sendMessage(`[x] ขอบเขตผิดพลาด!`);
        console.warn(`[ Protection ] showBorder: ${e}`);
    }
};

export const createZone = async (player) => {
    try {
        const result = validateZoneCreate(player, zoneDatabase.zones);
        if (!result.ok) return player.sendMessage(result.reason);
        const newZone = buildZone(result.center);
        if (isZoneOverlap(newZone, zoneDatabase.zones)) {
            return player.sendMessage(`[x] โซนทับกับโซนอื่น!`);
        }

        const cForm = new ActionFormData()
            .title('ยืนยันการสร้างโซน')
            .body(`คุณแน่ใจหรือไม่ที่จะสร้างโซนป้องกันขนาด ${Config.ZoneSize}x${Config.ZoneSize} ที่นี่?\nการสร้างโซนจะต้องใช้ Diamond Block 1 บล็อก`)
            .button('ตกลง', 'textures/ui/check')
            .button('ยกเลิก', 'textures/ui/cancel');

        const res = await cForm.show(player);
        if (!isFormValid(player, res) || res.selection !== 0) return;

        if (!consumeBlock(player)) {
            return player.sendMessage(`[x] ต้องมี Diamond Block ในตัวก่อน`);
        }

        zoneDatabase.zones[player.name] = newZone;
        zoneDatabase.save();
        zoneDatabase.cache.clear();

        player.sendMessage(`${Colors.Success}สร้างโซน ${Config.ZoneSize}x${Config.ZoneSize} สำเร็จ!`);
    } catch (e) {
        player.sendMessage(`[x] สร้างโซนผิดพลาด!`);
        console.warn(`[ Protection ] createZone: ${e}`);
    }
};

export const deleteZone = async (player) => {
    try {
        if (!zoneDatabase.zones[player.name]) {
            return player.sendMessage(`[x] ไม่มีโซน!`);
        }

        const c1 = new ActionFormData();
        c1.title('ยืนยันลบโซน');
        c1.body('แน่ใจว่าจะลบโซน?');
        c1.button('ตกลง', 'textures/ui/check');
        c1.button('ยกเลิก', 'textures/ui/cancel');

        const r1 = await c1.show(player);
        if (!isFormValid(player, r1) || r1.selection !== 0) return;

        const c2 = new ActionFormData();
        c2.title('ยืนยันครั้งสุดท้าย');
        c2.body('ยืนยันอีกครั้งเพื่อลบโซน');
        c2.button('ตกลง', 'textures/ui/check');
        c2.button('ยกเลิก', 'textures/ui/cancel');

        const r2 = await c2.show(player);
        if (!isFormValid(player, r2) || r2.selection !== 0) return;

        delete zoneDatabase.zones[player.name];
        zoneDatabase.save();
        zoneDatabase.cache.clear();
        activeBorders.delete(player.name);

        if (Object.keys(zoneDatabase.zones).length === 0) stopParticlesIfIdle();

        player.sendMessage(`${Colors.Success}ลบโซนเรียบร้อย!`);
    } catch (e) {
        player.sendMessage(`[x] ลบโซนผิดพลาด!`);
        console.warn(`[ Protection ] deleteZone: ${e}`);
    }
};

export const manageFriends = async (player) => {
    try {
        const zone = zoneDatabase.zones[player.name];
        if (!zone) return player.sendMessage(`[x] ไม่มีโซน!`);

        const allPlayers = world.getPlayers();
        const otherNames = [];
        const allLen = allPlayers.length;
        for (let i = 0; i < allLen; i++) {
            const n = allPlayers[i].name;
            if (n !== player.name) otherNames.push(n);
        }

        const form = new ModalFormData();
        form.title('จัดการเพื่อน');
        form.dropdown('การดำเนินการ', ['เพิ่มเพื่อน', 'ลบเพื่อน'], {
            defaultValueIndex: 0,
        });
        form.dropdown('ผู้เล่น', otherNames.length ? otherNames : [`ไม่มีผู้เล่น`], {
            defaultValueIndex: 0,
        });

        const res = await form.show(player);
        if (!isFormValid(player, res)) return;

        const actionIdx = res.formValues[0];
        const playerIdx = res.formValues[1];

        if (typeof playerIdx !== 'number' || playerIdx < 0 || playerIdx >= otherNames.length) {
            return player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง!`);
        }

        const targetName = otherNames[playerIdx];
        if (!targetName) return player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง!`);

        if (actionIdx === 0) {
            if (zone.friends.length >= Config.MaxFriends) {
                return player.sendMessage(`[x] เพื่อนครบ ${Config.MaxFriends} คนแล้ว!`);
            }

            const friends = zone.friends;
            const friendsLen = friends.length;

            for (let i = 0; i < friendsLen; i++) {
                if (friends[i] === targetName) {
                    return player.sendMessage(`[x] เป็นเพื่อนแล้ว!`);
                }
            }

            zone.friends.push(targetName);
            player.sendMessage(`${Colors.Success}[/] เพิ่ม ${targetName} แล้ว!`);
        } else {
            const friends = zone.friends;
            const friendsLen = friends.length;
            let found = false;
            const newFriends = [];

            for (let i = 0; i < friendsLen; i++) {
                if (friends[i] === targetName) {
                    found = true;
                } else {
                    newFriends.push(friends[i]);
                }
            }

            if (!found) return player.sendMessage(`[x] ไม่ได้เป็นเพื่อน!`);
            zone.friends = newFriends;
            player.sendMessage(`${Colors.Warning}[/] ลบ ${targetName} แล้ว!`);
        }

        zoneDatabase.save();
        zoneDatabase.cache.clear();
    } catch (e) {
        player.sendMessage(`[x] จัดการเพื่อนผิดพลาด!`);
        console.warn(`[ Protection ] manageFriends: ${e}`);
    }
};

export const adminDeleteZone = async (player) => {
    try {
        if (!player.hasTag(Config.AdminTag)) return player.sendMessage(`[x] เฉพาะแอดมิน!`);

        const owners = Object.keys(zoneDatabase.zones);
        if (owners.length === 0) return player.sendMessage(`[x] ไม่มีโซน!`);

        const form = new ModalFormData().title('ลบโซน (แอดมิน)').dropdown('เลือกโซน', owners, { defaultValueIndex: 0 });

        const res = await form.show(player);
        if (!isFormValid(player, res)) return;

        const idx = res.formValues[0];
        if (typeof idx !== 'number' || idx < 0 || idx >= owners.length) {
            return player.sendMessage(`[x] เลือกไม่ถูกต้อง!`);
        }

        const owner = owners[idx];
        if (!zoneDatabase.zones[owner]) return player.sendMessage(`[x] ไม่พบโซน!`);

        delete zoneDatabase.zones[owner];
        zoneDatabase.save();
        zoneDatabase.cache.clear();
        activeBorders.delete(owner);

        if (Object.keys(zoneDatabase.zones).length === 0) stopParticlesIfIdle();

        player.sendMessage(`${Colors.Warning}[/] ลบโซน ${owner} แล้ว!`);

        const allPlayers = world.getPlayers();
        const allLen = allPlayers.length;
        for (let i = 0; i < allLen; i++) {
            if (allPlayers[i].name === owner) {
                allPlayers[i].sendMessage(`โซนคุณถูกลบโดยแอดมิน!`);
                break;
            }
        }
    } catch (e) {
        player.sendMessage(`[x] ลบโซนแอดมินผิดพลาด!`);
        console.warn(`[ Protection ] adminDelete: ${e}`);
    }
};

export const adminTeleport = async (player) => {
    try {
        if (!player.hasTag(Config.AdminTag)) return player.sendMessage(`[x] เฉพาะแอดมิน!`);

        const owners = Object.keys(zoneDatabase.zones);
        if (owners.length === 0) return player.sendMessage(`[x] ไม่มีโซน!`);

        const form = new ModalFormData().title('เทเลพอร์ต (แอดมิน)').dropdown('เลือกโซน', owners, { defaultValueIndex: 0 });

        const res = await form.show(player);
        if (!isFormValid(player, res)) return;

        const idx = res.formValues[0];
        if (typeof idx !== 'number' || idx < 0 || idx >= owners.length) {
            return player.sendMessage(`[x] เลือกไม่ถูกต้อง!`);
        }

        const owner = owners[idx];
        const zone = zoneDatabase.zones[owner];
        if (!zone) return player.sendMessage(`[x] ไม่พบโซน!`);

        const h = HalfZoneSize;
        const center = {
            x: zone.start.x + h,
            y: zone.start.y + h,
            z: zone.start.z + h,
        };
        player.teleport(center, { dimension: player.dimension });
        player.sendMessage(`${Colors.Success}[/] เทเลพอร์ตไป ${owner}`);
    } catch (e) {
        player.sendMessage(`[x] เทเลพอร์ตผิดพลาด!`);
        console.warn(`[ Protection ] adminTeleport: ${e}`);
    }
};

export const clearVisuals = (name) => {
    activeBorders.delete(name);
    stopParticlesIfIdle();
};
