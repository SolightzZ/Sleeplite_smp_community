import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const TEXTURE_OPTIONS = [
  { name: "Default", index: 0, icon: "textures/blocks/default" },
  { name: "ShowCase2026", index: 1, icon: "textures/blocks/custom_paintings/1" },
  { name: "UHCRUN2026", index: 2, icon: "textures/blocks/custom_paintings/2" },
  { name: "SleepliteJr(1)", index: 3, icon: "textures/blocks/custom_paintings/3" },
  { name: "SleepliteJr(2)", index: 4, icon: "textures/blocks/custom_paintings/4" },
  { name: "SleepliteJr(3)", index: 5, icon: "textures/blocks/custom_paintings/5" },
  { name: "SleepliteJr(4)", index: 6, icon: "textures/blocks/custom_paintings/6" },
  { name: "SleepliteJr(7)", index: 7, icon: "textures/blocks/custom_paintings/7" },
  { name: "SleepliteJr(8)", index: 8, icon: "textures/blocks/custom_paintings/8" },
  { name: "SleepliteJr(9)", index: 9, icon: "textures/blocks/custom_paintings/9" },
  { name: "SleepliteJr(10)", index: 10, icon: "textures/blocks/custom_paintings/10" },
  { name: "Sleeplite Junior", index: 11, icon: "textures/blocks/custom_paintings/sljr" },
  { name: "Sleeplite", index: 12, icon: "textures/blocks/custom_paintings/sl" },
];

const SIZES = [
  { name: "1x1", w: 1, h: 1 },
  { name: "1x2", w: 1, h: 2 },
  { name: "2x1", w: 2, h: 1 },
  { name: "2x2", w: 2, h: 2 },
];

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.blockComponentRegistry.registerCustomComponent("custom:frame_interact", {
    onPlayerInteract: (e) => {
      const player = e.player;
      const block = e.block;

      const equipment = player.getComponent("equippable");
      const mainHand = equipment?.getEquipment("Mainhand");

      if (mainHand?.typeId === "custom:brush") {
        system.run(() => showMainMenu(player, block));
      } else {
        system.run(() => player.sendMessage("§cYou need a Custom Brush to use this."));
      }
    },
  });
});

function showMainMenu(player, block) {
  new ActionFormData()
    .title("Frame Settings")
    .body("Choose what to customize:")
    .button("Change Size")
    .button("Change Texture")
    .show(player)
    .then((response) => {
      if (response.canceled) return;
      if (response.selection === 0) showSizeForm(player, block);
      else if (response.selection === 1) showTextureForm(player, block);
    });
}

function showSizeForm(player, block) {
  const form = new ActionFormData().title("Select Size").body("Choose a preset or enter a custom size.").button("Custom Size Input");

  SIZES.forEach((size) => form.button(size.name));

  form.show(player).then((response) => {
    if (response.canceled) return;
    if (response.selection === 0) {
      showCustomSizeForm(player, block);
    } else {
      const size = SIZES[response.selection - 1];
      applySize(block, size.w, size.h, player);
    }
  });
}

function showCustomSizeForm(player, block) {
  const perm = block.permutation;
  const currentW = perm.getState("custom:width") ?? 1;
  const currentH = perm.getState("custom:height") ?? 1;

  new ModalFormData()
    .title("Custom Size Input")
    .slider("Width (Blocks)", 1, 8, 1, currentW)
    .slider("Height (Blocks)", 1, 8, 1, currentH)
    .show(player)
    .then((response) => {
      if (response.canceled) return;
      const [width, height] = response.formValues;
      applySize(block, Math.floor(width), Math.floor(height), player);
    });
}

function applySize(block, w, h, player = null) {
  try {
    let newPerm = block.permutation.withState("custom:width", w).withState("custom:height", h);
    block.setPermutation(newPerm);
  } catch (e) {
    if (player) player.sendMessage(`§cError applying size: ${e}`);
    console.error("[CustomFrames] applySize error: " + e);
  }
}

function showTextureForm(player, block, filter = "") {
  const filtered = filter ? TEXTURE_OPTIONS.filter((opt) => opt.name.toLowerCase().includes(filter.toLowerCase())) : TEXTURE_OPTIONS;

  if (filtered.length === 0) {
    player.sendMessage(`§cNo textures found matching: "${filter}"`);
    showTextureForm(player, block, "");
    return;
  }

  const form = new ActionFormData().title(filter ? `Filter: ${filter}` : "Change Texture").button("§9Search / Filter\n§8Type a name to search...", "textures/items/brushFrame");

  if (filter) {
    form.button("§cReset Filter\n§8Show all textures");
  }

  filtered.forEach((opt) => form.button(opt.name, opt.icon));

  const textureStartIndex = filter ? 2 : 1;

  form.show(player).then((response) => {
    if (response.canceled) return;

    const sel = response.selection;

    if (sel === 0) {
      new ModalFormData()
        .title("Search Texture")
        .textField("Search by name:", "e.g. wall, wood...", filter)
        .show(player)
        .then((sr) => {
          if (sr.canceled) {
            showTextureForm(player, block, filter);
            return;
          }
          showTextureForm(player, block, sr.formValues[0] ?? "");
        });
      return;
    }

    if (filter && sel === 1) {
      showTextureForm(player, block, "");
      return;
    }

    const selected = filtered[sel - textureStartIndex];
    if (!selected) return;

    applyTexture(block, selected.index, player);
  });
}

function applyTexture(block, textureIndex, player = null) {
  const variantPage = Math.floor(textureIndex / 16);
  const variantSlot = textureIndex % 16;
  const perm = block.permutation;

  try {
    let newPerm = perm;
    if (perm.getState("custom:variant_page") !== undefined) newPerm = newPerm.withState("custom:variant_page", variantPage);
    if (perm.getState("custom:variant_slot") !== undefined) newPerm = newPerm.withState("custom:variant_slot", variantSlot);
    block.setPermutation(newPerm);
  } catch (e) {
    if (player) player.sendMessage(`§cError applying texture: ${e}`);
    console.error("[CustomFrames] applyTexture error: " + e);
  }
}
