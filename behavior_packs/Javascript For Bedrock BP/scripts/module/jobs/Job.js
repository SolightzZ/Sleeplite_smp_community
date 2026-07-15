import { ItemTypes, system } from '@minecraft/server';
import { logError } from '../../events/logger.js';
import { Registry } from '../../events/registry.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { jobDurationTicks, moduleTag, storageKeys } from './config.js';
import { showMainMenu } from './Menu.js';

export const jobs = [];
let nextJobId = 0;
export const ITEM_IDS = new Set();

export const amountMap = new Map();
export const selectedMap = new Map();
export const playerJobMap = new Map();
export const timerMap = new Map();
export const pendingDelivery = new Map();
export const ownerNotifyMap = new Map();

let isDirty = false;
let saveScheduled = false;

export const saveData = () => {
   isDirty = true;
   if (saveScheduled) return;
   saveScheduled = true;
   system.run(() => {
      saveScheduled = false;
      if (!isDirty) return;
      isDirty = false;
      try {
         cache.setDynamicProperty(storageKeys.JOBS, JSON.stringify(jobs));
         cache.setDynamicProperty(storageKeys.JOB_ID, nextJobId);
         cache.setDynamicProperty(storageKeys.RIDER_MAP, JSON.stringify(Array.from(playerJobMap.entries())));
         const timerEntries = Array.from(timerMap.entries()).map(([k, v]) => [k, { startTick: v.startTick }]);
         cache.setDynamicProperty(storageKeys.TIMERS, JSON.stringify(timerEntries));
         cache.setDynamicProperty(storageKeys.PENDING, JSON.stringify(Array.from(pendingDelivery.entries())));
         const notifyEntries = Array.from(ownerNotifyMap.entries()).map(([k, v]) => [k, Array.from(v)]);
         cache.setDynamicProperty(storageKeys.NOTIFY, JSON.stringify(notifyEntries));
      } catch (error) {
         logError(moduleTag, 'Save Error', error);
      }
   });
};

const loadJobData = () => {
   try {
      const jobsData = cache.getDynamicProperty(storageKeys.JOBS);
      if (jobsData) {
         jobs.length = 0;
         jobs.push(...JSON.parse(jobsData));
      }

      const jobIdData = cache.getDynamicProperty(storageKeys.JOB_ID);
      if (jobIdData !== undefined) {
         nextJobId = jobIdData;
      }

      const riderData = cache.getDynamicProperty(storageKeys.RIDER_MAP);
      if (riderData) {
         JSON.parse(riderData).forEach(([k, v]) => playerJobMap.set(k, v));
      }

      const timerData = cache.getDynamicProperty(storageKeys.TIMERS);
      if (timerData) {
         JSON.parse(timerData).forEach(([k, v]) => timerMap.set(k, v));
      }

      const pendingData = cache.getDynamicProperty(storageKeys.PENDING);
      if (pendingData) {
         JSON.parse(pendingData).forEach(([k, v]) => pendingDelivery.set(k, v));
      }

      const notifyData = cache.getDynamicProperty(storageKeys.NOTIFY);
      if (notifyData) {
         JSON.parse(notifyData).forEach(([k, v]) => ownerNotifyMap.set(k, new Set(v)));
      }
   } catch (error) {
      logError(moduleTag, 'Load Error', error);
   }
};

const MAX_JOBS = 500;

export const createJobData = (job) => {
   job.id = nextJobId++;
   jobs.push(job);
   if (jobs.length > MAX_JOBS) jobs.splice(0, jobs.length - MAX_JOBS);
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
      if (!pcheck(player)) return;
      form
         .show(player)
         .then((res) => {
            if (!res || res.canceled) return;
            callback(res);
         })
         .catch((error) => logError('Job', 'UI Error', error));
   });
};

export const countItem = (inv, typeId) => {
   let count = 0;
   const items = cache.getContainerItems(inv);
   for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it && it.typeId === typeId) count += it.amount;
   }
   return count;
};

export const buildInventoryMap = (inv) => {
   const map = new Map();
   const items = cache.getContainerItems(inv);
   for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it) continue;
      map.set(it.typeId, (map.get(it.typeId) ?? 0) + it.amount);
   }
   return map;
};

export const getPlayerById = (id) => {
   // ใช้ Registry ในการดึงข้อมูลผู้เล่นแบบ O(1) เพื่อลดภาระการประมวลผลแทนการวนลูปแบบ O(N)
   return Registry.get(id)?.player ?? null;
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

export const JOB_DURATION_TICKS = jobDurationTicks;

export const onJobItemUse = (event) => {
   const source = event.source;
   if (pcheck(source)) showMainMenu(source);
};

export const onJobPlayerLeave = (playerId) => {
   selectedMap.delete(playerId);
   amountMap.delete(playerId);
   playerJobMap.delete(playerId);
   pendingDelivery.delete(playerId);
   ownerNotifyMap.delete(playerId);
};

system.run(() => {
   const types = ItemTypes.getAll();
   for (const type of types) {
      ITEM_IDS.add(type.id);
   }
   loadJobData();
});
