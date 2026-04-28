import { ItemStack, EquipmentSlot } from "@minecraft/server";
import { CONFIG, logic } from "./constants.js";
import { LOOT_MAP } from "./loot_tables.js";

export const isValidTool = (typeId) => CONFIG.TOOLS.has(typeId);

export const isMineableBlock = (blockId, tags) => {
  if (CONFIG.IGNORE_BLOCKS.has(blockId)) return false;

  if (blockId.includes(logic.KEY_STONE) || blockId.includes(logic.KEY_ORE) || blockId.includes(logic.KEY_DEEPSLATE)) return true;

  return tags.some((tag) => CONFIG.TargetKeywords.some((keyword) => tag.includes(keyword)));
};

export const getEnchantData = (item, player) => {
  let comp = item?.getComponent(logic.COMP_ENCHANTABLE);

  if (!comp) {
    const equipComp = player?.getComponent(logic.COMP_EQUIPPABLE);
    const mainHandItem = equipComp?.getEquipment(EquipmentSlot.Mainhand);
    comp = mainHandItem?.getComponent(logic.COMP_ENCHANTABLE);
  }

  return {
    fortune: comp?.getEnchantment(logic.ENCH_FORTUNE)?.level || 0,
    silk: !!comp?.getEnchantment(logic.ENCH_SILK),
    unbreaking: comp?.getEnchantment(logic.ENCH_UNBREAKING)?.level || 0,
  };
};

export const calculateLoot = (blockId, { fortune = 0, silk = false }) => {
  if (silk) return new ItemStack(blockId, 1);

  const baseId = blockId.replace(logic.PREFIX_DEEPSLATE, "");
  const dropId = LOOT_MAP[blockId] || LOOT_MAP[baseId] || blockId;

  let count = 1;

  if (dropId !== blockId && fortune > 0) {
    const isHighMult = blockId.includes(logic.KEY_LAPIS) || blockId.includes(logic.KEY_REDSTONE);
    const isMidMult = blockId.includes(logic.KEY_COPPER);

    const multiplier = isHighMult ? logic.MULT_HIGH : isMidMult ? logic.MULT_MID : logic.MULT_BASE;
    const bonus = Math.floor(Math.random() * (fortune + 2)) - 1;

    count = bonus < 0 ? multiplier : multiplier * (bonus + 1);
  }

  return new ItemStack(dropId, Math.min(count, logic.MAX_STACK));
};

export const shouldDropXP = (blockId, isSilk) => {
  return blockId.includes(logic.KEY_ORE) && !isSilk;
};

export const calculateDurabilityCost = (unbreakingLevel = 0) => {
  const baseDamage = Math.round(Math.random());

  if (baseDamage === 0) return 0;
  if (unbreakingLevel > 0) {
    const saveChance = unbreakingLevel * 0.1;

    if (Math.random() < saveChance) {
      return 0;
    }
  }

  return 1;
};
