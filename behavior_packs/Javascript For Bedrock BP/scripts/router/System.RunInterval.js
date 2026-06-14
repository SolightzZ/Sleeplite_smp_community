import { handleIdlePoller } from '../module/AFKCinematic/core/poller.js';
import { FlashlightRunInterval } from '../module/flashlight/core/engine.js';
import { Interval } from './core/interval.js';

Interval.register(FlashlightRunInterval, 2);
Interval.register(handleIdlePoller, 20);
