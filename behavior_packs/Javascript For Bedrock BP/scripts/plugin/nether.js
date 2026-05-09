import { system } from "@minecraft/server";

const DIM_OVERWORLD = "minecraft:overworld";
const DIM_NETHER = "minecraft:nether";

const PREFIX = "§7[§l\u00BB§r§7] ";
const MSG_INVALID = "§c[x] กรุณาป้อนพิกัดเป็นตัวเลขที่ถูกต้อง";
const MSG_USAGE = "§c[?] ใช้งาน: !xz หรือ !xz <x> <z> ตัวอย่าง: !xz 200 200";
const MSG_UNSUPPORTED = "§eไม่สามารถคำนวณได้ในมิตินี้";

const sendCalculated = (player, x, z) => {
  if (!player.isValid) return;

  const dimId = player.dimension.id;
  const rx = Math.round(x);
  const rz = Math.round(z);

  let msg;
  if (dimId === DIM_OVERWORLD) {
    const nx = Math.floor(x * 0.125);
    const nz = Math.floor(z * 0.125);
    msg = `${PREFIX}§aOverworld: <x${rx}> <z${rz}> §cNether: <x${nx}> <z${nz}>`;
  } else if (dimId === DIM_NETHER) {
    const ox = Math.floor(x * 8);
    const oz = Math.floor(z * 8);
    msg = `${PREFIX}§cNether: X=${rx}, Z=${rz} §aOverworld: X=${ox}, Z=${oz}`;
  } else {
    msg = MSG_UNSUPPORTED;
  }

  player.sendMessage(msg);
};

export const xz_main = (ev) => {
  const raw = ev.message;
  if (raw.charCodeAt(0) !== 33 || !raw.startsWith("!xz")) return;

  const player = ev.sender;
  if (!player || !player.isValid) return;

  ev.cancel = true;

  const trimmed = raw.trim();
  const sp1 = trimmed.indexOf(" ");

  if (sp1 === -1) {
    const loc = player.location;
    system.run(() => sendCalculated(player, loc.x, loc.z));
    return;
  }

  const sp2 = trimmed.indexOf(" ", sp1 + 1);
  if (sp2 === -1) {
    player.sendMessage(MSG_USAGE);
    return;
  }

  const argX = parseFloat(trimmed.slice(sp1 + 1, sp2));
  const argZ = parseFloat(trimmed.slice(sp2 + 1));

  if (isNaN(argX) || isNaN(argZ)) {
    player.sendMessage(MSG_INVALID);
    return;
  }

  system.run(() => sendCalculated(player, argX, argZ));
};
