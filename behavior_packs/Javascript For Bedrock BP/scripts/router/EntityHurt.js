import { onEntityHurt } from '../module/protection/core/events.js';
import { router } from '../events/index.js';

router.on('beforeEntityHurt', (event) => {
   if (event.hurtEntity?.typeId !== 'minecraft:player') return;
   onEntityHurt(event);
});
