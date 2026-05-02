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
  try {
    stopTimer(riderId);

    const startTick = savedStartTick ?? system.currentTick;
    const intervalId = system.runInterval(() => {
      const rider = findPlayerById(riderId);

      if (!rider || !playerJobMap.has(riderId)) {
        stopTimer(riderId); // หยุดถ้า rider ออกหรือไม่มีงานแล้ว
        return;
      }

      const elapsed = system.currentTick - startTick;
      const remaining = 20 * 60 * 20 - elapsed;

      if (remaining <= 0) {
        expireJob(riderId); // หมดเวลา — ยกเลิกงาน
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
  } catch (error) {
    console.error(" startTimer: " + error);
  }
};

// หมดเวลา: ยกเลิกงานของ rider
const expireJob = (riderId) => {
  try {
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
        "[Job] หมดเวลาแล้ว ระบบได้ยกเลิกการจัดส่งและนำกลับเข้าสู่คิว",
      );

    const owner = findPlayerById(job.owner);
    if (owner)
      owner.sendMessage(
        "[Job] ผู้ส่งงานหมดเวลา การจัดส่งถูกรีเซ็ตและเปิดรับใหม่",
      );

    viewJobs(rider);
  } catch (error) {
    console.error(" expireJob: " + error);
  }
};

// =========================================
// View Jobs
// =========================================
function viewJobs(player) {
  try {
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
  } catch (error) {
    console.error("viewJobs: " + error);
  }
}

const openJobDetail = (player, job) => {
  try {
    const total = totalDiamond(job);
    let body = `Owner: ${job.ownerName}\nReward: ${total} diamond\n\nItems required:`;

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
        player.sendMessage("[Job] คุณมีงานจัดส่งที่กำลังดำเนินการอยู่แล้ว");
        return;
      }
      if (job.status !== "open") {
        player.sendMessage("[Job] งานนี้ไม่อยู่ในสถานะที่สามารถรับได้แล้ว");
        return;
      }

      job.status = "taken";
      job.takenBy = player.id;
      playerJobMap.set(player.id, job.id);

      startTimer(player.id, job.id);
      saveData();

      player.sendMessage(
        "[Job] รับงานเรียบร้อยแล้ว คุณมีเวลา 20 นาที กรุณาเก็บไอเท็มให้ครบและกด Complete Delivery",
      );

      const owner = findPlayerById(job.owner);
      if (owner)
        owner.sendMessage(
          `[Job] ${player.name} ได้รับงานจัดส่งของคุณแล้ว ระบบเริ่มจับเวลา 20 นาที`,
        );
    });
  } catch (error) {
    console.error(" openJobDetail: " + error);
  }
};

system.runTimeout(() => {
  for (const [riderId, data] of timerMap.entries()) {
    if (data.startTick)
      startTimer(riderId, playerJobMap.get(riderId), data.startTick);
  }
}, 10);

export { openJobDetail, viewJobs };
