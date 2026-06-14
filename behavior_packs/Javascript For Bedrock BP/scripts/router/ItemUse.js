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
import { router } from './core/index.js';

const itemHandlersMap = {
    'minecraft:compass': setting_main,
    'addon:protection': onItemUse,
    'addon:trade': RewarditemUse,
    'addon:emote': showMenuEmote,
    'minecraft:paper': showMenuReport,
    'minecraft:command_block': chatRankItemUse,
    'minecraft:sponge': handleSpongeAbsorption,
};

router.on('afterItemUse', (event) => {
    const stack = event.itemStack;
    if (!stack) return;

    // 1. Direct O(1) matching for standard item types
    const handler = itemHandlersMap[stack.typeId];
    if (handler) {
        handler(event);
        return;
    }

    // 2. Prefix matching for dynamic items (e.g. magnets, job items)
    if (stack.typeId.startsWith('addon:magnet_')) {
        onMagnetUse(event);
    } else if (stack.typeId.startsWith('addon:fullbright_')) {
        FullBrightUseItem(event);
    } else if (stack.typeId.startsWith('addon:job')) {
        onJobItemUse(event);
    }
});
