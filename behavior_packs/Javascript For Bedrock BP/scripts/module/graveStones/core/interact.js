import { system } from "@minecraft/server";
import { GRAVESTONE_ENTITY } from "../config.js";

export function onGravestoneInteract(event) {
  const { target, player } = event;
  if (!player?.isValid || !target?.isValid) return;
  if (target.typeId !== GRAVESTONE_ENTITY) return;

  system.run(() => {
    if (target.isValid) target.kill();
  });
}
