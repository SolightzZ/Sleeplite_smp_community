import { system, world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
  initEvent.itemComponentRegistry.registerCustomComponent(
    "be_chocolate_bucket_mid:trigger",
    {
      onConsume: (e) => {
        e.source.removeEffect("minecraft:slowness");
        e.source.removeEffect("minecraft:weakness");
        e.source.removeEffect("minecraft:saturation");
        e.source.removeEffect("minecraft:poison");
        e.source.removeEffect("minecraft:wither");
        e.source.removeEffect("minecraft:nausea");
        e.source.removeEffect("minecraft:hunger");
        e.source.removeEffect("minecraft:blindness");
        e.source.removeEffect("minecraft:bad_omen");
        e.source.removeEffect("minecraft:fatal_poison");
        e.source.removeEffect("minecraft:mining_fatigue");
      },
    },
  );

  initEvent.itemComponentRegistry.registerCustomComponent(
    "ber_bucket_chocolate_low:trigger",
    {
      onConsume: (e) => {
        e.source.removeEffect("minecraft:nausea");
        e.source.removeEffect("minecraft:poison");
        e.source.removeEffect("minecraft:weakness");
        e.source.removeEffect("minecraft:slowness");
        e.source.removeEffect("minecraft:mining_fatigue");
        e.source.removeEffect("minecraft:hunger");
        e.source.removeEffect("minecraft:blindness");
        e.source.removeEffect("minecraft:fatal_poison");
        e.source.removeEffect("minecraft:wither");
        e.source.removeEffect("minecraft:bad_omen");
      },
    },
  );

  initEvent.itemComponentRegistry.registerCustomComponent(
    "ber_chocolate_bucket_full:trigger",
    {
      onConsume: (e) => {
        e.source.removeEffect("minecraft:weakness");
        e.source.removeEffect("minecraft:wither");
        e.source.removeEffect("minecraft:slowness");
        e.source.removeEffect("minecraft:mining_fatigue");
        e.source.removeEffect("minecraft:nausea");
        e.source.removeEffect("minecraft:poison");
        e.source.removeEffect("minecraft:hunger");
        e.source.removeEffect("minecraft:blindness");
        e.source.removeEffect("minecraft:fatal_poison");
        e.source.removeEffect("minecraft:bad_omen");
        e.source.removeEffect("minecraft:saturation");
      },
    },
  );

  initEvent.itemComponentRegistry.registerCustomComponent(
    "ber_lush_salad:trigger",
    {
      onConsume: (e) => {
        e.source.addEffect("minecraft:night_vision", 400, { amplifier: 1 });
      },
    },
  );

  initEvent.itemComponentRegistry.registerCustomComponent(
    "ber_honey_sausage:trigger",
    {
      onConsume: (e) => {
        e.source.removeEffect("minecraft:blindness");
        e.source.removeEffect("minecraft:nausea");
        e.source.removeEffect("minecraft:poison");
        e.source.removeEffect("minecraft:wither");
        e.source.removeEffect("minecraft:weakness");
        e.source.removeEffect("minecraft:slowness");
        e.source.removeEffect("minecraft:hunger");
      },
    },
  );
});
