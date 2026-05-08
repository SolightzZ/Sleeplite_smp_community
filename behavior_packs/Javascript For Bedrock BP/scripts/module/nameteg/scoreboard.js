import { world } from "@minecraft/server";
export function getObjective(name) {
  try {
    return world.scoreboard.getObjective(name);
  } catch {
    return null;
  }
}
export function ensureObjective(name) {
  let objective = getObjective(name);
  if (!objective) {
    objective = world.scoreboard.addObjective(name, name);
  }
  return objective;
}
export function getScore(player, objectiveName) {
  try {
    const objective = ensureObjective(objectiveName);
    return objective.getScore(player.scoreboardIdentity) ?? 0;
  } catch {
    return 0;
  }
}
export function addScore(player, objectiveName, amount = 1) {
  const objective = ensureObjective(objectiveName);
  objective.setScore(player, getScore(player, objectiveName) + amount);
}
