import { DisplaySlotId, HudElement, HudVisibility, ObjectiveSortOrder, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const OBJECTIVE_DEATHS = "Deaths";
const OBJECTIVE_DEATHS_PLUS = "DeathsPlus";
const HUD_ITEM_TEXT = "item_text";
const HUD_STATUS_EFFECTS = "status_effects";
const HUD_TOOLTIPS = "tooltips";
const HUD_TOUCH_CONTROLS = "touch_controls";
const HUD_TAG_PREFIX = "hud.";
const HUD_ELEMENT_BY_KEY = new Map([
  [HUD_ITEM_TEXT, HudElement.ItemText],
  [HUD_STATUS_EFFECTS, HudElement.StatusEffects],
  [HUD_TOOLTIPS, HudElement.ToolTips],
  [HUD_TOUCH_CONTROLS, HudElement.TouchControls],
]);

const mainMenu = async (player) => {
  const response = await new ActionFormData();
  response.title("Settings Menu");
  response.button("Server Settings", "textures/ui/sidebar_icons/categories");
  response.button("HUD Settings", "textures/ui/sidebar_icons/my_characters");
  response.show(player);

  if (response.canceled) return;

  if (response.selection === 0) {
    await serverSettings(player);
    return;
  }

  if (response.selection === 1) {
    await hudSettings(player);
  }
};

const hasDisplayObjective = (slotId, objectiveId) => {
  const slot = world.scoreboard.getObjectiveAtDisplaySlot(slotId);
  if (!slot || !slot.objective) return false;

  return slot.objective.id === objectiveId;
};

const getOrCreateObjective = (id, player) => {
  let objective = world.scoreboard.getObjective(id);
  if (objective) return objective;

  try {
    objective = world.scoreboard.addObjective(id);
    return objective;
  } catch (e) {
    player.sendMessage(`§c[x] ไม่สามารถสร้าง Scoreboard '${id}' ได้`);
    console.warn("[ setting ] objective_create_error", id, e.message);
    return undefined;
  }
};

const updateServerSettings = (values, deathsObjective, deathsPlusObjective) => {
  const [showCoordinates, showDaysPlayed, showSidebarDeaths, showBelowNameDeaths, showLocatorBar] = values;

  world.gameRules.showCoordinates = showCoordinates;
  world.gameRules.showDaysPlayed = showDaysPlayed;
  world.gameRules.locatorBar = showLocatorBar;

  if (showSidebarDeaths) {
    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, {
      objective: deathsObjective,
      sortOrder: ObjectiveSortOrder.Descending,
    });
  } else {
    world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.Sidebar);
  }

  if (showBelowNameDeaths) {
    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.BelowName, {
      objective: deathsPlusObjective,
      sortOrder: ObjectiveSortOrder.Descending,
    });
  } else {
    world.scoreboard.clearObjectiveAtDisplaySlot(DisplaySlotId.BelowName);
  }
};

const serverSettings = async (player) => {
  const deathsObjective = getOrCreateObjective(OBJECTIVE_DEATHS, player);
  if (!deathsObjective) return;
  const deathsPlusObjective = getOrCreateObjective(OBJECTIVE_DEATHS_PLUS, player);
  if (!deathsPlusObjective) return;

  try {
    const response = await new ModalFormData();
    response.title("Server Setting");
    response.toggle("Show XYZ", { defaultValue: world.gameRules.showCoordinates });
    response.toggle("Show Day", { defaultValue: world.gameRules.showDaysPlayed });
    response.toggle("Sidebar Death Count", { defaultValue: hasDisplayObjective(DisplaySlotId.Sidebar, OBJECTIVE_DEATHS) });
    response.toggle("Belowname Death Count", { defaultValue: hasDisplayObjective(DisplaySlotId.BelowName, OBJECTIVE_DEATHS_PLUS) });
    response.toggle("Locator Bar", { defaultValue: world.gameRules.locatorBar });
    response.show(player);

    if (response.canceled || !response.formValues) return;
    updateServerSettings(response.formValues, deathsObjective, deathsPlusObjective);
  } catch (e) {
    console.warn("[ setting ] server_settings_error", e.message);
  }
};

const getHudTag = (element) => `${HUD_TAG_PREFIX}${element}`;
const hasHudTag = (player, element) => player.hasTag(getHudTag(element));

const setHudElement = (player, element, hideElement) => {
  try {
    const hudElement = HUD_ELEMENT_BY_KEY.get(element);
    if (hudElement === undefined) return;

    player.onScreenDisplay.setHudVisibility(hideElement ? HudVisibility.Hide : HudVisibility.Reset, [hudElement]);

    if (hideElement) {
      player.addTag(getHudTag(element));
      return;
    }

    player.removeTag(getHudTag(element));
  } catch (e) {
    console.warn("[ setting ] hud_command_error", element, e.message);
    player.sendMessage(`§c[x] ไม่สามารถปรับ HUD ${element} ได้`);
  }
};

const hudSettings = async (player) => {
  try {
    const response = await new ModalFormData();
    response.title("HUD Setting");
    response.toggle("Item Text", { defaultValue: hasHudTag(player, HUD_ITEM_TEXT) });
    response.toggle("Status Effects", { defaultValue: hasHudTag(player, HUD_STATUS_EFFECTS) });
    response.toggle("ToolTips", { defaultValue: hasHudTag(player, HUD_TOOLTIPS) });
    response.toggle("Touch Controls", { defaultValue: hasHudTag(player, HUD_TOUCH_CONTROLS) });
    response.show(player);

    if (response.canceled || !response.formValues) return;

    const [hideItemText, hideStatusEffects, hideTooltips, hideTouchControls] = response.formValues;
    setHudElement(player, HUD_ITEM_TEXT, hideItemText);
    setHudElement(player, HUD_STATUS_EFFECTS, hideStatusEffects);
    setHudElement(player, HUD_TOOLTIPS, hideTooltips);
    setHudElement(player, HUD_TOUCH_CONTROLS, hideTouchControls);
  } catch (e) {
    console.warn("[ setting ] hud_settings_error", e.message);
  }
};

export const setting_main = ({ source }) => {
  if (!source || !source.isValid) return;
  mainMenu(source);
};
