const activeUsers = new Set();
let runId = null;

export const addMagnetUser = (player) => activeUsers.add(player.id);
export const removeMagnetUser = (id) => activeUsers.delete(id);
export const hasMagnetUser = (id) => activeUsers.has(id);
export const countMagnetUsers = () => activeUsers.size;
export const getMagnetUserIds = () => activeUsers;

export const setMagnetRunId = (id) => (runId = id);
export const clearMagnetRunId = () => (runId = null);
export const hasMagnetRunId = () => runId !== null;
export const getMagnetRunId = () => runId;
