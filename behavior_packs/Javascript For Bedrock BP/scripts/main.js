// ==========================
// Core / System
// ==========================
import "./router/Startup.js";

// ==========================
// Player Lifecycle
// ==========================
import "./router/PlayerJoin.js";
import "./router/PlayerLeave.js";
import "./router/PlayerSpawn.js";
import "./router/PlayerDimensionChange.js";

// ==========================
// Player Interaction
// ==========================
import "./router/ChatSend.js";
import "./router/ItemUse.js";
import "./router/PlayerInteractWithBlock.js";
import "./router/PlayerInteractWithEntity.js";

// ==========================
// Block Events
// ==========================
import "./router/PlayerPlaceBlock.js";
import "./router/PlayerBreakBlock.js";
import "./router/EntityHitBlock.js";

// ==========================
// Entity Lifecycle
// ==========================
import "./router/EntitySpawn.js";
import "./router/EntityDie.js";

// ==========================
// World Events
// ==========================
import "./router/Explosion.js";
