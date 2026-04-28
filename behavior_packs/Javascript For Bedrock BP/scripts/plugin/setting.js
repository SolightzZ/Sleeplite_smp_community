import { world, system, DisplaySlotId, ObjectiveSortOrder, Player } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";

const config = {
  xyz: false,
  day: false,
  sidebarDeath: false,
  belowNameDeath: false,
  locatorbar: false,
};

const MainMenu = async (player) => {
  const form = new ActionFormData();
  form.title("Settings Menu");
  form.button("Server Settings", "textures/ui/sidebar_icons/categories");
  form.button("HUD Settings", "textures/ui/sidebar_icons/my_characters");

  const response = await form.show(player);
  if (response.canceled) return;
  if (response.selection === 0) {
    await Settings(player);
  } else if (response.selection === 1) {
    await Hud(player);
  }
};

const Settings = async (player) => {
  let DeathsObjective = world.scoreboard.getObjective("Deaths");
  let DeathsPlus = world.scoreboard.getObjective("DeathsPlus");

  if (!DeathsObjective) {
    try {
      DeathsObjective = world.scoreboard.addObjective("Deaths");
    } catch (e) {
      player.sendMessage("§c[x] ไม่สามารถสร้าง Scoreboard 'Deaths' ได้");
      console.warn("Scoreboard creation error: " + e);
      return;
    }
  }

  if (!DeathsPlus) {
    try {
      DeathsPlus = world.scoreboard.addObjective("DeathsPlus");
    } catch (e) {
      player.sendMessage("§c[x] ไม่สามารถสร้าง Scoreboard 'DeathsPlus' ได้");
      console.warn("Scoreboard creation error: " + e);
      return;
    }
  }

  try {
    const form = new ModalFormData();
    form.title("Server Setting");
    form.toggle("Show XYZ", { defaultValue: config.xyz });
    form.toggle("Show Day", { defaultValue: config.day });
    form.toggle("Sidebar Death Count", { defaultValue: config.sidebarDeath });
    form.toggle("Belowname Death Count", { defaultValue: config.belowNameDeath });
    form.toggle("Locator Bar", { defaultValue: config.locatorbar });

    const response = await form.show(player);
    if (response.canceled) return;

    const [xyz, day, sidebarDeath, belowNameDeath, locatorbar] = response.formValues;

    config.xyz = xyz;
    config.day = day;
    config.sidebarDeath = sidebarDeath;
    config.belowNameDeath = belowNameDeath;
    config.locatorbar = locatorbar;

    world.gameRules.showCoordinates = xyz;
    world.gameRules.showDaysPlayed = day;
    world.gameRules.locatorBar = locatorbar;

    if (sidebarDeath) {
      world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
        objective: DeathsObjective,
        sortOrder: ObjectiveSortOrder.Descending,
      });
    } else {
      world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
    }

    if (belowNameDeath) {
      world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.BelowName, {
        objective: DeathsPlus,
        sortOrder: ObjectiveSortOrder.Descending,
      });
    } else {
      world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.BelowName);
    }
  } catch (error) {
    console.warn("Error Server Setting: " + error);
  }
};

const Hud = async (player) => {
  try {
    const getTagState = (tag) => player.hasTag(`hud.${tag}`);
    const form = new ModalFormData();
    form.title("HUD Setting");

    form.toggle("Item Text", { defaultValue: getTagState("item_text") });
    form.toggle("Status Effects", { defaultValue: getTagState("status_effects") });
    form.toggle("ToolTips", { defaultValue: getTagState("tooltips") });
    form.toggle("Touch Controls", { defaultValue: getTagState("touch_controls") });

    const response = await form.show(player);
    if (response.canceled) return;

    const [item_text, statusEffects, toolTips, touchControls] = response.formValues;

    const toggleHud = async (element, enabled) => {
      const action = enabled ? "hide" : "reset";
      try {
        await player.runCommand(`hud @s ${action} ${element}`);
        const tag = `hud.${element}`;
        if (enabled) player.addTag(tag);
        else player.removeTag(tag);
      } catch (cmdError) {
        console.warn(`Failed to run HUD command for ${element}: ${cmdError}`);
        player.sendMessage(`§c[x] ไม่สามารถปรับ HUD ${element} ได้`);
      }
    };

    await toggleHud("item_text", item_text);
    await toggleHud("status_effects", statusEffects);
    await toggleHud("tooltips", toolTips);
    await toggleHud("touch_controls", touchControls);
  } catch (error) {
    console.warn("HUD Update Error:", error);
  }
};

export function setting_main({ source }) {
  MainMenu(source);
}
