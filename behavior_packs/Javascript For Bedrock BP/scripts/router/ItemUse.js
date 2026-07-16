import { router } from '../events/index.js';
import { logError } from '../events/logger.js';
import { openBanMenu } from '../module/banPlayers/ui/menu.js';
import { showCamMenu } from '../module/cam/ui.js';
import { showMenuEmote } from '../module/emotes/functions.js';
import { FullBrightUseItem } from '../module/fullBright/events.js';
import { onJobItemUse } from '../module/jobs/Job.js';
import { onMagnetUse } from '../module/magNet/core/events.js';
import { chatRankItemUse } from '../module/nametag/events.js';
import { onItemUse } from '../module/protection/core/events.js';
import { showMenuReport } from '../module/report/ui/main-menu.js';
import { RewarditemUse } from '../module/rewards/system.js';
import { setting_main } from '../plugin/setting.js';
import { handleSpongeAbsorption } from '../plugin/SpongeAbsorption.js';

const itemHandlers = [
   { prefix: 'addon:magnet_', run: onMagnetUse },
   { prefix: 'addon:fullbright_', run: FullBrightUseItem },
   { prefix: 'addon:job', run: onJobItemUse },
   { prefix: 'addon:setting', run: setting_main },
   { prefix: 'addon:protection', run: onItemUse },
   { prefix: 'addon:trade', run: RewarditemUse },
   { prefix: 'addon:emote', run: showMenuEmote },
   { prefix: 'addon:report', run: showMenuReport },
   { prefix: 'addon:admin', run: chatRankItemUse },
   { prefix: 'minecraft:sponge', run: handleSpongeAbsorption },
   { prefix: 'addon:cam', run: showCamMenu },
   { prefix: 'minecraft:barrier', run: openBanMenu },
];

router.on('afterItemUse', (event) => {
   const stack = event.itemStack;
   if (!stack) return;

   for (let i = 0; i < itemHandlers.length; i++) {
      const { prefix, run } = itemHandlers[i];
      if (stack.typeId.startsWith(prefix)) {
         try {
            run(event);
         } catch (error) {
            logError('ItemUse', `${prefix} handler error`, error);
         }
         return;
      }
   }
});
