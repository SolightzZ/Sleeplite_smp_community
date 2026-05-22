import { CONFIG_KEY, DEFAULT_CONFIG } from "./Config.js";

export function getPlayerConfig(player) {
  let config = { ...DEFAULT_CONFIG };

  try {
    const rawConfig = player.getDynamicProperty(CONFIG_KEY);

    if (typeof rawConfig === "string") {
      const parsedConfig = JSON.parse(rawConfig);

      if (typeof parsedConfig === "object" && parsedConfig !== null) {
        if (typeof parsedConfig.playSound === "boolean") {
          config.playSound = parsedConfig.playSound;
        }

        if (typeof parsedConfig.hideHud === "boolean") {
          config.hideHud = parsedConfig.hideHud;
        }
      }
    }
  } catch (e) {
    console.error("[ Zoom ] Failed to load player config", e);
  }

  return config;
}
