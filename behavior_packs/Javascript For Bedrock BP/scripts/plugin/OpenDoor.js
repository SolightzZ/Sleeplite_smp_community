const dirs = [
  (b) => b.east(),
  (b) => b.west(),
  (b) => b.north(),
  (b) => b.south(),
];

export const openDoor = (ev) => {
  try {
    const block = ev.block;
    const typeId = block.typeId;

    if (!typeId.endsWith("_door") || typeId.includes("trap")) return;

    const perm = block.permutation;
    const dir = perm.getState("minecraft:cardinal_direction");
    const open = perm.getState("open_bit");

    for (let i = 0; i < 4; i++) {
      const door = dirs[i](block);
      const t = door.typeId;

      if (!t.endsWith("_door") || t.includes("trap")) continue;

      const p = door.permutation;
      if (p.getState("minecraft:cardinal_direction") !== dir) continue;

      door.setPermutation(p.withState("open_bit", open));
    }
  } catch (e) {
    console.error("[ OpenDoor ]  openDoor: ", e.message);
  }
};
