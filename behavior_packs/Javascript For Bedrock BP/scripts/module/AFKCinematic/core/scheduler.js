import { system, world } from "@minecraft/server";
import { CONFIG } from "../config.js";
import { playerStates } from "./state.js";
import { getCameraFrame } from "./afk.js";
import { tickBlockCache } from "./block.js";

function safeRun(player, command) {
  const p = player.runCommand(command);
}

export class CinematicScheduler {
  constructor() {
    this._ids = [];
    this._cursor = 0;
    this._playerMap = new Map();
    this.intervalId = undefined;
  }

  get size() {
    return this._ids.length;
  }

  enqueue(playerId) {
    if (!this._ids.includes(playerId)) {
      this._ids.push(playerId);
    }
    if (this.intervalId === undefined) {
      this.intervalId = system.runInterval(() => this.tick(), 1);
    }
  }

  dequeue(playerId) {
    const idx = this._ids.indexOf(playerId);
    if (idx === -1) return;
    this._ids.splice(idx, 1);
    if (this._cursor > idx) this._cursor--;
    if (this._cursor >= this._ids.length) this._cursor = 0;
    if (this._ids.length === 0) this.stop();
  }

  _rebuildPlayerMap() {
    this._playerMap.clear();
    const players = world.getAllPlayers();
    for (let i = 0; i < players.length; i++) {
      this._playerMap.set(players[i].id, players[i]);
    }
  }

  tick() {
    if (this._ids.length === 0) {
      this.stop();
      return;
    }

    tickBlockCache();
    this._rebuildPlayerMap();

    const budget = Math.min(CONFIG.schedulerBudget, this._ids.length);
    const toRemove = [];

    for (let b = 0; b < budget; b++) {
      if (this._ids.length === 0) break;
      if (this._cursor >= this._ids.length) this._cursor = 0;

      const playerId = this._ids[this._cursor++];
      const player = this._playerMap.get(playerId);

      if (!player?.isValid) {
        toRemove.push(playerId);
        continue;
      }

      const s = playerStates.get(playerId);
      if (!s?.isAfk) {
        toRemove.push(playerId);
        continue;
      }

      try {
        const { position: p, rotation: r } = getCameraFrame(player, s);
        safeRun(
          player,
          `camera @s set minecraft:free pos ${p.x.toFixed(3)} ${p.y.toFixed(3)} ${p.z.toFixed(3)} rot ${r.pitch.toFixed(3)} ${r.yaw.toFixed(3)}`,
        );
      } catch {
        toRemove.push(playerId);
        continue;
      }

      s.shotTicks++;
      const shot = s.sequence[s.sequenceIndex];
      if (s.shotTicks >= shot.duration) {
        s.sequenceIndex = (s.sequenceIndex + 1) % s.sequence.length;
        s.shotTicks = 0;
        s.waveClock = Math.random() * Math.PI * 2;
      }
    }

    for (let i = 0; i < toRemove.length; i++) {
      this.dequeue(toRemove[i]);
    }
  }

  stop() {
    if (this.intervalId !== undefined) {
      system.clearRun(this.intervalId);
      this.intervalId = undefined;
    }
    this._ids.length = 0;
    this._cursor = 0;
    this._playerMap.clear();
  }
}
