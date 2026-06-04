import { ActionFormData } from '@minecraft/server-ui';
import { Colors, Config, HalfZoneSize } from '../config.js';
import { zoneDatabase } from '../core/database.js';
import { adminDeleteZone, adminTeleport, createZone, deleteZone, manageFlags, manageFriends, showBorder, uiLocks } from '../core/protection.js';

const buildBody = (player) => {
    const zones = zoneDatabase.zones;
    const zone = zones[player.name];
    const zoneCount = Object.keys(zones).length;

    let friendZone = null;

    for (const z of Object.values(zones)) {
        if (z.members.includes(player.name)) {
            friendZone = z;
            break;
        }
    }

    const lines = [`§7โพรเทค: ${zoneCount}/${Config.MaxZones}`];

    if (zone || friendZone) {
        const z = zone || friendZone;
        const h = HalfZoneSize;
        const center = {
            x: z.start.x + h,
            y: z.start.y + h,
            z: z.start.z + h,
        };
        const memberStr = z.members.length ? z.members.join(', ') : 'ไม่มี';
        const dimLabel = z.dimension === 'minecraft:overworld' ? 'Overworld' : z.dimension === 'minecraft:nether' ? 'Nether' : 'End';
        lines.push(`เจ้าของ: ${z.owner}`, `สมาชิก: ${memberStr}`, `โลก: ${dimLabel}`, `ศูนย์กลาง: (${center.x}, ${center.y}, ${center.z})`);
    } else {
        lines.push('');
    }

    return lines.join('\n');
};

const addBtn = (form, text, icon) => form.button(text, icon);

const buildButtons = (form, player, isAdmin) => {
    const hasZone = zoneDatabase.zones[player.name];
    const actions = [];
    const zoneCount = Object.keys(zoneDatabase.zones).length;

    if (!hasZone) {
        if (zoneCount < Config.MaxZones) {
            addBtn(form, 'สร้างโพรเทค', 'textures/ui/sidebar_icons/addon');
            actions.push(() => createZone(player));
        }

        if (isAdmin) {
            addBtn(form, 'ลบโพรเทค (แอดมิน)', 'textures/ui/sidebar_icons/promotag');
            addBtn(form, 'เทเลพอร์ต (แอดมิน)', 'textures/ui/sidebar_icons/my_characters');
            actions.push(() => adminDeleteZone(player));
            actions.push(() => adminTeleport(player));
        }
    } else {
        addBtn(form, 'ตั้งค่าสิทธิ์', 'textures/ui/sidebar_icons/control');
        addBtn(form, 'จัดการสมาชิก', 'textures/ui/sidebar_icons/wish_list');
        addBtn(form, 'แสดงขอบเขต', 'textures/ui/sidebar_icons/classic_skins');
        addBtn(form, 'ลบโพรเทค', 'textures/ui/sidebar_icons/squaredonut');
        actions.push(() => manageFlags(player));
        actions.push(() => manageFriends(player));
        actions.push(() => showBorder(player));
        actions.push(() => deleteZone(player));

        if (isAdmin) {
            addBtn(form, 'ลบโพรเทค (แอดมิน)', 'textures/ui/sidebar_icons/promotag');
            addBtn(form, 'เทเลพอร์ต (แอดมิน)', 'textures/ui/sidebar_icons/my_characters');
            actions.push(() => adminDeleteZone(player));
            actions.push(() => adminTeleport(player));
        }
    }
    return actions;
};

export const openMenu = async (player) => {
    if (uiLocks.has(player.name)) return player.sendMessage(`[x] กรุณารอสักครู่`);

    uiLocks.add(player.name);

    try {
        const isAdmin = player.hasTag(Config.AdminTag);
        const form = new ActionFormData().title('โพรเทค').body(buildBody(player));
        const actions = buildButtons(form, player, isAdmin);

        const res = await form.show(player);
        if (res.canceled) return;
        if (!player.isValid) return;

        if (res.selection < actions.length) {
            await actions[res.selection]();
        } else {
            player.sendMessage(`[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่`);
        }
    } catch (e) {
        player.sendMessage(`[x] เมนูผิดพลาด`);
        console.warn(`[ Protection ] openMenu: ${e}`);
    } finally {
        uiLocks.delete(player.name);
    }
};
