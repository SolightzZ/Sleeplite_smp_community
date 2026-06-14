import { helpmain } from '../help/help.js';
import { xz_main } from '../plugin/nether.js';
import { RewardchatSend } from '../module/rewards/system.js';
import { onChat } from '../module/protection/core/events.js';
import { router } from './core/index.js';

router.on('beforeChatSend', helpmain);
router.on('beforeChatSend', xz_main);
router.on('beforeChatSend', RewardchatSend);
router.on('beforeChatSend', onChat);
