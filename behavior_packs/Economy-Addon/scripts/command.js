import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';

import { logError } from './events/logger.js';
import { showAdminPanel } from './ui/adminPanel.js';
import { showMainMenu } from './ui/menu.js';

function getValidPlayer(origin) {
   const player = origin.sourceEntity;
   if (!player || player.typeId !== 'minecraft:player' || !player.isValid) {
      return null;
   }
   return player;
}

// ดีเลย์การทำงานไป tick ถัดไป (ป้องกันการเรียก UI ในระหว่าง before event)
function execLater(player, fn) {
   system.run(() => {
      if (!player.isValid) return;
      fn(player);
   });
}

export function onCommand(init) {
   try {
      init.customCommandRegistry.registerCommand(
         {
            name: 'addon:shop',
            description: 'เปิดเมนูจัดการร้านค้า/ซื้อของ',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
         },
         (origin) => {
            const player = getValidPlayer(origin);
            if (!player)
               return {
                  status: CustomCommandStatus.Failure,
                  message: 'คำสั่งนี้สามารถใช้ได้เฉพาะผู้เล่นภายในเกมเท่านั้น!',
               };
            execLater(player, showMainMenu);
            return { status: CustomCommandStatus.Success };
         },
      );
   } catch (error) {
      logError('EcoShop', 'Failed to register commands', error);
   }
}

export function onAdminCommand(init) {
   try {
      init.customCommandRegistry.registerCommand(
         {
            name: 'addon:shopadmin',
            description: 'เปิดเมนูสำหรับผู้ดูแลระบบ (Admin)',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
         },
         (origin) => {
            const player = getValidPlayer(origin);
            if (!player)
               return {
                  status: CustomCommandStatus.Failure,
                  message: 'คำสั่งนี้สามารถใช้ได้เฉพาะผู้เล่นภายในเกมเท่านั้น!',
               };
            execLater(player, showAdminPanel);
            return { status: CustomCommandStatus.Success };
         },
      );
   } catch (error) {
      logError('EcoAdmin', 'Failed to register commands', error);
   }
}
