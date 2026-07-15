import { system } from '@minecraft/server';
import { transferPlayer } from '@minecraft/server-admin';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { logError } from '../../events/logger.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { SERVER_LIST } from './Source.js';
import {
   UI_TITLES,
   UI_BUTTONS,
   UI_TEXT,
   DEFAULT_ICON,
   LOG_TAG,
   MESSAGES,
} from './config.js';

export function showServerMenu(player) {
   if (!pcheck(player)) return;

   const form = new ActionFormData().title(UI_TITLES.serverMenu);

   for (const server of SERVER_LIST) {
      form.button(server.displayName, server.iconTexture || DEFAULT_ICON);
   }

   form.button(UI_BUTTONS.customIp);
   form
      .show(player)
      .then((response) => {
         if (!response || response.canceled) return;

         const idx = response.selection;
         if (idx === undefined) return;

         if (idx >= SERVER_LIST.length) {
            system.run(() => {
               if (pcheck(player)) showCustomServerInput(player);
            });
            return;
         }

         const server = SERVER_LIST[idx];
         system.run(() => {
            if (pcheck(player)) showConfirmationMenu(player, server.displayName, server.ipAddress, server.portNumber);
         });
      })
      .catch((error) => {
         logError(LOG_TAG, 'showServerMenu', error);
         system.run(() => {
            if (pcheck(player)) showCustomServerInput(player);
         });
         return;
      });
}

function showCustomServerInput(player) {
   if (!pcheck(player)) return;

   const form = new ModalFormData();
   form.title(UI_TITLES.customInput);
   form.textField(UI_TEXT.ipLabel, UI_TEXT.ipPlaceholder);
   form.textField(UI_TEXT.portLabel, UI_TEXT.portPlaceholder);

   form
      .show(player)
      .then((response) => {
         if (!response || response.canceled) return;

         const values = response.formValues;
         if (!values) return;

         const ipAddress = values[0];
         const portNumber = Number(values[1]);

         if (!ipAddress || !Number.isInteger(portNumber)) {
            cache.sendMessage(player, MESSAGES.INVALID_IP);
            return;
         }

         system.run(() => {
            if (pcheck(player)) showConfirmationMenu(player, UI_TEXT.customServerLabel, ipAddress, portNumber);
         });
      })
      .catch((error) => {
         logError(LOG_TAG, 'showCustomServerInput', error);
         system.run(() => {
            if (pcheck(player)) showServerMenu(player);
         });
         return;
      });
}

function showConfirmationMenu(player, serverName, ipAddress, portNumber) {
   if (!pcheck(player)) return;

   const form = new ActionFormData();
   form.title(UI_TITLES.confirm);
   form.body(UI_TEXT.confirmBody(serverName, ipAddress, portNumber));
   form.button(UI_BUTTONS.confirm);
   form.button(UI_BUTTONS.back);

   form
      .show(player)
      .then((response) => {
         if (!response || response.canceled) return;

         if (response.selection !== 0) {
            system.run(() => {
               if (pcheck(player)) showServerMenu(player);
            });
            return;
         }

         transferPlayerToServer(player, ipAddress, portNumber);
      })
      .catch((error) => {
         logError(LOG_TAG, 'showConfirmationMenu', error);
         system.run(() => {
            if (pcheck(player)) showServerMenu(player);
         });
         return;
      });
}

function transferPlayerToServer(player, ipAddress, portNumber) {
   if (!pcheck(player)) return;
   try {
      transferPlayer(player, { hostname: ipAddress, port: portNumber });
      cache.sendMessage(player, MESSAGES.TRANSFER_START(ipAddress, portNumber));
   } catch (error) {
      logError(LOG_TAG, 'transferPlayerToServer', error);
      cache.sendMessage(player, MESSAGES.TRANSFER_FAIL);
   }
}
