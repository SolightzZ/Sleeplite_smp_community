import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { giveDiamond } from "./CompleteJob.js";
import {
  deleteJobData,
  getPlayerById,
  jobs,
  playerJobMap,
  showUI,
  stopTimer,
  timerMap,
  totalDiamond,
} from "./Job.js";
import { showMainMenu } from "./Menu.js";

const refundOwner = (job) => {
  const owner = getPlayerById(job.owner);
  const total = totalDiamond(job);
  if (owner && owner.isValid) {
    giveDiamond(owner, total);
    owner.sendMessage(`[Job] ได้ทำการคืน ${total} เพชรแล้ว เนื่องจากยกเลิกงาน`);
  }
};

// =========================================
//  Manage Jobs
// =========================================
export function editJobs(player) {
  if (!player.isValid) return;

  const myJobs = [];
  const len = jobs.length;
  for (let i = 0; i < len; i++) {
    if (jobs[i].owner === player.id) myJobs.push(jobs[i]);
  }

  const form = new ActionFormData();
  form.title("My Orders");

  if (myJobs.length === 0) {
    form.body("You have no active orders.");
    form.button("Back");
    showUI(player, form, () => showMainMenu(player));
    return;
  }

  form.body("Select an order to manage:");

  const myJobsLen = myJobs.length;
  for (let i = 0; i < myJobsLen; i++) {
    const job = myJobs[i];
    const statusText =
      job.status === "open"
        ? "[Open]"
        : job.status === "taken"
          ? "[Taken]"
          : "[Done]";
    form.button(
      `${statusText} ${job.items.length} items  ${totalDiamond(job)} diamond`,
    );
  }
  form.button("Back");

  showUI(player, form, (res) => {
    const backIdx = myJobs.length;
    if (res.selection === backIdx) {
      showMainMenu(player);
      return;
    }
    const jobIdx = res.selection;
    const job = myJobs[jobIdx];
    if (job) openManageJobDetail(player, job);
  });
}

const openManageJobDetail = (player, job) => {
  if (!player.isValid) return;

  const statusText =
    job.status === "open" ? "Open" : job.status === "taken" ? "Taken" : "Done";

  let body = `Status: ${statusText}\n\n`;
  const itemsLen = job.items.length;
  for (let i = 0; i < itemsLen; i++) {
    const it = job.items[i];
    body += `- ${it.id.replace("minecraft:", "")} x${it.amount}  (${it.diamond} diamond)\n`;
  }

  if (job.status === "taken") {
    const rider = getPlayerById(job.takenBy);
    const t = timerMap.get(job.takenBy);
    let timeLeft = "";
    if (t) {
      const secs = Math.ceil(
        (20 * 60 * 20 - (system.currentTick - t.startTick)) / 20,
      );
      const m = Math.floor(secs / 60),
        s = secs % 60;
      timeLeft = ` (${m}:${String(s).padStart(2, "0")} left)`;
    }
    body += `\nRider: ${rider ? rider.name : "Unknown (offline)"}${timeLeft}`;
  }

  const canDelete = job.status === "open" || job.status === "taken";
  const form = new ActionFormData();
  form.title("Manage Order");
  form.body(body);
  if (canDelete) {
    form.button("Cancel Order");
    form.button("Back");
  } else {
    form.button("Back");
  }

  showUI(player, form, (res) => {
    if (canDelete && res.selection === 0) {
      if (job.status === "taken" && job.takenBy) {
        const rider = getPlayerById(job.takenBy);
        if (rider && rider.isValid)
          rider.sendMessage("[Job] งานนี้ถูกยกเลิกโดยเจ้าของแล้ว");
        stopTimer(job.takenBy);
        playerJobMap.delete(job.takenBy);
      }

      refundOwner(job);
      deleteJobData(job.id);
      if (player.isValid)
        player.sendMessage("[Job] คำสั่งถูกยกเลิกเรียบร้อยแล้ว");
      editJobs(player);
    } else {
      editJobs(player);
    }
  });
};
