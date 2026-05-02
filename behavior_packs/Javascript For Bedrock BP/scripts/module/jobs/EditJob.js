import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import {
  deleteJobData,
  findPlayerById,
  jobs,
  playerJobMap,
  showUI,
  stopTimer,
  timerMap,
  totalDiamond,
} from "./Job";
import { showMainMenu } from "./Menu";
import { giveDiamond } from "./CompleteJob";
// คืน diamond ให้ owner (ใช้ตอน delete/cancel)
const refundOwner = (job) => {
  const owner = findPlayerById(job.owner);
  const total = totalDiamond(job);
  if (owner) {
    giveDiamond(owner, total);
    owner.sendMessage(`[Job] Refunded ${total} diamond (job cancelled)`);
  }
};

// =========================================
//  Manage Jobs
// =========================================
function editJobs(player) {
  const myJobs = jobs.filter((j) => j.owner === player.id);

  const form = new ActionFormData();
  form.title("My Orders");

  if (myJobs.length === 0) {
    form.body("You have no active orders.");
    form.button("Back");
    showUI(player, form, () => showMainMenu(player));
    return;
  }

  let body = "Select an order to manage:";
  form.body(body);

  for (const job of myJobs) {
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
  const statusText =
    job.status === "open" ? "Open" : job.status === "taken" ? "Taken" : "Done";

  let body = `Status: ${statusText}\n\n`;
  for (const it of job.items)
    body += `- ${it.id.replace("minecraft:", "")} x${it.amount}  (${it.diamond} diamond)\n`;

  if (job.status === "taken") {
    const rider = findPlayerById(job.takenBy);
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
    form.button("Cancel Order"); // 0
    form.button("Back"); // 1
  } else {
    form.button("Back"); // 0
  }

  showUI(player, form, (res) => {
    if (canDelete && res.selection === 0) {
      if (job.status === "taken" && job.takenBy) {
        const rider = findPlayerById(job.takenBy);
        if (rider)
          rider.sendMessage("[Job] Your order was cancelled by the owner");
        stopTimer(job.takenBy);
        playerJobMap.delete(job.takenBy);
      }
      // คืน diamond ให้ owner
      refundOwner(job);
      deleteJobData(job.id);
      player.sendMessage("[Job] Order cancelled");
      editJobs(player);
    } else {
      editJobs(player);
    }
  });
};

export { editJobs };
