# Router Design for 30+ Players (Revised & Verified for Bedrock API 1.26.20)

ระบบ Router นี้ได้รับการออกแบบใหม่เพื่อปรับปรุงประสิทธิภาพเมื่อเซิร์ฟเวอร์มีจำนวนผู้เล่น **30+ คน** โดยแก้ปัญหา overhead ของการ subscribe ซ้ำ, O(N) player lookup, ปัญหาสะสมคิวกดดัน (Queue Starvation), และประสิทธิภาพการประมวลผลของคิว (Array.shift O(N) overhead) สอดคล้องกับข้อกำหนดและโครงสร้างของ Minecraft Bedrock API เวอร์ชัน 1.26.20

---

## สถาปัตยกรรมและโครงสร้างไฟล์

```
scripts/
├── main.js                          # โหลด router/core/index.js และไฟล์จัดคิวของ event
├── router/
│   ├── core/                        # โฟลเดอร์รวมระบบแกนหลักของ Router (Router Core Engine)
│   │   ├── index.js                 # EventBus — จุดรับการลงทะเบียนและกระจาย Event ครั้งเดียว
│   │   ├── registry.js              # PlayerRegistry — O(1) player lookup & sweep
│   │   ├── queue.js                 # DeferredTaskQueue — รันคิวแบบ O(1) Head-pointer + Starvation Ratio
│   │   ├── interval.js              # IntervalManager — รวมลูปย่อยและระบบ Batch Iterator แยก state
│   │   └── utils.js                 # ฟังก์ชันรัน handler พร้อมบอกชื่อดีบั๊กและสนับสนุนการยกเลิก Event
│   │
│   # Event registration files (ทำหน้าที่นำเข้าโมดูลและลงทะเบียน handler ไปที่ EventBus)
│   ├── ChatSend.js
│   ├── EntityDie.js
│   ├── EntityHurt.js
│   ├── EntitySpawn.js
│   ├── Explosion.js
│   ├── ItemUse.js
│   ├── PlayerBreakBlock.js
│   ├── PlayerDimensionChange.js
│   ├── PlayerInteractWithBlock.js
│   ├── PlayerInteractWithEntity.js
│   ├── PlayerJoin.js
│   ├── PlayerLeave.js
│   ├── PlayerPlaceBlock.js
│   ├── PlayerSpawn.js
│   ├── Startup.js
│   └── System.RunInterval.js
```

---

## 1. EventBus (`router/core/index.js`)

ใช้สำหรับรับการจดทะเบียน Event ของโมดูลต่าง ๆ และรัน Event Subscription เพียงครั้งเดียวต่อประเภทสิทธิ์ เพื่อลด listener overhead

```javascript
import { world } from '@minecraft/server';
import { runEventHandlers, runEventHandlersWithCancel } from './utils.js';
import { Registry } from './registry.js';

const HANDLERS = {
    beforeChatSend: [],
    afterItemUse: [],
    afterEntityDiePlayer: [],
    afterPlayerSpawn: [],
    afterPlayerJoin: [],
    beforePlayerLeave: [],
    afterPlayerLeave: [],
    beforeEntityHurt: [],
    afterEntitySpawnByType: new Map(),
    afterEntityDieByType: new Map(), // O(1) lookup สำหรับสลับการประมวลผลตาม TypeId
    beforeExplosion: [],
    beforePlayerBreakBlock: [],
    afterPlayerBreakBlock: [],
    afterPlayerDimensionChange: [],
    beforePlayerInteractBlock: [],
    afterPlayerInteractBlock: [],
    beforePlayerInteractEntity: [],
    beforePlayerPlaceBlock: []
};

export const router = {
    on(event, handler, options = {}) {
        const { typeId } = options;
        if (event === 'afterEntitySpawn' && typeId) {
            if (!HANDLERS.afterEntitySpawnByType.has(typeId)) {
                HANDLERS.afterEntitySpawnByType.set(typeId, []);
            }
            HANDLERS.afterEntitySpawnByType.get(typeId).push(handler);
            return;
        }
        if (event === 'afterEntityDie' && typeId) {
            if (!HANDLERS.afterEntityDieByType.has(typeId)) {
                HANDLERS.afterEntityDieByType.set(typeId, []);
            }
            HANDLERS.afterEntityDieByType.get(typeId).push(handler);
            return;
        }
        if (HANDLERS[event]) {
            HANDLERS[event].push(handler);
        } else {
            console.warn(`[Router] Unknown event type registered: ${event}`);
        }
    }
};

// เวิร์ลเริ่มต้นประมวลผลเสร็จสิ้น (worldLoad) ให้ดึงรายชื่อผู้เล่นที่ออนไลน์อยู่แล้วเข้า Registry
// หมายเหตุ: อ้างอิงตาม API 1.26.20 ใช้ world.afterEvents.worldLoad แทน worldInitialize
world.afterEvents.worldLoad.subscribe((event) => {
    Registry.init();
});

// ── Subscribe ตัวอย่างการแจกจ่าย Event ครั้งเดียว ──
world.beforeEvents.chatSend.subscribe((event) => {
    const sender = event.sender;
    if (!sender || !sender.isValid) return;
    runEventHandlersWithCancel('ChatSend', HANDLERS.beforeChatSend, event);
});

world.afterEvents.entityDie.subscribe((event) => {
    const deadEntity = event.deadEntity;
    if (!deadEntity || !deadEntity.isValid) return;

    // Dispatch ผ่าน Map O(1) แทนการวนลูปเช็คชนิดเอนทิตีทีละตัว
    const typeHandlers = HANDLERS.afterEntityDieByType.get(deadEntity.typeId);
    if (typeHandlers && typeHandlers.length > 0) {
        runEventHandlers('EntityDieByType', typeHandlers, event);
    }

    if (deadEntity.typeId === 'minecraft:player') {
        runEventHandlers('EntityDie(Player)', HANDLERS.afterEntityDiePlayer, event);
    }
});

// สำหรับ PlayerLeaveBeforeEvent (ก่อนออกเกม) จะได้ Event ที่ถือออบเจกต์ player มาแทน string
world.beforeEvents.playerLeave.subscribe((event) => {
    runEventHandlers('PlayerLeave(Before)', HANDLERS.beforePlayerLeave, event);
    Registry.remove(event.player.id); // ดึง id จาก player ออบเจกต์ เนื่องจากก่อนออกเกมไม่มี playerId เป็น string
});

// สำหรับ PlayerLeaveAfterEvent (หลังออกเกมแล้ว) จะได้ event.playerId เป็น string โดยตรง
world.afterEvents.playerLeave.subscribe((event) => {
    runEventHandlers('PlayerLeave(After)', HANDLERS.afterPlayerLeave, event.playerId);
});
```

---

## 2. PlayerRegistry (`router/core/registry.js`)

เก็บ Cache ข้อมูลของผู้เล่นเพื่อลด O(n) ของ `world.getPlayers()` เหลือ O(1) lookup และล้างข้อมูลออฟไลน์อัตโนมัติ

```javascript
import { world, system } from '@minecraft/server';

const _registry = new Map();
const _entriesBuf = []; // Reuse buffer ลด GC allocation

export const Registry = {
    add(player) {
        if (!player || !player.isValid || _registry.has(player.id)) return;
        _registry.set(player.id, {
            player,
            data: { kills: 0, deaths: 0, coins: 0, afkTicks: 0 },
            joinedAt: Date.now(),
        });
    },

    remove(playerId) {
        _registry.delete(playerId);
    },

    get(id) {
        return _registry.get(id) ?? null;
    },

    /** 
     * คืนค่า buffer ของผู้เล่นที่กำลังออนไลน์ (GC friendly)
     * ⚠️ WARNING: อาร์เรย์ที่ส่งคืนเป็น Shared Mutable Reference ห้ามเก็บแคชข้าม Tick
     * @returns {Array} _entriesBuf
     */
    getEntries() {
        _entriesBuf.length = 0;
        for (const entry of _registry.values()) {
            if (entry.player?.isValid) _entriesBuf.push(entry);
        }
        return _entriesBuf;
    },

    sweep() {
        for (const [id, entry] of _registry) {
            if (!entry.player?.isValid) _registry.delete(id);
        }
    },

    init() {
        // ใช้ world.getAllPlayers() ตามมาตรฐาน API 1.26.20
        for (const player of world.getAllPlayers()) {
            this.add(player);
        }
    }
};

system.runInterval(() => Registry.sweep(), 600); // กวาดล้างขยะทุกๆ 30 วินาที
```

---

## 3. DeferredTaskQueue (`router/core/queue.js`)

ใช้แนวคิด **Head-pointer** เพื่อหลีกเลี่ยงการสลับย้าย Array O(N) จาก `shift()` และใช้อัตราส่วน **Priority 3 : Normal 1** เพื่อป้องกันคิวปกติไม่ถูกทำงาน (Starvation)

```javascript
const _tasks = [];
const _priority = [];
let _pHead = 0;
let _qHead = 0;

export const Queue = {
    push(task, priority = false) {
        if (priority) _priority.push(task);
        else _tasks.push(task);
    },

    tick(maxMs = 5) {
        const startTime = Date.now();
        let checked = 0;
        let pCount = 0;

        while (_pHead < _priority.length || _qHead < _tasks.length) {
            // ตรวจสอบเวลาทุกๆ 8 tasks เพื่อลด Overhead ของ Date.now()
            if (++checked % 8 === 0 && Date.now() - startTime > maxMs) {
                break; // ยกยอดไปทำต่อใน Tick ถัดไป
            }

            // Starvation Preventer: จัดการอัตราส่วน Priority 3 งาน ต่อ Normal 1 งาน
            const task = (_pHead < _priority.length && (pCount++ % 4 !== 3))
                ? _priority[_pHead++]
                : (_qHead < _tasks.length ? _tasks[_qHead++] : _priority[_pHead++]);

            if (!task) continue;
            try {
                task();
            } catch (error) {
                console.error('[Queue] task error:', error?.message ?? error);
            }
        }

        // GC Sweep ล้างอาเรย์ส่วนที่ประมวลผลแล้วเมื่อดัชนีสะสมเกิน 256 เพื่อไม่ให้ Memory บวม
        if (_pHead > 256) {
            _priority.splice(0, _pHead);
            _pHead = 0;
        }
        if (_qHead > 256) {
            _tasks.splice(0, _qHead);
            _qHead = 0;
        }
    },

    get size() {
        return (_priority.length - _pHead) + (_tasks.length - _qHead);
    }
};
```

---

## 4. IntervalManager (`router/core/interval.js`)

ใช้ลูปกลางเพียงรอบเดียวขับเคลื่อน Interval ทั้งหมด และแก้ไขการขัดแย้งของ Batch index ด้วยการแจกจ่าย Batch Iterator แบบมี State แยกของตัวเอง

```javascript
import { system } from '@minecraft/server';
import { Registry } from './registry.js';
import { Queue } from './queue.js';

const _intervals = [];

export const Interval = {
    register(fn, ticks) {
        _intervals.push({ fn, ticks, counter: 0 });
    },

    tick() {
        for (let i = 0; i < _intervals.length; i++) {
            const iv = _intervals[i];
            iv.counter++;
            if (iv.counter < iv.ticks) continue;
            iv.counter = 0;
            try {
                iv.fn();
            } catch (error) {
                const name = iv.fn?.name || `anonymous_interval[${i}]`;
                console.error(`[Interval] ${name} error:`, error?.message ?? error);
            }
        }
    }
};

// ระบบ Round-Robin ที่มีดัชนีเป็นของแต่ละระบบย่อย (แก้บั๊กการแทรกแซงข้ามโมดูล)
export function createPlayerBatchIterator() {
    let index = 0;
    return function (fn) {
        const entries = Registry.getEntries();
        if (entries.length === 0) return;
        if (index >= entries.length) index = 0;
        const entry = entries[index];
        if (entry && entry.player?.isValid) {
            try {
                fn(entry);
            } catch (error) {
                console.error('[PlayerBatchIterator] task error:', error?.message ?? error);
            }
        }
        index++;
    };
}

system.runInterval(() => {
    Interval.tick();
    Queue.tick();
}, 1);
```

---

## 5. การปรับใช้พารามิเตอร์ที่เป็นมิตร (Clear Parameter Names)

เพื่อให้โค้ดสามารถเข้าใจได้ง่ายและอ่านลื่นไหล หลีกเลี่ยงตัวย่อที่ไม่สื่อความหมาย:
* **ไม่ใช้**: `ev`
* **ให้ใช้**: `event`

ตัวอย่างในไฟล์ลงทะเบียน เช่น [ItemUse.js](file:///C:/Users/User/AppData/Roaming/Minecraft%20Bedrock/Users/444727145975720638/games/com.mojang/minecraftWorlds/mc-bedrock-1.26.20/behavior_packs/Javascript%20For%20Bedrock%20BP/scripts/router/ItemUse.js):
```javascript
router.on('afterItemUse', (event) => {
    const stack = event.itemStack;
    // ...
});
```

---

## สรุปผลการจัดระเบียบโครงสร้างไฟล์ย่อย
1. **จัดเก็บ Core Engine**: ย้ายไฟล์ `index.js`, `registry.js`, `queue.js`, `interval.js` และ `utils.js` ไปรวมกันไว้ที่โฟลเดอร์ **`router/core/`** เพื่อความเป็นระเบียบและไม่ปะปนกับ Event registration stub files
2. **อัปเดต Relative Imports**: ปรับเปลี่ยนพาธนำเข้าในไฟล์ stub ในโฟลเดอร์ `router/` และ `main.js` ให้ชี้ไปหาพาธใหม่ `./core/...` ทั้งหมดเรียบร้อยแล้ว
