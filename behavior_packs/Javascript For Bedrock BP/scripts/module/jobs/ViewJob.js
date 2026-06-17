import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import {
   getPlayerById,
   JOB_DURATION_TICKS,
   jobs,
   playerJobMap,
   saveData,
   showUI,
   stopTimer,
   timerMap,
   totalDiamond,
} from './Job.js';
import { showMainMenu } from './Menu.js';
import { Registry } from '../../router/core/registry.js';
import { addSound } from '../../plugin/utils.js';

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
      if (!rider || !rider.isValid) continue;

      const secs = Math.ceil(remaining / 20);
      const mins = Math.floor(secs / 60);
      const sec2 = secs % 60;
      const pad = sec2 < 10 ? '0' : '';

      rider.onScreenDisplay?.setActionBar(`[Job] Time left: ${mins}:${pad}${sec2}`);
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
   if (rider && rider.isValid) {
      rider.sendMessage(
         '[Job] หมดเวลาแล้ว ระบบได้ยกเลิกการจัดส่งและนำกลับเข้าสู่ “งานจัดส่งที่พร้อมรับ”',
      );
      viewJobs(rider);
   }

   const owner = getPlayerById(job.owner);
   if (owner && owner.isValid)
      owner.sendMessage('[Job] ผู้ส่งงานหมดเวลา การจัดส่งถูกรีเซ็ตและเปิดรับใหม่');
};

export function viewJobs(player) {
   if (!player.isValid) return;

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
         addSound(player, 'item.book.page_turn');
         showMainMenu(player);
      });
      return;
   }

   form.body(`มีงานจัดส่งที่พร้อมรับ ${openJobs.length} งาน:`);
   const openLen = openJobs.length;
   for (let i = 0; i < openLen; i++) {
      const job = openJobs[i];
      form.button(
         `${job.ownerName}\nจำนวน ${job.items.length} ชิ้น  | ของที่ได้รับ ${totalDiamond(job)} เพชร`,
         'textures/ui/icon_deals',
      );
   }

   form.button('ย้อนกลับ');

   showUI(player, form, (res) => {
      if (res.selection === openJobs.length) {
         addSound(player, 'item.book.page_turn');
         showMainMenu(player);
         return;
      }
      const job = openJobs[res.selection];
      if (job) {
         addSound(player, 'random.orb');
         openJobDetail(player, job);
      }
   });
}

export const openJobDetail = (player, job) => {
   if (!player.isValid) return;

   const total = totalDiamond(job);
   let body = `ผู้ว่าจ้าง: ${job.ownerName}\nของที่ได้รับ: ${total} เพชร\n\nไอเทมที่ต้องการ:\n`;

   for (const item of job.items) {
      body += `- ${item.id.replace('minecraft:', '')} จำนวน ${item.amount} ชิ้น (ของที่ได้รับ ${item.diamond} เพชร)\n`;
   }

   const form = new ActionFormData();
   form.title('รายละเอียดงานจัดส่ง');
   form.body(body);
   form.button('รับงานจัดส่ง', 'textures/ui/New_confirm_Hover');
   form.button('ย้อนกลับ');

   showUI(player, form, (res) => {
      if (res.selection === 1) {
         addSound(player, 'item.book.page_turn');
         viewJobs(player);
         return;
      }

      if (playerJobMap.has(player.id)) {
         addSound(player, 'block.false_permissions');
         if (player.isValid) player.sendMessage('[Job] คุณมีงานจัดส่งที่กำลังดำเนินการอยู่แล้ว');
         return;
      }

      if (job.status !== 'open') {
         addSound(player, 'random.fizz');
         if (player.isValid) player.sendMessage('[Job] งานนี้ไม่อยู่ในสถานะที่สามารถรับได้แล้ว');
         return;
      }

      job.status = 'taken';
      job.takenBy = player.id;
      playerJobMap.set(player.id, job.id);

      startTimer(player.id, job.id);
      saveData();

      addSound(player, 'block.barrel.open');
      if (player.isValid) {
         player.sendMessage(
            '[Job] รับงานเรียบร้อยแล้ว คุณมีเวลา 20 นาที กรุณาเก็บไอเท็มให้ครบและกด “ส่งมอบงาน”',
         );
      }

      const owner = getPlayerById(job.owner);
      if (owner && owner.isValid)
         owner.sendMessage(
            `[Job] ${player.name} ได้รับงานจัดส่งของคุณแล้ว ระบบเริ่มจับเวลา 20 นาที`,
         );
   });
};
