import { ItemTypes, system, world } from "@minecraft/server";
import { showMainMenu } from "./Menu.js";

export let jobs = [];
export let jobId = 0;
export let ITEM_IDS = new Set();

export const amountMap = new Map();
export const playerJobMap = new Map();
export const selectedMap = new Map();
export const timerMap = new Map();
export const pendingDelivery = new Map();
export const ownerNotifyMap = new Map();

export const saveData = () => {
  try {
    world.setDynamicProperty("jobs_data_jobs", JSON.stringify(jobs));
    world.setDynamicProperty("jobs_data_jobId", jobId);
    world.setDynamicProperty(
      "jobs_data_playerJobMap",
      JSON.stringify(Array.from(playerJobMap.entries())),
    );
    const timerEntries = Array.from(timerMap.entries()).map(([k, v]) => [
      k,
      { startTick: v.startTick },
    ]);
    world.setDynamicProperty(
      "jobs_data_timerMap",
      JSON.stringify(timerEntries),
    );
    world.setDynamicProperty(
      "jobs_data_pendingDelivery",
      JSON.stringify(Array.from(pendingDelivery.entries())),
    );
    const notifyEntries = Array.from(ownerNotifyMap.entries()).map(([k, v]) => [
      k,
      Array.from(v),
    ]);
    world.setDynamicProperty(
      "jobs_data_ownerNotifyMap",
      JSON.stringify(notifyEntries),
    );
  } catch (e) {
    console.error("[Job] Save Error:", e);
  }
};

export const loadData = () => {
  try {
    const j = world.getDynamicProperty("jobs_data_jobs");
    if (j) {
      jobs.length = 0;
      jobs.push(...JSON.parse(j));
    }
    const jId = world.getDynamicProperty("jobs_data_jobId");
    if (jId !== undefined) jobId = jId;

    const pjm = world.getDynamicProperty("jobs_data_playerJobMap");
    if (pjm) JSON.parse(pjm).forEach(([k, v]) => playerJobMap.set(k, v));

    const tm = world.getDynamicProperty("jobs_data_timerMap");
    if (tm) JSON.parse(tm).forEach(([k, v]) => timerMap.set(k, v));

    const pd = world.getDynamicProperty("jobs_data_pendingDelivery");
    if (pd) JSON.parse(pd).forEach(([k, v]) => pendingDelivery.set(k, v));

    const onm = world.getDynamicProperty("jobs_data_ownerNotifyMap");
    if (onm)
      JSON.parse(onm).forEach(([k, v]) => ownerNotifyMap.set(k, new Set(v)));
  } catch (e) {
    console.error("[Job] Load Error:", e);
  }
};

export const createJobData = (job) => {
  job.id = jobId++;
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
    form
      .show(player)
      .then((res) => {
        if (!res || res.canceled) return;
        callback(res);
      })
      .catch((err) => {
        if (err?.message === "User is busy" && retries > 0) {
          system.runTimeout(() => showUI(player, form, callback, retries - 1), 10);
        } else if (err?.message !== "User is busy") {
          console.error("[Job] UI Error:", err);
        }
      });
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

export const getInvMap = (inv) => {
  const map = new Map();
  const size = inv.size;
  for (let i = 0; i < size; i++) {
    const it = inv.getItem(i);
    if (!it) continue;
    map.set(it.typeId, (map.get(it.typeId) ?? 0) + it.amount);
  }
  return map;
};

export const findPlayerById = (id) => {
  const players = world.getAllPlayers();
  const len = players.length;
  for (let i = 0; i < len; i++) {
    if (players[i].id === id) return players[i];
  }
  return null;
};

export const totalDiamond = (job) => {
  let sum = 0;
  const len = job.items.length;
  for (let i = 0; i < len; i++) {
    sum += job.items[i].diamond;
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

export function handleJob(event) {
  const { source } = event;
  if (source?.isValid) {
    showMainMenu(source);
  }
}

export function JobLeave(event) {
  const playerId = event.playerId;
  selectedMap.delete(playerId);
  amountMap.delete(playerId);
}

system.run(() => {
  const types = ItemTypes.getAll();
  const len = types.length;
  for (let i = 0; i < len; i++) {
    ITEM_IDS.add(types[i].id);
  }
  loadData();
});
