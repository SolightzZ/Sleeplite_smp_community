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
        for (const p of players) {
            onlineNames.add(p.name);
        }

        const toRemove = [];

        for (const [name, state] of activeBorders) {
            try {
                if (!onlineNames.has(name) || state.ticks >= Config.BorderDuration) {
                    toRemove.push(name);
                    continue;
                }

                for (const pt of state.points) {
                    state.dim.spawnParticle(Config.ParticleId, pt);
                }
                state.ticks += 1;
            } catch (e) {
                console.warn(`[ Protection ] Border error ${name}: ${e}`);
                toRemove.push(name);
            }
        }

        for (const name of toRemove) {
            activeBorders.delete(name);
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
        if (!zone) return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);

        const dim = world.getDimension(zone.dimension);
        const points = buildBorderPoints(zone.start, Config.ParticleStep);
        activeBorders.set(player.name, {
            points,
            dim,
            ticks: 0,
        });
        startParticles();
    } catch (e) {
        player.sendMessage(`[x] แสดงขอบเขตโพรเทคไม่ได้`);
        console.warn(`[ Protection ] showBorder: ${e}`);
    }
};

export const createZone = async (player) => {
    try {
        const result = validateZoneCreate(player, zoneDatabase.zones);
        if (!result.ok) return player.sendMessage(result.reason);

        const newZone = buildZone(result.center, result.dimension);
        if (isZoneOverlap(newZone, zoneDatabase.zones)) {
            return player.sendMessage(`[x] ตำแหน่งนี้ซ้อนทับกับโพรเทคอื่น`);
        }

        const cForm = new ActionFormData()
            .title('สร้างโพรเทค')
            .body(`คุณต้องการสร้างโพรเทคขนาด ${Config.ZoneSize}x${Config.ZoneSize} ที่นี่หรือไม่?\nต้องใช้ Diamond Block 1 บล็อก`)
            .button('ตกลง', 'textures/ui/check')
            .button('ยกเลิก', 'textures/ui/cancel');

        const res = await cForm.show(player);
        if (!isFormValid(player, res) || res.selection !== 0) return;

        if (!consumeBlock(player)) {
            return player.sendMessage(`[x] คุณต้องมี Diamond Block ในช่องเก็บของ`);
        }

        newZone.owner = player.name;
        zoneDatabase.zones[player.name] = newZone;
        zoneDatabase.save();

        player.sendMessage(`${Colors.Success}[/] สร้างโพรเทค ${Config.ZoneSize}x${Config.ZoneSize} สำเร็จ`);
    } catch (e) {
        player.sendMessage(`[x] ไม่สามารถสร้างโพรเทคได้`);
        console.warn(`[ Protection ] createZone: ${e}`);
    }
};

export const deleteZone = async (player) => {
    try {
        if (!zoneDatabase.zones[player.name]) {
            return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);
        }

        const c1 = new ActionFormData();
        c1.title('ลบโพรเทค');
        c1.body('คุณแน่ใจหรือไม่ว่าต้องการลบโพรเทคนี้');
        c1.button('ตกลง', 'textures/ui/check');
        c1.button('ยกเลิก', 'textures/ui/cancel');

        const r1 = await c1.show(player);
        if (!isFormValid(player, r1) || r1.selection !== 0) return;

        const c2 = new ActionFormData();
        c2.title('ยืนยันอีกครั้ง');
        c2.body('กรุณายืนยันอีกครั้งเพื่อลบโพรเทค');
        c2.button('ตกลง', 'textures/ui/check');
        c2.button('ยกเลิก', 'textures/ui/cancel');

        const r2 = await c2.show(player);
        if (!isFormValid(player, r2) || r2.selection !== 0) return;

        delete zoneDatabase.zones[player.name];
        zoneDatabase.save();
        activeBorders.delete(player.name);

        if (Object.keys(zoneDatabase.zones).length === 0) stopParticlesIfIdle();
        player.sendMessage(`${Colors.Success}[/] ลบโพรเทคเรียบร้อย`);
    } catch (e) {
        player.sendMessage(`[x] ไม่สามารถลบโพรเทคได้`);
        console.warn(`[ Protection ] deleteZone: ${e}`);
    }
};

export const manageFriends = async (player) => {
    try {
        const zone = zoneDatabase.zones[player.name];
        if (!zone) return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);

        const allPlayers = world.getPlayers();
        const otherNames = [];
        for (const p of allPlayers) {
            if (p.name !== player.name) otherNames.push(p.name);
        }

        const form = new ModalFormData();
        form.title('จัดการสมาชิก');
        form.dropdown('การดำเนินการ', ['เพิ่มสมาชิก', 'ลบสมาชิก'], { defaultValueIndex: 0 });
        form.dropdown('ผู้เล่น', otherNames.length ? otherNames : ['ไม่มีผู้เล่น'], { defaultValueIndex: 0 });

        const res = await form.show(player);
        if (!isFormValid(player, res)) return;

        const actionIdx = res.formValues[0];
        const playerIdx = res.formValues[1];

        if (typeof playerIdx !== 'number' || playerIdx < 0 || playerIdx >= otherNames.length) {
            return player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);
        }

        const targetName = otherNames[playerIdx];
        if (!targetName) return player.sendMessage(`[x] ฟอร์มไม่ถูกต้อง กรุณาลองใหม่`);

        if (actionIdx === 0) {
            if (zone.members.length >= Config.MaxFriends) {
                return player.sendMessage(`[x] สมาชิกเต็มแล้ว (สูงสุด ${Config.MaxFriends} คน)`);
            }

            if (zone.members.includes(targetName)) {
                return player.sendMessage(`[x] ผู้เล่นนี้เป็นสมาชิกอยู่แล้ว`);
            }

            zone.members.push(targetName);
            player.sendMessage(`${Colors.Success}[/] เพิ่ม ${targetName} เข้าเป็นสมาชิกแล้ว`);
        } else {
            const idx = zone.members.indexOf(targetName);
            if (idx === -1) return player.sendMessage(`[x] ผู้เล่นนี้ไม่ได้เป็นสมาชิก`);
            zone.members.splice(idx, 1);
            player.sendMessage(`${Colors.Warning}[/] ลบ ${targetName} ออกจากสมาชิกแล้ว`);
        }

        zoneDatabase.save();
    } catch (e) {
        player.sendMessage(`[x] ไม่สามารถจัดการสมาชิกได้`);
        console.warn(`[ Protection ] manageFriends: ${e}`);
    }
};

export const adminDeleteZone = async (player) => {
    try {
        if (!player.hasTag(Config.AdminTag)) return player.sendMessage(`[x] เฉพาะผู้ดูแลระบบเท่านั้น`);

        const owners = Object.keys(zoneDatabase.zones);
        if (owners.length === 0) return player.sendMessage(`[x] ยังไม่มีโพรเทคในระบบ`);

        const form = new ModalFormData().title('ลบโพรเทค (แอดมิน)').dropdown('เลือกโพรเทค', owners, { defaultValueIndex: 0 });

        const res = await form.show(player);
        if (!isFormValid(player, res)) return;

        const idx = res.formValues[0];
        if (typeof idx !== 'number' || idx < 0 || idx >= owners.length) {
            return player.sendMessage(`[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่`);
        }

        const owner = owners[idx];
        if (!zoneDatabase.zones[owner]) return player.sendMessage(`[x] ไม่พบโพรเทคดังกล่าว`);

        delete zoneDatabase.zones[owner];
        zoneDatabase.save();
        activeBorders.delete(owner);

        if (Object.keys(zoneDatabase.zones).length === 0) stopParticlesIfIdle();
        player.sendMessage(`${Colors.Warning}[/] ลบโพรเทคของ ${owner} แล้ว`);

        for (const p of world.getPlayers()) {
            if (p.name === owner) {
                p.sendMessage(`§cผู้ดูแลระบบลบโพรเทคของคุณแล้ว`);
                break;
            }
        }
    } catch (e) {
        player.sendMessage(`[x] ไม่สามารถลบโพรเทคได้ (แอดมิน)`);
        console.warn(`[ Protection ] adminDeleteZone: ${e}`);
    }
};

export const manageFlags = async (player) => {
    try {
        const zone = zoneDatabase.zones[player.name];
        if (!zone) return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);

        const flags = zone.flags ?? Config.DefaultFlags;
        const form = new ModalFormData()
            .title('ตั้งค่าสิทธิ์')
            .toggle('ทำลายบล็อก', { defaultValue: flags.break ?? true })
            .toggle('วางบล็อก', { defaultValue: flags.place ?? true })
            .toggle('ใช้งาน (ประตู/คันโยก)', { defaultValue: flags.interact ?? true })
            .toggle('เปิดคอนเทนเนอร์ (หีบ/เตา)', { defaultValue: flags.container ?? true })
            .toggle('PvP ในโพรเทค', { defaultValue: flags.damage ?? false });

        const res = await form.show(player);
        if (!isFormValid(player, res)) return;

        zone.flags = {
            ...Config.DefaultFlags,
            break: res.formValues[0],
            place: res.formValues[1],
            interact: res.formValues[2],
            container: res.formValues[3],
            damage: res.formValues[4],
        };
        zoneDatabase.save();
        player.sendMessage(`${Colors.Success}[/] ตั้งค่าสิทธิ์โพรเทคเรียบร้อย`);
    } catch (e) {
        player.sendMessage(`[x] ไม่สามารถตั้งค่าสิทธิ์ได้`);
        console.warn(`[ Protection ] manageFlags: ${e}`);
    }
};

export const adminTeleport = async (player) => {
    try {
        if (!player.hasTag(Config.AdminTag)) return player.sendMessage(`[x] เฉพาะผู้ดูแลระบบเท่านั้น`);

        const owners = Object.keys(zoneDatabase.zones);
        if (owners.length === 0) return player.sendMessage(`[x] ยังไม่มีโพรเทคในระบบ`);

        const form = new ModalFormData().title('เทเลพอร์ต (แอดมิน)').dropdown('เลือกโพรเทค', owners, { defaultValueIndex: 0 });

        const res = await form.show(player);
        if (!isFormValid(player, res)) return;

        const idx = res.formValues[0];
        if (typeof idx !== 'number' || idx < 0 || idx >= owners.length) {
            return player.sendMessage(`[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่`);
        }

        const owner = owners[idx];
        const zone = zoneDatabase.zones[owner];
        if (!zone) return player.sendMessage(`[x] ไม่พบโพรเทคดังกล่าว`);

        const h = HalfZoneSize;
        const center = {
            x: zone.start.x + h,
            y: zone.start.y + h,
            z: zone.start.z + h,
        };
        const dim = world.getDimension(zone.dimension);
        player.teleport(center, { dimension: dim });
        player.sendMessage(`${Colors.Success}[/] เทเลพอร์ตไปยังโพรเทคของ ${owner}`);
    } catch (e) {
        player.sendMessage(`[x] ไม่สามารถเทเลพอร์ตได้`);
        console.warn(`[ Protection ] adminTeleport: ${e}`);
    }
};

export const clearVisuals = (name) => {
    activeBorders.delete(name);
    stopParticlesIfIdle();
};
