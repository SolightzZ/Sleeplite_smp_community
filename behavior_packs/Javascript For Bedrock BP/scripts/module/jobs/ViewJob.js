import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import {
  findPlayerById,
  jobs,
  playerJobMap,
  saveData,
  showUI,
  stopTimer,
  timerMap,
  totalDiamond,
} from "./Job";
import { showMainMenu } from "./Menu";

// Timer
const startTimer = (riderId, jobId_, savedStartTick) => {
  stopTimer(riderId);

  const startTick = savedStartTick ?? system.currentTick;
  const intervalId = system.runInterval(() => {
    const rider = findPlayerById(riderId);

    // หยุดถ้า rider ออกหรือไม่มีงานแล้ว
    if (!rider || !playerJobMap.has(riderId)) {
      stopTimer(riderId);
      return;
    }

    const elapsed = system.currentTick - startTick;
    const remaining = 20 * 60 * 20 - elapsed;

    if (remaining <= 0) {
      // หมดเวลา — ยกเลิกงาน
      expireJob(riderId);
      return;
    }

    const secs = Math.ceil(remaining / 20);
    const mins = Math.floor(secs / 60);
    const sec2 = secs % 60;
    const pad = sec2 < 10 ? "0" : "";

    rider.onScreenDisplay.setActionBar(
      `[Job] Time left: ${mins}:${pad}${sec2}`,
    );
  }, 20);

  timerMap.set(riderId, { intervalId, startTick });
};

// หมดเวลา: ยกเลิกงานของ rider
const expireJob = (riderId) => {
  stopTimer(riderId);

  const jobId_ = playerJobMap.get(riderId);
  playerJobMap.delete(riderId);

  if (jobId_ === undefined) return;
  const job = jobs.find((j) => j.id === jobId_);
  if (!job) return;

  job.status = "open";
  job.takenBy = null;
  saveData();

  const rider = findPlayerById(riderId);
  if (rider)
    rider.sendMessage(
      "[Job] Time is up! Delivery cancelled and returned to queue",
    );

  const owner = findPlayerById(job.owner);
  if (owner)
    owner.sendMessage("[Job] Rider ran out of time. Delivery is open again");
};

// =========================================
// View Jobs
// =========================================
function viewJobs(player) {
  const openJobs = jobs.filter((j) => j.status === "open");

  const form = new ActionFormData();
  form.title("Available Deliveries");

  if (openJobs.length === 0) {
    form.body("No deliveries available.");
    form.button("Back");
    showUI(player, form, () => showMainMenu(player));
    return;
  }

  form.body(`${openJobs.length} delivery(ies) available:`);
  for (const job of openJobs)
    form.button(
      `${job.ownerName}\n${job.items.length} items  ${totalDiamond(job)} diamond`,
    );
  form.button("Back");

  showUI(player, form, (res) => {
    if (res.selection === openJobs.length) {
      showMainMenu(player);
      return;
    }
    const job = openJobs[res.selection];
    if (job) openJobDetail(player, job);
  });
}

const openJobDetail = (player, job) => {
  const total = totalDiamond(job);
  let body = `Owner: ${job.ownerName}
Reward: ${total} diamond

Items required:
`;

  for (const it of job.items) {
    body += `- ${it.id.replace("minecraft:", "")} x${it.amount} (${it.diamond} diamond)\n`;
  }

  const form = new ActionFormData();
  form.title("Delivery Detail");
  form.body(body);
  form.button("Accept Delivery");
  form.button("Back");

  showUI(player, form, (res) => {
    if (res.selection === 1) {
      viewJobs(player);
      return;
    }

    if (playerJobMap.has(player.id)) {
      player.sendMessage("[Job] You already have an active delivery");
      return;
    }
    if (job.status !== "open") {
      player.sendMessage("[Job] This delivery is no longer available");
      return;
    }

    job.status = "taken";
    job.takenBy = player.id;
    playerJobMap.set(player.id, job.id);

    startTimer(player.id, job.id);
    saveData();

    player.sendMessage(
      "[Job] Accepted! You have 20 minutes. Collect items and press Complete Delivery",
    );

    const owner = findPlayerById(job.owner);
    if (owner)
      owner.sendMessage(
        `[Job] ${player.name} accepted your delivery order (20 min timer started)`,
      );
  });
};

system.run(() => {
  system.runTimeout(() => {
    for (const [riderId, data] of timerMap.entries()) {
      if (data.startTick)
        startTimer(riderId, playerJobMap.get(riderId), data.startTick);
    }
  }, 10);
});

export { openJobDetail, viewJobs };
