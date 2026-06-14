import { system } from '@minecraft/server';
import { RegisterHelp } from '../help/help.js';
import { registerCommandAFK } from '../module/AFKCinematic/commands/afk-command.js';
import { registerCommands } from '../module/customCommands/Register.js';
import { registerSortCommands } from '../module/inventorySorter/commands/sort-command.js';
import { zoneDatabase } from '../module/protection/core/database.js';
import { RegisterRewards } from '../module/rewards/system.js';
import { registerCustomCommandTakeASeat } from '../module/simpleSit/commands/sit-command.js';
import { initCleanup } from '../module/simpleSit/core/cleanup.js';
import { ZoomCommand } from '../module/zoom/Command.js';
import { runEventHandlers } from './core/utils.js';

system.run(() => {
    zoneDatabase.load();
});
initCleanup();

const startupHandlers = [
    registerCommands,
    registerCommandAFK,
    registerSortCommands,
    registerCustomCommandTakeASeat,
    RegisterRewards,
    RegisterHelp,
    ZoomCommand,
];

system.beforeEvents.startup.subscribe((event) => {
    runEventHandlers('Startup', startupHandlers, event);
});
