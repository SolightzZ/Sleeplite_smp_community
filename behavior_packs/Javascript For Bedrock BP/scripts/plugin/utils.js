export function addSound(player, soundId, soundOptions) {
   const loc = player.location;
   const dir = player.getViewDirection();
   const front = { x: loc.x + dir.x, y: loc.y + dir.y, z: loc.z + dir.z };
   player.dimension.playSound(soundId, front, soundOptions);
}
