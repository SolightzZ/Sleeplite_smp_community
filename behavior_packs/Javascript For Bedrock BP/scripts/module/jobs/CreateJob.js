import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import {
  amountMap,
  countItem,
  createJobData,
  getInvMap,
  ITEM_IDS,
  jobs,
  selectedMap,
  showUI,
} from "./Job";
import { showMainMenu } from "./Menu";

const getIcon = (typeId) => {
  try {
    return ITEM_IDS.has(typeId)
      ? `textures/items/${typeId.replace("minecraft:", "")}`
      : "textures/ui/icon_none";
  } catch (error) {
    console.error(" getIcon: " + error);
  }
};

const formatName = (id) => {
  try {
    const parts = id.split(":");
    return (parts.length > 1 ? parts[1] : id).replace(/_/g, " ");
  } catch (error) {
    console.error(" formatName: " + error);
  }
};

const searchBlock = (player) => {
  try {
    const inv = player.getComponent("minecraft:inventory").container;
    const invMap = getInvMap(inv);

    if (invMap.size === 0) {
      player.sendMessage("[Job] ไม่พบไอเท็มในคลัง");
      createJob(player);
      return;
    }

    const selectedList = selectedMap.get(player.id) ?? [];
    const found = Array.from(invMap.keys())
      .sort((a, b) => formatName(a).localeCompare(formatName(b)))
      .slice(0, 50);

    const form = new ActionFormData();
    form.title(`Select Item (${selectedList.length}/5)`);
    form.button("Back");

    for (const id of found) {
      const count = selectedList.filter((x) => x === id).length;
      form.button(
        `${count > 0 ? `§9[${count}] ` : ""}${id.replace("minecraft:", "")}`,
        getIcon(id),
      );
    }

    showUI(player, form, (res) => {
      if (res.selection === 0) {
        createJob(player);
        return;
      }

      const chosen = found[res.selection - 1];
      if (!chosen) return;

      let list = [...selectedList];
      if (list.length >= 5) {
        player.sendMessage("[Job] เลือกได้สูงสุด 5 ไอเท็ม");
        searchBlock(player);
        return;
      }
      if ((invMap.get(chosen) ?? 0) === 0) {
        player.sendMessage("[Job] คุณไม่มีไอเท็มนี้");
        searchBlock(player);
        return;
      }
      list.push(chosen);

      selectedMap.set(player.id, list);
      searchBlock(player);
    });
  } catch (error) {
    console.error(" searchBlock: " + error);
  }
};

// =========================================
//  Create Job
// =========================================
function createJob(player) {
  try {
    const activeJobs = jobs.filter((j) => j.owner === player.id);
    if (activeJobs.length >= 5) {
      player.sendMessage("[Job] จำนวนงานสูงสุดที่สร้างได้คือ 5 งาน");
      showMainMenu(player);
      return;
    }

    const selected = selectedMap.get(player.id) ?? [];
    const itemCount = selected.length === 0 ? 1 : selected.length;

    const form = new ActionFormData();
    form.title("Request Delivery");
    form.body("Press item to remove  |  Search to add");
    form.button("Search Item");

    if (selected.length === 0) {
      form.label("Selected (0/5)");
      form.button("No items selected", "textures/ui/icon_none");
    } else {
      form.label(`Selected (${selected.length}/5)  press to remove`);
      for (const id of selected)
        form.button(id.replace("minecraft:", ""), getIcon(id));
    }

    const nextIndex = 1 + itemCount;
    const backIndex = nextIndex + 1;
    form.button("Next > Amount");
    form.divider();
    form.button("Back");

    showUI(player, form, (res) => {
      if (res.selection === 0) {
        searchBlock(player);
      } else if (res.selection === nextIndex) {
        if (selected.length === 0) {
          player.sendMessage("[Job] กรุณาเลือกอย่างน้อย 1 ไอเท็ม");
          createJob(player);
          return;
        }
        const inv = player.getComponent("minecraft:inventory").container;
        const invMap = getInvMap(inv);
        const missing = selected.find((id) => (invMap.get(id) ?? 0) === 0);
        if (missing) {
          player.sendMessage(
            `[Job] ไม่พบไอเท็มในคลังแล้ว: ${missing.replace("minecraft:", "")}`,
          );
          selectedMap.set(
            player.id,
            selected.filter((id) => id !== missing),
          );
          createJob(player);
          return;
        }
        openAmountForm(player);
      } else if (res.selection === backIndex) {
        selectedMap.delete(player.id);
        amountMap.delete(player.id);
        showMainMenu(player);
      } else if (res.selection >= 1 && res.selection < nextIndex) {
        selectedMap.set(
          player.id,
          selected.filter((_, i) => i !== res.selection - 1),
        );
        createJob(player);
      }
    });
  } catch (error) {
    console.error(" createJob: " + error);
  }
}

const openAmountForm = (player) => {
  try {
    const selected = selectedMap.get(player.id) ?? [];
    if (selected.length === 0) {
      createJob(player);
      return;
    }

    const currentAmounts = amountMap.get(player.id) ?? [];
    const modal = new ModalFormData();
    modal.title("Set Amount");

    let i = 0;
    for (const id of selected) {
      const displayName = id.replace("minecraft:", "");
      const current = currentAmounts[i++] ?? {};
      modal.textField(
        `${displayName} จำนวนไอเทมที่ต้องการ (1-2000)`,
        "ระบุจำนวน...",
        {
          defaultValue: String(current.amount ?? 1),
        },
      );
      modal.slider(`${displayName} จำนวนเพชรที่ต้องการ  (1-64)`, 1, 64, {
        defaultValue: current.diamond ?? 1,
      });
    }

    modal.submitButton("Next > Confirm");

    showUI(player, modal, (res) => {
      const values = res.formValues ?? [];
      const newAmounts = [];
      let idx = 0;

      for (const id of selected) {
        let amount = parseInt(values[idx++]);
        let diamond = values[idx++];

        if (!Number.isFinite(amount) || amount < 1) amount = 1;
        if (amount > 2000) amount = 2000;
        if (!Number.isFinite(diamond) || diamond < 1) diamond = 1;
        if (diamond > 64) diamond = 64;

        newAmounts.push({ amount, diamond });
      }

      amountMap.set(player.id, newAmounts);
      openConfirmForm(player);
    });
  } catch (error) {
    console.error(" openAmountForm: " + error);
  }
};

const openConfirmForm = (player) => {
  try {
    const selected = selectedMap.get(player.id) ?? [];
    const amounts = amountMap.get(player.id) ?? [];

    let total = 0;
    let body = "Confirm Job:\n\n";

    let i = 0;
    for (const id of selected) {
      const data = amounts[i++] ?? {};
      const amount = data.amount ?? 1;
      const diamond = data.diamond ?? 1;
      total += diamond;
      body += `- ${id.replace("minecraft:", "")}: x${amount}  (${diamond} diamond)\n`;
    }

    const inv = player.getComponent("minecraft:inventory").container;
    const haveDiam = countItem(inv, "minecraft:diamond");
    body += `\nTotal reward: ${total} diamond`;
    body += `\nYour diamond: ${haveDiam} / ${total}`;

    const form = new ActionFormData();
    form.title("Confirm Delivery");
    form.body(body);
    form.button("Confirm Order");
    form.button("Back (edit)");
    form.button("Cancel");

    showUI(player, form, (res) => {
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

      // Confirm — ตรวจ diamond อีกรอบ
      const inv2 = player.getComponent("minecraft:inventory").container;
      const haveDiam2 = countItem(inv2, "minecraft:diamond");

      if (haveDiam2 < total) {
        const warnForm = new ActionFormData();
        warnForm.title("Not Enough Diamond");
        warnForm.body(
          `Need: ${total} diamond\n` +
            `Have: ${haveDiam2} diamond\n` +
            `Missing: ${total - haveDiam2} diamond`,
        );
        warnForm.button("Back (edit reward)");
        warnForm.button("Cancel Order");
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

      // ตัด diamond จาก owner
      let need = total;
      for (let i = 0; i < inv2.size && need > 0; i++) {
        const it = inv2.getItem(i);
        if (!it || it.typeId !== "minecraft:diamond") continue;
        const take = Math.min(it.amount, need);
        it.amount -= take;
        need -= take;
        inv2.setItem(i, it.amount <= 0 ? undefined : it);
      }

      createJobData({
        owner: player.id,
        ownerName: player.name,
        items: selected.map((id, index) => {
          const data = amounts[index] ?? {};
          return { id, amount: data.amount ?? 1, diamond: data.diamond ?? 1 };
        }),
        status: "open",
        takenBy: null,
      });
      selectedMap.delete(player.id);
      amountMap.delete(player.id);
      player.sendMessage(
        `[Job] สร้างคำสั่งจัดส่งสำเร็จแล้ว ระบบได้หัก ${total} เพชร`,
      );
    });
  } catch (error) {
    console.error(" openConfirmForm: " + error);
  }
};

export { createJob, openAmountForm, openConfirmForm };
