import { system, world } from '@minecraft/server';
import { Config } from '../config.js';
import { buildBorderPoints } from '../utils/helpers.js';
import { zoneDatabase } from './database.js';

// สถานะ
const activeBorders = new Map();
let particleIntervalId = null;

// จัดการ Interval
const startParticleInterval = () => {
    if (particleIntervalId !== null) return;
    particleIntervalId = system.runInterval(renderBorderParticles, 40);
};

const stopParticleIntervalIfIdle = () => {
    if (activeBorders.size === 0 && particleIntervalId !== null) {
        system.clearRun(particleIntervalId);
        particleIntervalId = null;
    }
};

const forceStopParticleInterval = () => {
    if (particleIntervalId !== null) {
        system.clearRun(particleIntervalId);
        particleIntervalId = null;
    }
};

// วนเรนเดอร์ขอบเขต (ทุก 40 ticks)
const renderBorderParticles = () => {
    try {
        if (activeBorders.size === 0) return;

        const players = world.getAllPlayers();
        const onlineNames = new Set(players.map((player) => player.name));

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
        stopParticleIntervalIfIdle();
    } catch (error) {
        console.error(`[ Protection ] Particle loop: ${error}`);
        forceStopParticleInterval();
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
        startParticleInterval();
    } catch (error) {
        player.sendMessage(`[x] แสดงขอบเขตโพรเทคไม่ได้`);
        console.error(`[ Protection ] showBorder: ${error}`);
    }
};

export const clearBorderVisuals = (name) => {
    activeBorders.delete(name);
    stopParticleIntervalIfIdle();
};
