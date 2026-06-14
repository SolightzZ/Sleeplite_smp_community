import { itile_main } from "../plugin/title.js";
import { router } from "./core/index.js";

router.on('afterEntitySpawn', itile_main, { typeId: 'minecraft:ender_dragon' });
router.on('afterEntitySpawn', itile_main, { typeId: 'minecraft:wither' });
