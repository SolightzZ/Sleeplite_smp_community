import { ActionFormData } from '@minecraft/server-ui';
import { Colors, Config, halfZoneSize } from '../config.js';
import { zoneDatabase } from '../core/database.js';
import { adminDeleteZone, adminTeleport, createZone, deleteZone, manageFlags, manageMembers, uiLockSet } from '../core/protection.js';
import { showBorder } from '../core/borders.js';

// สร้างเนื้อหาเมนู
const buildMenuBody = (player) => {
    const zones = zoneDatabase.zones;
    const zone = zones[player.name];
    const zoneCount = Object.keys(zones).length;

    let memberZone = null;

    for (const zone of Object.values(zones)) {
        if (zone.members.includes(player.name)) {
            memberZone = zone;
            break;
        }
    }

    const bodyLines = [`§7โพรเทค: ${zoneCount}/${Config.MaxZones}`];

    if (zone || memberZone) {
        const currentZone = zone || memberZone;
        const halfSize = halfZoneSize;
        const center = {
            x: currentZone.start.x + halfSize,
            y: currentZone.start.y + halfSize,
            z: currentZone.start.z + halfSize,
        };
        const memberList = currentZone.members.length ? currentZone.members.join(', ') : 'ไม่มี';
        const dimensionLabel = currentZone.dimension === 'minecraft:overworld' ? 'Overworld' : currentZone.dimension === 'minecraft:nether' ? 'Nether' : 'End';
        bodyLines.push(`เจ้าของ: ${currentZone.owner}`, `สมาชิก: ${memberList}`, `โลก: ${dimensionLabel}`, `ศูนย์กลาง: (${center.x}, ${center.y}, ${center.z})`);
    } else {
        bodyLines.push('');
    }

    return bodyLines.join('\n');
};

// สร้างปุ่ม
const addButton = (form, text, icon) => form.button(text, icon);

const buildMenuButtons = (form, player, isAdmin) => {
    const ownsZone = zoneDatabase.zones[player.name];
    const actions = [];
    const zoneCount = Object.keys(zoneDatabase.zones).length;

    if (!ownsZone) {
        if (zoneCount < Config.MaxZones) {
            addButton(form, 'สร้างโพรเทค', 'textures/ui/sidebar_icons/addon');
            actions.push(() => createZone(player));
        }

        if (isAdmin) {
            addButton(form, 'ลบโพรเทค (แอดมิน)', 'textures/ui/sidebar_icons/promotag');
            addButton(form, 'เทเลพอร์ต (แอดมิน)', 'textures/ui/sidebar_icons/my_characters');
            actions.push(() => adminDeleteZone(player));
            actions.push(() => adminTeleport(player));
        }
    } else {
        addButton(form, 'ตั้งค่าสิทธิ์', 'textures/ui/profile_glyph_combined');
        addButton(form, 'จัดการสมาชิก', 'textures/ui/sidebar_icons/wish_list');
        addButton(form, 'แสดงขอบเขต', 'textures/ui/sidebar_icons/classic_skins');
        addButton(form, 'ลบโพรเทค', 'textures/ui/sidebar_icons/squaredonut');

        actions.push(() => manageFlags(player));
        actions.push(() => manageMembers(player));
        actions.push(() => showBorder(player));
        actions.push(() => deleteZone(player));

        if (isAdmin) {
            addButton(form, 'ลบโพรเทค (แอดมิน)', 'textures/ui/sidebar_icons/promotag');
            addButton(form, 'เทเลพอร์ต (แอดมิน)', 'textures/ui/sidebar_icons/my_characters');
            actions.push(() => adminDeleteZone(player));
            actions.push(() => adminTeleport(player));
        }
    }
    return actions;
};

// เมนูหลัก
export const openMenu = async (player) => {
    if (uiLockSet.has(player.name)) return player.sendMessage(`[x] กรุณารอสักครู่`);

    uiLockSet.add(player.name);

    try {
        const isAdmin = player.hasTag(Config.AdminTag);
        const form = new ActionFormData().title('โพรเทค').body(buildMenuBody(player));
        const actions = buildMenuButtons(form, player, isAdmin);

        const response = await form.show(player);
        if (response.canceled) return;
        if (!player.isValid) return;

        if (response.selection < actions.length) {
            await actions[response.selection]();
        } else {
            player.sendMessage(`[x] การเลือกไม่ถูกต้อง กรุณาลองใหม่`);
        }
    } catch (error) {
        player.sendMessage(`[x] เมนูผิดพลาด`);
        console.error(`[ Protection ] openMenu: ${error}`);
    } finally {
        uiLockSet.delete(player.name);
    }
};
