import { ItemTypes, ItemStack, system, world } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// ─── Constants ────────────────────────────────────────────────────────────────
const JOB_TIMEOUT_TICKS = 20 * 60 * 20; // 20 นาที (20 tick/วินาที)
const ACTIONBAR_INTERVAL = 20; // อัปเดต actionbar ทุก 1 วินาที

// ─── Global State ─────────────────────────────────────────────────────────────
let ITEM_IDS = new Set();
let jobs = [];
let jobId = 0;

const selectedMap = new Map(); // playerId -> string[]
const amountMap = new Map(); // playerId -> { [itemId]: { amount, diamond } }
const playerJobMap = new Map(); // playerId -> jobId (rider ที่รับงานอยู่)

// Timer: playerId -> { intervalId, startTick }
const timerMap = new Map();

// ของที่ rider ส่งแล้ว รอ owner มารับ: jobId -> { ownerName, items: [{id,amount}] }
const pendingDelivery = new Map();

// owner ที่มีของรอรับ: playerId -> Set<jobId>
const ownerNotifyMap = new Map();

// ─── Init ─────────────────────────────────────────────────────────────────────
function initTypes() {
  for (const type of ItemTypes.getAll()) ITEM_IDS.add(type.id);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getIcon = (typeId) => {
  if (!typeId.startsWith("minecraft:")) return "textures/ui/icon_none";
  return ITEM_IDS.has(typeId)
    ? "textures/items/" + typeId.replace("minecraft:", "")
    : "textures/ui/icon_none";
};

const formatName = (id) => {
  const parts = id.split(":");
  return (parts.length > 1 ? parts[1] : id).replace(/_/g, " ");
};

const showUI = (player, form, callback) => {
  system.run(() => {
    form
      .show(player)
      .then((res) => {
        if (!res.canceled) callback(res);
      })
      .catch((err) => console.error("[UI Error]", err));
  });
};

const getInv = (player) => player.getComponent("minecraft:inventory").container;

const countItem = (inv, typeId) => {
  let count = 0;
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (it && it.typeId === typeId) count += it.amount;
  }
  return count;
};

const getInvMap = (inv) => {
  const map = new Map();
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (!it) continue;
    map.set(it.typeId, (map.get(it.typeId) ?? 0) + it.amount);
  }
  return map;
};

const checkJobItems = (inv, job) => {
  const invMap = getInvMap(inv);
  for (const item of job.items) {
    const have = invMap.get(item.id) ?? 0;
    if (have < item.amount)
      return (
        item.id.replace("minecraft:", "") +
        " (" +
        have +
        "/" +
        item.amount +
        ")"
      );
  }
  return null;
};

const removeJobItems = (inv, job) => {
  for (const item of job.items) {
    let need = item.amount;
    for (let i = 0; i < inv.size && need > 0; i++) {
      const it = inv.getItem(i);
      if (!it || it.typeId !== item.id) continue;
      const take = Math.min(it.amount, need);
      it.amount -= take;
      need -= take;
      inv.setItem(i, it.amount <= 0 ? undefined : it);
    }
  }
};

const giveDiamond = (player, amount) => {
  const inv = getInv(player);
  let remaining = amount;
  for (let i = 0; i < inv.size && remaining > 0; i++) {
    const it = inv.getItem(i);
    if (!it || it.typeId !== "minecraft:diamond") continue;
    const space = 64 - it.amount;
    if (space <= 0) continue;
    const add = Math.min(space, remaining);
    it.amount += add;
    remaining -= add;
    inv.setItem(i, it);
  }
  for (let i = 0; i < inv.size && remaining > 0; i++) {
    if (inv.getItem(i)) continue;
    const size = Math.min(64, remaining);
    inv.setItem(i, new ItemStack("minecraft:diamond", size));
    remaining -= size;
  }
};

// ให้ item จาก array [{id, amount}] เข้า inventory ของ player
const giveItems = (player, items) => {
  const inv = getInv(player);
  for (const item of items) {
    let remaining = item.amount;
    // เติม stack เดิมก่อน
    for (let i = 0; i < inv.size && remaining > 0; i++) {
      const it = inv.getItem(i);
      if (!it || it.typeId !== item.id) continue;
      const space = 64 - it.amount;
      if (space <= 0) continue;
      const add = Math.min(space, remaining);
      it.amount += add;
      remaining -= add;
      inv.setItem(i, it);
    }
    // วาง stack ใหม่
    for (let i = 0; i < inv.size && remaining > 0; i++) {
      if (inv.getItem(i)) continue;
      const size = Math.min(64, remaining);
      inv.setItem(i, new ItemStack(item.id, size));
      remaining -= size;
    }
  }
};

const findPlayerById = (id) =>
  world.getAllPlayers().find((p) => p.id === id) ?? null;

const totalDiamond = (job) =>
  job.items.reduce((sum, it) => sum + it.diamond, 0);

// คืน diamond ให้ owner (ใช้ตอน delete/cancel)
const refundOwner = (job) => {
  const owner = findPlayerById(job.owner);
  const total = totalDiamond(job);
  if (owner) {
    giveDiamond(owner, total);
    owner.sendMessage("[Job] Refunded " + total + " diamond (job cancelled)");
  }
};

// ─── Timer ────────────────────────────────────────────────────────────────────
const startTimer = (riderId, jobId_) => {
  stopTimer(riderId); // ป้องกัน double interval

  const startTick = system.currentTick;

  const intervalId = system.runInterval(() => {
    const rider = findPlayerById(riderId);

    // หยุดถ้า rider ออกหรือไม่มีงานแล้ว
    if (!rider || !playerJobMap.has(riderId)) {
      stopTimer(riderId);
      return;
    }

    const elapsed = system.currentTick - startTick;
    const remaining = JOB_TIMEOUT_TICKS - elapsed;

    if (remaining <= 0) {
      // หมดเวลา — ยกเลิกงาน
      expireJob(riderId);
      return;
    }

    const secs = Math.ceil(remaining / 20);
    const mins = Math.floor(secs / 60);
    const sec2 = secs % 60;
    const pad = sec2 < 10 ? "0" : "";

    rider.onScreenDisplay.setActionBar(
      "[Job] Time left: " + mins + ":" + pad + sec2,
    );
  }, ACTIONBAR_INTERVAL);

  timerMap.set(riderId, { intervalId, startTick });
};

const stopTimer = (riderId) => {
  const t = timerMap.get(riderId);
  if (!t) return;
  system.clearRun(t.intervalId);
  timerMap.delete(riderId);

  // ล้าง actionbar
  const rider = findPlayerById(riderId);
  if (rider) rider.onScreenDisplay.setActionBar("");
};

// หมดเวลา: ยกเลิกงานของ rider
const expireJob = (riderId) => {
  stopTimer(riderId);

  const jobId_ = playerJobMap.get(riderId);
  playerJobMap.delete(riderId);

  if (jobId_ === undefined) return;
  const job = jobs.find((j) => j.id === jobId_);
  if (!job) return;

  job.status = "open";
  job.takenBy = null;

  const rider = findPlayerById(riderId);
  if (rider)
    rider.sendMessage("[Job] Time is up! Job cancelled and returned to queue");

  const owner = findPlayerById(job.owner);
  if (owner)
    owner.sendMessage("[Job] Rider ran out of time. Job is open again");
};

// ─── Owner notify helpers ─────────────────────────────────────────────────────
const addOwnerNotify = (ownerId, jobId_) => {
  if (!ownerNotifyMap.has(ownerId)) ownerNotifyMap.set(ownerId, new Set());
  ownerNotifyMap.get(ownerId).add(jobId_);
};

const removeOwnerNotify = (ownerId, jobId_) => {
  const s = ownerNotifyMap.get(ownerId);
  if (!s) return;
  s.delete(jobId_);
  if (s.size === 0) ownerNotifyMap.delete(ownerId);
};

const hasOwnerNotify = (ownerId) =>
  (ownerNotifyMap.get(ownerId)?.size ?? 0) > 0;

// ─── Main Menu ────────────────────────────────────────────────────────────────
const showMainMenu = (player) => {
  const hasPending = hasOwnerNotify(player.id);
  const activeJobId = playerJobMap.get(player.id);

  const form = new ActionFormData();
  form.title("Job Menu");
  form.body("@Sleeplite");
  form.button("Create Job"); // 0
  form.button(hasPending ? "[!] My Jobs (items ready)" : "My Jobs"); // 1
  form.button("View Jobs"); // 2
  form.button(activeJobId !== undefined ? "Active Job" : "Complete Job"); // 3

  showUI(player, form, (res) => {
    if (res.selection === 0) createJob(player);
    else if (res.selection === 1) editJobs(player);
    else if (res.selection === 2) viewJobs(player);
    else if (res.selection === 3) completeJob(player);
  });
};

// ─── Create Job ───────────────────────────────────────────────────────────────
const searchBlock = (player) => {
  const inv = getInv(player);
  const invMap = getInvMap(inv);

  if (invMap.size === 0) {
    player.sendMessage("[Job] No items in inventory");
    createJob(player);
    return;
  }

  const selectedList = selectedMap.get(player.id) ?? [];
  const found = Array.from(invMap.keys())
    .sort((a, b) => formatName(a).localeCompare(formatName(b)))
    .slice(0, 50);

  const form = new ActionFormData();
  form.title("Select Item (" + selectedList.length + "/5)");
  form.button("Back"); // 0

  for (const id of found) {
    const isSelected = selectedList.includes(id);
    form.button(
      (isSelected ? "§9[+] " : "") + id.replace("minecraft:", ""),
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
    if (list.includes(chosen)) {
      list = list.filter((id) => id !== chosen);
    } else {
      if (list.length >= 5) {
        player.sendMessage("[Job] Max 5 items");
        searchBlock(player);
        return;
      }
      if ((invMap.get(chosen) ?? 0) === 0) {
        player.sendMessage("[Job] You do not have that item");
        searchBlock(player);
        return;
      }
      list.push(chosen);
    }

    selectedMap.set(player.id, list);
    searchBlock(player);
  });
};

const createJob = (player) => {
  const selected = selectedMap.get(player.id) ?? [];
  const itemCount = selected.length === 0 ? 1 : selected.length;

  const form = new ActionFormData();
  form.title("Create Job");
  form.body("Press item to remove  |  Search to add");
  form.button("Search Block"); // 0

  if (selected.length === 0) {
    form.label("Selected (0/5)");
    form.button("No items selected", "textures/ui/icon_none");
  } else {
    form.label("Selected (" + selected.length + "/5)  press to remove");
    for (const id of selected)
      form.button(id.replace("minecraft:", ""), getIcon(id));
  }

  const nextIndex = 1 + itemCount;
  const backIndex = nextIndex + 1;
  form.button("Next > Amount"); // nextIndex
  form.divider();
  form.button("Back"); // backIndex

  showUI(player, form, (res) => {
    if (res.selection === 0) {
      searchBlock(player);
    } else if (res.selection === nextIndex) {
      if (selected.length === 0) {
        player.sendMessage("[Job] Select at least 1 item");
        createJob(player);
        return;
      }
      const inv = getInv(player);
      const invMap = getInvMap(inv);
      const missing = selected.find((id) => (invMap.get(id) ?? 0) === 0);
      if (missing) {
        player.sendMessage(
          "[Job] Item no longer in inventory: " +
            missing.replace("minecraft:", ""),
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
};

const openAmountForm = (player) => {
  const selected = selectedMap.get(player.id) ?? [];
  if (selected.length === 0) {
    createJob(player);
    return;
  }

  const currentAmounts = amountMap.get(player.id) ?? {};
  const modal = new ModalFormData();
  modal.title("Set Amount");

  for (const id of selected) {
    const displayName = id.replace("minecraft:", "");
    const current = currentAmounts[id] ?? {};
    modal.textField(displayName + " Amount (1-2000)", "Enter number...", {
      defaultValue: String(current.amount ?? 1),
    });
    modal.slider(displayName + " Diamond Reward (1-64)", 1, 64, {
      defaultValue: current.diamond ?? 1,
    });
  }

  modal.submitButton("Next > Confirm");

  showUI(player, modal, (res) => {
    const values = res.formValues ?? [];
    const newAmounts = {};
    let idx = 0;

    for (const id of selected) {
      let amount = parseInt(values[idx++]);
      let diamond = values[idx++];

      if (!Number.isFinite(amount) || amount < 1) amount = 1;
      if (amount > 2000) amount = 2000;
      if (!Number.isFinite(diamond) || diamond < 1) diamond = 1;
      if (diamond > 64) diamond = 64;

      newAmounts[id] = { amount, diamond };
    }

    amountMap.set(player.id, newAmounts);
    openConfirmForm(player);
  });
};

const openConfirmForm = (player) => {
  const selected = selectedMap.get(player.id) ?? [];
  const amounts = amountMap.get(player.id) ?? {};

  let total = 0;
  let body = "Confirm Job:\n\n";

  for (const id of selected) {
    const data = amounts[id] ?? {};
    const amount = data.amount ?? 1;
    const diamond = data.diamond ?? 1;
    total += diamond;
    body +=
      "- " +
      id.replace("minecraft:", "") +
      ": x" +
      amount +
      "  (" +
      diamond +
      " diamond)\n";
  }

  const inv = getInv(player);
  const haveDiam = countItem(inv, "minecraft:diamond");
  body += "\nTotal reward: " + total + " diamond";
  body += "\nYour diamond: " + haveDiam + " / " + total;

  const form = new ActionFormData();
  form.title("Confirm Job");
  form.body(body);
  form.button("Confirm"); // 0
  form.button("Back (edit)"); // 1
  form.button("Cancel"); // 2

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
    const inv2 = getInv(player);
    const haveDiam2 = countItem(inv2, "minecraft:diamond");

    if (haveDiam2 < total) {
      const warnForm = new ActionFormData();
      warnForm.title("Not Enough Diamond");
      warnForm.body(
        "Need: " +
          total +
          " diamond\n" +
          "Have: " +
          haveDiam2 +
          " diamond\n" +
          "Missing: " +
          (total - haveDiam2) +
          " diamond",
      );
      warnForm.button("Back (edit reward)"); // 0
      warnForm.button("Cancel job"); // 1
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

    jobs.push({
      id: jobId++,
      owner: player.id,
      ownerName: player.name,
      items: selected.map((id) => {
        const data = amounts[id] ?? {};
        return { id, amount: data.amount ?? 1, diamond: data.diamond ?? 1 };
      }),
      status: "open",
      takenBy: null,
    });
    selectedMap.delete(player.id);
    amountMap.delete(player.id);
    player.sendMessage("[Job] Job created! " + total + " diamond deducted");
  });
};

// ─── My Jobs / Edit (owner) ───────────────────────────────────────────────────
const editJobs = (player) => {
  const myJobs = jobs.filter((j) => j.owner === player.id);
  const hasPend = hasOwnerNotify(player.id);

  const form = new ActionFormData();
  form.title("My Jobs");

  if (myJobs.length === 0 && !hasPend) {
    form.body("You have no jobs.");
    form.button("Back");
    showUI(player, form, () => showMainMenu(player));
    return;
  }

  let body = "Select a job to manage:";
  if (hasPend) body += "\n[!] You have items ready to receive!";
  form.body(body);

  // ปุ่ม รับของ ถ้ามี pending
  if (hasPend) form.button("[!] Receive Items"); // 0 (conditional)

  for (const job of myJobs) {
    const statusText =
      job.status === "open"
        ? "[Open]"
        : job.status === "taken"
          ? "[Taken]"
          : "[Done]";
    form.button(
      statusText +
        " " +
        job.items.length +
        " items  " +
        totalDiamond(job) +
        " diamond",
    );
  }
  form.button("Back");

  showUI(player, form, (res) => {
    const receiveOffset = hasPend ? 1 : 0;
    const backIdx = receiveOffset + myJobs.length;

    if (res.selection === backIdx) {
      showMainMenu(player);
      return;
    }

    if (hasPend && res.selection === 0) {
      receiveItems(player);
      return;
    }

    const jobIdx = res.selection - receiveOffset;
    const job = myJobs[jobIdx];
    if (job) openManageJobDetail(player, job);
  });
};

// owner รับของที่ rider ส่งมา
const receiveItems = (player) => {
  const pendingIds = ownerNotifyMap.get(player.id);
  if (!pendingIds || pendingIds.size === 0) {
    player.sendMessage("[Job] No items to receive");
    editJobs(player);
    return;
  }

  // รวม items ทุก job ที่ pending
  const allItems = [];
  for (const jid of pendingIds) {
    const delivery = pendingDelivery.get(jid);
    if (!delivery) continue;
    for (const item of delivery.items) allItems.push(item);
  }

  let body = "Items from completed jobs:\n\n";
  for (const item of allItems)
    body +=
      "- " + item.id.replace("minecraft:", "") + " x" + item.amount + "\n";
  body += "\nPress Receive to collect all items.";

  const form = new ActionFormData();
  form.title("Receive Items");
  form.body(body);
  form.button("Receive All"); // 0
  form.button("Back"); // 1

  showUI(player, form, (res) => {
    if (res.selection === 1) {
      editJobs(player);
      return;
    }

    giveItems(player, allItems);

    // ล้าง pending
    for (const jid of pendingIds) pendingDelivery.delete(jid);
    ownerNotifyMap.delete(player.id);

    player.sendMessage("[Job] Received " + allItems.length + " item type(s)!");
    editJobs(player);
  });
};

const openManageJobDetail = (player, job) => {
  const statusText =
    job.status === "open" ? "Open" : job.status === "taken" ? "Taken" : "Done";

  let body = "Status: " + statusText + "\n\n";
  for (const it of job.items)
    body +=
      "- " +
      it.id.replace("minecraft:", "") +
      " x" +
      it.amount +
      "  (" +
      it.diamond +
      " diamond)\n";

  if (job.status === "taken") {
    const rider = findPlayerById(job.takenBy);
    const t = timerMap.get(job.takenBy);
    let timeLeft = "";
    if (t) {
      const secs = Math.ceil(
        (JOB_TIMEOUT_TICKS - (system.currentTick - t.startTick)) / 20,
      );
      const m = Math.floor(secs / 60),
        s = secs % 60;
      timeLeft = " (" + m + ":" + (s < 10 ? "0" : "") + s + " left)";
    }
    body += "\nRider: " + (rider ? rider.name : "Unknown (offline)") + timeLeft;
  }

  const canDelete = job.status === "open" || job.status === "taken";
  const form = new ActionFormData();
  form.title("Manage Job");
  form.body(body);
  if (canDelete) {
    form.button("Delete Job"); // 0
    form.button("Back"); // 1
  } else {
    form.button("Back"); // 0
  }

  showUI(player, form, (res) => {
    if (canDelete && res.selection === 0) {
      if (job.status === "taken" && job.takenBy) {
        const rider = findPlayerById(job.takenBy);
        if (rider)
          rider.sendMessage("[Job] Your job was cancelled by the owner");
        stopTimer(job.takenBy);
        playerJobMap.delete(job.takenBy);
      }
      // คืน diamond ให้ owner
      refundOwner(job);
      jobs = jobs.filter((j) => j.id !== job.id);
      player.sendMessage("[Job] Job deleted");
      editJobs(player);
    } else {
      editJobs(player);
    }
  });
};

// ─── View Jobs (rider) ────────────────────────────────────────────────────────
const viewJobs = (player) => {
  const openJobs = jobs.filter((j) => j.status === "open");

  const form = new ActionFormData();
  form.title("Available Jobs");

  if (openJobs.length === 0) {
    form.body("No jobs available.");
    form.button("Back");
    showUI(player, form, () => showMainMenu(player));
    return;
  }

  form.body(openJobs.length + " job(s) available:");
  for (const job of openJobs)
    form.button(
      job.ownerName +
        "\n" +
        job.items.length +
        " items  " +
        totalDiamond(job) +
        " diamond",
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
};

const openJobDetail = (player, job) => {
  const total = totalDiamond(job);
  let body =
    "Owner: " +
    job.ownerName +
    "\nReward: " +
    total +
    " diamond\n\nItems required:\n";
  for (const it of job.items)
    body +=
      "- " +
      it.id.replace("minecraft:", "") +
      " x" +
      it.amount +
      "  (" +
      it.diamond +
      " diamond)\n";

  const form = new ActionFormData();
  form.title("Job Detail");
  form.body(body);
  form.button("Accept Job"); // 0
  form.button("Back"); // 1

  showUI(player, form, (res) => {
    if (res.selection === 1) {
      viewJobs(player);
      return;
    }

    if (playerJobMap.has(player.id)) {
      player.sendMessage("[Job] You already have an active job");
      return;
    }
    if (job.status !== "open") {
      player.sendMessage("[Job] This job is no longer available");
      return;
    }

    job.status = "taken";
    job.takenBy = player.id;
    playerJobMap.set(player.id, job.id);

    // เริ่ม timer 20 นาที
    startTimer(player.id, job.id);

    player.sendMessage(
      "[Job] Accepted! You have 20 minutes. Collect items and press Complete Job",
    );

    const owner = findPlayerById(job.owner);
    if (owner)
      owner.sendMessage(
        "[Job] " + player.name + " accepted your job (20 min timer started)",
      );
  });
};

// ─── Complete / Active Job (rider) ───────────────────────────────────────────
const completeJob = (player) => {
  const activeJobId = playerJobMap.get(player.id);
  if (activeJobId === undefined) {
    player.sendMessage("[Job] You have no active job");
    return;
  }

  const job = jobs.find((j) => j.id === activeJobId);
  if (!job) {
    stopTimer(player.id);
    playerJobMap.delete(player.id);
    player.sendMessage("[Job] Job not found (may have been cancelled)");
    return;
  }

  const inv = getInv(player);
  const total = totalDiamond(job);
  const invMap = getInvMap(inv);

  // เวลาที่เหลือ
  const t = timerMap.get(player.id);
  let timeStr = "N/A";
  if (t) {
    const secs = Math.ceil(
      (JOB_TIMEOUT_TICKS - (system.currentTick - t.startTick)) / 20,
    );
    const m = Math.floor(secs / 60),
      s = secs % 60;
    timeStr = m + ":" + (s < 10 ? "0" : "") + s;
  }

  let body =
    "Job from: " +
    job.ownerName +
    "\nReward: " +
    total +
    " diamond" +
    "\nTime left: " +
    timeStr +
    "\n\nItems:\n";

  for (const item of job.items) {
    const have = invMap.get(item.id) ?? 0;
    const ok = have >= item.amount;
    body +=
      (ok ? "[OK]     " : "[MISSING] ") +
      item.id.replace("minecraft:", "") +
      "  " +
      have +
      "/" +
      item.amount +
      "  (" +
      item.diamond +
      " diamond)\n";
  }

  const form = new ActionFormData();
  form.title("Active Job");
  form.body(body);
  form.button("Submit"); // 0
  form.button("Cancel Job"); // 1
  form.button("Back"); // 2

  showUI(player, form, (res) => {
    if (res.selection === 2) {
      showMainMenu(player);
      return;
    }

    // ── Cancel Job ──────────────────────────────────────────────────────────
    if (res.selection === 1) {
      const confirmForm = new ActionFormData();
      confirmForm.title("Cancel Job?");
      confirmForm.body(
        "Are you sure you want to cancel this job?\n" +
          "The job will return to the queue.\n" +
          "You will NOT receive any diamond.",
      );
      confirmForm.button("Yes, Cancel"); // 0
      confirmForm.button("No, Keep"); // 1

      showUI(player, confirmForm, (r) => {
        if (r.selection === 1) {
          completeJob(player);
          return;
        }

        stopTimer(player.id);
        playerJobMap.delete(player.id);

        job.status = "open";
        job.takenBy = null;

        player.sendMessage(
          "[Job] You cancelled the job. It is back in the queue",
        );

        const owner = findPlayerById(job.owner);
        if (owner)
          owner.sendMessage(
            "[Job] " + player.name + " cancelled your job. It is open again",
          );
      });
      return;
    }

    // ── Submit ──────────────────────────────────────────────────────────────
    const inv2 = getInv(player);
    const missing = checkJobItems(inv2, job);
    if (missing) {
      player.sendMessage("[Job] Missing: " + missing);
      return;
    }

    // ตัดของจาก rider
    removeJobItems(inv2, job);

    // ให้ diamond แก่ rider
    giveDiamond(player, total);

    // เก็บของไว้ใน pendingDelivery รอ owner มารับ
    const deliveryItems = job.items.map((it) => ({
      id: it.id,
      amount: it.amount,
    }));
    pendingDelivery.set(job.id, {
      ownerName: player.name,
      items: deliveryItems,
    });
    addOwnerNotify(job.owner, job.id);

    // หยุด timer
    stopTimer(player.id);
    playerJobMap.delete(player.id);

    job.status = "done";

    player.sendMessage("[Job] Complete! Received " + total + " diamond");

    const owner = findPlayerById(job.owner);
    if (owner)
      owner.sendMessage(
        "[Job] " +
          player.name +
          " completed your job! Open My Jobs to receive your items",
      );
  });
};

// ─── Events ───────────────────────────────────────────────────────────────────
function handleJob(event) {
  const { source, itemStack } = event;
  if (itemStack.typeId !== "minecraft:stick") return;
  showMainMenu(source);
}

function onPlayerLeave(event) {
  selectedMap.delete(event.playerId);
  amountMap.delete(event.playerId);
  // timer และ playerJobMap ไม่ลบ — rider ยังมีเวลาที่เหลือเมื่อกลับมา
  // แต่ interval จะหยุดเองเพราะ findPlayerById คืน null
}

system.run(() => initTypes());
world.afterEvents.itemUse.subscribe(handleJob);
world.afterEvents.playerLeave.subscribe(onPlayerLeave);
