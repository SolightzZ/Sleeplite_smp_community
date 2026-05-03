import { world } from "@minecraft/server";
import { boardA, boardB } from "./data.js";

let objA, objB;

const board = (name) => {
  try {
    return (
      world.scoreboard.getObjective(name) ??
      world.scoreboard.addObjective(name, name)
    );
  } catch (error) {
    console.error("board: " + error);
  }
};

export const add = (player) => {
  try {
    if (!player || !player.isValid || !player.scoreboardIdentity) return;

    objA.addScore(player.scoreboardIdentity, 1);
    objB.addScore(`*${player.name}`, 1);
  } catch (error) {
    console.error("add: " + error);
  }
};

export const init = () => {
  try {
    objA = board(boardA);
    objB = board(boardB);
  } catch (error) {
    console.error("init: " + error);
  }
};
