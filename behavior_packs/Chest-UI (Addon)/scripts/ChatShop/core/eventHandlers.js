import { system } from "@minecraft/server";
import shopDatabase from "./database.js";
import shopQueries from "./shopQueries.js";
import shopCreator from "./shopCreator.js";
import helpers from "../utils/helpers.js";
import blockUtils from "../utils/blockUtils.js";
import { showBuyMenu } from "../ui/buyMenu.js";
import { manageItems } from "../ui/manageItems.js";

class EventHandlers {
  onShopInteract = (event) => {
    try {
      const player = event.player;
      const block = event.block;
      if (!player?.isValid || !block) return;

      if (!helpers.isContainer(block.typeId)) return;

      const shop = shopQueries.findShopByBlock(block);

      if (!shop) {
        const equip = player
          .getComponent("minecraft:inventory")
          ?.container?.getSlot(player.selectedSlotIndex);
        if (!equip || !helpers.isShopTool(equip)) return;

        event.cancel = true;
        shopCreator.createShop(player, block);
        return;
      }

      event.cancel = true;
      shop.status.lastAccess = helpers.now();
      shop.status.visitCount = (shop.status.visitCount || 0) + 1;

      const expectedHash = helpers.blockKey(
        block.location.x,
        block.location.y,
        block.location.z,
      );
      const registeredHash = helpers.blockKey(
        shop.location.x,
        shop.location.y,
        shop.location.z,
      );
      if (registeredHash !== expectedHash) {
        player.sendMessage(
          `§c[Shop] ตรวจพบว่ากล่องถูกย้าย กรุณาลบร้านและสร้างใหม่`,
        );
        shopDatabase.save();
        return;
      }

      shopDatabase.save();

      if (shop.owner.playerId === player.id) {
        system.run(() => {
          if (player.isValid) manageItems(player, shop);
        });
      } else {
        if (!shop.status.isEnabled) {
          player.sendMessage(`§c[Shop] ร้านนี้ถูกปิดใช้งานชั่วคราว`);
          return;
        }
        if (shop.status.isLocked) {
          player.sendMessage(`§c[Shop] ร้านนี้ถูกล็อคชั่วคราว`);
          return;
        }
        system.run(() => {
          if (player.isValid) showBuyMenu(player, shop);
        });
      }
    } catch (error) {
      console.error("[Shop] onShopInteract:", error);
    }
  };

  onShopBreak = (event) => {
    try {
      const player = event.player;
      const block = event.block;
      if (!player?.isValid || !block) return;

      const data = shopDatabase.data;
      const key = helpers.blockKey(
        block.location.x,
        block.location.y,
        block.location.z,
      );
      const protectedEntry = data.protectedBlocks[key];
      if (!protectedEntry) return;

      const shopId =
        typeof protectedEntry === "object"
          ? protectedEntry.shopId
          : protectedEntry;
      const shop = data.shops[shopId];
      if (!shop) return;

      if (shop.owner.playerId === player.id) {
        if (shop.protection.allowOwnerBreak) {
          system.run(() => {
            blockUtils.deleteShop(shop.shopId);
          });
          player.sendMessage(`§e[Shop] ร้านค้าถูกลบแล้ว`);
          return;
        }
      }

      event.cancel = true;
      player.sendMessage(`§c[Shop] ร้านค้าถูกป้องกัน`);
    } catch (error) {
      console.error("[Shop] onShopBreak:", error);
    }
  };

  onShopExplosion = (event) => {
    try {
      const data = shopDatabase.data;
      const protectedCount = Object.keys(data.protectedBlocks).length;
      if (protectedCount === 0) return;

      const impactedBlocks = event.getImpactedBlocks();
      const hasProtected = impactedBlocks.some((block) => {
        const key = helpers.blockKey(
          block.location.x,
          block.location.y,
          block.location.z,
        );
        return !!data.protectedBlocks[key];
      });
      if (hasProtected) {
        event.cancel = true;
      }
    } catch (error) {
      console.error("[Shop] onShopExplosion:", error);
    }
  };
}

export default new EventHandlers();
