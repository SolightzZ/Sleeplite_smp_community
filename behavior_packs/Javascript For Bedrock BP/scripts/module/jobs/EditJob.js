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

const refundOwner = (job) => {
  try {
    const owner = findPlayerById(job.owner);
    const total = totalDiamond(job);
    if (owner) {
      giveDiamond(owner, total);
      owner.sendMessage(
        `[Job] ได้ทำการคืน ${total} เพชรแล้ว เนื่องจากยกเลิกงาน`,
      );
    }
  } catch (error) {
    console.error(" refundOwner: " + error);
  }
};

// =========================================
//  Manage Jobs
// =========================================
function editJobs(player) {
  try {
    const myJobs = jobs.filter((j) => j.owner === player.id);

    const form = new ActionFormData();
    form.title("My Orders");

    if (myJobs.length === 0) {
      form.body("You have no active orders.");
      form.button("Back");
      showUI(player, form, () => showMainMenu(player));
      return;
    }

    form.body("Select an order to manage:");

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
  } catch (error) {
    console.error(" editJobs: " + error);
  }
}

const openManageJobDetail = (player, job) => {
  try {
    const statusText =
      job.status === "open"
        ? "Open"
        : job.status === "taken"
          ? "Taken"
          : "Done";

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
      form.button("Cancel Order");
      form.button("Back");
    } else {
      form.button("Back");
    }

    showUI(player, form, (res) => {
      if (canDelete && res.selection === 0) {
        if (job.status === "taken" && job.takenBy) {
          const rider = findPlayerById(job.takenBy);
          if (rider) rider.sendMessage("[Job] งานนี้ถูกยกเลิกโดยเจ้าของแล้ว");
          stopTimer(job.takenBy);
          playerJobMap.delete(job.takenBy);
        }

        refundOwner(job);
        deleteJobData(job.id);
        player.sendMessage("[Job] คำสั่งถูกยกเลิกเรียบร้อยแล้ว");
        editJobs(player);
      } else {
        editJobs(player);
      }
    });
  } catch (error) {
    console.error(" openManageJobDetail: " + error);
  }
};

export { editJobs };
