const activeUsers = new Set();

export const addMagnetUser = (player) => activeUsers.add(player.id);
export const removeMagnetUser = (id) => activeUsers.delete(id);
export const hasMagnetUser = (id) => activeUsers.has(id);
export const countMagnetUsers = () => activeUsers.size;
export const getMagnetUserIds = () => activeUsers;
