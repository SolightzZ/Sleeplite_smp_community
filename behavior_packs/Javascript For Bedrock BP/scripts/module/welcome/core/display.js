import { cache } from '../../../shared/cache.js';
import { CFG, buildSubtitle } from '../config.js';
import { formatThaiDate } from '../../../shared/datetime.js';
import { addSound } from '../../../shared/utils.js';
import { PlayerTimeStorage } from '../../playerTime/PlayerTimeStorage.js';
import { formatPlayTime } from '../../playerTime/PlayerTimeUtils.js';

export const showWelcome = (player, deaths, dayNumber) => {
   cache.sendMessage(player, `${CFG.head}\n§7 Name: ${player.name}\n Deaths: ${deaths}\n Day: ${dayNumber}\n Play Time: ${formatPlayTime(PlayerTimeStorage.getPlayTime(player))}\n Date: ${formatThaiDate('dd/mm/yyyy HH:nn:ss', new Date())}`);
   cache.setTitle(player.onScreenDisplay, player.name, {
      fadeInDuration: CFG.title.fadeInDuration,
      fadeOutDuration: CFG.title.fadeOutDuration,
      stayDuration: CFG.title.stayDuration,
      subtitle: buildSubtitle(deaths),
   });
    addSound(player, CFG.welcomeSound.name, { pitch: CFG.welcomeSound.pitch, volume: CFG.welcomeSound.volume });
};
