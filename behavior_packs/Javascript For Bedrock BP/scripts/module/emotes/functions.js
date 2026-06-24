import { system, world } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';

import { addSound } from '../../plugin/utils.js';
import { logError } from '../../router/core/logger.js';
import { emoteList, setting } from './database.js';

function playEmote(player, animName, emoteName) {
   if (!player.isValid) return;

   const cmd = `playanimation "${player.name}" animation.${animName} animation.${animName}`;
   try {
      system.run(() => {
         if (player.isValid) {
            world.getDimension(player.dimension.id)?.runCommand(cmd);
         }
      });
   } catch (error) {
      logError('Emote', 'play command failed', error);
      return;
   }

   player.onScreenDisplay?.setActionBar(`§aEmote: §f${emoteName}`);
   addSound(player, setting.soundClick);
}

function stopEmote(player, animName) {
   if (!player.isValid) return;

   const cmd = `playanimation "${player.name}" animation.${animName}`;
   try {
      system.run(() => {
         if (player.isValid) {
            world.getDimension(player.dimension.id)?.runCommand(cmd);
         }
      });
   } catch (error) {
      logError('Emote', 'stop command failed', error);
      return;
   }

   player.onScreenDisplay?.setActionBar('§cEmote: §fSTOPPED');
   addSound(player, setting.soundClick);
}

function openSubMenu(player, group) {
   if (!player.isValid) return;

   const title = group.title ? `§e§m§o§t§e§f` + '§r§8' + `${group.title}` : 'Emotes';
   const form = new ActionFormData().title(title).body('§7เลือกท่าทาง:');

   const items = group.items;

   for (const item of items) {
      form.button(item.name, item.icon || setting.iconDefault);
   }

   form
      .show(player)
      .then((result) => {
         if (!result || result.canceled) return;

         const index = result.selection;
         if (index === undefined) return;

         const selected = items[index];
         if (selected) {
            system.run(() => {
               if (player.isValid) playEmote(player, selected.anim, selected.name);
            });
         }
      })
      .catch((error) => logError('Emote', 'OpenSubMenu UI Error', error));
}

export function showMenuEmote(event) {
   const player = event.source;
   if (!player?.isValid) return;

   const form = new ActionFormData().title('Emote Packs | รวมท่าทาง');
   form.body('                     §7เลือกท่าทาง:');
   form.divider();
   for (const group of emoteList) {
      form.button(group.name, group.icon || setting.iconDefault);
   }

   form.label('               @Sleeplite 2026');

   if (setting.soundOpen) {
      player.playSound(setting.soundOpen);
   }

   form
      .show(player)
      .then((result) => {
         if (!result || result.canceled) return;

         const index = result.selection;
         if (index === undefined) return;

         const selected = emoteList[index];
         if (!selected) return;

         system.run(() => {
            if (!player.isValid) return;
            if (selected.type === 'BUTTON') {
               stopEmote(player, selected.cmd);
            } else if (selected.type === 'GROUP') {
               openSubMenu(player, selected);
            }
         });
      })
      .catch((error) => logError('Emote', 'ShowMain UI Error', error));
}
