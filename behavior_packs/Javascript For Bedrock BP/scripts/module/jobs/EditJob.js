import { system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import { giveDiamond } from './CompleteJob.js';
import { deleteJobData, getPlayerById, jobs, playerJobMap, showUI, stopTimer, timerMap, totalDiamond } from './Job.js';
import { showMainMenu } from './Menu.js';

const refundOwner = (job) => {
    const owner = getPlayerById(job.owner);
    const total = totalDiamond(job);
    if (owner && owner.isValid) {
        giveDiamond(owner, total);
        owner.sendMessage(`[Job] ได้ทำการคืน ${total} เพชรแล้ว เนื่องจากยกเลิกงาน`);
    }
};

export function editJobs(player) {
    if (!player.isValid) return;

    const myJobs = [];
    const len = jobs.length;

    for (let i = 0; i < len; i++) {
        if (jobs[i].owner === player.id) myJobs.push(jobs[i]);
    }

    const form = new ActionFormData();
    form.title('รายการคำสั่งของฉัน');

    if (myJobs.length === 0) {
        form.body('คุณไม่มีรายการคำสั่งที่กำลังดำเนินการ');
        form.button('ย้อนกลับ');
        showUI(player, form, () => showMainMenu(player));
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

    const statusText = job.status === 'open' ? 'กำลังรับสมัคร' : job.status === 'taken' ? 'มีผู้รับงานแล้ว' : 'เสร็จสิ้น';

    let body = `สถานะ: ${statusText}\n\n`;
    const itemsLen = job.items.length;
    for (let i = 0; i < itemsLen; i++) {
        const it = job.items[i];
        body += `- ${it.id.replace('minecraft:', '')} จำนวน ${it.amount} ชิ้น  (ของที่ได้รับ ${it.diamond} เพชร)\n`;
    }

    if (job.status === 'taken') {
        const rider = getPlayerById(job.takenBy);
        const t = timerMap.get(job.takenBy);
        let timeLeft = '';

        if (t) {
            const secs = Math.ceil((20 * 60 * 20 - (system.currentTick - t.startTick)) / 20);
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
        form.button('ยกเลิกคำสั่ง', 'textures/ui/cancel');
        form.button('ย้อนกลับ');
    } else {
        form.button('ย้อนกลับ');
    }

    showUI(player, form, (res) => {
        if (canDelete && res.selection === 0) {
            if (job.status === 'taken' && job.takenBy) {
                const rider = getPlayerById(job.takenBy);
                if (rider && rider.isValid) rider.sendMessage('[Job] งานนี้ถูกยกเลิกโดยเจ้าของแล้ว');
                stopTimer(job.takenBy);
                playerJobMap.delete(job.takenBy);
            }

            refundOwner(job);
            deleteJobData(job.id);
            if (player.isValid) player.sendMessage('[Job] คำสั่งถูกยกเลิกเรียบร้อยแล้ว');
            editJobs(player);
        } else {
            editJobs(player);
        }
    });
};
