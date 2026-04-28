import { EquipmentSlot, ItemComponentTypes } from "@minecraft/server";
import { CONFIG, job } from "./constants.js";
import { isMineableBlock, calculateLoot, shouldDropXP, calculateDurabilityCost } from "./logic.js";

export function* miningJobExecutor(dimension, targets, enchantData, player) {
  let processed = 0;
  const equipment = player.getComponent(job.ID_EQUIPPABLE);

  for (const loc of targets) {
    const tool = equipment?.getEquipment(EquipmentSlot.Mainhand);
    if (!tool) return;

    const block = dimension.getBlock(loc);

    if (block && isMineableBlock(block.typeId, block.getTags())) {
      const centerLoc = {
        x: loc.x + job.CENTER_OFFSET,
        y: loc.y + job.CENTER_OFFSET,
        z: loc.z + job.CENTER_OFFSET,
      };

      const itemStack = calculateLoot(block.typeId, enchantData);
      if (itemStack) {
        dimension.spawnItem(itemStack, centerLoc);
      }

      if (shouldDropXP(block.typeId, enchantData.silk)) {
        dimension.spawnEntity(job.ID_XP_ORB, centerLoc);
      }

      const randomPitch = job.PITCH_BASE + Math.random() * job.PITCH_VARIANCE;
      dimension.playSound(job.SOUND_DIG, loc, {
        volume: job.SOUND_VOLUME,
        pitch: randomPitch,
      });

      block.setType(job.ID_AIR);

      const durabilityComp = tool.getComponent(ItemComponentTypes.Durability);

      if (durabilityComp) {
        const damage = calculateDurabilityCost(enchantData.unbreaking);

        if (damage > 0) {
          durabilityComp.damage += damage;

          if (durabilityComp.damage >= durabilityComp.maxDurability) {
            equipment.setEquipment(EquipmentSlot.Mainhand, undefined);
            dimension.playSound(job.SOUND_BREAK, player.location);
            return;
          } else {
            equipment.setEquipment(EquipmentSlot.Mainhand, tool);
          }
        }
      }
      processed++;
    }
    if (processed % CONFIG.BATCH_SIZE === 0) yield;
  }
}
