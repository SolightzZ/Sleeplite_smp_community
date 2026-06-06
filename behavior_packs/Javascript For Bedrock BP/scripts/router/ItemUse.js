import { world } from '@minecraft/server';
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
    ['minecraft:compass', setting_main],
    ['addon:protection', onItemUse],
    ['addon:trade', RewarditemUse],
    ['addon:emote', showMenuEmote],
    ['minecraft:paper', showMenuReport],
    ['minecraft:command_block', chatRankItemUse],
    ['addon:magnet_', onMagnetUse],
    ['addon:fullbright_', FullBrightUseItem],
    ['addon:job', onJobItemUse],
    ['minecraft:sponge', handleSpongeAbsorption],
];

world.afterEvents.itemUse.subscribe((ev) => {
    try {
        const player = ev.source;
        const stack = ev.itemStack;
        if (!player || !player.isValid || !stack) return;

        for (const [id, handler] of itemHandlers) {
            if (stack.typeId.startsWith(id)) {
                handler(ev);
                return;
            }
        }
    } catch (error) {
        console.error('[ ItemUse ] item_use', error.message);
    }
});
