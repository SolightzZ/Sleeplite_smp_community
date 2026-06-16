import {
  removePendingTree,
  decrementPlayerJobCount,
  setPlayerLastJobEnd
} from "./state.js";

export const cleanupJobState = (job) => {
  removePendingTree(job.treeKey);
  decrementPlayerJobCount(job.playerId);
  setPlayerLastJobEnd(job.playerId, Date.now());
};

