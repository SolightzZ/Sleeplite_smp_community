import { CommandPermissionLevel, CustomCommandStatus, system } from '@minecraft/server';
import { logError } from '../../../events/logger.js';
import { cache } from '../../../shared/cache.js';
import { pcheck } from '../../../shared/player.js';
import { PlayerTimeStorage } from '../PlayerTimeStorage.js';
import { formatPlayTime } from '../PlayerTimeUtils.js';

const TOP_LIMIT = 10;
const MEDALS = ['§e#1', '§7#2', '§6#3'];

const cmdPlayTimeLeaderboard = (origin) => {
   const player = origin.sourceEntity;
   if (!pcheck(player)) return { status: CustomCommandStatus.Failure };

   system.run(() => {
      try {
         if (!pcheck(player)) return;

         const rows = cache
            .getAllPlayers()
            .filter(pcheck)
            .map((p) => ({ name: p.name, ms: PlayerTimeStorage.getPlayTime(p) }))
            .sort((a, b) => b.ms - a.ms);

         const lines = rows.slice(0, TOP_LIMIT).map((row, i) => {
            const rank = MEDALS[i] ?? `§f#${i + 1}`;
            return `${rank} §f${row.name} §7- §b${formatPlayTime(row.ms)}`;
         });

         if (lines.length === 0) {
            cache.sendMessage(player, '§e[+] No player data yet');
            return;
         }

         const own = rows.find((row) => row.name === player.name);
         if (own && rows.indexOf(own) >= TOP_LIMIT) {
            lines.push(`§7...\n§fYou: §b${formatPlayTime(own.ms)} (rank #${rows.indexOf(own) + 1})`);
         }

         cache.sendMessage(player, `§e[+] Top ${Math.min(lines.length, TOP_LIMIT)} Play Time\n§7${lines.join('\n')}`);
      } catch (error) {
         logError('playerTime', 'cmdPlayTimeLeaderboard', error);
      }
   });

   return { status: CustomCommandStatus.Success };
};

export function registerPlayTimeCommand(init) {
   try {
      init.customCommandRegistry.registerCommand(
         {
            name: 'addon:playtime',
            description: 'Top players by play time',
            permissionLevel: CommandPermissionLevel.Any,
            cheatsRequired: false,
         },
         cmdPlayTimeLeaderboard,
      );
   } catch (error) {
      logError('playerTime', 'registerPlayTimeCommand', error);
   }
}
