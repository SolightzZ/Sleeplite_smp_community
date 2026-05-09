import { DisplaySlotId, ObjectiveSortOrder, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const cfg = {
  xyz: false,
  day: false,
  sidebarDeath: false,
  belowNameDeath: false,
  locatorbar: false,
};

const mainMenu = async (player) => {
  const form = new ActionFormData()
    .title("Settings Menu")
    .button("Server Settings", "textures/ui/sidebar_icons/categories")
    .button("HUD Settings", "textures/ui/sidebar_icons/my_characters");

  const res = await form.show(player);
  if (res.canceled) return;

  if (res.selection === 0) await serverSettings(player);
  else if (res.selection === 1) await hudSettings(player);
};

const serverSettings = async (player) => {
  let objDeaths = world.scoreboard.getObjective("Deaths");
  let objDeathsPlus = world.scoreboard.getObjective("DeathsPlus");

  if (!objDeaths) {
    try {
      objDeaths = world.scoreboard.addObjective("Deaths");
    } catch (e) {
      player.sendMessage("§c[x] ไม่สามารถสร้าง Scoreboard 'Deaths' ได้");
      console.warn("Scoreboard error", e.message);
      return;
    }
  }

  if (!objDeathsPlus) {
    try {
      objDeathsPlus = world.scoreboard.addObjective("DeathsPlus");
    } catch (e) {
      player.sendMessage("§c[x] ไม่สามารถสร้าง Scoreboard 'DeathsPlus' ได้");
      console.warn("Scoreboard error", e.message);
      return;
    }
  }

  try {
    const form = new ModalFormData()
      .title("Server Setting")
      .toggle("Show XYZ", { defaultValue: cfg.xyz })
      .toggle("Show Day", { defaultValue: cfg.day })
      .toggle("Sidebar Death Count", { defaultValue: cfg.sidebarDeath })
      .toggle("Belowname Death Count", { defaultValue: cfg.belowNameDeath })
      .toggle("Locator Bar", { defaultValue: cfg.locatorbar });

    const res = await form.show(player);
    if (res.canceled) return;

    const [xyz, day, sidebar, belowName, locator] = res.formValues;

    cfg.xyz = xyz;
    cfg.day = day;
    cfg.sidebarDeath = sidebar;
    cfg.belowNameDeath = belowName;
    cfg.locatorbar = locator;

    world.gameRules.showCoordinates = xyz;
    world.gameRules.showDaysPlayed = day;
    world.gameRules.locatorBar = locator;

    if (sidebar) {
      world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
        objective: objDeaths,
        sortOrder: ObjectiveSortOrder.Descending,
      });
    } else {
      world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
    }

    if (belowName) {
      world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.BelowName, {
        objective: objDeathsPlus,
        sortOrder: ObjectiveSortOrder.Descending,
      });
    } else {
      world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.BelowName);
    }
  } catch (e) {
    console.warn("Server Setting error", e.message);
  }
};

const hudSettings = async (player) => {
  try {
    const hasTag = (tag) => player.hasTag(`hud.${tag}`);

    const form = new ModalFormData()
      .title("HUD Setting")
      .toggle("Item Text", { defaultValue: hasTag("item_text") })
      .toggle("Status Effects", { defaultValue: hasTag("status_effects") })
      .toggle("ToolTips", { defaultValue: hasTag("tooltips") })
      .toggle("Touch Controls", { defaultValue: hasTag("touch_controls") });

    const res = await form.show(player);
    if (res.canceled) return;

    const [itemText, statusEffects, toolTips, touchControls] = res.formValues;

    const toggleHud = async (element, enabled) => {
      const action = enabled ? "hide" : "reset";
      try {
        await player.runCommand(`hud @s ${action} ${element}`);
        const tag = `hud.${element}`;
        if (enabled) player.addTag(tag);
        else player.removeTag(tag);
      } catch (e) {
        console.warn(`HUD command error ${element}`, e.message);
        player.sendMessage(`§c[x] ไม่สามารถปรับ HUD ${element} ได้`);
      }
    };

    await toggleHud("item_text", itemText);
    await toggleHud("status_effects", statusEffects);
    await toggleHud("tooltips", toolTips);
    await toggleHud("touch_controls", touchControls);
  } catch (e) {
    console.warn("HUD error", e.message);
  }
};

export const setting_main = ({ source }) => {
  mainMenu(source);
};
