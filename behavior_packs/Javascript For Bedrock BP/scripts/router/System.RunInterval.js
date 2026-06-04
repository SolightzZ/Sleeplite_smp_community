import { system } from '@minecraft/server';
import { handleIdlePoller } from '../module/AFKCinematic/core/poller.js';
import { FlashlightRunInterval } from '../module/flashlight/core/engine.js';

system.runInterval(FlashlightRunInterval, 2);

system.runInterval(handleIdlePoller, 20);
