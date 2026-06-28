export function isAdmin(player) {
   return player.hasTag('admin') || player.hasTag('owner');
}
