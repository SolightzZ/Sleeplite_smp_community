export const getEnchantData = (item) => {
  const enc = item?.getComponent("minecraft:enchantable");
  if (!enc) return { fortune: 0, silk: false, unbreaking: 0 };
  return {
    fortune: enc.getEnchantment("fortune")?.level ?? 0,
    silk: Boolean(enc.getEnchantment("silk_touch")),
    unbreaking: enc.getEnchantment("unbreaking")?.level ?? 0,
  };
};
