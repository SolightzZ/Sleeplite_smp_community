import { system } from "@minecraft/server";

function onGravestoneInteract(event) {
  const { target, player } = event;
  if (!player || !target) return;
  if (target.typeId !== "true:gravestone_storage") return;

  system.run(() => {
    target.kill();
  });
}

export { onGravestoneInteract };
