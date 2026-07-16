import { JobQueue } from "./state.js";

export const cleanupJobState = (job) => {
  JobQueue.removePending(job.treeKey);
  JobQueue.decrementPlayerJobCount(job.playerId);
  JobQueue.setPlayerLastJobEnd(job.playerId, Date.now());
};

