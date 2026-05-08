import { SEAT_NEAR_RADIUS } from "../config.js";
import { SEAT_ENTITY_ID } from "../constants.js";
import { isBreathableBlock } from "../utils/block.js";
import { weirdoToRotation } from "../utils/rotation.js";
import { validatePlayerForSit } from "../utils/validation.js";
import { spawnSeat } from "./seat-manager.js";

export function handleSitCommand(player) {
  if (!validatePlayerForSit(player)) return;

  const dimension = player.dimension;
  const { x: px, y: py, z: pz } = player.location;

  const underLocation = {
    x: Math.floor(px),
    y: Math.floor(py - 0.1),
    z: Math.floor(pz),
  };

  let underBlock;
  try {
    underBlock = dimension.getBlock(underLocation);
  } catch {
    return;
  }

  const isSlab = underBlock?.typeId.includes("slab");
  const isStairs = underBlock?.typeId.includes("stairs");
  const isUnderStairOrSlab = underBlock && (isSlab || isStairs);

  let useSpecialSit = false;
  let specialSpawnY = py - 1;
  let specialRotation = { x: 0, y: player.getRotation().y };

  if (isUnderStairOrSlab) {
    const blockStates = underBlock.permutation.getAllStates();
    const verticalHalf = blockStates["minecraft:vertical_half"];
    const upsideDownBit = blockStates["upside_down_bit"];
    const weirdoDirection = isStairs ? blockStates["weirdo_direction"] : null;

    const isFlipped = (isSlab && verticalHalf === "top") || (isStairs && upsideDownBit === true);

    if (!isFlipped) {
      useSpecialSit = true;
      specialSpawnY = underBlock.location.y;
      if (isStairs) {
        specialRotation = weirdoToRotation(weirdoDirection);
      }
    }
  }

  const headCheckY = useSpecialSit ? Math.floor(specialSpawnY) + 1 : Math.floor(py - 0.1) + 1;
  let blockAboveHead;
  try {
    blockAboveHead = dimension.getBlock({ x: Math.floor(px), y: headCheckY, z: Math.floor(pz) });
  } catch {
    return;
  }

  if (!blockAboveHead || !isBreathableBlock(blockAboveHead.typeId)) {
    player.onScreenDisplay.setActionBar("§7Not enough headroom to sit!");
    return;
  }

  const nearbySeat = dimension.getEntities({
    type: SEAT_ENTITY_ID,
    location: player.location,
    maxDistance: SEAT_NEAR_RADIUS,
  });
  if (nearbySeat.length > 0) return;

  const spawnLocation = {
    x: Math.floor(px) + 0.5,
    y: useSpecialSit ? specialSpawnY : py - 0.5,
    z: Math.floor(pz) + 0.5,
  };
  const rotation = useSpecialSit ? specialRotation : { x: 0, y: player.getRotation().y };

  spawnSeat(dimension, spawnLocation, rotation, player, undefined);
}
