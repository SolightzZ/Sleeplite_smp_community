import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { addSound } from '../../shared/utils.js';
import { emoteList, setting } from './database.js';

function playEmote(player, animName, emoteName) {
   if (!pcheck(player)) return;

   const cmd = `playanimation "${player.name}" animation.${animName} animation.${animName}`;
   system.run(() => {
      if (pcheck(player)) {
         try {
            cache.runCommand(player.dimension, cmd);
         } catch (error) {
            logError('Emote', 'play command failed', error);
         }
      }
   });

   cache.setActionBar(player.onScreenDisplay, `§aEmote: §f${emoteName}`);
   cache.playSound(player, setting.soundClick);
}

function stopEmote(player, animName) {
   if (!pcheck(player)) return;

   const cmd = `playanimation "${player.name}" animation.${animName}`;
   system.run(() => {
      if (pcheck(player)) {
         try {
            cache.runCommand(player.dimension, cmd);
         } catch (error) {
            logError('Emote', 'stop command failed', error);
         }
      }
   });

   cache.setActionBar(player.onScreenDisplay, '§cEmote: §fSTOPPED');
   cache.playSound(player, setting.soundClick);
}

function openSubMenu(player, group) {
   if (!pcheck(player)) return;

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
               if (pcheck(player)) playEmote(player, selected.anim, selected.name);
            });
         }
      })
      .catch((error) => logError('Emote', 'OpenSubMenu UI Error', error));
}

export function showMenuEmote(event) {
   const player = event.source;
   if (!pcheck(player)) return;

   const form = new ActionFormData().title('Emote Packs | รวมท่าทาง');
   form.body('                     §7เลือกท่าทาง:');
   form.divider();
   for (const group of emoteList) {
      form.button(group.name, group.icon || setting.iconDefault);
   }

   form.label('               @Sleeplite 2026');

   if (setting.soundOpen) {
      addSound(player, setting.soundOpen);
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
            if (!pcheck(player)) return;
            if (selected.type === 'BUTTON') {
               stopEmote(player, selected.cmd);
            } else if (selected.type === 'GROUP') {
               openSubMenu(player, selected);
            }
         });
      })
      .catch((error) => logError('Emote', 'ShowMain UI Error', error));
}
