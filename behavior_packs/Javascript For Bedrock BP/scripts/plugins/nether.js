import { system } from "@minecraft/server";

const TO_NETHER_FACTOR = 1 / 8;
const TO_OVERWORLD_FACTOR = 8;

const toNether = (x, z) => ({
  x: Math.floor(x * TO_NETHER_FACTOR),
  z: Math.floor(z * TO_NETHER_FACTOR),
});

const toOverworld = (x, z) => ({
  x: Math.floor(x * TO_OVERWORLD_FACTOR),
  z: Math.floor(z * TO_OVERWORLD_FACTOR),
});

const calculate = (player, x, z) => {
  const dimensionId = player.dimension.id;

  const roundedX = Math.round(x);
  const roundedZ = Math.round(z);

  const { x: nx, z: nz } = toNether(x, z);
  const { x: ox, z: oz } = toOverworld(x, z);

  let message;
  if (dimensionId === "minecraft:overworld") {
    message = `§7[§l\u00BB§r§7] §aOverworld: <x${roundedX}> <z${roundedZ}> §cNether: <x${nx}> <z${nz}>`;
  } else if (dimensionId === "minecraft:nether") {
    message = `§7[§l\u00BB§r§7] §cNether: X=${roundedX}, Z=${roundedZ} §aOverworld: X=${ox}, Z=${oz}`;
  } else {
    message = "§eไม่สามารถคำนวณได้ในมิตินี้";
  }

  player.sendMessage(message);
};

export function xz_main(event) {
  const { sender: player, message } = event;
  const trimmedMessage = message.trim().toLowerCase();

  if (!trimmedMessage.startsWith("!xz")) return;

  event.cancel = true;
  const args = trimmedMessage.split(/\s+/);

  let x, z;

  if (args.length === 1) {
    const loc = player.location;
    x = loc.x;
    z = loc.z;
  } else if (args.length === 3) {
    const parsedX = parseFloat(args[1]);
    const parsedZ = parseFloat(args[2]);

    if (isNaN(parsedX) || isNaN(parsedZ)) {
      player.sendMessage("§c[x] กรุณาป้อนพิกัดเป็นตัวเลขที่ถูกต้อง");
      return;
    }
    x = parsedX;
    z = parsedZ;
  } else {
    player.sendMessage("§c[?] ใช้งาน: !xz หรือ !xz <x> <z> ตัวอย่าง: !xz 200 200");
    return;
  }

  system.run(() => calculate(player, x, z));
}
