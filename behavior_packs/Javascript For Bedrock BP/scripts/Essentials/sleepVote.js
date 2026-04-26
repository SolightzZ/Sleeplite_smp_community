import { world, system } from "@minecraft/server";
import { Module, moduleManager } from "../mainCore.js";

class SleepVoteModule extends Module {
  constructor() {
    super(
      "Sleep Vote",
      "Allows skipping the night if a percentage of players are sleeping.",
      "Configurable percentage for multiplayer-friendly nights.",
      true,
      "textures/items/bed_red.png",
    );

    this.settings = {
      sleepPercentage: {
        type: "slider",
        label: "Sleep Percentage Required",
        min: 1,
        max: 100,
        step: 1,
        tooltip:
          "The percentage of non-AFK players required to sleep to skip the night.",
      },
    };

    this.sleepPercentage = 50; // Default value: 50%
    this.afkTag = "afk";
    this.lastSleeperCount = 0;
  }

  tick() {
    if (system.currentTick % 20 !== 0) return; // Check every second
    const time = world.getTimeOfDay();
    const overworld = world.getDimension("overworld");
    const isThunder = Weather.get(overworld).id === "Thunder";
    const isNight = time >= 12500 && time <= 23500;

    // Allow sleep vote either at night OR during thunder (even if day)
    if (!isThunder && !isNight) {
      if (this.lastSleeperCount !== 0) {
        this.lastSleeperCount = 0;
      }
      return;
    }

    const eligiblePlayers = world.getPlayers({
      gameModes: ["survival", "adventure"],
    });
    const nonAfkPlayers = eligiblePlayers.filter((p) => !p.hasTag(this.afkTag));

    if (nonAfkPlayers.length === 0) return;

    const sleepingCount = nonAfkPlayers.filter((p) => p.isSleeping).length;

    // console.warn(
    //     `§a[SleepVote] §c${sleepingCount} of ${nonAfkPlayers.length} non-AFK players are sleeping. Required: ${Math.ceil(
    //         nonAfkPlayers.length * (this.sleepPercentage / 100),
    //     )}§r`,
    // );

    if (sleepingCount === this.lastSleeperCount) return;
    this.lastSleeperCount = sleepingCount;

    const requiredCount = Math.ceil(
      nonAfkPlayers.length * (this.sleepPercentage / 100),
    );

    if (sleepingCount >= requiredCount) {
      system.runTimeout(() => {
        world.setTimeOfDay(1000);
        Weather.set(overworld, "Clear");
        // "[Essential++] Enough players sleeping. The night has been skipped!"
        CTsAPI.msg.broadcastMessage(
          "§aEnough players sleeping. §7The night has been skipped!",
          "info",
        );
      }, 20); // 1 second delay
    } else if (sleepingCount > 0) {
      CTsAPI.msg.broadcastMessage(
        `§b${sleepingCount} §7of §b${requiredCount} §7players are sleeping.`,
        "info",
        { volume: 0.5, pitch: 1.5 },
      );
    }
  }
}

moduleManager.registerModule(new SleepVoteModule());

class Weather {
  static #weatherMap = new WeakMap();
  constructor(dimension) {
    this.#dimension = dimension;
  }
  #dimension;

  /** @type {import('@minecraft/server').WeatherType} */
  get id() {
    return world.getDynamicProperty("weather:" + this.dimension.id) || "Clear";
  }

  /** @type {import('@minecraft/server').Dimension} */
  get dimension() {
    return this.#dimension;
  }

  /**
   * @param {import('@minecraft/server').Dimension}
   * @returns {Weather}
   */
  static get(dimension) {
    return (
      this.#weatherMap.get(dimension) ||
      this.#weatherMap.set(dimension, new Weather(dimension)).get(dimension)
    );
  }

  static isRaining() {
    return ["Rain", "Thunder"].includes(
      Weather.get(world.getDimension("overworld")).id,
    );
  }

  static set(dimension, weatherType) {
    world.setDynamicProperty("weather:" + dimension.id, weatherType);
    dimension.runCommand(`weather ${weatherType.toLowerCase()}`);
  }
}
world.afterEvents.weatherChange.subscribe((data) => {
  world.setDynamicProperty(
    "weather:" + world.getDimension(data.dimension).id,
    data.newWeather,
  );
});
