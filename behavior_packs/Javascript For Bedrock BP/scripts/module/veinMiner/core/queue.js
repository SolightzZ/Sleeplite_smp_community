import { JobQueue } from '../../../shared/jobQueue.js';

export const getJobQueueLength = () => JobQueue.getJobQueueLength();
export const getJob = (idx) => JobQueue.getJob(idx);
export const pushJob = (job) => JobQueue.pushJob(job);
export const popJob = (idx) => JobQueue.popJob(idx);
export const getLastProcessedIndex = () => JobQueue.getLastProcessedIndex();
export const setLastProcessedIndex = (idx) => JobQueue.setLastProcessedIndex(idx);
export const incrementLastProcessedIndex = () => JobQueue.incrementLastProcessedIndex();
