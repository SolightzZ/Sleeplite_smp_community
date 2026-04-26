import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// This list will be replaced/injected by the PHP generator
const TEXTURE_OPTIONS = [
  {
    name: "Default",
    index: 0,
    icon: "textures/blocks/default",
  },
  {
    name: "QR",
    index: 1,
    icon: "textures/blocks/custom_paintings/1",
  },
  {
    name: "Scan QR",
    index: 2,
    icon: "textures/blocks/custom_paintings/2",
  },
  {
    name: "example 0",
    index: 3,
    icon: "textures/blocks/custom_paintings/3",
  },
  {
    name: "example 1",
    index: 4,
    icon: "textures/blocks/custom_paintings/4",
  },
];

const SIZES = [
  { name: "1x1", w: 1, h: 1 },
  { name: "1x2", w: 1, h: 2 },
  { name: "2x1", w: 2, h: 1 },
  { name: "2x2", w: 2, h: 2 },
];

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.blockComponentRegistry.registerCustomComponent(
    "custom:frame_interact",
    {
      onPlayerInteract: (e) => {
        const player = e.player;
        const block = e.block;

        // Only if holding the brush
        const equipment = player.getComponent("equippable");
        const mainHand = equipment?.getEquipment("Mainhand");

        if (mainHand?.typeId === "custom:brush") {
          system.run(() => {
            showMainMenu(player, block);
          });
        } else {
          // If not holding usage brush (empty hand or other item)
          system.run(() => {
            player.sendMessage({ translate: "custom.message.need_brush" });
          });
        }
      },
    },
  );
});

// Global interval to handle particle effects for players holding the brush
system.runInterval(() => {
  const players = world.getAllPlayers();
  for (const player of players) {
    const equipment = player.getComponent("equippable");
    const mainHand = equipment?.getEquipment("Mainhand");

    if (mainHand?.typeId === "custom:brush") {
      try {
        // Raycast to check block player is looking at
        const hit = player.getBlockFromViewDirection({ maxDistance: 10 });
        const block = hit?.block;

        if (block && block.typeId === "custom:paintings") {
          // Calculate center of the block
          const center = {
            x: block.location.x + 0.5,
            y: block.location.y + 0.5,
            z: block.location.z + 0.5,
          };

          // Spawn redstone particles
          try {
            // Attempt to spawn particle at block center
            player.dimension.spawnParticle(
              "minecraft:redstone_torch_dust_particle",
              center,
            );
          } catch (e) {
            // Fallback harmlessly if particle fails
          }
        }
      } catch (err) {
        // Component access or raycast errors
      }
    }
  }
}, 5); // Run every 5 ticks (0.25s)

function showMainMenu(player, block) {
  const form = new ActionFormData()
    .title("Frame Settings")
    .body({ translate: "custom.menu.website_info" })
    .button({ translate: "custom.menu.change_size" })
    .button({ translate: "custom.menu.change_texture" })
    .button({ translate: "custom.menu.get_link" });

  form.show(player).then((response) => {
    if (response.canceled) return;

    if (response.selection === 0) {
      showSizeForm(player, block);
    } else if (response.selection === 1) {
      showTextureForm(player, block);
    } else if (response.selection === 2) {
      player.sendMessage({ translate: "custom.menu.website_info" });
    }
  });
}

function showSizeForm(player, block) {
  const form = new ActionFormData()
    .title({ translate: "custom.menu.select_size" })
    .body({ translate: "custom.menu.size_desc" })
    .button({ translate: "custom.menu.custom_size" });

  SIZES.forEach((size) => {
    form.button(size.name);
  });

  form.show(player).then((response) => {
    if (response.canceled) return;

    if (response.selection === 0) {
      showCustomSizeForm(player, block);
    } else {
      const selectedSize = SIZES[response.selection - 1];
      applySize(block, selectedSize.w, selectedSize.h, player);
    }
  });
}

function showCustomSizeForm(player, block) {
  const perm = block.permutation;
  const currentW = perm.getState("custom:width") ?? 1;
  const currentH = perm.getState("custom:height") ?? 1;

  const form = new ModalFormData()
    .title({ translate: "custom.menu.custom_size" })
    .slider({ translate: "custom.menu.width" }, 1, 8, 1, currentW)
    .slider({ translate: "custom.menu.height" }, 1, 8, 1, currentH);

  form.show(player).then((response) => {
    if (response.canceled) return;

    const [width, height] = response.formValues;
    applySize(block, Math.floor(width), Math.floor(height), player);
  });
}

function applySize(block, w, h, player = null) {
  const perm = block.permutation;
  try {
    let newPerm = perm;

    const width = Number(w);
    const height = Number(h);

    newPerm = newPerm.withState("custom:width", width);
    newPerm = newPerm.withState("custom:height", height);

    block.setPermutation(newPerm);

    if (player) {
      player.sendMessage({
        rawtext: [
          { text: "§a" },
          { translate: "custom.message.applied" },
          { text: ` §fSize ${width}x${height}` },
        ],
      });
    }
  } catch (e) {
    if (player) {
      player.sendMessage(`§cError: ${e}`);
    }
  }
}

function showTextureForm(player, block, filter = "") {
  const validTextures = filter
    ? TEXTURE_OPTIONS.filter((opt) =>
        opt.name.toLowerCase().includes(filter.toLowerCase()),
      )
    : TEXTURE_OPTIONS;

  if (validTextures.length === 0 && filter) {
    player.sendMessage({
      rawtext: [
        { text: "§c" },
        { translate: "custom.message.not_found" },
        { text: ` "${filter}"` },
      ],
    });
    return showTextureForm(player, block, "");
  }

  const form = new ActionFormData();

  if (filter) {
    form.title({
      rawtext: [
        { translate: "custom.menu.filter_active" },
        { text: ` ${filter}` },
      ],
    });
  } else {
    form.title({ translate: "custom.menu.change_texture" });
  }

  form.button(
    {
      rawtext: [
        { text: "§b§l" },
        { translate: "custom.menu.search_filter" },
        { text: "\n§8" },
        { translate: "custom.menu.search_filter_desc" },
      ],
    },
    "textures/items/brushFrame",
  );

  if (filter) {
    form.button({
      rawtext: [
        { text: "§c§l" },
        { translate: "custom.menu.reset_filter" },
        { text: "\n§8" },
        { translate: "custom.menu.reset_filter_desc" },
      ],
    });
  }

  validTextures.forEach((opt) => {
    form.button(opt.name, opt.icon);
  });

  form.show(player).then((response) => {
    if (response.canceled) return;

    let selection = response.selection;

    if (selection === 0) {
      const searchForm = new ModalFormData()
        .title({ translate: "custom.menu.search" })
        .textField(
          { translate: "custom.menu.search_input" },
          { translate: "custom.menu.search_placeholder" },
          filter,
        );

      searchForm.show(player).then((sr) => {
        if (sr.canceled) return showTextureForm(player, block, filter);
        showTextureForm(player, block, sr.formValues[0]);
      });
      return;
    }

    if (filter && selection === 1) {
      showTextureForm(player, block, "");
      return;
    }

    const offset = filter ? 2 : 1;
    const selectedIndex = selection - offset;
    const selectedOption = validTextures[selectedIndex];

    if (!selectedOption) return;

    const perm = block.permutation;
    {
      const variantPage = Math.floor(selectedOption.index / 16);
      const variantSlot = selectedOption.index % 16;
      let newPermutation = perm;
      if (perm.getState("custom:variant_page") !== undefined) {
        newPermutation = newPermutation.withState(
          "custom:variant_page",
          variantPage,
        );
      }
      if (perm.getState("custom:variant_slot") !== undefined) {
        newPermutation = newPermutation.withState(
          "custom:variant_slot",
          variantSlot,
        );
      }
      block.setPermutation(newPermutation);
    }
  });
}
