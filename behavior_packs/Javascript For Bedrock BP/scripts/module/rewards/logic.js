import { ActionFormData, MessageFormData } from '@minecraft/server-ui';

import { addSound } from '../../plugin/utils.js';
import { logError } from '../../router/core/logger.js';
import { list } from './constants.js';
import { load, save } from './database.js';
import { give, name, time } from './functions.js';

const logFormError = (source, error) => {
   logError('rewards', source, error);
};

function menu(player) {
   const today = time();
   const data = load(player);

   if (data.count >= list.length) {
      player.sendMessage('§a[/] คุณได้รับของรางวัลครบทุกวันแล้ว!');
      return;
   }

   const form = new ActionFormData();
   form.title('Daily Reward | ล็อกอินรายวัน');
   form.body(`              Date: ${today}\n                Claimed: ${data.count} Days`);
   form.divider();
   list.forEach((item, i) => {
      const isPast = i < data.count;
      const isTarget = i === data.count;
      const isClaimedToday = data.last === today;

      let buttonText = '';
      let icon = '';

      if (isPast) {
         buttonText = `Day ${item.day}: ${name(item.id)}`;
         icon = 'textures/ui/worldsIcon.png';
      } else if (isTarget) {
         if (isClaimedToday) {
            buttonText = `Day ${item.day}: Come back tomorrow`;
            icon = 'textures/ui/world_glyph_desaturated.png';
         } else {
            buttonText = `Day ${item.day}: ${name(item.id)} (Click!)`;
            icon = 'textures/ui/csbChevronArrowLarge.png';
         }
      } else {
         buttonText = `§8Day ${item.day}: Locked`;
         icon = 'textures/ui/world_glyph_desaturated.png';
      }

      form.button(buttonText, icon);
   });

   form.label('               @Sleeplite 2026');

   addSound(player, 'vault.open_shutter');

   form
      .show(player)
      .then((res) => {
         if (!player.isValid || res.canceled) return;

         if (res.selection !== data.count) {
            addSound(player, 'random.break');
            player.onScreenDisplay.setTitle('§cกรุณารับของตามลำดับ');
            return;
         }

         if (data.last === today) {
            addSound(player, 'random.fizz');
            player.onScreenDisplay.setTitle('§cคุณรับของวันนี้ไปแล้ว');
            return;
         }

         confirm(player, data, today);
      })
      .catch((error) => logFormError('menu', error));
}

export { menu };

function confirm(player, data, today) {
   const item = list[data.count];
   const bodyText = [
      `§7==========================`,
      ` §fPlayer: §e${player.name}`,
      ` §fDate: §e${today}`,
      `§7--------------------------`,
      ``,
      ` §fYou will receive:`,
      ` §6➤ ${name(item.id)} x${item.count}`,
      ``,
      `§7--------------------------`,
      `§8(Click Claim to accept)`,
   ].join('\n');
   const ui = new MessageFormData();
   ui.title('Confirm');
   ui.body(bodyText);
   ui.button1('Cancel');
   ui.button2('Claim');

   addSound(player, 'random.pop2');

   ui.show(player)
      .then((res) => {
         if (!player.isValid) return;

         if (res.selection === 1) {
            if (give(player, item.id, item.count)) {
               data.last = today;
               data.count = data.count + 1;

               save(player, data);
               addSound(player, 'random.levelup');
               player.sendMessage(`§a[/] §aรับของสำเร็จ! ได้รับ ${name(item.id)}`);
               player.onScreenDisplay.setTitle(`§a${name(item.id)} x${item.count}`);
            } else {
               addSound(player, 'block.false_permissions');
               player.sendMessage('§c[x] §cช่องเก็บของเต็ม');
               player.onScreenDisplay.setTitle('§cช่องเก็บของเต็ม');
            }
         }
      })
      .catch((error) => logFormError('confirm', error));
}
