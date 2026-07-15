import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { Registry } from '../../events/registry.js';
import { cache } from '../../shared/cache.js';
import { pcheck } from './../../shared/player.js';
import { icons, sounds, stripPrefix } from './config.js';
import { getPlayerById, JOB_DURATION_TICKS, jobs, playerJobMap, saveData, showUI, stopTimer, timerMap, totalDiamond } from './Job.js';
import { showMainMenu } from './Menu.js';

const startTimer = (riderId, jobId_, savedStartTick) => {
   stopTimer(riderId);

   const startTick = savedStartTick ?? system.currentTick;

   timerMap.set(riderId, { startTick });
};

export const processTimers = () => {
   if (timerMap.size === 0) return;

   for (const [riderId, data] of timerMap) {
      if (!playerJobMap.has(riderId)) {
         stopTimer(riderId);
         continue;
      }

      const elapsed = system.currentTick - data.startTick;
      const remaining = JOB_DURATION_TICKS - elapsed;

      if (remaining <= 0) {
         expireJob(riderId);
         continue;
      }

      const rider = Registry.get(riderId)?.player;
      if (!pcheck(rider)) continue;

      const secs = Math.ceil(remaining / 20);
      const mins = Math.floor(secs / 60);
      const sec2 = secs % 60;
      const pad = sec2 < 10 ? '0' : '';

      cache.setActionBar(rider.onScreenDisplay, `[Job] Time left: ${mins}:${pad}${sec2}`);
   }
};

const expireJob = (riderId) => {
   stopTimer(riderId);

   const jobId_ = playerJobMap.get(riderId);
   playerJobMap.delete(riderId);

   if (jobId_ === undefined) return;

   let job = null;

   for (const currentJob of jobs) {
      if (currentJob.id === jobId_) {
         job = currentJob;
         break;
      }
   }

   if (!job) return;

   job.status = 'open';
   job.takenBy = null;
   saveData();

   const rider = getPlayerById(riderId);
   if (pcheck(rider)) {
      cache.sendMessage(rider, '[Job] หมดเวลาแล้ว ระบบได้ยกเลิกการจัดส่งและนำกลับเข้าสู่ “งานจัดส่งที่พร้อมรับ”');
      viewJobs(rider);
   }

   const owner = getPlayerById(job.owner);
   if (pcheck(owner)) cache.sendMessage(owner, '[Job] ผู้ส่งงานหมดเวลา การจัดส่งถูกรีเซ็ตและเปิดรับใหม่');
};

export function viewJobs(player) {
   if (!pcheck(player)) return;

   const openJobs = [];
   for (const job of jobs) {
      if (job.status === 'open') openJobs.push(job);
   }

   const form = new ActionFormData();
   form.title('งานจัดส่งที่พร้อมรับ');

   if (openJobs.length === 0) {
      form.body('ไม่มีงานจัดส่งในขณะนี้');
      form.button('ย้อนกลับ');
      showUI(player, form, () => {
          cache.playSound(player, sounds.bookPageTurn);
         showMainMenu(player);
      });
      return;
   }

   form.body(`มีงานจัดส่งที่พร้อมรับ ${openJobs.length} งาน:`);
   const openLen = openJobs.length;
   for (let i = 0; i < openLen; i++) {
      const job = openJobs[i];
       form.button(`${job.ownerName}\nจำนวน ${job.items.length} ชิ้น  | ของที่ได้รับ ${totalDiamond(job)} เพชร`, icons.deals);
   }

   form.button('ย้อนกลับ');

   showUI(player, form, (res) => {
      if (res.selection === openJobs.length) {
          cache.playSound(player, sounds.bookPageTurn);
         showMainMenu(player);
         return;
      }
      const job = openJobs[res.selection];
      if (job) {
          cache.playSound(player, sounds.orb);
         openJobDetail(player, job);
      }
   });
}

const openJobDetail = (player, job) => {
   if (!pcheck(player)) return;

   const total = totalDiamond(job);
   let body = `ผู้ว่าจ้าง: ${job.ownerName}\nของที่ได้รับ: ${total} เพชร\n\nไอเทมที่ต้องการ:\n`;

   for (const item of job.items) {
       body += `- ${stripPrefix(item.id)} จำนวน ${item.amount} ชิ้น (ของที่ได้รับ ${item.diamond} เพชร)\n`;
   }

   const form = new ActionFormData();
   form.title('รายละเอียดงานจัดส่ง');
   form.body(body);
    form.button('รับงานจัดส่ง', icons.newConfirm);
    form.button('ย้อนกลับ');

    showUI(player, form, (res) => {
       if (res.selection === 1) {
          cache.playSound(player, sounds.bookPageTurn);
          viewJobs(player);
          return;
       }

       if (playerJobMap.has(player.id)) {
          cache.playSound(player, sounds.falsePermissions);
         if (pcheck(player)) cache.sendMessage(player, '[Job] คุณมีงานจัดส่งที่กำลังดำเนินการอยู่แล้ว');
         return;
      }

      if (job.status !== 'open') {
          cache.playSound(player, sounds.fizz);
         if (pcheck(player)) cache.sendMessage(player, '[Job] งานนี้ไม่อยู่ในสถานะที่สามารถรับได้แล้ว');
         return;
      }

      job.status = 'taken';
      job.takenBy = player.id;
      playerJobMap.set(player.id, job.id);

      startTimer(player.id, job.id);
      saveData();

       cache.playSound(player, sounds.barrelOpen);
      if (pcheck(player)) {
         cache.sendMessage(player, '[Job] รับงานเรียบร้อยแล้ว คุณมีเวลา 20 นาที กรุณาเก็บไอเท็มให้ครบและกด “ส่งมอบงาน”');
      }

      const owner = getPlayerById(job.owner);
      if (pcheck(owner)) cache.sendMessage(owner, `[Job] ${player.name} ได้รับงานจัดส่งของคุณแล้ว ระบบเริ่มจับเวลา 20 นาที`);
   });
};
