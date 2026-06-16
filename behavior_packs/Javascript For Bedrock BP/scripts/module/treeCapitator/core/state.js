const jobQueue = [];
const pendingTrees = new Set();
const playerJobCount = new Map();
const playerLastJobEnd = new Map();
let runHandle = null;
let lastProcessedIndex = 0;

export const getJobQueueLength = () => jobQueue.length;
export const getJob = (idx) => jobQueue[idx];
export const pushJob = (job) => jobQueue.push(job);
export const popJob = (idx) => {
  const last = jobQueue.pop();
  if (idx < jobQueue.length) {
    jobQueue[idx] = last;
  }
};

export const isTreePending = (key) => pendingTrees.has(key);
export const addPendingTree = (key) => pendingTrees.add(key);
export const removePendingTree = (key) => pendingTrees.delete(key);

export const getPlayerJobCount = (playerId) => playerJobCount.get(playerId) || 0;
export const incrementPlayerJobCount = (playerId) => {
  const current = playerJobCount.get(playerId) || 0;
  playerJobCount.set(playerId, current + 1);
};
export const decrementPlayerJobCount = (playerId) => {
  const current = playerJobCount.get(playerId) || 0;
  if (current <= 1) {
    playerJobCount.delete(playerId);
  } else {
    playerJobCount.set(playerId, current - 1);
  }
};

export const getPlayerLastJobEnd = (playerId) => playerLastJobEnd.get(playerId) || 0;
export const setPlayerLastJobEnd = (playerId, time) => playerLastJobEnd.set(playerId, time);
export const cleanupPlayerState = (playerId) => {
  playerLastJobEnd.delete(playerId);
  playerJobCount.delete(playerId);
};

export const getRunHandle = () => runHandle;
export const setRunHandle = (handle) => {
  runHandle = handle;
};

export const getLastProcessedIndex = () => lastProcessedIndex;
export const setLastProcessedIndex = (idx) => {
  lastProcessedIndex = idx;
};
export const incrementLastProcessedIndex = () => {
  lastProcessedIndex++;
};

