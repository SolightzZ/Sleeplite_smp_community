const tag = "bright";
const effect = "night_vision";

export const hasBright = (player) => player.hasTag(tag);

const apply = (player) => {
  if (player.hasTag(tag)) return false;

  player.addTag(tag);
  player.addEffect(effect, 20 * 60 * 20, {
    amplifier: 0,
    showParticles: false,
  });

  return true;
};

const remove = (player) => {
  if (!player.hasTag(tag)) return false;

  player.removeTag(tag);

  if (player.getEffect(effect)) {
    player.removeEffect(effect);
  }

  return true;
};

const toggleBright = (player) => {
  return player.hasTag(tag) ? !remove(player) : apply(player);
};

const resetBright = (player) => {
  if (!player || !player.hasTag(tag)) return;
  remove(player);
};

export { toggleBright, resetBright };
