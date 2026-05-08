
const dirs = [
  (b) => b.east(),
  (b) => b.west(),
  (b) => b.north(),
  (b) => b.south(),
];

// Open doors
function openDoor(event) {
  try {
    const block = event.block;
    const typeId = block.typeId;

    if (!typeId.endsWith("_door") || typeId.includes("trap")) return;

    const perm = block.permutation;
    const direction = perm.getState("minecraft:cardinal_direction");
    const open_bit = perm.getState("open_bit");

    for (let i = 0; i < 4; i++) {
      const door = dirs[i](block);
      const t = door.typeId;

      if (!t.endsWith("_door") || t.includes("trap")) continue;

      const p = door.permutation;
      if (p.getState("minecraft:cardinal_direction") !== direction) continue;

      door.setPermutation(p.withState("open_bit", open_bit));
    }
  } catch (error) {
    console.error("openDoor: " + error);
  }
}

export { openDoor };

