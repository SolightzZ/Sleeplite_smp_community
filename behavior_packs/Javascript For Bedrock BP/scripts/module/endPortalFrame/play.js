import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { ask, forget } from './brain.js';
import { boss, door, key, shop, team, zone } from './config.js';
import { eat, hit, say, see, sound } from './hand.js';
import { count, fix } from './tools.js';

function showiconstest(player, title, message, icon) {
   const form = new ActionFormData();
   form.title(title);
   form.body(message);

   if (icon) {
      form.button(message, icon);
   } else {
      form.button(message);
   }

   form.button('Close');
   form.label('               @Sleeplite 2026');

   system.run(() => {
      form
         .show(player)
         .then(() => {})
         .catch((error) => logError('EndPortalFrame', 'showiconstest', error));
   });
}

export const touch = (event) => {
   try {
      const player = event.player;
      const block = event.block;
      const item = event.itemStack;

      if (!pcheck(player)) return;
      if (!block || !block.isValid) return;
      if (block.typeId !== door) return;
      if (!item || item.typeId !== key) return;
      if (player.hasTag(boss)) return;
      if (block.permutation.getState('end_portal_eye_bit')) return;

      const friends = count(block);
      if (friends < team) {
         event.cancel = true;
         say(player, `§cNeed more friends! (${friends}/${team}) within ${zone} blocks.`);
         return;
      }

      const gift = ask(block);
      const name = fix(gift.id);

      if (!see(player, gift.id)) {
         event.cancel = true;
         const itemData = shop.find((i) => i.id === gift.id);
         sound(player, 'random.click');
         showiconstest(player, 'Portal Frame', `${name}`, itemData?.icon);
         return;
      }

      eat(player, gift.id);
      hit(player, gift.hp);
      forget(block);
      sound(player, 'block.end_portal_frame.fill');

      cache.sendMessage(player, `§d[Portal Success] §7Used: ${name} | Damage: ${gift.hp}`);
   } catch (error) {
      logError('EndPortalFrame', 'touch', error);
   }
};
