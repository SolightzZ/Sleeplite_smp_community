import { ItemTypes, system, world } from "@minecraft/server";
import { showMainMenu } from "./Menu";

export let jobs = [];
export let jobId = 0;
export let ITEM_IDS = new Set();

export const amountMap = new Map(); // playerId -> { [itemId]: { amount, diamond } }
export const playerJobMap = new Map(); // playerId -> jobId (rider ที่รับงานอยู่)
export const selectedMap = new Map(); // playerId -> string[]
export const timerMap = new Map(); // Timer: playerId -> { intervalId, startTick }
export const pendingDelivery = new Map(); // ของที่ rider ส่งแล้ว รอ owner มารับ: jobId -> { ownerName, items: [{id,amount}] }
export const ownerNotifyMap = new Map(); // owner ที่มีของรอรับ: playerId -> Set<jobId>

const saveData = () => {
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
    console.warn("[Job] Save Error:", e);
  }
};

const loadData = () => {
  try {
    const j = world.getDynamicProperty("jobs_data_jobs");
    console.log("j:", j);
    if (j) {
      jobs.length = 0;
      jobs.push(...JSON.parse(j));
    }
    const jId = world.getDynamicProperty("jobs_data_jobId");
    console.log("jId:", jId);
    if (jId !== undefined) jobId = jId;

    const pjm = world.getDynamicProperty("jobs_data_playerJobMap");
    console.log("pjm:", pjm);
    if (pjm) JSON.parse(pjm).forEach(([k, v]) => playerJobMap.set(k, v));

    const tm = world.getDynamicProperty("jobs_data_timerMap");
    console.log("tm:", tm);
    if (tm) JSON.parse(tm).forEach(([k, v]) => timerMap.set(k, v));

    const pd = world.getDynamicProperty("jobs_data_pendingDelivery");
    console.log("pd:", pd);
    if (pd) JSON.parse(pd).forEach(([k, v]) => pendingDelivery.set(k, v));

    const onm = world.getDynamicProperty("jobs_data_ownerNotifyMap");
    console.log("onm:", onm);
    if (onm)
      JSON.parse(onm).forEach(([k, v]) => ownerNotifyMap.set(k, new Set(v)));
  } catch (e) {
    console.warn("[Job] Load Error:", e);
  }
};

const createJobData = (job) => {
  job.id = jobId++;
  jobs.push(job);
  saveData();
};

const deleteJobData = (id) => {
  const index = jobs.findIndex((j) => j.id === id);
  if (index !== -1) jobs.splice(index, 1);
  saveData();
};

const showUI = (player, form, callback) => {
  system.run(() => {
    form
      .show(player)
      .then((res) => {
        if (!res.canceled) callback(res);
      })
      .catch((err) => console.error("[UI Error]", err));
  });
};

const countItem = (inv, typeId) => {
  let count = 0;
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (it && it.typeId === typeId) count += it.amount;
  }
  return count;
};

const getInvMap = (inv) => {
  const map = new Map();
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (!it) continue;
    map.set(it.typeId, (map.get(it.typeId) ?? 0) + it.amount);
  }
  return map;
};

const findPlayerById = (id) =>
  world.getAllPlayers().find((p) => p.id === id) ?? null;

const totalDiamond = (job) =>
  job.items.reduce((sum, it) => sum + it.diamond, 0);

const stopTimer = (riderId) => {
  const t = timerMap.get(riderId);
  if (!t) return;
  system.clearRun(t.intervalId);
  timerMap.delete(riderId);
};

const hasOwnerNotify = (ownerId) =>
  (ownerNotifyMap.get(ownerId)?.size ?? 0) > 0;

function handleJob(event) {
  const { source, itemStack } = event;
  if (itemStack.typeId !== "minecraft:stick") return;
  showMainMenu(source);
}

function onPlayerLeave(event) {
  selectedMap.delete(event.playerId);
  amountMap.delete(event.playerId);
}

system.run(() => {
  for (const type of ItemTypes.getAll()) ITEM_IDS.add(type.id);
  loadData();
});
world.afterEvents.itemUse.subscribe(handleJob);
world.afterEvents.playerLeave.subscribe(onPlayerLeave);

export {
  countItem,
  createJobData,
  deleteJobData,
  findPlayerById,
  getInvMap,
  hasOwnerNotify,
  loadData,
  saveData,
  showUI,
  stopTimer,
  totalDiamond,
};
