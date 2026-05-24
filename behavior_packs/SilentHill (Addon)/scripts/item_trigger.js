import { system, world } from "@minecraft/server";
import { decrementStack, getOppositeDirection, DirectionType, cardinalSides, randomFunction } from "./utils/helper";
import { directionToVector3 } from "./utils/math";

system.beforeEvents.startup.subscribe((initEvent) => {
  initEvent.itemComponentRegistry.registerCustomComponent("jsart_arare:trigger", {
    onConsume: (e) => {
      e.source.addEffect("minecraft:instant_health", 100, { amplifier: 2 });
    },
  });

  initEvent.itemComponentRegistry.registerCustomComponent("jsart_divine_water:trigger", {
    onConsume: (e) => {
      e.source.addEffect("minecraft:health_boost", 2400, { amplifier: 3.6 });
      e.source.addEffect("minecraft:instant_health", 300, { amplifier: 2 });
    },

    onUse: (e) => {
      e.source.runCommand("function js_sanity_heal");
    },
  });

  initEvent.itemComponentRegistry.registerCustomComponent("jsart_steel_pipe:trigger", {
    onHitEntity: (e) => {
      e.attackingEntity.runCommand("function cano_de_metal");
    },
  });

  initEvent.itemComponentRegistry.registerCustomComponent("jsart_sledgehammer:trigger", {
    onUse: (e) => {
      e.source.runCommand("function martelo_skill");
    },

    onHitEntity: (e) => {
      e.attackingEntity.runCommand("function martelo_dano");
    },
  });

  initEvent.itemComponentRegistry.registerCustomComponent("jsart_yokan:trigger", {
    onConsume: (e) => {
      e.source.addEffect("minecraft:instant_health", 200, { amplifier: 2 });
      e.source.addEffect("minecraft:jump_boost", 300, { amplifier: 2 });
      e.source.addEffect("minecraft:slow_falling", 400, { amplifier: 1 });
    },
  });
});
