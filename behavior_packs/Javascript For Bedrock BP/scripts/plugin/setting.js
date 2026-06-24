import { DisplaySlotId, HudElement, HudVisibility, ObjectiveSortOrder, world } from '@minecraft/server';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { logError } from '../router/core/logger.js';
import { addSound } from './utils.js';

const OBJECTIVE_DEATHS = 'Deaths';
const OBJECTIVE_DEATHS_PLUS = 'DeathsPlus';
const HUD_ITEM_TEXT = 'item_text';
const HUD_STATUS_EFFECTS = 'status_effects';
const HUD_TOOLTIPS = 'tooltips';
const HUD_TOUCH_CONTROLS = 'touch_controls';
const HUD_TAG_PREFIX = 'hud.';
const HUD_ELEMENT_BY_KEY = new Map([
   [HUD_ITEM_TEXT, HudElement.ItemText],
   [HUD_STATUS_EFFECTS, HudElement.StatusEffects],
   [HUD_TOOLTIPS, HudElement.ToolTips],
   [HUD_TOUCH_CONTROLS, HudElement.TouchControls],
]);

const mainMenu = async (player) => {
   addSound(player, 'block.loom.use');

   const form = new ActionFormData();
   form.title('Settings');
   form.button('Server Settings', 'textures/ui/sidebar_icons/categories');
   form.button('HUD Settings', 'textures/ui/sidebar_icons/my_characters');

   const response = await form.show(player);
   if (response.canceled) {
      return;
   }

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
   } catch (error) {
      player.sendMessage(`§c[x] ไม่สามารถสร้าง Scoreboard '${id}' ได้`);
      logError('setting', 'objective_create_error ' + id, error);
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
      addSound(player, 'block.smithing_table.use');

      const form = new ModalFormData();
      form.title('Server Setting');
      form.toggle('Show XYZ', { defaultValue: world.gameRules.showCoordinates });
      form.toggle('Show Day', { defaultValue: world.gameRules.showDaysPlayed });

      form.toggle('Sidebar Death Count', {
         defaultValue: hasDisplayObjective(DisplaySlotId.Sidebar, OBJECTIVE_DEATHS),
      });

      form.toggle('Belowname Death Count', {
         defaultValue: hasDisplayObjective(DisplaySlotId.BelowName, OBJECTIVE_DEATHS_PLUS),
      });

      form.toggle('Locator Bar', { defaultValue: world.gameRules.locatorBar });

      const response = await form.show(player);

      if (response.canceled || !response.formValues) {
         return;
      }
      updateServerSettings(response.formValues, deathsObjective, deathsPlusObjective);
      addSound(player, 'random.orb');
   } catch (error) {
      logError('setting', 'server_settings_error', error);
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
   } catch (error) {
      logError('setting', 'hud_command_error ' + element, error);
      player.sendMessage(`§c[x] ไม่สามารถปรับ HUD ${element} ได้`);
   }
};

const hudSettings = async (player) => {
   try {
      addSound(player, 'block.cartography_table.use');

      const form = new ModalFormData();
      form.title('HUD Setting');
      form.toggle('Item Text', { defaultValue: hasHudTag(player, HUD_ITEM_TEXT) });

      form.toggle('Status Effects', { defaultValue: hasHudTag(player, HUD_STATUS_EFFECTS) });
      form.toggle('ToolTips', { defaultValue: hasHudTag(player, HUD_TOOLTIPS) });
      form.toggle('Touch Controls', { defaultValue: hasHudTag(player, HUD_TOUCH_CONTROLS) });
      const response = await form.show(player);

      if (response.canceled || !response.formValues) {
         return;
      }

      const [hideItemText, hideStatusEffects, hideTooltips, hideTouchControls] = response.formValues;
      setHudElement(player, HUD_ITEM_TEXT, hideItemText);
      setHudElement(player, HUD_STATUS_EFFECTS, hideStatusEffects);
      setHudElement(player, HUD_TOOLTIPS, hideTooltips);
      setHudElement(player, HUD_TOUCH_CONTROLS, hideTouchControls);
      addSound(player, 'random.orb');
   } catch (error) {
      logError('setting', 'hud_settings_error', error);
   }
};

export const setting_main = ({ source }) => {
   if (!source || !source.isValid) return;
   mainMenu(source);
};
