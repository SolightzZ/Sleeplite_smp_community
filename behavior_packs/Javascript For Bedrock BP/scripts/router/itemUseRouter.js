export function itemUseRouter(ev) {
  const player = ev.source;
  const item = ev.itemStack;
  if (!player || !item) return;
  const itemId = item.typeId;

  switch (itemId) {
    case "minecraft:emerald":
      return tradingController.openUI(player);

    case "minecraft:bone":
      return battlePassController.openUI(player);

    default:
      return;
  }
}
