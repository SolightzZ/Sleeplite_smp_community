const tag = 'bright';
const effect = 'night_vision';

export const hasBright = (player) => {
    if (!player || !player.isValid) return false;
    return player.hasTag(tag);
};

const apply = (player) => {
    if (!player || !player.isValid || player.hasTag(tag)) return false;

    player.addTag(tag);
    player.addEffect(effect, 20 * 60 * 20, {
        amplifier: 0,
        showParticles: false,
    });

    return true;
};

const remove = (player) => {
    if (!player || !player.isValid || !player.hasTag(tag)) return false;

    player.removeTag(tag);

    if (player.getEffect(effect)) {
        player.removeEffect(effect);
    }

    return true;
};

export const toggleBright = (player) => {
    if (!player || !player.isValid) return false;
    return player.hasTag(tag) ? !remove(player) : apply(player);
};

export const resetBright = (player) => {
    if (!player || !player.isValid) return;
    if (player.hasTag(tag)) remove(player);
};
