export const moduleTag = 'Job';
export const vanillaPrefix = 'minecraft:';

export const diamondId = 'minecraft:diamond';

export const maxPlayerJobs = 5;
export const maxJobItems = 5;
export const maxItemAmount = 420;
export const maxDiamondReward = 64;

export const jobDurationTicks = 20 * 60 * 20;

export const storageKeys = {
   JOBS: 'jobs_data_jobs',
   JOB_ID: 'jobs_data_jobId',
   RIDER_MAP: 'jobs_data_riderMap',
   TIMERS: 'jobs_data_timers',
   PENDING: 'jobs_data_pending',
   NOTIFY: 'jobs_data_notify',
};

export const sounds = {
   fizz: 'random.fizz',
   orb: 'random.orb',
   vaultDeactivate: 'vault.deactivate',
   fireworkTwinkle: 'firework.twinkle',
   chestClosed: 'random.chestclosed',
   chestOpen: 'random.chestopen',
   falsePermissions: 'block.false_permissions',
   stonecutterResult: 'ui.stonecutter.take_result',
   barrelClose: 'block.barrel.close',
   anvilUse: 'random.anvil_use',
   bookPageTurn: 'item.book.page_turn',
   villagerIdle: 'mob.villager.idle',
   barrelOpen: 'block.barrel.open',
   ejectItem: 'trial_spawner.eject_item',
};

export const icons = {
   confirm: 'textures/ui/confirm',
   cancel: 'textures/ui/cancel',
   none: 'textures/ui/icon_none',
   debug: 'textures/ui/debug_glyph_color',
   mashup: 'textures/ui/MashupIcon',
   muteOff: 'textures/ui/mute_off',
   muteOn: 'textures/ui/mute_on',
   myContent: 'textures/ui/sidebar_icons/my_content',
   friends: 'textures/ui/FriendsDiversity',
   envelope: 'textures/ui/Envelope',
   howToPlay: 'textures/ui/how_to_play_button_default_light',
   gift: 'textures/ui/promo_gift_small_yellow',
   deals: 'textures/ui/icon_deals',
   newConfirm: 'textures/ui/New_confirm_Hover',
};

export const getIconForItem = (typeId) => {
   const id = typeId.startsWith(vanillaPrefix) ? typeId.slice(vanillaPrefix.length) : typeId.split(':')[1] ?? typeId;
   return `textures/items/${id}`;
};

export const stripPrefix = (typeId) => typeId.replace(vanillaPrefix, '');
