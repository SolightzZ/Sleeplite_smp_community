// ==========================
// Core / System
// ==========================
import './router/core/index.js';
import './router/Startup.js';
import './router/System.RunInterval.js';

// ==========================
// World Events
// ==========================
import './router/Explosion.js';

// ==========================
// Player Lifecycle
// ==========================
import './router/PlayerJoin.js';
import './router/PlayerLeave.js';
import './router/PlayerSpawn.js';
import './router/PlayerDimensionChange.js';

// ==========================
// Player Interaction
// ==========================
import './router/ChatSend.js';
import './router/ItemUse.js';
import './router/PlayerInteractWithBlock.js';
import './router/PlayerInteractWithEntity.js';

// ==========================
// Block Events
// ==========================
import './router/PlayerPlaceBlock.js';
import './router/PlayerBreakBlock.js';

// ==========================
// Entity Lifecycle
// ==========================
import './router/EntitySpawn.js';
import './router/EntityDie.js';
import './router/EntityHurt.js';

// import { world, system } from '@minecraft/server';

// const DIMENSIONS = ['overworld', 'nether', 'the_end'];

// system.runInterval(() => {
//    const players = world.getPlayers();
//    const typeMap = {};

//    for (const dimId of DIMENSIONS) {
//       try {
//          const dim = world.getDimension(dimId);
//          const entities = dim.getEntities();
//          for (const e of entities) {
//             const id = e.typeId;
//             typeMap[id] = (typeMap[id] || 0) + 1;
//          }
//       } catch (e) {
//          console.warn(`[${dimId}] error:`, e);
//       }
//    }

//    const entries = Object.entries(typeMap)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 10);
//    const text = entries.map(([id, c]) => `${c}: ${id.replace('minecraft:', '')}`).join('\n');

//    for (let i = 0; i < players.length; i++) {
//       const player = players[i];
//       if (!player.isValid) continue;
//       player.onScreenDisplay.setActionBar(text || 'No entities found');
//    }
// }, 5);
