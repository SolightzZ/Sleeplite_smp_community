import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { icons, sounds, stripPrefix } from './config.js';
import { giveDiamond } from './CompleteJob.js';
import { deleteJobData, getPlayerById, JOB_DURATION_TICKS, jobs, playerJobMap, showUI, stopTimer, timerMap, totalDiamond } from './Job.js';
import { showMainMenu } from './Menu.js';

const refundOwner = (job) => {
   const owner = getPlayerById(job.owner);
   const total = totalDiamond(job);
   if (pcheck(owner)) {
      giveDiamond(owner, total);
      cache.sendMessage(owner, `[Job] ได้ทำการคืน ${total} เพชรแล้ว เนื่องจากยกเลิกงาน`);
   }
};

export function editJobs(player) {
   if (!pcheck(player)) return;

   const myJobs = [];

   for (const job of jobs) {
      if (job.owner === player.id) myJobs.push(job);
   }

   const form = new ActionFormData();
   form.title('รายการคำสั่งของฉัน');

   if (myJobs.length === 0) {
      form.body('คุณไม่มีรายการคำสั่งที่กำลังดำเนินการ');
      form.button('ย้อนกลับ');
      showUI(player, form, () => {
          cache.playSound(player, sounds.bookPageTurn);
          showMainMenu(player);
       });
       return;
    }

    form.body('เลือกรายการคำสั่งเพื่อจัดการ:');

   const myJobsLen = myJobs.length;
   for (let i = 0; i < myJobsLen; i++) {
      const job = myJobs[i];
      const statusText = job.status === 'open' ? '[กำลังรับสมัคร]' : job.status === 'taken' ? '[มีผู้รับงานแล้ว]' : '[เสร็จสิ้น]';
      form.button(`${statusText} ${job.items.length} ชิ้น  | ของที่ได้รับ ${totalDiamond(job)} เพชร`);
   }

   form.button('ย้อนกลับ');

   showUI(player, form, (res) => {
      const backIdx = myJobs.length;
      if (res.selection === backIdx) {
       cache.playSound(player, sounds.bookPageTurn);
       showMainMenu(player);
       return;
    }

    const jobIdx = res.selection;
      const job = myJobs[jobIdx];

      if (job) {
          cache.playSound(player, sounds.orb);
         openManageJobDetail(player, job);
      }
   });
}

const openManageJobDetail = (player, job) => {
   if (!pcheck(player)) return;

   const statusText = job.status === 'open' ? 'กำลังรับสมัคร' : job.status === 'taken' ? 'มีผู้รับงานแล้ว' : 'เสร็จสิ้น';

   let body = `สถานะ: ${statusText}\n\n`;
   for (const item of job.items) {
       body += `- ${stripPrefix(item.id)} จำนวน ${item.amount} ชิ้น  (ของที่ได้รับ ${item.diamond} เพชร)\n`;
   }

   if (job.status === 'taken') {
      const rider = getPlayerById(job.takenBy);
      const t = timerMap.get(job.takenBy);
      let timeLeft = '';

      if (t) {
         const secs = Math.ceil((JOB_DURATION_TICKS - (system.currentTick - t.startTick)) / 20);
         const m = Math.floor(secs / 60),
            s = secs % 60;
         timeLeft = ` (เหลือเวลา ${m}:${String(s).padStart(2, '0')})`;
      }

      body += `\nคนส่ง: ${rider ? rider.name : 'ไม่ทราบชื่อ (ออฟไลน์)'}${timeLeft}`;
   }

   const canDelete = job.status === 'open' || job.status === 'taken';
   const form = new ActionFormData();
   form.title('จัดการคำสั่ง');
   form.body(body);

   if (canDelete) {
       form.button('ยกเลิกคำสั่ง', icons.cancel);
      form.button('ย้อนกลับ');
   } else {
      form.button('ย้อนกลับ');
   }

   showUI(player, form, (res) => {
      if (canDelete && res.selection === 0) {
         if (job.status === 'taken' && job.takenBy) {
            const rider = getPlayerById(job.takenBy);
            if (pcheck(rider)) cache.sendMessage(rider, '[Job] งานนี้ถูกยกเลิกโดยเจ้าของแล้ว');
            stopTimer(job.takenBy);
            playerJobMap.delete(job.takenBy);
         }

         refundOwner(job);
         deleteJobData(job.id);
         if (pcheck(player)) cache.sendMessage(player, '[Job] คำสั่งถูกยกเลิกเรียบร้อยแล้ว');
          cache.playSound(player, sounds.vaultDeactivate);
         editJobs(player);
      } else {
          cache.playSound(player, sounds.bookPageTurn);
         editJobs(player);
      }
   });
};
