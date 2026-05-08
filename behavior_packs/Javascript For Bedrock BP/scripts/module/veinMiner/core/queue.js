export const state = {
  jobQueue: [],
  pendingBlocks: new Set(),
  playerJobCount: new Map(),
  playerLastJobEnd: new Map(),
  runHandle: null,
  lastProcessedIndex: 0
};

export const popJob = (index) => {
  const last = state.jobQueue.pop();
  if (index < state.jobQueue.length) {
    state.jobQueue[index] = last;
  }
};
