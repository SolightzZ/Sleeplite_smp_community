import { handlePlayerDimensionChange } from '../module/biometype/system.js';
import { router } from './core/index.js';

router.on('afterPlayerDimensionChange', handlePlayerDimensionChange);
