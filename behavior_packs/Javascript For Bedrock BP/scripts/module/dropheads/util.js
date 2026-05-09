const dimNames = {
  "minecraft:overworld": "Overworld",
  "minecraft:nether": "Nether",
  "minecraft:the_end": "The End",
};

const upperFirst = (str) => {
  if (!str) return "";
  return str[0].toUpperCase() + str.slice(1);
};

export const formatName = (id) => {
  if (!id) return "Unknown";

  return id
    .replace("minecraft:", "")
    .replace(/_/g, " ")
    .split(" ")
    .map(upperFirst)
    .join(" ");
};

export const worldName = (id) => {
  return dimNames[id] || formatName(id);
};

export const posInt = (p) => ({
  x: Math.floor(p.x),
  y: Math.floor(p.y),
  z: Math.floor(p.z),
});

export const getKillerName = (player, dmg) => {
  const src = dmg?.damagingEntity;
  const cause = dmg?.cause;

  if (src?.isValid) {
    if (src.typeId === "minecraft:player") {
      return src.id === player.id ? "Suicide" : src.name;
    }

    return formatName(src.typeId);
  }

  switch (cause) {
    case "suicide":
      return "Suicide";

    case "fall":
      return "Fall Damage";

    case "fire":
    case "fireTick":
      return "Fire";

    case "lava":
      return "Lava";

    case "drowning":
      return "Drowning";

    case "freezing":
      return "Freezing";

    case "starvation":
      return "Starvation";

    case "void":
      return "The Void";

    case "magic":
      return "Magic";

    case "wither":
      return "Wither";

    case "thorns":
      return "Thorns";

    case "projectile":
      return "Projectile";

    case "entityExplosion":
      return "Entity Explosion";

    case "blockExplosion":
      return "Block Explosion";

    case "suffocation":
      return "Suffocation";

    case "contact":
      return "Contact Damage";

    case "anvil":
      return "Anvil";

    case "fallingBlock":
      return "Falling Block";

    case "lightning":
      return "Lightning";

    case "temperature":
      return "Temperature";

    case "override":
      return "Command";

    default:
      return formatName(cause);
  }
};
