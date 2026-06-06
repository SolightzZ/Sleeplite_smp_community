export const validatePlayerForSit = (player) => {
    if (!player || !player.isValid) return false;

    const v = player.getVelocity();
    if (Math.hypot(v.x, v.z) > 0.01) {
        player.onScreenDisplay.setActionBar('§cStand still!');
        return false;
    }

    if (!player.isOnGround) {
        player.onScreenDisplay.setActionBar('§cMust be on ground!');
        return false;
    }

    if (player.isCrawling) {
        player.onScreenDisplay.setActionBar('§cCannot sit while crawling!');
        return false;
    }

    if (player.isSwimming) {
        player.onScreenDisplay.setActionBar('§cCannot sit while swimming!');
        return false;
    }

    return true;
};
