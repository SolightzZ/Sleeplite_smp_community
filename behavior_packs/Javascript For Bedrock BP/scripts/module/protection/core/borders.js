import { world } from '@minecraft/server';
import { Registry } from '../../../router/core/registry.js';
import { Config } from '../config.js';
import { buildBorderPoints } from '../utils/helpers.js';
import { zoneDatabase } from './database.js';

// สถานะ
const activeBorders = new Map();

// วนเรนเดอร์ขอบเขต (ทุก 40 ticks)
export const renderBorderParticles = () => {
    try {
        if (activeBorders.size === 0) return;

        // ใช้ Registry ในการเช็คชื่อผู้เล่นที่ออนไลน์ เพื่อลดการทำงานแบบ O(N) ของเครื่องยนต์หลัก
        const onlineNames = new Set();
        for (const entry of Registry.getEntries()) {
            onlineNames.add(entry.player.name);
        }

        const expiredNames = [];

        for (const [name, state] of activeBorders) {
            try {
                if (!onlineNames.has(name) || state.ticks >= Config.BorderDuration) {
                    expiredNames.push(name);
                    continue;
                }

                for (const point of state.points) {
                    state.dimension.spawnParticle(Config.ParticleId, point);
                }
                state.ticks += 1;
            } catch (error) {
                console.error(`[ Protection ] Border error ${name}: ${error}`);
                expiredNames.push(name);
            }
        }

        for (const name of expiredNames) {
            activeBorders.delete(name);
        }
    } catch (error) {
        console.error(`[ Protection ] Particle loop: ${error}`);
        activeBorders.clear();
    }
};

// API สาธารณะ
export const showBorder = async (player) => {
    try {
        const zone = zoneDatabase.zones[player.name];
        if (!zone) return player.sendMessage(`[x] คุณยังไม่ได้ตั้งค่าโพรเทค`);

        const dimension = world.getDimension(zone.dimension);
        const points = buildBorderPoints(zone.start, Config.ParticleStep);
        activeBorders.set(player.name, {
            points,
            dimension,
            ticks: 0,
        });
    } catch (error) {
        player.sendMessage(`[x] แสดงขอบเขตโพรเทคไม่ได้`);
        console.error(`[ Protection ] showBorder: ${error}`);
    }
};

export const clearBorderVisuals = (name) => {
    activeBorders.delete(name);
};
