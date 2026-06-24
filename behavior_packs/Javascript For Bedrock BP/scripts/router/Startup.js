import { system } from '@minecraft/server';
import { registerCommandAFK } from '../module/AFKCinematic/commands/afk-command.js';
import { registerBanCommands } from '../module/banPlayers/commands/ban-command.js';
import { BanDatabase } from '../module/banPlayers/core/database.js';
import { registerCommands } from '../module/customCommands/Register.js';
import { registerSortCommands } from '../module/inventorySorter/commands/sort-command.js';
import { zoneDatabase } from '../module/protection/core/database.js';
import { RegisterRewards } from '../module/rewards/system.js';
import { registerCustomCommandTakeASeat } from '../module/simpleSit/commands/sit-command.js';
import { initCleanup } from '../module/simpleSit/core/cleanup.js';
import { loadSpawnProtec } from '../module/spawnProtection/core/database.js';
import { ZoomCommand } from '../module/zoom/Command.js';
import { RegisterDurability, RegisterHelp, RegisterRule, RegisterVote, RegisterWebsites } from '../plugin/help/help.js';
import { RegisterNetherCalc } from '../plugin/nether.js';
import { logError } from './core/logger.js';
import { runEventHandlers } from './core/utils.js';
import { RegisterSpawnProtection } from '../module/spawnProtection/command.js';

// โหลดข้อมูลโซนและแบนตอนเริ่มเกม
system.run(() => {
   zoneDatabase.load();
   BanDatabase.load();
   loadSpawnProtec();
});
initCleanup();

// รายการฟังก์ชันที่ต้องลงทะเบียนคำสั่งตอนเกมเริ่ม
const startupHandlers = [
   registerCommands, // addon:server
   registerCommandAFK, // addon:afk
   registerSortCommands, // addon:c, addon:r
   registerCustomCommandTakeASeat, // addon:sit
   RegisterRewards, // addon:rw
   RegisterHelp, // addon:help
   RegisterRule, // addon:rule
   RegisterVote, // addon:vote
   RegisterWebsites, // addon:websites
   RegisterDurability, // addon:d
   RegisterNetherCalc, // addon:xz
   ZoomCommand, // addon:zoom
   RegisterSpawnProtection, // addon:spawnprotec
   registerBanCommands, // addon:ban, addon:unban, addon:kick, addon:banlist
];

system.beforeEvents.startup.subscribe((event) => {
   try {
      runEventHandlers('Startup', startupHandlers, event);
   } catch (error) {
      logError('Startup', 'register error', error);
   }
});
