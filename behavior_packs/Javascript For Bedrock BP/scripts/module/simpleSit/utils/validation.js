export const validatePlayerForSit = (player) => {
  const velocity = player.getVelocity();
  if (Math.hypot(velocity.x, velocity.z) > 0.01) {
    player.onScreenDisplay.setActionBar("§cYou must be standing still to sit!");
    return false;
  }
  if (!player.isOnGround) {
    player.onScreenDisplay.setActionBar("§cYou must be on the ground to sit!");
    return false;
  }
  if (player.isCrawling) {
    player.onScreenDisplay.setActionBar("§cYou cannot sit while crawling!");
    return false;
  }
  if (player.isSwimming) {
    player.onScreenDisplay.setActionBar("§cYou cannot sit while swimming!");
    return false;
  }
  return true;
};
