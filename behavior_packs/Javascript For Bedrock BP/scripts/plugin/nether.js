import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { cache } from '../shared/cache.js';
import { pcheck } from './../shared/player.js';

const DIM_OVERWORLD = 'minecraft:overworld';
const DIM_NETHER = 'minecraft:nether';

const PREFIX = '§7[§l\u00BB§r§7] ';
const MSG_UNSUPPORTED = '§eไม่สามารถคำนวณได้ในมิตินี้';

const sendCalculated = (player, x, z) => {
   if (!pcheck(player)) return;

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

   cache.sendMessage(player, msg);
};

export function RegisterNetherCalc(init) {
   init.customCommandRegistry.registerCommand(
      {
         name: 'addon:xz',
         description: '§7คำนวณพิกัด Overworld ↔ Nether',
         permissionLevel: CommandPermissionLevel.Any,
         cheatsRequired: false,
         optionalParameters: [
            { name: 'x', type: CustomCommandParamType.Float },
            { name: 'z', type: CustomCommandParamType.Float },
         ],
      },
      (origin, x, z) => {
         const player = origin.sourceEntity;
         if (!pcheck(player)) return { status: CustomCommandStatus.Failure, message: '§cใช้ได้เฉพาะผู้เล่น' };

         system.run(() => {
            if (!pcheck(player)) return;
            if (x === undefined || z === undefined) {
               const loc = player.location;
               sendCalculated(player, loc.x, loc.z);
            } else {
               sendCalculated(player, x, z);
            }
         });
         return { status: CustomCommandStatus.Success };
      },
   );
}
