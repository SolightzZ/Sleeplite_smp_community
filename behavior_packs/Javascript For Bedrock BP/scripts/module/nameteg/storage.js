import { world } from "@minecraft/server";
import { STORAGE_KEY, defaultConfig } from "./config.js";

export let GT_CONFIG = JSON.parse(JSON.stringify(defaultConfig));

export const Storage = {
  load() {
    try {
      const data = world.getDynamicProperty(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  save(config) {
    world.setDynamicProperty(STORAGE_KEY, JSON.stringify(config));
  },
};

export function loadGamertagConfig() {
  const saved = Storage.load();
  if (saved && typeof saved === "object") {
    GT_CONFIG = JSON.parse(JSON.stringify(defaultConfig));
    for (const key in saved) {
      if (typeof saved[key] === "object" && saved[key] !== null) {
        GT_CONFIG[key] = { ...GT_CONFIG[key], ...saved[key] };
      } else {
        GT_CONFIG[key] = saved[key];
      }
    }
  }
  Storage.save(GT_CONFIG);
}
