import { ItemTypes, system, world } from '@minecraft/server';
import { showMainMenu } from './Menu.js';

export const jobs = [];
export let nextJobId = 0;
export const ITEM_IDS = new Set();

export const amountMap = new Map();
export const selectedMap = new Map();
export const playerJobMap = new Map();
export const timerMap = new Map();
export const pendingDelivery = new Map();
export const ownerNotifyMap = new Map();

const STORAGE_KEYS = {
    JOBS: 'jobs_data_jobs',
    JOB_ID: 'jobs_data_jobId',
    RIDER_MAP: 'jobs_data_riderMap',
    TIMERS: 'jobs_data_timers',
    PENDING: 'jobs_data_pending',
    NOTIFY: 'jobs_data_notify',
};

export const saveData = () => {
    try {
        world.setDynamicProperty(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
        world.setDynamicProperty(STORAGE_KEYS.JOB_ID, nextJobId);
        world.setDynamicProperty(STORAGE_KEYS.RIDER_MAP, JSON.stringify(Array.from(playerJobMap.entries())));
        const timerEntries = Array.from(timerMap.entries()).map(([k, v]) => [k, { startTick: v.startTick }]);
        world.setDynamicProperty(STORAGE_KEYS.TIMERS, JSON.stringify(timerEntries));
        world.setDynamicProperty(STORAGE_KEYS.PENDING, JSON.stringify(Array.from(pendingDelivery.entries())));
        const notifyEntries = Array.from(ownerNotifyMap.entries()).map(([k, v]) => [k, Array.from(v)]);
        world.setDynamicProperty(STORAGE_KEYS.NOTIFY, JSON.stringify(notifyEntries));
    } catch (error) {
        console.error('[Job] Save Error:', error);
    }
};

export const loadJobData = () => {
    try {
        const jobsData = world.getDynamicProperty(STORAGE_KEYS.JOBS);
        if (jobsData) {
            jobs.length = 0;
            jobs.push(...JSON.parse(jobsData));
        }

        const jobIdData = world.getDynamicProperty(STORAGE_KEYS.JOB_ID);
        if (jobIdData !== undefined) {
            nextJobId = jobIdData;
        }

        const riderData = world.getDynamicProperty(STORAGE_KEYS.RIDER_MAP);
        if (riderData) {
            JSON.parse(riderData).forEach(([k, v]) => playerJobMap.set(k, v));
        }

        const timerData = world.getDynamicProperty(STORAGE_KEYS.TIMERS);
        if (timerData) {
            JSON.parse(timerData).forEach(([k, v]) => timerMap.set(k, v));
        }

        const pendingData = world.getDynamicProperty(STORAGE_KEYS.PENDING);
        if (pendingData) {
            JSON.parse(pendingData).forEach(([k, v]) => pendingDelivery.set(k, v));
        }

        const notifyData = world.getDynamicProperty(STORAGE_KEYS.NOTIFY);
        if (notifyData) {
            JSON.parse(notifyData).forEach(([k, v]) => ownerNotifyMap.set(k, new Set(v)));
        }
    } catch (error) {
        console.error('[Job] Load Error:', error);
    }
};

export const createJobData = (job) => {
    job.id = nextJobId++;
    jobs.push(job);
    saveData();
};

export const deleteJobData = (id) => {
    const len = jobs.length;
    for (let i = 0; i < len; i++) {
        if (jobs[i].id === id) {
            jobs.splice(i, 1);
            break;
        }
    }
    saveData();
};

export const showUI = (player, form, callback, retries = 3) => {
    system.run(() => {
        if (!player || !player.isValid) return;
        form.show(player)
            .then((res) => {
                if (!res || res.canceled) return;
                callback(res);
            })
            .catch((error) => console.error('[Job] UI Error:', error));
    });
};

export const countItem = (inv, typeId) => {
    let count = 0;
    const size = inv.size;
    for (let i = 0; i < size; i++) {
        const it = inv.getItem(i);
        if (it && it.typeId === typeId) count += it.amount;
    }
    return count;
};

export const buildInventoryMap = (inv) => {
    const map = new Map();
    const size = inv.size;
    for (let i = 0; i < size; i++) {
        const it = inv.getItem(i);
        if (!it) continue;
        map.set(it.typeId, (map.get(it.typeId) ?? 0) + it.amount);
    }
    return map;
};

export const getPlayerById = (id) => {
    const players = world.getAllPlayers();
    for (const player of players) {
        if (player.id === id) return player;
    }
    return null;
};

export const totalDiamond = (job) => {
    let sum = 0;
    for (const item of job.items) {
        sum += item.diamond;
    }
    return sum;
};

export const stopTimer = (riderId) => {
    const t = timerMap.get(riderId);
    if (!t) return;
    if (t.intervalId !== undefined) system.clearRun(t.intervalId);
    timerMap.delete(riderId);
};

export const hasOwnerNotify = (ownerId) => {
    return (ownerNotifyMap.get(ownerId)?.size ?? 0) > 0;
};

export const onJobItemUse = (event) => {
    const source = event.source;
    if (source?.isValid) showMainMenu(source);
};

export const onJobPlayerLeave = (playerId) => {
    selectedMap.delete(playerId);
    amountMap.delete(playerId);
};

system.run(() => {
    const types = ItemTypes.getAll();
    for (const type of types) {
        ITEM_IDS.add(type.id);
    }
    loadJobData();
});
