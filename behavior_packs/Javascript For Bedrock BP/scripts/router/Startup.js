import { system } from '@minecraft/server';
import { RegisterDurability, RegisterHelp } from '../plugin/help/help.js';
import { registerCommandAFK } from '../module/AFKCinematic/commands/afk-command.js';
import { registerCommands } from '../module/customCommands/Register.js';
import { registerSortCommands } from '../module/inventorySorter/commands/sort-command.js';
import { RegisterNetherCalc } from '../plugin/nether.js';
import { zoneDatabase } from '../module/protection/core/database.js';
import { RegisterRewards } from '../module/rewards/system.js';
import { registerCustomCommandTakeASeat } from '../module/simpleSit/commands/sit-command.js';
import { initCleanup } from '../module/simpleSit/core/cleanup.js';
import { ZoomCommand } from '../module/zoom/Command.js';
import { runEventHandlers } from './core/utils.js';
import { logError } from './core/logger.js';

// โหลดข้อมูลโซนและล้างขยะตอนเริ่มเกม
system.run(() => {
    zoneDatabase.load();
});
initCleanup();

// รายการฟังก์ชันที่ต้องลงทะเบียนคำสั่งตอนเกมเริ่ม
const startupHandlers = [
    registerCommands,              // addon:server
    registerCommandAFK,            // addon:afk
    registerSortCommands,          // addon:c, addon:r
    registerCustomCommandTakeASeat,// addon:sit
    RegisterRewards,               // addon:rw
    RegisterHelp,                  // addon:help
    RegisterDurability,            // addon:d
    RegisterNetherCalc,            // addon:xz
    ZoomCommand,                   // addon:zoom
];

system.beforeEvents.startup.subscribe((event) => {
    try {
        runEventHandlers('Startup', startupHandlers, event);
    } catch (error) {
        logError('Startup', 'register error', error);
    }
});
