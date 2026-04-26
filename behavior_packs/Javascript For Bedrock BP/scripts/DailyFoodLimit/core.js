import { system } from "@minecraft/server";
import { rules, foods } from "./constants.js";
import * as State from "./state.js";
import * as Utils from "./utils.js";
import * as UI from "./ui.js";

const spam = new WeakMap();

export function tryeat(player, item, event) {
  if (!item) return;
  const id = item.typeId;
  if (!Utils.isfood(foods, id)) return;

  const tick = system.currentTick;
  const last = spam.get(player) ?? 0;

  if (State.getcount(player, id) >= rules.max) {
    event.cancel = true;

    if (tick - last > rules.spamwait) {
      UI.warn(player, Utils.fixname(id), rules.max);
      spam.set(player, tick);
    }
  }
}

export function ate(player, item) {
  const id = item.typeId;
  if (!Utils.isfood(foods, id)) return;

  const newcount = State.add(player, id);
  UI.success(player, Utils.fixname(id), newcount, rules.max);
}

export function clean(player) {
  spam.delete(player);
}
