import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';
import { openMenuSpawnProtec } from './ui/menu.js';
import { pcheck, pisPlayer } from './../../shared/player.js';

export function RegisterSpawnProtection(init) {
   init.customCommandRegistry.registerCommand(
      {
         name: 'addon:spawnprotec',
         description: '§7Spawn Protection — ตั้งค่าระบบป้องกัน spawn',
         permissionLevel: CommandPermissionLevel.Any,
         cheatsRequired: false,
      },
      (origin) => {
         const player = origin.sourceEntity;
         if (!pisPlayer(player)) {
            return { status: CustomCommandStatus.Failure, message: '§cPlayer only.' };
         }
         system.run(() => {
            if (!pcheck(player)) return;
            openMenuSpawnProtec(player);
         });
         return { status: CustomCommandStatus.Success };
      },
   );
}
