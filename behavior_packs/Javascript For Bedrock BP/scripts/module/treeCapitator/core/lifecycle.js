import { state } from "./state.js";

export const cleanupJobState = (job) => {
  state.pendingTrees.delete(job.treeKey);

  const count = state.playerJobCount.get(job.playerId) || 1;

  if (count <= 1) {
    state.playerJobCount.delete(job.playerId);
  } else {
    state.playerJobCount.set(job.playerId, count - 1);
  }

  state.playerLastJobEnd.set(job.playerId, Date.now());
};
