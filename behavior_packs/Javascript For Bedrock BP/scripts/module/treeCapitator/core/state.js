import { JobQueue } from '../../../shared/jobQueue.js';

export const getJobQueueLength = () => JobQueue.getJobQueueLength();
export const getJob = (idx) => JobQueue.getJob(idx);
export const pushJob = (job) => JobQueue.pushJob(job);
export const popJob = (idx) => JobQueue.popJob(idx);
export const isTreePending = (key) => JobQueue.isPending(key);
export const addPendingTree = (key) => JobQueue.addPending(key);
export const removePendingTree = (key) => JobQueue.removePending(key);
export const getPlayerJobCount = (playerId) => JobQueue.getPlayerJobCount(playerId);
export const incrementPlayerJobCount = (playerId) => JobQueue.incrementPlayerJobCount(playerId);
export const decrementPlayerJobCount = (playerId) => JobQueue.decrementPlayerJobCount(playerId);
export const getPlayerLastJobEnd = (playerId) => JobQueue.getPlayerLastJobEnd(playerId);
export const setPlayerLastJobEnd = (playerId, time) => JobQueue.setPlayerLastJobEnd(playerId, time);
export const cleanupPlayerState = (playerId) => JobQueue.cleanupPlayerState(playerId);
export const getLastProcessedIndex = () => JobQueue.getLastProcessedIndex();
export const setLastProcessedIndex = (idx) => JobQueue.setLastProcessedIndex(idx);
export const incrementLastProcessedIndex = () => JobQueue.incrementLastProcessedIndex();
