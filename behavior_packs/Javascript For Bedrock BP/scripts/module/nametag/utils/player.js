export const isValidPlayer = (player) => player?.typeId === 'minecraft:player' && player.isValid;

export const safePlayerOp = (player, operation, defaultValue) => {
    if (!isValidPlayer(player)) return defaultValue;

    try {
        return operation(player);
    } catch (error) {
        console.error(`[Nametag] Player operation failed: ${error.message}`);
        return defaultValue;
    }
};
