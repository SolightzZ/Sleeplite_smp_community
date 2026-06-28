import { handlePlayerDimensionChange } from '../module/biometype/system.js';
import { router } from '../events/index.js';

router.on('afterPlayerDimensionChange', handlePlayerDimensionChange);
