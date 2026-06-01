import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { amountMap, countItem, createJobData, buildInventoryMap, ITEM_IDS, jobs, selectedMap, showUI } from './Job.js';
import { showMainMenu } from './Menu.js';

export const getIcon = (typeId) => {
    return ITEM_IDS.has(typeId) ? `textures/items/${typeId.replace('minecraft:', '')}` : 'textures/ui/icon_none';
};

export const formatName = (id) => {
    const parts = id.split(':');

    return (parts.length > 1 ? parts[1] : id).replace(/_/g, ' ');
};

export const searchBlock = (player) => {
    if (!player.isValid) return;

    const inv = player.getComponent('minecraft:inventory')?.container;
    if (!inv) return;

    const invMap = buildInventoryMap(inv);

    if (invMap.size === 0) {
        player.sendMessage('[Job] ไม่พบไอเท็มในคลัง');
        createJob(player);
        return;
    }

    const selectedList = selectedMap.get(player.id) ?? [];

    const found = Array.from(invMap.keys())
        .sort((a, b) => formatName(a).localeCompare(formatName(b)))
        .slice(0, 50);

    const form = new ActionFormData();
    form.title(`เลือกไอเทม (${selectedList.length}/5)`);
    form.button('ย้อนกลับ');

    const foundLen = found.length;

    for (let i = 0; i < foundLen; i++) {
        const id = found[i];
        let count = 0;
        const selLen = selectedList.length;

        for (let j = 0; j < selLen; j++) {
            if (selectedList[j] === id) count++;
        }

        form.button(`${count > 0 ? `§9[${count}] ` : ''}${id.replace('minecraft:', '')}`, getIcon(id));
    }

    showUI(player, form, (res) => {
        if (res.selection === 0) {
            createJob(player);
            return;
        }

        const chosen = found[res.selection - 1];
        if (!chosen) return;

        const list = [];
        const slen = selectedList.length;

        for (let i = 0; i < slen; i++) list.push(selectedList[i]);

        if (list.length >= 5) {
            if (player.isValid) player.sendMessage('[Job] เลือกได้สูงสุด 5 ไอเท็ม');
            searchBlock(player);
            return;
        }

        if ((invMap.get(chosen) ?? 0) === 0) {
            if (player.isValid) player.sendMessage('[Job] คุณไม่มีไอเท็มนี้');
            searchBlock(player);
            return;
        }

        let isDuplicate = false;
        for (let i = 0; i < slen; i++) {
            if (list[i] === chosen) {
                isDuplicate = true;
                break;
            }
        }

        if (isDuplicate) {
            if (player.isValid) player.sendMessage('[Job] คุณได้เลือกไอเท็มนี้ไปแล้ว');
            searchBlock(player);
            return;
        }

        list.push(chosen);

        selectedMap.set(player.id, list);
        searchBlock(player);
    });
};

export function createJob(player) {
    if (!player.isValid) return;

    const activeJobs = [];
    const jLen = jobs.length;

    for (let i = 0; i < jLen; i++) {
        if (jobs[i].owner === player.id) activeJobs.push(jobs[i]);
    }

    if (activeJobs.length >= 5) {
        player.sendMessage('[Job] จำนวนงานสูงสุดที่สร้างได้คือ 5 งาน');
        showMainMenu(player);
        return;
    }

    const selected = selectedMap.get(player.id) ?? [];
    const itemCount = selected.length === 0 ? 1 : selected.length;

    const form = new ActionFormData();
    form.title('สร้างคำสั่งจัดส่ง');
    form.body('กดที่ไอเทมเพื่อนำออก  |  กดค้นหาเพื่อเพิ่มไอเทม');
    form.button('ค้นหาไอเทม');

    if (selected.length === 0) {
        form.label('เลือกแล้ว (0/5)');
        form.button('ยังไม่ได้เลือกไอเทม', 'textures/ui/icon_none');
    } else {
        form.label(`เลือกแล้ว (${selected.length}/5)  กดเพื่อนำออก`);
        const sLen = selected.length;

        for (let i = 0; i < sLen; i++) {
            form.button(selected[i].replace('minecraft:', ''), getIcon(selected[i]));
        }
    }

    const nextIndex = 1 + itemCount;
    const backIndex = nextIndex + 1;
    form.button('ถัดไป > กำหนดจำนวน');
    form.divider();
    form.button('ย้อนกลับ');

    showUI(player, form, (res) => {
        if (!player.isValid) return;
        if (res.selection === 0) {
            searchBlock(player);
        } else if (res.selection === nextIndex) {
            if (selected.length === 0) {
                player.sendMessage('[Job] กรุณาเลือกอย่างน้อย 1 ไอเท็ม');
                createJob(player);
                return;
            }
            const inv = player.getComponent('minecraft:inventory')?.container;
            if (!inv) return;
            const invMap = buildInventoryMap(inv);

            let missing = null;
            const sLen2 = selected.length;
            for (let i = 0; i < sLen2; i++) {
                if ((invMap.get(selected[i]) ?? 0) === 0) {
                    missing = selected[i];
                    break;
                }
            }

            if (missing) {
                player.sendMessage(`[Job] ไม่พบไอเท็มในคลังแล้ว: ${missing.replace('minecraft:', '')}`);

                const filtered = [];
                for (let i = 0; i < sLen2; i++) {
                    if (selected[i] !== missing) filtered.push(selected[i]);
                }
                selectedMap.set(player.id, filtered);
                createJob(player);
                return;
            }

            openAmountForm(player);
        } else if (res.selection === backIndex) {
            selectedMap.delete(player.id);
            amountMap.delete(player.id);
            showMainMenu(player);
        } else if (res.selection >= 1 && res.selection < nextIndex) {
            const filtered = [];
            const removeIdx = res.selection - 1;
            const sLen3 = selected.length;

            for (let i = 0; i < sLen3; i++) {
                if (i !== removeIdx) filtered.push(selected[i]);
            }

            selectedMap.set(player.id, filtered);
            createJob(player);
        }
    });
}

export const openAmountForm = (player) => {
    if (!player.isValid) return;

    const selected = selectedMap.get(player.id) ?? [];
    if (selected.length === 0) {
        createJob(player);
        return;
    }

    const currentAmounts = amountMap.get(player.id) ?? [];
    const modal = new ModalFormData();
    modal.title('กำหนดจำนวน');

    const sLen = selected.length;
    for (let i = 0; i < sLen; i++) {
        const id = selected[i];
        const displayName = id.replace('minecraft:', '');
        const current = currentAmounts[i] ?? {};

        modal.textField(`${displayName} จำนวนไอเทมที่ต้องการ (1-420)`, 'ระบุจำนวน...', { defaultValue: String(current.amount ?? 1) });

        modal.slider(`Diamond จำนวนเพชรที่ต้องการ  (1-64)`, 1, 64, {
            valueStep: 1,
            defaultValue: current.diamond ?? 1,
        });
    }

    modal.submitButton('ถัดไป > ยืนยัน');

    showUI(player, modal, (res) => {
        const values = res.formValues ?? [];
        const newAmounts = [];
        let idx = 0;

        const len = selected.length;
        for (let i = 0; i < len; i++) {
            let amount = parseInt(values[idx++]);
            let diamond = values[idx++];

            if (!Number.isFinite(amount) || amount < 1) amount = 1;
            if (amount > 420) amount = 420;
            if (!Number.isFinite(diamond) || diamond < 1) diamond = 1;
            if (diamond > 64) diamond = 64;

            newAmounts.push({ amount, diamond });
        }

        amountMap.set(player.id, newAmounts);
        openConfirmForm(player);
    });
};

export const openConfirmForm = (player) => {
    if (!player.isValid) return;
    const selected = selectedMap.get(player.id) ?? [];
    const amounts = amountMap.get(player.id) ?? [];

    let total = 0;
    let body = 'ยืนยันคำสั่งจัดส่ง:\n\n';

    const sLen = selected.length;
    for (let i = 0; i < sLen; i++) {
        const id = selected[i];
        const data = amounts[i] ?? {};
        const amount = data.amount ?? 1;
        const diamond = data.diamond ?? 1;
        total += diamond;
        body += `- ${id.replace('minecraft:', '')} จำนวน ${amount} ชิ้น (ของที่ได้รับ ${diamond} เพชร)\n`;
    }

    const inv = player.getComponent('minecraft:inventory')?.container;
    if (!inv) return;
    const haveDiam = countItem(inv, 'minecraft:diamond');
    body += `\nของที่ได้รับทั้งหมด: ${total} เพชร`;
    body += `\nเพชรของคุณ: ${haveDiam} / ${total}`;

    const form = new ActionFormData();
    form.title('ยืนยันคำสั่งจัดส่ง');
    form.body(body);
    form.button('ยืนยันคำสั่ง', 'textures/ui/confirm');
    form.button('ย้อนกลับ (แก้ไข)', 'textures/ui/debug_glyph_color');
    form.button('ยกเลิก', 'textures/ui/cancel');

    showUI(player, form, (res) => {
        if (!player.isValid) return;
        if (res.selection === 1) {
            openAmountForm(player);
            return;
        }
        if (res.selection === 2) {
            selectedMap.delete(player.id);
            amountMap.delete(player.id);
            showMainMenu(player);
            return;
        }

        const inv2 = player.getComponent('minecraft:inventory')?.container;
        if (!inv2) return;
        const haveDiam2 = countItem(inv2, 'minecraft:diamond');

        if (haveDiam2 < total) {
            const warnForm = new ActionFormData();
            warnForm.title('เพชรไม่เพียงพอ');
            warnForm.body(`ต้องการ: ${total} เพชร\n` + `มีอยู่: ${haveDiam2} เพชร\n` + `ขาดอีก: ${total - haveDiam2} เพชร`);

            warnForm.button('ย้อนกลับ (แก้ไขของที่ได้รับ)', 'textures/ui/debug_glyph_color');

            warnForm.button('ยกเลิกคำสั่ง', 'textures/ui/cancel');
            showUI(player, warnForm, (r) => {
                if (r.selection === 0) openAmountForm(player);
                else {
                    selectedMap.delete(player.id);
                    amountMap.delete(player.id);
                    showMainMenu(player);
                }
            });
            return;
        }

        let need = total;
        const invSize = inv2.size;
        for (let i = 0; i < invSize && need > 0; i++) {
            const it = inv2.getItem(i);
            if (!it || it.typeId !== 'minecraft:diamond') continue;
            const take = Math.min(it.amount, need);
            if (take >= it.amount) {
                need -= it.amount;
                inv2.setItem(i, undefined);
            } else {
                it.amount -= take;
                need -= take;
                inv2.setItem(i, it);
            }
        }

        const mapItems = [];
        for (let i = 0; i < sLen; i++) {
            const data = amounts[i] ?? {};
            mapItems.push({
                id: selected[i],
                amount: data.amount ?? 1,
                diamond: data.diamond ?? 1,
            });
        }

        createJobData({
            owner: player.id,
            ownerName: player.name,
            items: mapItems,
            status: 'open',
            takenBy: null,
        });
        selectedMap.delete(player.id);
        amountMap.delete(player.id);
        player.sendMessage(`[Job] สร้างคำสั่งจัดส่งสำเร็จแล้ว ระบบได้หัก ${total} เพชร`);
    });
};
