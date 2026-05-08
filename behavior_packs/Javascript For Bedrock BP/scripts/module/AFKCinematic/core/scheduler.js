import { system } from "@minecraft/server";
import { playerStates } from "./state";
import { getCameraFrame } from "./camera";

export class CinematicScheduler {
  constructor() {
    this.afkPlayers = new Map();
    this.intervalId = undefined;
  }

  enqueue(playerId, player) {
    this.afkPlayers.set(playerId, player);
    if (this.intervalId === undefined) {
      this.intervalId = system.runInterval(() => this.tick(), 1);
    }
  }

  dequeue(playerId) {
    this.afkPlayers.delete(playerId);
    if (this.afkPlayers.size === 0) this.stop();
  }

  tick() {
    if (this.afkPlayers.size === 0) {
      this.stop();
      return;
    }

    for (const [playerId, player] of this.afkPlayers) {
      if (!player || !player.isValid) {
        this.dequeue(playerId);
        continue;
      }

      const s = playerStates.get(playerId);
      if (!s?.isAfk) {
        this.dequeue(playerId);
        continue;
      }

      const frame = getCameraFrame(player, s);
      const p = frame.position, r = frame.rotation;

      try {
        player.camera.setCamera("minecraft:free", {
          position: p,
          rotation: r,
          easeOptions: { style: "linear", time: 0.05 }
        });
      } catch {
        try {
          player.runCommand(
            `camera @s set minecraft:free pos ${p.x.toFixed(3)} ${p.y.toFixed(3)} ${p.z.toFixed(3)} rot ${r.pitch.toFixed(3)} ${r.yaw.toFixed(3)}`
          );
        } catch { }
      }

      s.shotTicks++;
      const shot = s.sequence[s.sequenceIndex];
      if (s.shotTicks >= shot.duration) {
        s.sequenceIndex = (s.sequenceIndex + 1) % s.sequence.length;
        s.shotTicks = 0;
        s.waveClock = Math.random() * Math.PI * 2;
      }
    }
  }

  stop() {
    if (this.intervalId !== undefined) {
      system.clearRun(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

export const cinematicScheduler = new CinematicScheduler();
