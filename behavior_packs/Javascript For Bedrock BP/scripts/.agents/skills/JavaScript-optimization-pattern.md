# 🧠🔥 JavaScript Optimization Pattern Library (Production Ready)

---

## 🎯 CORE PRINCIPLE
> 💡 **Performance is not about making code faster — it's about reducing how often it runs.**

### 🏷️ Part 1: Foundation Patterns

#### 1. ⚡ Event-Driven Pattern
- **Use Case**: ตอบสนองต่อเหตุการณ์แทนการเช็คตลอดเวลา
```javascript
world.afterEvents.entityHurt.subscribe((e) => {
    // logic
});
```

#### 2. 📦 Batch Processing Pattern
- **Use Case**: ทยอยทำงานทีละนิด ไม่ทำรวดเดียวให้เซิร์ฟเวอร์ค้าง
```javascript
const queue = [];

export function addTask(task) {
    queue.push(task);
}

system.runInterval(() => {
    const batchSize = 5;

    for (let i = 0; i < batchSize && queue.length; i++) {
        try {
            queue.shift()();
        } catch (e) {
            console.warn(e);
        }
    }
}, 1);
```

#### 3. ⏱️ Tick Budget Pattern
- **Use Case**: จำกัดปริมาณ entity ที่ประมวลผลต่อ tick
```javascript
function process(entities, limit = 5) {
    let count = 0;

    for (const e of entities) {
        if (!e?.isValid()) continue;
        if (++count >= limit) break;
    }
}
```

#### 4. 🛡️ Guard Clause Pattern
- **Use Case**: เช็คเงื่อนไขและหยุดการทำงานทันทีถ้าไม่ตรง เพื่อลด nested `if`
```javascript
if (!entity || !entity.isValid()) return;
```

#### 5. 🗂️ Cache Pattern
- **Use Case**: เก็บข้อมูลที่ใช้บ่อยไว้ ไม่ต้องเรียกหาข้อมูลใหม่ทุกครั้ง
```javascript
let players = [];

system.runInterval(() => {
    players = world.getPlayers();
}, 20);
```

#### 6. 📅 Scheduler Pattern
- **Use Case**: จัดการฟังก์ชันทั้งหมดให้อยู่ในลูปเดียว ลดการสร้าง `runInterval` หลายๆ อัน
```javascript
const systems = [];

export function registerSystem(fn) {
    systems.push(fn);
}

system.runInterval(() => {
    for (const sys of systems) {
        sys();
    }
}, 1);
```

#### 7. ⏳ Cooldown Pattern
- **Use Case**: ป้องกันการเรียกใช้ logic ซ้ำถี่เกินไป
```javascript
const cooldown = new Map();

function canUse(id, delay = 1000) {
    const now = Date.now();
    if ((cooldown.get(id) ?? 0) > now) return false;

    cooldown.set(id, now + delay);
    return true;
}
```

#### 8. 🧬 ECS (Entity Component System) Pattern
- **Use Case**: แยกระบบ logic กับข้อมูลออกจากกัน
```javascript
const components = new Map();

function addComponent(entity, data) {
    components.set(entity.id, data);
}

function getComponent(entity) {
    return components.get(entity.id);
}
```

#### 9. 😴 Lazy Processing Pattern
- **Use Case**: ควบคุมให้เก็บข้อมูลไว้ก่อน แล้วค่อยประมวลผลรวดเดียว
```javascript
let dirty = new Set();

function markDirty(e) {
    dirty.add(e);
}

system.runInterval(() => {
    for (const e of dirty) {
        // update logic
    }
    dirty.clear();
}, 1);
```

#### 10. 📉 Frequency Reduction Pattern
- **Use Case**: ลดความถี่ของการเรียก logic หนักๆ
```javascript
system.runInterval(updateHeavyLogic, 20);
```

#### 11. ♻️ Object Pooling Pattern
- **Use Case**: นำ Object เก่ากลับมาใช้ใหม่ ลดการทำงานของ Garbage Collector (GC)
```javascript
const pool = [];

function getObj() {
    return pool.pop() || {};
}

function releaseObj(obj) {
    pool.push(obj);
}
```

#### 12. ✂️ Work Partitioning Pattern
- **Use Case**: แบ่งงานเป็นก้อนย่อยๆ และทำไปเรื่อยๆ ตามลำดับ
```javascript
let index = 0;
const items = [];

system.runInterval(() => {
    const chunkSize = 10;
    for (let i = 0; i < chunkSize && index < items.length; i++) {
        process(items[index++]);
    }
    if (index >= items.length) index = 0;
}, 1);
```

#### 13. ⏱️ Profiling Pattern
- **Use Case**: วัดประสิทธิภาพความเร็วในการรัน code
```javascript
const start = Date.now();
// heavy logic
console.log("ms:", Date.now() - start);
```

#### 14. 🛟 Fail-Safe Pattern
- **Use Case**: ป้องกัน code ดับทั้งระบบจาก error ตัวเดียว
```javascript
try {
    risky();
} catch (e) {
    console.warn(e);
}
```

#### 15. 🔄 State Machine Pattern
- **Use Case**: จัดการ logic ด้วยสถานะ ทำให้เรียกใช้แค่ logic ที่ตรงกับสถานะเท่านั้น
```javascript
const states = {
    idle: () => {},
    active: () => {}
};

function update(e, state) {
    states[state](e);
}
```

#### 16. 🏗️ Dependency Isolation Pattern
- **Use Case**: แยก api หรือ logic ออกมาเป็นส่วนๆ เพื่อความอิสระในการเรียกใช้งาน
```javascript
function createSystem(api) {
    return () => {
        api.doSomething();
    };
}
```

#### 17. 👑 MASTER PATTERN (Combined)
- **Use Case**: การผสมรูปแบบด้านบนทั้งหมดเพื่อให้ทนต่อผู้เล่นจำนวนมาก
```javascript
const queue = [];
const active = new Set();

world.afterEvents.entityHurt.subscribe((e) => {
    const entity = e.hurtEntity;
    if (!entity?.isValid()) return;

    active.add(entity);
});

system.runInterval(() => {
    for (let i = 0; i < 5 && queue.length; i++) {
        try {
            queue.shift()();
        } catch {}
    }
}, 1);

system.runInterval(() => {
    let count = 0;
    for (const e of active) {
        if (!e?.isValid()) {
            active.delete(e);
            continue;
        }

        queue.push(() => {
            e.applyImpulse({ x: 0, y: 0.2, z: 0 });
        });

        if (++count > 5) break;
    }
}, 1);
```

---

### 🚀 Part 2: Advanced Optimization Patterns

#### 18. 🗺️ Spatial Partitioning Pattern
- **Use Case**: ลดการ Loop หา Entity ทั้งโลก ด้วยการแบ่งเป็นตาราง
```javascript
const grid = new Map();

function getKey(x, z) {
    return `${Math.floor(x / 16)}:${Math.floor(z / 16)}`;
}

function add(entity) {
    const key = getKey(entity.location.x, entity.location.z);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(entity);
}
```

#### 19. 🛑 Early Exit Loop Pattern
- **Use Case**: หยุด Loop ทันทีที่เจอเป้าหมาย
```javascript
for (const e of entities) {
    if (!e.isValid()) continue;
    if (e.typeId !== "minecraft:zombie") continue;
    
    // stop early when found
    break; 
}
```

#### 20. 🚦 Priority Queue Pattern
- **Use Case**: ลำดับความสำคัญของงาน งานไหนด่วนทำก่อน
```javascript
const queue = [];

function add(task, priority = 0) {
    queue.push({ task, priority });
    queue.sort((a, b) => b.priority - a.priority);
}
```

#### 21. 📸 Immutable Snapshot Pattern
- **Use Case**: จำลองข้อมูลเพื่อการเข้าถึงที่ปลอดภัย ป้องกันการพังเวลา loop ทับกับ update
```javascript
const snapshot = [...entities];

for (const e of snapshot) {
    // safe iteration
}
```

#### 22. 🔀 Double Buffer Pattern
- **Use Case**: สลับสับเปลี่ยน array สองตัว เพื่อไม่ให้ memory สะดุด
```javascript
let current = [];
let next = [];

function swap() {
    [current, next] = [next, current];
    next.length = 0;
}
```

#### 23. 🚩 Dirty Flag Pattern
- **Use Case**: แจ้งให้ระบบรู้ว่ามีข้อมูลเปลี่ยน ค่อยอัปเดต
```javascript
let dirty = false;

function markDirty() {
    dirty = true;
}

function update() {
    if (!dirty) return;
    
    // heavy logic
    dirty = false;
}
```

#### 24. 📖 Lookup Table Pattern
- **Use Case**: ใช้ Object เล็กๆ ในการจับคู่ข้อมูล แทนการรัน `switch-case`
```javascript
const damageTable = {
    zombie: 5,
    skeleton: 4
};

function getDamage(type) {
    return damageTable[type] ?? 1;
}
```

#### 25. 🪶 Flyweight Pattern
- **Use Case**: ใช้ข้อมูลหรือ object ที่เหมือนกันร่วมกันเพื่อประหยัดหน่วยความจำ
```javascript
const shared = {
    velocity: { x: 0, y: 0, z: 0 }
};
```

#### 26. 📜 Command Queue Pattern
- **Use Case**: ต่อคิวคำสั่งไว้รันพร้อมกัน
```javascript
const commands = [];

function enqueue(cmd) {
    commands.push(cmd);
}

function execute() {
    for (const cmd of commands) cmd();
    commands.length = 0;
}
```

#### 27. 🚧 Rate Limiter Pattern
- **Use Case**: จำกัดความถี่ในการเรียก logic ให้มีระยะห่าง
```javascript
let last = 0;

function allow(interval = 100) {
    const now = Date.now();
    if (now - last < interval) return false;
    last = now;
    return true;
}
```

#### 28. 📉 Delta Update Pattern
- **Use Case**: Update เฉพาะข้อมูลที่มีการเปลี่ยนแปลงจากค่าเดิม
```javascript
let prev = 0;

function update(value) {
    const delta = value - prev;
    prev = value;

    if (delta === 0) return;
}
```

#### 29. ♻️ Memory Reuse Pattern
- **Use Case**: นำตัวแปรเดิมมา assign ค่าใหม่ แทนการสร้าง Object บ่อยๆ
```javascript
const temp = { x: 0, y: 0, z: 0 };

function use() {
    temp.x = 1;
    temp.y = 2;
}
```

#### 30. 🕰️ Deferred Execution Pattern
- **Use Case**: เลื่อนการทำงานไปทำทีหลังในรอบระบบว่าง
```javascript
const deferred = [];

function defer(fn) {
    deferred.push(fn);
}

system.run(() => {
    while (deferred.length) deferred.shift()();
});
```

#### 31. 🧺 Event Aggregation Pattern
- **Use Case**: รวม event เป็นก้อนแล้วส่งรวดเดียว
```javascript
const events = [];

function emit(e) {
    events.push(e);
}

function flush() {
    for (const e of events) handle(e);
    events.length = 0;
}
```

#### 32. 🤏 Minimal Data Pattern
- **Use Case**: ส่ง/เก็บเฉพาะข้อมูลที่สำคัญ
```javascript
// ❌ heavy
// { x, y, z, velocity, health }

// ✅ minimal
// { id }
```

#### 33. 🎯 Selective Update Pattern
- **Use Case**: เลือกรันเฉพาะ Entity ที่ต้องการหรือจำเป็น
```javascript
for (const e of entities) {
    if (e.dimension.id !== "overworld") continue;

    // update only needed entities
}
```

#### 34. ✂️ Async Split Pattern
- **Use Case**: ซอยงานหนักด้วย `system.runTimeout` ให้ออกเป็น event เล็กๆ
```javascript
async function heavy() {
    await system.runTimeout(() => {}, 0);
}
```

#### 35. 🗃️ Index Map Pattern
- **Use Case**: ทำระบบ Map Index ให้ค้นหา Entity แบบ `O(1)` ทันที
```javascript
const index = new Map();

function add(e) {
    index.set(e.id, e);
}
```

#### 36. 🔥 Hot Path Optimization Pattern
- **Use Case**: ย้ายคำสั่งบ่อยๆ ออกนอกลูป
```javascript
const len = arr.length;

for (let i = 0; i < len; i++) {
    // fast loop
}
```

#### 37. 🥞 Flatten Structure Pattern
- **Use Case**: หลีกเลี่ยง Object ที่ซ้อนลึก ลดการ lookup
```javascript
// ❌ nested: data.player.stats.hp
// ✅ flat: data.hp
```

> 💀 **FINAL INSIGHT (Part 2)**
> ผสมกัน: **Spatial Partitioning + Batch Processing + Tick Budget + Lazy Update + Cache**
> 👉 จะได้ performance ระดับ server scale 50+ players แบบนิ่งๆ!
> 
> 🧠 **REAL PRO TIP**: **"อย่า optimize ทุกอย่าง"** Optimize เฉพาะ: Hot path, High frequency code, Large loops.

---

### ⚙️ Part 3: Advanced Optimization Patterns (JS Built-in Focus)

#### 38. 📦 Object.create(null) Pattern
- **Use Case**: สร้าง Dictionary ไร้ Prototype (เร็วสุด, ไม่มี key หลง)
```javascript
const dict = Object.create(null);
dict["key"] = 1;
```

#### 39. 🗺️ Map vs Object Optimization Pattern
- **Use Case**: ใช้ Map หากมี Insert/Delete บ่อยและ key แบบ Dynamic
```javascript
const map = new Map();
map.set("id", data);
```

#### 40. 🧹 Set Deduplication Pattern
- **Use Case**: ลบตัวซ้ำใน Array ไวสุดแบบ `O(n)`
```javascript
const unique = [...new Set(arr)];
```

#### 41. 👻 WeakMap Cache Pattern
- **Use Case**: Cache ข้อมูลอ้างอิง Object (ลบออกจาก memory เองด้วย GC)
```javascript
const cache = new WeakMap();

function get(entity) {
    if (!cache.has(entity)) {
        cache.set(entity, compute(entity));
    }
    return cache.get(entity);
}
```

#### 42. 🕸️ WeakSet Tracking Pattern
- **Use Case**: เช็ค Entity ที่ประมวลผลแล้ว
```javascript
const processed = new WeakSet();

if (!processed.has(entity)) {
    processed.add(entity);
}
```

#### 43. 🚫 JSON Serialization Cost Avoidance
- **Use Case**: หลีกเลี่ยงค่าคอมไพล์จาก JSON
```javascript
// ❌ heavy
// JSON.stringify(obj)
// ✅ avoid if not needed
```

#### 44. 👯 Structured Clone Pattern
- **Use Case**: ก็อปปี้ Object แบบ Deep copy เร็วสุดๆ
```javascript
const clone = structuredClone(data);
```

#### 45. 📏 Array Pre-allocation Pattern
- **Use Case**: จองพื้นที่ Array ไว้ก่อน ลด cost การขยายขนาด
```javascript
const arr = new Array(1000);
```

#### 46. 🚀 TypedArray Performance Pattern
- **Use Case**: จอง Memory เรียงติดกัน (เร็วกว่า Array ปกติในคำนวณเลข)
```javascript
const buffer = new Float32Array(1024);
```

#### 47. ♻️ ArrayBuffer Reuse Pattern
- **Use Case**: นำ buffer เดิมมาใช้ ลดการทำความสะอาดขยะของ GC
```javascript
const buffer = new ArrayBuffer(1024);
```

#### 48. 🔬 DataView Low-level Access Pattern
- **Use Case**: เข้าถึง Memory แบบตรงจุดสุดๆ
```javascript
const view = new DataView(buffer);
view.setInt32(0, 123);
```

#### 49. 🏗️ String Builder Pattern
- **Use Case**: การต่อสตริงทีละน้อย (ถ้าสตริงใหญ่ใช้ Array.join จะไวกว่า)
```javascript
let str = "";
for (let i = 0; i < 10; i++) {
    str += i;
}
```

#### 50. 🔗 Array.join Optimization Pattern
- **Use Case**: รวมข้อความใหญ่ๆ (เร็วกว่าใช้ loop ต่อ string)
```javascript
const result = parts.join("");
```

#### 51. 🔍 RegExp Precompile Pattern
- **Use Case**: ประกาศ Regex ไว้ด้านนอก ไม่ใส่ใน loop
```javascript
const regex = /abc/;
regex.test(str);
```

#### 52. 🔢 Number Parsing Optimization
- **Use Case**: เปลี่ยนตัวอักษรเป็นตัวเลขไวสุด
```javascript
const n = +str; // faster than parseInt
```

#### 53. 🧮 Math Cache Pattern
- **Use Case**: Cache ค่าคงที่ของ Math ไว้ใช้
```javascript
const PI = Math.PI;
```

#### 54. ⏱️ Date.now() vs new Date()
- **Use Case**: ถ้าต้องการเวลาใช้ `Date.now()` ไวกว่า
```javascript
const t = Date.now();
```

#### 55. 🚦 Promise Pool Pattern
- **Use Case**: จำกัดปริมาณ async concurrency ไม่รันทีเดียวทั้งหมด
```javascript
const limit = 5;
let active = 0;
// Promise logic here...
```

#### 56. 🛡️ Promise.allSettled Pattern
- **Use Case**: กัน crash ยกกลุ่มจากการทำ Batch Async
```javascript
await Promise.allSettled(tasks);
```

#### 57. ⚡ Microtask Optimization Pattern
- **Use Case**: ยัดใส่คิวด่วนได้ไวกว่า `setTimeout`
```javascript
queueMicrotask(() => {
    // faster scheduling
});
```

#### 58. 🚫 Proxy Avoidance Pattern
- **Use Case**: เลี่ยงการใช้ Proxy ในคำสั่งที่เรียกบ่อย เพราะมันช้ามาก
```javascript
// ❌ avoid heavy Proxy in hot path
```

#### 59. 🪞 Reflect Direct Access Pattern
- **Use Case**: การอ่านข้อมูล dynamic อย่างปลอดภัย
```javascript
Reflect.get(obj, key);
```

> 💀 **FINAL INSIGHT (Built-in Level)**
> Performance ของ JS ส่วนใหญ่พังเพราะ:
> - ใช้ Array ผิด type
> - ใช้ Object แทน Map
> - ใช้ JSON stringify เยอะ
> - สร้าง object ซ้ำใน loop
>
> 🔥 **RULE (ตารางเลือกใช้โครงสร้างข้อมูล)**
> | Use Case | Structure |
> |---|---|
> | Key แบบ Dynamic | `Map` |
> | List ห้ามซ้ำ | `Set` |
> | อ้างอิง Entity ชั่วคราว | `WeakMap` |
> | คำนวณเลขหนักๆ | `TypedArray` |
> | ข้อมูลดิบจาก Memory | `ArrayBuffer` |

---

### 📊 Part 4: Array Deep Dive Patterns

#### 60. 🧱 Dense Array Pattern
- **Use Case**: เลี่ยง Array แบบมีช่องโหว่
```javascript
const arr = [1, 2, 3]; // ✅ dense
// ❌ หลีกเลี่ยง const arr = []; arr[1000] = 1; (sparse = slow)
```

#### 61. 🚫 Avoid Holes Pattern
- **Use Case**: เพิ่มของด้วย `.push` ไม่ใช้ index ไกลๆ
```javascript
arr.push(value); // ✅
// arr[10] = value; ❌ creates holes
```

#### 62. ✂️ Length Truncation Pattern
- **Use Case**: ล้าง Array แบบไวและประหยัด 메모รี
```javascript
arr.length = 0; // fastest clear (reuses memory)
```

#### 63. 📥 Push vs Index Assignment
- **Use Case**: ไวกว่า `push` เล็กน้อยในลูปหนักๆ
```javascript
arr[arr.length] = value; // fastest low-level
```

#### 64. 📐 Pre-size + Fill Pattern
- **Use Case**: คาดเดา memory ล่วงหน้า
```javascript
const arr = new Array(1000).fill(0);
```

#### 65. 🎨 Avoid Mixed Types Pattern
- **Use Case**: ลดอาการพังของ V8 Engine (De-optimization)
```javascript
const arr = [1, 2, 3]; // ✅ good
// const arr = [1, "a", {}]; ❌ deopt
```

#### 66. 🥞 FlatMap Fusion Pattern
- **Use Case**: ทำ Map และ Flat ให้เหลือแค่ Loop เดียว
```javascript
arr.flatMap(fn);
```

#### 67. 🛑 Early Break Pattern
- **Use Case**: ไวกว่า `forEach` เพราะสามารถหยุดทันทีที่เจอ
```javascript
arr.some(x => x > 10);
```

#### 68. 🗜️ Reduce Accumulator Pattern
- **Use Case**: รวบยอด loop เข้าด้วยกัน
```javascript
arr.reduce((acc, v) => acc + v, 0);
```

#### 69. ⏪ Reverse Loop Pattern
- **Use Case**: เหมาะกับการ Pop/Remove ค่าย้อนกลับ
```javascript
for (let i = arr.length - 1; i >= 0; i--) {}
```

#### 70. 🏆 for Loop > forEach Pattern
- **Use Case**: นี่คือราชาความไวใน Hot path
```javascript
for (let i = 0; i < len; i++) {}
```

#### 71. 📏 Cached Length Pattern
- **Use Case**: ลด Property Access ໃນ loop
```javascript
for (let i = 0, len = arr.length; i < len; i++) {}
```

#### 72. 🚫 Avoid Callback Overhead Pattern
- **Use Case**: เอา Logic ออกมา ไม่ฝาก callback ไวกว่ามาก
```javascript
// ❌ arr.map(fn);
// ✅ for (...) fn(...)
```

#### 73. 🍕 Slice Copy Pattern
- **Use Case**: ไวกว่าการโคลนด้วย Loop เอง
```javascript
const copy = arr.slice();
```

#### 74. 🧩 Spread Clone Tradeoff Pattern
- **Use Case**: อ่านง่าย แต่อาจจะช้ากว่าใน Array ขนาดใหญ่
```javascript
const copy = [...arr];
```

#### 75. ⚖️ Stable Sort Optimization Pattern
- **Use Case**: การเรียงตัวเลขควรมี Comparator เสมอ
```javascript
arr.sort((a, b) => a - b);
```

#### 76. 🚫 Avoid Default Sort Pattern
- **Use Case**: เลี่ยง Sort เปล่า เพราะมันจะเทียบเป็น String
```javascript
// arr.sort(); ❌ string compare
```

#### 77. 📦 Chunk Processing Pattern
- **Use Case**: หั่นทำงานทีละก้อน (Batch work)
```javascript
for (let i = 0; i < arr.length; i += 10) {
    const chunk = arr.slice(i, i + 10);
}
```

#### 78. 🔀 In-place Mutation Pattern
- **Use Case**: แก้ที่ตัวเดิม ไม่ต้องสร้าง Array ใหม่
```javascript
arr[i] = newValue;
```

#### 79. 🔒 toSorted / toReversed Pattern
- **Use Case**: เรียงและสลับแบบปลอดภัย (Immutable version)
```javascript
const newArr = arr.toSorted();
```

> 💀 **FINAL INSIGHT (Array Level)**
> Array performance พังเพราะ: Sparse array, Mixed type, Callback overload, Unnecessary clone
>
> 🔥 **RULE (สำคัญมาก)**
> | Scenario | Best Practice |
> |---|---|
> | ลูปรันบ่อยๆ (Hot loop) | `for` loop |
> | ค้นหาค่า | `find` / `some` |
> | แปลงข้อมูล | `map` (เฉพาะ Non-hot) |
> | คำนวณแบบหนักหน่วง | `reduce` |
> | จำนวนข้อมูลเยอะมาก | `TypedArray` |

---

### 🗺️ Part 5: Map Production Patterns

#### 80. 🛠️ getOrSet Pattern (สำคัญมาก)
- **Use Case**: ใช้แทน boilerplate has/get/set ซ้ำซ้อน
```javascript
function getOrSet(map, key, factory) {
    if (!map.has(key)) {
        map.set(key, factory());
    }
    return map.get(key);
}

// Usage
const cache = new Map();
const data = getOrSet(cache, player.id, () => ({ score: 0 }));
```

#### 81. 🔢 Counter Map Pattern
- **Use Case**: จัดการค่าบวกเพิ่มของ Key ใน Map
```javascript
function increment(map, key, step = 1) {
    map.set(key, (map.get(key) ?? 0) + step);
}

// Usage
increment(killMap, player.id);
```

#### 82. 👥 Group By Pattern (Production)
- **Use Case**: จัดกลุ่มข้อมูลต่างๆ ใส่ Map Array
```javascript
function groupBy(arr, keyFn) {
    const map = new Map();
    for (const item of arr) {
        const key = keyFn(item);
        const group = getOrSet(map, key, () => []);
        group.push(item);
    }
    return map;
}

// Usage
const grouped = groupBy(players, p => p.team);
```

#### 83. 📚 Multi-Value Map Pattern
- **Use Case**: ดันข้อมูลเก็บแบบ List
```javascript
function pushMap(map, key, value) {
    const arr = map.get(key);
    if (arr) arr.push(value);
    else map.set(key, [value]);
}
```

#### 84. 🗑️ Safe Delete Pattern
- **Use Case**: ลบโดยมีการเช็คก่อนลด error
```javascript
function safeDelete(map, key) {
    if (!map.has(key)) return false;
    return map.delete(key);
}
```

#### 85. 💤 Lazy Init Object Pattern
- **Use Case**: หากยังไม่มี Key ให้ใส่ค่าเริ่มต้นทันที
```javascript
function ensure(map, key, defaultValue) {
    if (!map.has(key)) map.set(key, defaultValue);
    return map.get(key);
}
```

#### 86. 🔁 Map → Object Fast Convert Pattern
- **Use Case**: เปลี่ยน Map คืนให้กลายเป็น Object ไวๆ
```javascript
function mapToObject(map) {
    const obj = Object.create(null);
    for (const [k, v] of map) {
        obj[k] = v;
    }
    return obj;
}
```

#### 87. 🔁 Object → Map Fast Convert Pattern
- **Use Case**: แปลงจาก Object กลายเป็น Map
```javascript
function objectToMap(obj) {
    return new Map(Object.entries(obj));
}
```

#### 88. 🤝 Map Merge Pattern
- **Use Case**: ยุบรวม Map หลายๆ ตัวเข้าด้วยกัน
```javascript
function mergeMaps(...maps) {
    return new Map(maps.flatMap(m => [...m]));
}
```

#### 89. 🗂️ Map Filter Pattern
- **Use Case**: ดึงค่าแค่เฉพาะบางส่วนตามเงื่อนไข
```javascript
function filterMap(map, predicate) {
    const result = new Map();
    for (const [k, v] of map) {
        if (predicate(v, k)) result.set(k, v);
    }
    return result;
}
```

#### 90. 🔮 Map Transform Pattern
- **Use Case**: เปลี่ยนโครงสร้าง Value ข้างใน Map ทั้งหมด
```javascript
function mapValues(map, fn) {
    const result = new Map();
    for (const [k, v] of map) {
        result.set(k, fn(v, k));
    }
    return result;
}
```

#### 91. 🥇 LRU Cache Pattern (Production Core)
- **Use Case**: ลืมข้อมูลที่เก่านานสุด เลี้ยงขนาด Map ไว้ได้ดีมากๆ
```javascript
class LRU {
    constructor(limit = 100) {
        this.map = new Map();
        this.limit = limit;
    }

    get(key) {
        if (!this.map.has(key)) return;
        const value = this.map.get(key);
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    set(key, value) {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, value);

        if (this.map.size > this.limit) {
            const first = this.map.keys().next().value;
            this.map.delete(first);
        }
    }
}
```

#### 92. 👻 WeakRef Cache Pattern
- **Use Case**: Cache แบบ Reference เบาๆ
```javascript
const cache = new Map();

function setWeak(key, value) {
    cache.set(key, new WeakRef(value));
}

function getWeak(key) {
    return cache.get(key)?.deref();
}
```

#### 93. 🔙 Reverse Lookup Pattern
- **Use Case**: สลับจาก Value กลายเป็น Key ใช้สำหรับค้นหากลับ
```javascript
function reverseMap(map) {
    const result = new Map();
    for (const [k, v] of map) {
        result.set(v, k);
    }
    return result;
}
```

#### 94. 🛡️ Map Size Guard Pattern
- **Use Case**: ปกป้อง Map ไม่ให้บวมจนเกินไป
```javascript
function limitMap(map, max) {
    if (map.size <= max) return;
    for (const key of map.keys()) {
        map.delete(key);
        if (map.size <= max) break;
    }
}
```

#### 95. 📦 Batch Update Pattern
- **Use Case**: เซ็ตค่าพร้อมกันทีละเยอะๆ
```javascript
function batchSet(map, entries) {
    for (const [k, v] of entries) {
        map.set(k, v);
    }
}
```

#### 96. 📉 Map Diff Pattern
- **Use Case**: หาข้อแตกต่างระหว่าง Map A กับ Map B
```javascript
function diffMap(a, b) {
    const result = new Map();
    for (const [k, v] of a) {
        if (b.get(k) !== v) result.set(k, v);
    }
    return result;
}
```

#### 97. 📸 Map Snapshot Pattern
- **Use Case**: Copy Map ปัจจุบันเพื่อการทำงานลูปที่ปลอดภัย
```javascript
function snapshot(map) {
    return new Map(map);
}
```

#### 98. 🔑 Key Normalization Pattern
- **Use Case**: ทำให้ key เหมือนกัน (เช่น ลดรูปตัวพิมพ์เล็กหมด)
```javascript
function normalizeKey(key) {
    return typeof key === "string" ? key.toLowerCase() : key;
}
```

#### 99. 🗃️ Map Indexing Pattern
- **Use Case**: ใส่ Key-Value index อัตโนมัติตาม Function จัดการ
```javascript
function indexBy(arr, keyFn) {
    const map = new Map();
    for (const item of arr) {
        map.set(keyFn(item), item);
    }
    return map;
}
```

> 💀 **FINAL INSIGHT (Map Level)**
> Map ใช้ให้ถูก = performance กระโดดทันที
> พังเพราะ: ใช้ Object แทน Map, ไม่ cache, ไม่มี eviction, iterate เยอะเกิน
>
> 🔥 **RULE**
> | Use Case | Structure |
> |---|---|
> | Cache ทั่วไป | `Map` |
> | ให้ขยะหายอัตโนมัติ | `WeakMap` |
> | จัดการคิวจำกัดขนาด | `Map` + LRU reorder |
> | จัดกลุ่มข้อมูล | `Map<Array>` |
> | ดัชนีการเข้าถึง | `Map<Key, Value>` |
> 
> 🧠 **PRO TIP (ระดับ Production)**:
> Map = `O(1)` lookup แต่ bottleneck จริงคือ "iteration + memory growth"
> **ดังนั้นจง**: limit size, reuse, และ batch update!

# 🧠🔥 JavaScript Loop Optimization (Production Core for Multiplayer)

---

# 🎯 CORE RULE (จำให้ขึ้นใจ)

```text
1. ห้าม loop ทุกอย่างทุก tick
2. จำกัดจำนวนงานต่อ tick
3. ทำเฉพาะสิ่งที่ "เปลี่ยน"
4. แชร์ข้อมูล = cache + broadcast
```

---

# 🚀 1. Tick Scheduler (พื้นฐานที่สุด)

```js
const systems = [];

export function registerSystem(fn) {
    systems.push(fn);
}

system.runInterval(() => {
    for (const sys of systems) {
        sys();
    }
}, 1);
```

## ใช้ยังไง

```js
registerSystem(updatePlayers);
registerSystem(updateUI);
```

👉 แยก logic = scale ง่าย

---

# ⚡ 2. Player Cache Pattern

```js
let players = [];

system.runInterval(() => {
    players = world.getPlayers();
}, 20);
```

## ใช้ยังไง

```js
function updatePlayers() {
    for (const p of players) {
        // ใช้ cache ไม่เรียก API ซ้ำ
    }
}
```

👉 ลด API call อย่างหนัก

---

# ⏱️ 3. Tick Budget (สำคัญมาก)

```js
function processPlayers(limit = 5) {
    let count = 0;

    for (const p of players) {
        if (!p?.isValid()) continue;

        // logic

        if (++count >= limit) break;
    }
}
```

👉 ป้องกัน lag spike

---

# 🧵 4. Round-Robin Processing (กระจายโหลด)

```js
let index = 0;

function processBatch(size = 5) {
    for (let i = 0; i < size && players.length; i++) {
        const p = players[index % players.length];
        index++;

        if (!p?.isValid()) continue;

        // logic
    }
}
```

👉 ผู้เล่นเยอะก็ยังนิ่ง

---

# 📦 5. Shared State Cache (Sync ทุกคน)

```js
const sharedState = {
    score: 0,
    lastUpdate: 0
};
```

## ใช้ยังไง

```js
function updateGame() {
    sharedState.score++;
    sharedState.lastUpdate = Date.now();
}
```

👉 ทุกคนเห็นค่าเดียวกัน

---

# 🔁 6. Broadcast Pattern

```js
function broadcast(fn) {
    for (const p of players) {
        if (!p?.isValid()) continue;
        fn(p);
    }
}
```

## ใช้ยังไง

```js
broadcast(p => {
    p.onScreenDisplay.setActionBar("Score: " + sharedState.score);
});
```

---

# 🧊 7. Cooldown ต่อ Player

```js
const cooldown = new Map();

function canUpdate(id, delay = 1000) {
    const now = Date.now();

    if ((cooldown.get(id) ?? 0) > now) return false;

    cooldown.set(id, now + delay);
    return true;
}
```

## ใช้ยังไง

```js
if (canUpdate(player.id)) {
    // update UI
}
```

---

# 🧩 8. Dirty Update Pattern

```js
let dirtyPlayers = new Set();

function markDirty(player) {
    dirtyPlayers.add(player);
}

function processDirty() {
    for (const p of dirtyPlayers) {
        if (!p?.isValid()) continue;

        // update only changed
    }
    dirtyPlayers.clear();
}
```

👉 ลด loop 90%

---

# 📉 9. Frequency Reduction

```js
system.runInterval(updateHeavyLogic, 20); // 1 sec
system.runInterval(updateLightLogic, 1);  // every tick
```

👉 แยกงานหนัก/เบา

---

# 🧠 10. Minimal Loop Pattern

```js
for (let i = 0, len = players.length; i < len; i++) {
    const p = players[i];
    if (!p?.isValid()) continue;

    // fastest loop
}
```

👉 ใช้ใน hot path เท่านั้น

---

# 🧵 11. Task Queue Pattern

```js
const queue = [];

export function addTask(fn) {
    queue.push(fn);
}

function processQueue(limit = 5) {
    for (let i = 0; i < limit && queue.length; i++) {
        try {
            queue.shift()();
        } catch {}
    }
}
```

---

# 🛡️ 12. Guard Clause ทุก loop

```js
if (!player || !player.isValid()) continue;
```

👉 กัน crash + skip เร็ว

---

# 🔥 MASTER LOOP (ใช้จริงได้เลย)

```js
let players = [];
let index = 0;
const queue = [];

system.runInterval(() => {
    players = world.getPlayers();
}, 20);

system.runInterval(() => {
    // process queue
    for (let i = 0; i < 5 && queue.length; i++) {
        try {
            queue.shift()();
        } catch {}
    }

    // process players (round-robin)
    for (let i = 0; i < 5 && players.length; i++) {
        const p = players[index % players.length];
        index++;

        if (!p?.isValid()) continue;

        queue.push(() => {
            p.onScreenDisplay.setActionBar("Hello");
        });
    }

}, 1);
```

---

# 💀 ปัญหาที่ทำให้พัง (ต้องเลี่ยง)

❌ loop player ทุก tick แบบเต็ม
❌ world.getPlayers() ทุก loop
❌ runCommandAsync spam
❌ update UI ทุก tick ทุกคน
❌ ไม่มี limit

---

# 🎯 สรุปแบบตรง ๆ

ถ้าคุณจะ optimize loop:

* ใช้ **Round-robin**
* ใช้ **Tick budget**
* ใช้ **Cache players**
* ใช้ **Queue**
* ใช้ **Dirty update**

👉 แค่นี้ TPS จาก 10 → 20+ ได้เลย

---


โอเค อันนี้จะ “ตัดของไม่จำเป็นออก” แล้วให้ **แก่นจริงของการเขียน loop + system.runInterval สำหรับ multiplayer** แบบใช้ได้จริงใน production

ผมจะอิงพื้นฐานจากที่คุณมี (loop, array, function ฯลฯ)  แล้ว “ยกระดับให้ performant”

---

# 🧠 CORE PROBLEM (ของจริง)

ถ้าเขียนแบบนี้ 👇

```js
system.runInterval(() => {
    const players = world.getPlayers();

    for (const p of players) {
        p.runCommandAsync("title @s actionbar hello");
    }
}, 1);
```

❌ ปัญหา:

* เรียก API ทุก tick
* loop ทุก player ทุก tick
* command spam
* scale ไม่ได้

---

# 🔥 หลักการที่ต้องใช้ (จริง ๆ มีแค่ 4 ข้อ)

```text
1. Cache
2. Limit
3. Split
4. Sync
```

---

# ✅ 1. CACHE PLAYER (ห้ามเรียกทุก tick)

```js
let players = [];

system.runInterval(() => {
    players = world.getPlayers();
}, 20); // 1 วิ
```

👉 ใช้ `players` แทนการเรียก API

---

# ✅ 2. LOOP แบบ FAST + CONTROL

```js
function updatePlayers(limit = 5) {
    for (let i = 0, len = players.length; i < len && i < limit; i++) {
        const p = players[i];
        if (!p?.isValid()) continue;

        // logic
    }
}
```

👉 ใช้ `for` (เร็วสุด) + limit

---

# ✅ 3. ROUND ROBIN (แก้ multiplayer lag)

```js
let index = 0;

function processPlayers(batch = 5) {
    const len = players.length;

    for (let i = 0; i < batch && len > 0; i++) {
        const p = players[index % len];
        index++;

        if (!p?.isValid()) continue;

        // logic
    }
}
```

👉 ทุกคนได้ update แต่ไม่พร้อมกัน → TPS ไม่ตก

---

# ✅ 4. SHARED STATE (ให้ทุกคนเห็นข้อมูลเดียวกัน)

```js
const gameState = {
    score: 0
};
```

## update

```js
function updateGame() {
    gameState.score++;
}
```

---

# ✅ 5. BROADCAST (sync ให้ทุกคนเห็น)

```js
function broadcast() {
    for (let i = 0, len = players.length; i < len; i++) {
        const p = players[i];
        if (!p?.isValid()) continue;

        p.onScreenDisplay.setActionBar(
            "Score: " + gameState.score
        );
    }
}
```

---

# ✅ 6. ลดความถี่ (สำคัญมาก)

```js
system.runInterval(updateGame, 20);   // logic หนัก
system.runInterval(broadcast, 10);    // UI
system.runInterval(() => processPlayers(5), 1); // loop
```

👉 แยก layer

---

# ✅ 7. QUEUE (กัน spike)

```js
const queue = [];

function addTask(fn) {
    queue.push(fn);
}

function processQueue(limit = 5) {
    for (let i = 0; i < limit && queue.length; i++) {
        try {
            queue.shift()();
        } catch {}
    }
}
```

---

# 🧩 FULL STRUCTURE (ใช้จริงได้เลย)

```js
let players = [];
let index = 0;
const queue = [];

const gameState = {
    score: 0
};

// cache player
system.runInterval(() => {
    players = world.getPlayers();
}, 20);

// game logic
system.runInterval(() => {
    gameState.score++;
}, 20);

// main loop
system.runInterval(() => {

    // queue
    for (let i = 0; i < 5 && queue.length; i++) {
        try { queue.shift()(); } catch {}
    }

    // round-robin player update
    const len = players.length;

    for (let i = 0; i < 5 && len > 0; i++) {
        const p = players[index % len];
        index++;

        if (!p?.isValid()) continue;

        queue.push(() => {
            p.onScreenDisplay.setActionBar(
                "Score: " + gameState.score
            );
        });
    }

}, 1);
```

---

# 💀 สิ่งที่ “ห้ามทำ”

❌ `world.getPlayers()` ใน loop
❌ loop ทุก player ทุก tick
❌ runCommandAsync spam
❌ ไม่มี limit
❌ update UI ทุก tick

---

# 🎯 สรุปแบบ engineer

ถ้าจะ optimize loop:

* ใช้ `for` + cache length
* ใช้ `round-robin`
* ใช้ `queue`
* ใช้ `shared state`
* ใช้ `frequency split`

---

# 🔥 TL;DR

```text
Loop = ต้อง "แบ่ง"
Data = ต้อง "แชร์"
Update = ต้อง "จำกัด"
```

---

ถ้าคุณอยากให้ผม “refactor code ของคุณจริง ๆ” (เช่นระบบ Battle Pass / UI / Trading ที่คุณทำอยู่)
ผมสามารถ optimize ให้แบบ **รองรับ 20–50 player แบบไม่ drop TPS** ได้เลย
# 🧠🔥 JavaScript Optimization (Loop + Multiplayer) — 20 Essential Patterns

---

# 1. Player Cache

```js
let players = [];

system.runInterval(() => {
    players = world.getPlayers();
}, 20);
```

---

# 2. Fast Loop (Hot Path)

```js
for (let i = 0, len = players.length; i < len; i++) {
    const p = players[i];
    if (!p?.isValid()) continue;
}
```

---

# 3. Tick Budget

```js
function process(limit = 5) {
    for (let i = 0; i < players.length && i < limit; i++) {
        const p = players[i];
        if (!p?.isValid()) continue;
    }
}
```

---

# 4. Round-Robin

```js
let index = 0;

function nextPlayer() {
    if (!players.length) return null;
    return players[index++ % players.length];
}
```

---

# 5. Batch Processing

```js
function processBatch(size = 5) {
    for (let i = 0; i < size; i++) {
        const p = nextPlayer();
        if (!p?.isValid()) continue;
    }
}
```

---

# 6. Shared State

```js
const gameState = {
    score: 0
};
```

---

# 7. Broadcast

```js
function broadcast(msg) {
    for (let i = 0, len = players.length; i < len; i++) {
        const p = players[i];
        if (!p?.isValid()) continue;
        p.onScreenDisplay.setActionBar(msg);
    }
}
```

---

# 8. Frequency Split

```js
system.runInterval(updateGame, 20);
system.runInterval(updateUI, 10);
system.runInterval(loopPlayers, 1);
```

---

# 9. Guard Clause

```js
if (!player || !player.isValid()) return;
```

---

# 10. Queue System

```js
const queue = [];

function addTask(fn) {
    queue.push(fn);
}
```

---

# 11. Queue Processor

```js
function runQueue(limit = 5) {
    for (let i = 0; i < limit && queue.length; i++) {
        try { queue.shift()(); } catch {}
    }
}
```

---

# 12. Cooldown Per Player

```js
const cooldown = new Map();

function canRun(id, delay = 1000) {
    const now = Date.now();
    if ((cooldown.get(id) ?? 0) > now) return false;
    cooldown.set(id, now + delay);
    return true;
}
```

---

# 13. Dirty Update

```js
const dirty = new Set();

function markDirty(p) {
    dirty.add(p);
}
```

---

# 14. Process Dirty Only

```js
function processDirty() {
    for (const p of dirty) {
        if (!p?.isValid()) continue;
    }
    dirty.clear();
}
```

---

# 15. Minimal Object Allocation

```js
// ❌ avoid
players.map(p => ({ id: p.id }));

// ✅ use direct
for (const p of players) {}
```

---

# 16. Avoid API Spam

```js
// ❌
world.getPlayers();

// ✅ use cached players
players
```

---

# 17. Loop Split

```js
function updateLight() {}
function updateHeavy() {}

system.runInterval(updateLight, 1);
system.runInterval(updateHeavy, 20);
```

---

# 18. Index Loop Instead of forEach

```js
for (let i = 0; i < players.length; i++) {}
```

---

# 19. Limit UI Update

```js
function updateUI() {
    broadcast("Score: " + gameState.score);
}
```

---

# 20. MASTER LOOP (Production Ready)

```js
let players = [];
let index = 0;
const queue = [];

const gameState = { score: 0 };

// cache
system.runInterval(() => {
    players = world.getPlayers();
}, 20);

// game logic
system.runInterval(() => {
    gameState.score++;
}, 20);

// main loop
system.runInterval(() => {

    // queue
    for (let i = 0; i < 5 && queue.length; i++) {
        try { queue.shift()(); } catch {}
    }

    // players
    const len = players.length;

    for (let i = 0; i < 5 && len > 0; i++) {
        const p = players[index % len];
        index++;

        if (!p?.isValid()) continue;

        queue.push(() => {
            p.onScreenDisplay.setActionBar(
                "Score: " + gameState.score
            );
        });
    }

}, 1);
```

---

# 💀 RULE สุดท้าย (จำให้ขึ้นใจ)

* Loop ต้อง **limit**
* Player ต้อง **cache**
* งานต้อง **แบ่ง**
* UI ต้อง **ไม่ spam**

---

# 🎯 TL;DR

```text
Don't loop everything.
Process in batches.
Share state.
Throttle updates.
```

---

# 🧠💾 JavaScript Data Storage Optimization — 20 Essential Patterns

---

# 1. Map (Fast Lookup O(1))

```js
const playerData = new Map();

function setData(id, data) {
    playerData.set(id, data);
}

function getData(id) {
    return playerData.get(id);
}
```

---

# 2. Object (Lightweight)

```js
const data = Object.create(null);

data["player1"] = { score: 10 };
```

---

# 3. Array (Sequential Data)

```js
const list = [];

list.push({ id: "p1" });
```

---

# 4. ID-based Storage

```js
function getId(p) {
    return p.id;
}
```

👉 ทุกอย่างต้องอิง id

---

# 5. Cache Layer

```js
let cachedPlayers = [];

system.runInterval(() => {
    cachedPlayers = world.getPlayers();
}, 20);
```

---

# 6. Default Data Factory

```js
function createPlayerData() {
    return { score: 0, level: 1 };
}
```

---

# 7. Get or Create

```js
function getOrCreate(id) {
    if (!playerData.has(id)) {
        playerData.set(id, createPlayerData());
    }
    return playerData.get(id);
}
```

---

# 8. WeakMap (Auto GC)

```js
const tempData = new WeakMap();

tempData.set(player, { temp: true });
```

---

# 9. Shared Global State

```js
const gameState = {
    score: 0,
    phase: "waiting"
};
```

---

# 10. Partition Data

```js
const playerStats = new Map();
const playerInventory = new Map();
```

👉 แยก domain

---

# 11. Normalize Data

```js
// ❌ nested
{ player: { stats: { score: 10 } } }

// ✅ flat
{ score: 10 }
```

---

# 12. Immutable Update (safe)

```js
function updateScore(data, value) {
    return { ...data, score: value };
}
```

---

# 13. Mutable Update (fast)

```js
data.score += 1;
```

👉 ใช้ตอน performance สำคัญ

---

# 14. Dirty Flag

```js
const dirty = new Set();

function markDirty(id) {
    dirty.add(id);
}
```

---

# 15. Batch Save

```js
function saveDirty() {
    for (const id of dirty) {
        const data = playerData.get(id);
        // save logic
    }
    dirty.clear();
}
```

---

# 16. Snapshot (Backup)

```js
function snapshot() {
    return JSON.stringify([...playerData]);
}
```

---

# 17. Restore

```js
function restore(json) {
    const arr = JSON.parse(json);
    return new Map(arr);
}
```

---

# 18. TTL (Expire Data)

```js
const ttl = new Map();

function setTTL(id, ms) {
    ttl.set(id, Date.now() + ms);
}
```

---

# 19. Cleanup System

```js
function cleanup() {
    const now = Date.now();

    for (const [id, time] of ttl) {
        if (time < now) {
            playerData.delete(id);
            ttl.delete(id);
        }
    }
}
```

---

# 20. MASTER STORAGE (Production Ready)

```js
const playerData = new Map();
const dirty = new Set();

function getPlayerData(p) {
    const id = p.id;

    if (!playerData.has(id)) {
        playerData.set(id, {
            score: 0,
            level: 1
        });
    }

    return playerData.get(id);
}

function updatePlayer(p) {
    const data = getPlayerData(p);

    data.score += 1;
    dirty.add(p.id);
}

function saveSystem() {
    for (const id of dirty) {
        const data = playerData.get(id);
        // persist here
    }
    dirty.clear();
}
```

---

# 💀 RULE (สำคัญจริง)

* ใช้ Map > Object (ในระบบใหญ่)
* ใช้ id เป็น key เท่านั้น
* อย่า nested ลึก
* อย่า save ทุก tick
* ต้องมี cleanup

---

# 🎯 TL;DR

```text
Store fast (Map)
Update cheap (mutable)
Save smart (batch)
Clean always
```

---
เข้าใจว่าคุณต้องการ “คำแนะนำแบบใช้งานจริง” สำหรับ **การเก็บข้อมูล + loop + multiplayer** ไม่ใช่แค่ pattern เยอะ ๆ

ผมจะสรุปให้แบบ **Decision Guide (ควรใช้แบบไหน + ทำยังไง)** ให้คุณเอาไปออกแบบระบบได้ถูกตั้งแต่ต้น

---

# 🧠 🎯 แนวคิดหลัก (ต้องตั้งให้ถูกก่อน)

```text
1. Data ต้องแยกเป็น 3 ระดับ
2. Loop ต้องไม่แตะ data ทั้งหมด
3. Update ต้องเฉพาะที่เปลี่ยน
4. Sync ต้องเป็นรอบ (ไม่ใช่ทุก tick)
```

---

# 🧩 1. แบ่ง Data ให้ถูก (สำคัญที่สุด)

## 🔹 3 Layer ที่ต้องมี

### 1. Player Data (ต่อคน)

```js
const playerData = new Map();
```

ใช้เก็บ:

* score
* level
* stats

---

### 2. Game State (shared)

```js
const gameState = {
    score: 0,
    phase: "running"
};
```

ใช้เก็บ:

* คะแนนรวม
* phase เกม
* event

---

### 3. Temp Data (ชั่วคราว)

```js
const temp = new WeakMap();
```

ใช้เก็บ:

* cooldown
* state ชั่วคราว
* animation

---

👉 ถ้าคุณ “ไม่แยก 3 ตัวนี้” = ระบบจะพังตอน scale

---

# ⚡ 2. วิธีเก็บ Player Data ที่ถูกต้อง

```js
function getPlayerData(p) {
    let data = playerData.get(p.id);

    if (!data) {
        data = { score: 0, level: 1 };
        playerData.set(p.id, data);
    }

    return data;
}
```

👉 ห้ามสร้าง object ใหม่ทุก loop
👉 ต้อง reuse

---

# 🔁 3. Loop ที่ถูกต้อง (ไม่แลค)

❌ ห้าม:

```js
for (const p of world.getPlayers()) {}
```

✅ ต้อง:

```js
let players = [];

system.runInterval(() => {
    players = world.getPlayers();
}, 20);
```

---

# ⚙️ 4. Process Player แบบ scale ได้

```js
let index = 0;

function processPlayers(batch = 5) {
    const len = players.length;

    for (let i = 0; i < batch && len > 0; i++) {
        const p = players[index % len];
        index++;

        if (!p?.isValid()) continue;

        const data = getPlayerData(p);

        // update เฉพาะ player นี้
    }
}
```

👉 50 players ก็ยังลื่น

---

# 🧊 5. Dirty System (ตัวช่วยเทพ)

```js
const dirty = new Set();

function markDirty(id) {
    dirty.add(id);
}
```

ใช้ตอน:

```js
data.score++;
markDirty(p.id);
```

---

# 💾 6. Save แบบถูกต้อง (Batch เท่านั้น)

```js
function saveSystem() {
    for (const id of dirty) {
        const data = playerData.get(id);
        // save here
    }

    dirty.clear();
}
```

👉 ห้าม save ทุก tick

---

# 📡 7. Sync ให้หลาย player เห็นพร้อมกัน

```js
function broadcastScore() {
    for (const p of players) {
        if (!p?.isValid()) continue;

        p.onScreenDisplay.setActionBar(
            "Score: " + gameState.score
        );
    }
}
```

👉 ใช้ shared state

---

# ⏱️ 8. แยกความถี่ (โคตรสำคัญ)

```js
system.runInterval(processPlayers, 1);  // loop
system.runInterval(saveSystem, 20);    // save
system.runInterval(broadcastScore, 10); // UI
```

👉 ไม่ใช่ทุกอย่าง tick เดียว

---

# 💀 ปัญหาที่ dev ส่วนใหญ่พัง

❌ เก็บ data ใน array แล้วหา index
❌ สร้าง object ใหม่ทุก loop
❌ loop ทุก player ทุก tick
❌ ไม่มี dirty system
❌ save ทุกครั้ง

---

# 🧠 สรุปแบบสั้นที่สุด

```text
Data = Map
Loop = Batch
Update = Dirty
Sync = Broadcast
Save = Interval
```

---

# 🔥 คำแนะนำตรง ๆ (สำหรับคุณ)

จากที่คุณทำระบบ:

* Battle Pass
* Trading
* QIDB
* Multiplayer

👉 คุณควรมี “core system นี้”:

### ✅ Player Manager

* Map (playerData)

### ✅ Scheduler

* runInterval แยกงาน

### ✅ Dirty System

* Set

### ✅ Queue System

* กัน spike

---

# 🚀 ถ้าจะไปต่อระดับสูง

คุณควร upgrade ไป:

* ECS (Entity Component System)
* Data-oriented design
* Central game loop manager

---

ถ้าคุณต้องการ ผมสามารถ:

👉 “ออกแบบโครงสร้างจริงของโปรเจคคุณ (Battle Pass / Trading / UI)”
ให้เป็นแบบ **Production + รองรับ 50 player+ แบบไม่แลค**

แค่ส่ง code มา ผม refactor ให้ตรงจุดได้เลย
# 🧠🔥 JavaScript Optimization (Data + Loop + Multiplayer) — BASIC CORE

---

# 🎯 CORE RULE (จำให้ขึ้นใจ)

```text id="core001"
1. Data = ต้องเก็บเร็ว (Map)
2. Loop = ต้องจำกัด (limit)
3. Player = ต้อง cache
4. Update = ทำเฉพาะที่จำเป็น
```

---

# 🧩 1. Data Storage (พื้นฐานที่สุด)

```js id="data01"
const playerData = new Map();
```

👉 ใช้เก็บข้อมูลต่อ player

---

# 🧩 2. Get / Create Data

```js id="data02"
function getData(p) {
    let data = playerData.get(p.id);

    if (!data) {
        data = { score: 0 };
        playerData.set(p.id, data);
    }

    return data;
}
```

👉 ห้ามสร้าง object ใหม่ใน loop

---

# ⚡ 3. Cache Player (ห้ามเรียก API ทุก tick)

```js id="loop01"
let players = [];

system.runInterval(() => {
    players = world.getPlayers();
}, 20);
```

---

# ⚡ 4. Loop แบบเร็ว (Hot Path)

```js id="loop02"
for (let i = 0, len = players.length; i < len; i++) {
    const p = players[i];
    if (!p?.isValid()) continue;
}
```

---

# ⚡ 5. Limit Loop (กันแลค)

```js id="loop03"
function process(limit = 5) {
    for (let i = 0; i < players.length && i < limit; i++) {
        const p = players[i];
        if (!p?.isValid()) continue;
    }
}
```

---

# 🔁 6. Round-Robin (สำคัญมาก)

```js id="loop04"
let index = 0;

function nextPlayer() {
    if (!players.length) return null;
    return players[index++ % players.length];
}
```

---

# 🔁 7. Process Player ทีละส่วน

```js id="loop05"
function processBatch(size = 5) {
    for (let i = 0; i < size; i++) {
        const p = nextPlayer();
        if (!p?.isValid()) continue;

        const data = getData(p);
        data.score++;
    }
}
```

---

# 🧠 8. Shared Game State

```js id="state01"
const gameState = {
    score: 0
};
```

👉 ใช้ sync ทุกคน

---

# 📡 9. Broadcast ให้ทุกคนเห็น

```js id="sync01"
function broadcast() {
    for (let i = 0, len = players.length; i < len; i++) {
        const p = players[i];
        if (!p?.isValid()) continue;

        p.onScreenDisplay.setActionBar(
            "Score: " + gameState.score
        );
    }
}
```

---

# 🧊 10. Update เฉพาะที่เปลี่ยน (Dirty)

```js id="dirty01"
const dirty = new Set();

function markDirty(id) {
    dirty.add(id);
}
```

---

# 🧊 11. Process Dirty

```js id="dirty02"
function processDirty() {
    for (const id of dirty) {
        const data = playerData.get(id);
        // update/save
    }
    dirty.clear();
}
```

---

# 📦 12. Queue (กัน spike)

```js id="queue01"
const queue = [];

function addTask(fn) {
    queue.push(fn);
}
```

---

# 📦 13. Run Queue

```js id="queue02"
function runQueue(limit = 5) {
    for (let i = 0; i < limit && queue.length; i++) {
        try { queue.shift()(); } catch {}
    }
}
```

---

# ⏱️ 14. แยกความถี่ (โคตรสำคัญ)

```js id="freq01"
system.runInterval(processBatch, 1);
system.runInterval(broadcast, 10);
system.runInterval(processDirty, 20);
```

---

# 🛡️ 15. Guard Clause

```js id="safe01"
if (!p || !p.isValid()) continue;
```

---

# 🧠 16. ใช้ ID เป็น key เสมอ

```js id="id01"
playerData.set(p.id, data);
```

---

# 🧠 17. ห้าม nested data ลึก

```js id="flat01"
// ❌
{ player: { stats: { score: 10 } } }

// ✅
{ score: 10 }
```

---

# 🧠 18. Mutable = เร็วกว่า

```js id="mut01"
data.score += 1;
```

---

# 🧠 19. ห้าม API spam

```js id="api01"
// ❌
world.getPlayers()

// ✅
players
```

---

# 🔥 20. MASTER BASIC (ใช้ได้จริง)

```js id="master01"
let players = [];
let index = 0;

const playerData = new Map();
const dirty = new Set();

function getData(p) {
    let d = playerData.get(p.id);
    if (!d) {
        d = { score: 0 };
        playerData.set(p.id, d);
    }
    return d;
}

system.runInterval(() => {
    players = world.getPlayers();
}, 20);

system.runInterval(() => {

    const len = players.length;

    for (let i = 0; i < 5 && len > 0; i++) {
        const p = players[index % len];
        index++;

        if (!p?.isValid()) continue;

        const data = getData(p);
        data.score++;

        dirty.add(p.id);
    }

}, 1);

system.runInterval(() => {
    for (const p of players) {
        if (!p?.isValid()) continue;

        const data = playerData.get(p.id);

        p.onScreenDisplay.setActionBar(
            "Score: " + data.score
        );
    }
}, 10);
```

---

# 💀 FINAL RULE

```text id="final01"
Loop น้อย = เร็ว
Data น้อย = เร็ว
Update น้อย = เร็ว
```

---
โอเค อันนี้ผมจะ “จัดให้เป็น production จริง” แบบอ่านแล้วเอาไปใช้ได้เลย
อิงจากไฟล์ที่คุณให้ + best practice จริงใน server scale

📌 (มี reference จากไฟล์คุณด้วย) 

---

# 🧠🔥 JavaScript Optimization Pattern (Production – Multiplayer)

## 🎯 CORE RULE (ของจริง)

```text
1. ห้าม loop ทุก player ทุก tick
2. ห้ามเรียก API ซ้ำ
3. ทำงานเฉพาะที่จำเป็น (dirty)
4. กระจายงาน (batch + queue)
```

---

# 🚀 20 สิ่งที่จำเป็น + Production Function

---

# 1. 🗂 Player Data = Map (O(1))

```js
// ======================================================
// getPlayerData (สร้าง + cache)
// ======================================================
const playerStore = new Map();

function getPlayerData(id) {
  let data = playerStore.get(id);
  if (data) return data;

  data = { state: 0, score: 0 };
  playerStore.set(id, data);
  return data;
}
```

---

# 2. ⚡ Cache Player (ห้ามเรียก API ทุก tick)

```js
let players = [];

// ======================================================
// updatePlayerCache
// ======================================================
function updatePlayerCache() {
  players = world.getPlayers();
}
```

---

# 3. 🔁 Fast Loop (Hot Path)

```js
// ======================================================
// loopPlayers
// ======================================================
function loopPlayers(step) {
  for (let i = 0, len = players.length; i < len; i++) {
    const p = players[i];
    if (!p?.isValid) continue;

    step(p);
  }
}
```

---

# 4. 🚀 Tick Budget (จำกัดงานต่อ tick)

```js
// ======================================================
// processLimited
// ======================================================
function processLimited(limit, step) {
  for (let i = 0; i < players.length && i < limit; i++) {
    const p = players[i];
    if (!p?.isValid) continue;

    step(p);
  }
}
```

---

# 5. 🔁 Round-Robin (scale multiplayer)

```js
let index = 0;

// ======================================================
// nextPlayer
// ======================================================
function nextPlayer() {
  if (!players.length) return null;

  const p = players[index % players.length];
  index++;
  return p;
}
```

---

# 6. 🔁 Batch Processing (กัน lag spike)

```js
// ======================================================
// processBatch
// ======================================================
function processBatch(size, step) {
  for (let i = 0; i < size; i++) {
    const p = nextPlayer();
    if (!p?.isValid) continue;

    step(p);
  }
}
```

👉 ตรงกับ Batch Pattern ในไฟล์ 

---

# 7. 🧠 Guard Clause (ลด nested)

```js
function isValid(p) {
  if (!p) return false;
  if (!p.isValid) return false;
  return true;
}
```

---

# 8. 🧊 Dirty Flag (update เฉพาะที่เปลี่ยน)

```js
const dirty = new Set();

// ======================================================
// markDirty
// ======================================================
function markDirty(id) {
  dirty.add(id);
}
```

---

# 9. 🧊 Process Dirty

```js
// ======================================================
// flushDirty
// ======================================================
function flushDirty() {
  for (const id of dirty) {
    const data = playerStore.get(id);
    if (!data) continue;

    // update UI / save
  }
  dirty.clear();
}
```

---

# 10. 📦 Queue System (กัน spike)

```js
const queue = [];

// ======================================================
// addTask
// ======================================================
function addTask(fn) {
  queue.push(fn);
}
```

---

# 11. 📦 Process Queue

```js
// ======================================================
// runQueue
// ======================================================
function runQueue(limit) {
  let count = 0;

  while (count < limit && queue.length) {
    const fn = queue.shift();
    try { fn(); } catch {}
    count++;
  }
}
```

---

# 12. ⏱ Frequency Split (แยกงานหนัก/เบา)

```js
system.runInterval(updatePlayerCache, 20);
system.runInterval(flushDirty, 20);
system.runInterval(mainLoop, 1);
```

👉 ตาม pattern Frequency Reduction 

---

# 13. 🧠 Shared Game State

```js
const gameState = {
  score: 0,
  phase: 0
};
```

---

# 14. 📡 Broadcast Pattern

```js
function broadcast(msg) {
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p?.isValid) continue;

    p.onScreenDisplay.setActionBar(msg);
  }
}
```

---

# 15. 🧊 Cooldown per Player

```js
const cooldown = new Map();

// ======================================================
// canRun
// ======================================================
function canRun(id, delay) {
  const now = Date.now();

  if ((cooldown.get(id) ?? 0) > now) return false;

  cooldown.set(id, now + delay);
  return true;
}
```

---

# 16. 🧠 Minimal Data (ลด memory)

```js
// ❌ heavy
// { id, pos, hp, inventory }

// ✅ minimal
// { id }
```

---

# 17. 🧠 Mutable Update (เร็วกว่า)

```js
data.score += 1;
```

---

# 18. 🚫 Avoid API Spam

```js
// ❌ ห้าม
world.getPlayers();

// ✅ ใช้ cache
players;
```

---

# 19. 🔄 Work Partition (แบ่งงานใหญ่)

```js
let taskIndex = 0;

// ======================================================
// processLargeArray
// ======================================================
function processLargeArray(arr, chunk) {
  for (let i = 0; i < chunk && taskIndex < arr.length; i++) {
    arr[taskIndex++]();
  }

  if (taskIndex >= arr.length) {
    taskIndex = 0;
  }
}
```

---

# 20. 🔥 MASTER LOOP (Production จริง)

```js
// ======================================================
// mainLoop
// ======================================================
function mainLoop() {

  // queue first
  runQueue(5);

  // process players
  const len = players.length;

  for (let i = 0; i < 5 && len > 0; i++) {
    const p = nextPlayer();
    if (!p?.isValid) continue;

    const data = getPlayerData(p.id);

    if (data.state === 0) continue;

    addTask(() => {
      p.onScreenDisplay.setActionBar(
        "Score: " + data.score
      );
    });
  }
}
```

---

# 💀 FINAL RULE (จำให้ขึ้นใจ)

```text
Loop มาก = ตาย
API มาก = ตาย
Update มาก = ตาย
```

---

# 🎯 TL;DR (Production จริง)

```text
Data  = Map
Loop  = Batch + RoundRobin
State = Shared
Update= Dirty
Exec  = Queue
```

---

# 🔥 Insight จากโค้ดคุณ (ตรง ๆ)

คุณทำถูกแล้วหลายจุด:

* ✅ Batch processing
* ✅ Map storage
* ✅ Queue system
* ✅ Dirty update

👉 ถ้าจะ “โหดขึ้นอีก”:

* เพิ่ม Tick Scheduler กลาง
* แยก priority (UI / combat / world)
* ใช้ Spatial Partition

---

ถ้าคุณอยากต่อ levelจริง
ผมช่วยออกแบบเป็น:

👉 **UHC Engine (รองรับ 100+ player แบบนิ่ง)**
👉 **Tick System + Priority Queue + ECS**

ได้เลย บอกมา ผมจัดให้แบบ production ของจริง 👍
โอเค อันนี้จะเป็น **Level ถัดไป (Production++ / Big Tech Pattern)**
👉 ไม่ใช่พื้นฐานแล้ว แต่เป็นสิ่งที่ “ค่ายใหญ่ / engine จริง” ใช้กัน

ผมจะให้ **อีก 20 pattern ใหม่ (21–40)**
ที่ต่อจากของคุณโดยตรง และเอาไปใช้กับ Minecraft / multiplayer ได้จริง

อ้างอิงแนวคิดจากไฟล์คุณด้วย 

---

# 🚀 Advanced Optimization Patterns (Production / Big Scale)

---

# 21. 🧠 Hot / Cold Path Separation

```js
// ======================================================
// updateHot (เรียกทุก tick)
// ======================================================
function updateHot(p) {
  // movement / combat
}

// ======================================================
// updateCold (เรียกนานๆ)
// ======================================================
function updateCold(p) {
  // stats / UI / save
}
```

```js
system.runInterval(runHot, 1);
system.runInterval(runCold, 20);
```

👉 ค่ายใหญ่แยก “critical vs non-critical”

---

# 22. 🔥 Data-Oriented Design (DOD)

```js
// ❌ OOP
// player = { pos, hp, velocity }

// ✅ DOD
const posX = [];
const posY = [];
const hp = [];
```

👉 CPU cache hit ดีขึ้นมหาศาล

---

# 23. 🧵 Double Buffer (state ไม่ชนกัน)

```js
let current = [];
let next = [];

// ======================================================
// swapBuffer
// ======================================================
function swapBuffer() {
  const temp = current;
  current = next;
  next = temp;
  next.length = 0;
}
```

👉 ใช้ใน game engine จริง

---

# 24. 📸 Snapshot Isolation

```js
const snapshot = players.slice();

for (let i = 0; i < snapshot.length; i++) {
  const p = snapshot[i];
}
```

👉 กัน data เปลี่ยนระหว่าง loop

---

# 25. 🧠 Command Buffer (เหมือน GPU)

```js
const commandBuffer = [];

// ======================================================
// pushCommand
// ======================================================
function pushCommand(fn) {
  commandBuffer.push(fn);
}

// ======================================================
// executeCommands
// ======================================================
function executeCommands() {
  for (let i = 0; i < commandBuffer.length; i++) {
    commandBuffer[i]();
  }
  commandBuffer.length = 0;
}
```

👉 แยก “logic” กับ “execution”

---

# 26. 🧩 System Pipeline

```js
const systems = [];

// ======================================================
// registerSystem
// ======================================================
function registerSystem(fn) {
  systems.push(fn);
}
```

```js
system.runInterval(() => {
  for (let i = 0; i < systems.length; i++) {
    systems[i]();
  }
}, 1);
```

👉 core ของ ECS engine

---

# 27. ⚙️ Priority Scheduler

```js
const high = [];
const low = [];

// ======================================================
// schedule
// ======================================================
function schedule(fn, priority) {
  if (priority === 1) high.push(fn);
  else low.push(fn);
}
```

👉 งานสำคัญทำก่อน

---

# 28. 🧠 Spatial Partition (ลด loop ทั้งโลก)

```js
const grid = new Map();

// ======================================================
// getKey
// ======================================================
function getKey(x, z) {
  return (x >> 4) + ":" + (z >> 4);
}
```

👉 ลด O(n) → O(k)

---

# 29. 📦 Component Storage (ECS Core)

```js
const health = new Map();
const position = new Map();
```

👉 แยก data เป็น component

---

# 30. 🔁 System Filter

```js
function processHealth() {
  for (const [id, hp] of health) {
    if (hp <= 0) continue;

    // process
  }
}
```

👉 loop เฉพาะ entity ที่เกี่ยว

---

# 31. 🧠 Bitmask State

```js
const STATE_ALIVE = 1;
const STATE_PVP = 2;

let state = 0;

state |= STATE_ALIVE;
```

👉 เร็วกว่า string/boolean หลายตัว

---

# 32. 🔄 Delta Compression

```js
function updateScore(id, newScore) {
  const old = cache.get(id);

  if (old === newScore) return;

  cache.set(id, newScore);
}
```

👉 update เฉพาะ “เปลี่ยนจริง”

---

# 33. 🧊 Write Buffer

```js
const writeBuffer = [];

// ======================================================
// commit
// ======================================================
function commit() {
  for (let i = 0; i < writeBuffer.length; i++) {
    writeBuffer[i]();
  }
  writeBuffer.length = 0;
}
```

👉 ลด write cost

---

# 34. 🧠 Pull vs Push Model

```js
// ❌ push ทุก tick
updateUI();

// ✅ pull
if (dirty) updateUI();
```

👉 event-driven ดีกว่า polling

---

# 35. ⚡ Fast Path Inline

```js
if (data.state === 0) continue;
```

👉 หลีกเลี่ยง function call ใน hot path

---

# 36. 🧵 Worker Simulation (Fake Parallel)

```js
function heavyTask(arr, chunk) {
  let i = 0;

  system.runInterval(() => {
    for (let n = 0; n < chunk && i < arr.length; n++, i++) {
      arr[i]();
    }
  }, 1);
}
```

👉 simulate multithread

---

# 37. 🧠 Memory Layout Control

```js
const ids = [];
const scores = [];
```

👉 ลด GC + เร็วขึ้น

---

# 38. 🔄 Reuse Array

```js
arr.length = 0;
```

👉 ไม่สร้างใหม่

---

# 39. 🧠 Inline Cache Friendly

```js
// ❌ shape เปลี่ยน
data.a = 1;
data.b = 2;

// ✅ stable shape
data = { a: 0, b: 0 };
```

👉 JS engine optimize ได้

---

# 40. 🚀 Frame Budget System

```js
let budget = 5;

// ======================================================
// consumeBudget
// ======================================================
function consumeBudget() {
  if (budget <= 0) return false;

  budget--;
  return true;
}
```

👉 จำกัดงานต่อ tick แบบ dynamic

---

# 🎯 FINAL LEVEL INSIGHT

```text
Basic Dev:
- Loop ให้จบ

Intermediate:
- Loop ให้น้อย

Advanced:
- ไม่ loop ถ้าไม่จำเป็น

Engine Dev:
- ออกแบบระบบให้ไม่ต้อง loop
```

---

# 🔥 สรุปรวม (1–40)

คุณมีครบแล้ว:

### Layer 1 (พื้นฐาน)

* Map
* Cache
* Loop control
* Batch

### Layer 2 (production)

* Queue
* Dirty
* Scheduler
* Broadcast

### Layer 3 (engine)

* ECS
* Spatial partition
* Double buffer
* Command buffer

---

# 🧠 Insight สุดท้าย (สำคัญมาก)

> ❌ Performance ไม่ได้มาจาก "เขียนเร็ว"
> ✅ แต่มาจาก "ไม่ต้องทำงานนั้นเลย"

---

ถ้าคุณอยากไปสุดจริง (ระดับ engine):

ผมสามารถช่วยคุณออกแบบ:

* 🧠 ECS UHC System (เหมือน Unity/Unreal)
* ⚙️ Tick Scheduler แบบ priority + budget
* 🚀 รองรับ 100+ players แบบนิ่ง

บอกมาได้เลย เดี๋ยวผมจัด architecture ให้แบบโหดจริง 👍
โอเค นี่คือ **Production-Level + Big Tech Style (ครบ 40 Pattern)**
ผมจะจัดเป็น:

* ✅ **20 Core (ต้องมี)**
* 🚀 **+20 Advanced (ค่ายใหญ่ใช้)**
* พร้อม **function ตัวอย่าง + ใช้จริงได้**

อิงจากแนวคิดในไฟล์คุณ 

---

# 🧠🔥 CORE PRINCIPLE (จำให้แม่น)

```text
Performance = ลดจำนวนครั้งที่ code รัน × ลดขนาดงานต่อครั้ง
```

---

# 🧩 PART 1 — 20 CORE (Production Basic)

---

# 1. 🗂 Map Storage (O(1))

```js
const playerStore = new Map();

function getPlayer(id) {
  let data = playerStore.get(id);
  if (data) return data;

  data = { score: 0, state: 0 };
  playerStore.set(id, data);
  return data;
}
```

---

# 2. ⚡ Cache Player

```js
let players = [];

function updateCache() {
  players = world.getPlayers();
}
```

---

# 3. 🔁 Index Loop

```js
function loop(step) {
  for (let i = 0, len = players.length; i < len; i++) {
    const p = players[i];
    if (!p?.isValid) continue;
    step(p);
  }
}
```

---

# 4. 🚀 Tick Budget

```js
function process(limit, step) {
  for (let i = 0; i < players.length && i < limit; i++) {
    const p = players[i];
    if (!p?.isValid) continue;
    step(p);
  }
}
```

---

# 5. 🔁 Round Robin

```js
let index = 0;

function next() {
  if (!players.length) return null;
  return players[index++ % players.length];
}
```

---

# 6. 📦 Batch Processing

```js
function batch(size, step) {
  for (let i = 0; i < size; i++) {
    const p = next();
    if (!p?.isValid) continue;
    step(p);
  }
}
```

---

# 7. 🧠 Guard Clause

```js
if (!p || !p.isValid) return;
```

---

# 8. 🧊 Dirty Flag

```js
const dirty = new Set();

function markDirty(id) {
  dirty.add(id);
}
```

---

# 9. 🧊 Flush Dirty

```js
function flushDirty() {
  for (const id of dirty) {
    const data = playerStore.get(id);
    if (!data) continue;
  }
  dirty.clear();
}
```

---

# 10. 📦 Queue

```js
const queue = [];

function pushTask(fn) {
  queue.push(fn);
}
```

---

# 11. 📦 Run Queue

```js
function runQueue(limit) {
  let count = 0;

  while (count < limit && queue.length) {
    const fn = queue.shift();
    try { fn(); } catch {}
    count++;
  }
}
```

---

# 12. ⏱ Frequency Split

```js
system.runInterval(updateCache, 20);
system.runInterval(flushDirty, 20);
system.runInterval(mainLoop, 1);
```

---

# 13. 🧠 Shared State

```js
const gameState = { score: 0 };
```

---

# 14. 📡 Broadcast

```js
function broadcast(msg) {
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p?.isValid) continue;
    p.onScreenDisplay.setActionBar(msg);
  }
}
```

---

# 15. 🧊 Cooldown

```js
const cd = new Map();

function canRun(id, delay) {
  const now = Date.now();
  if ((cd.get(id) ?? 0) > now) return false;

  cd.set(id, now + delay);
  return true;
}
```

---

# 16. 🧠 Mutable Update

```js
data.score += 1;
```

---

# 17. 🚫 Avoid API Spam

```js
// ❌ world.getPlayers()
// ✅ players cache
```

---

# 18. 🔄 Work Split

```js
function processLarge(arr, chunk) {
  let i = 0;

  system.runInterval(() => {
    for (let n = 0; n < chunk && i < arr.length; n++, i++) {
      arr[i]();
    }
  }, 1);
}
```

---

# 19. 🧠 Minimal Data

```js
{ id } // ไม่เก็บหนัก
```

---

# 20. 🔥 Master Loop

```js
function mainLoop() {
  runQueue(5);

  for (let i = 0; i < 5; i++) {
    const p = next();
    if (!p?.isValid) continue;

    const data = getPlayer(p.id);

    pushTask(() => {
      p.onScreenDisplay.setActionBar("Score " + data.score);
    });
  }
}
```

---

# 🚀 PART 2 — 20 ADVANCED (Big Tech / Engine)

---

# 21. 🧠 Hot / Cold Split

```js
system.runInterval(updateHot, 1);
system.runInterval(updateCold, 20);
```

---

# 22. 🧬 ECS (Component Map)

```js
const hp = new Map();
const pos = new Map();
```

---

# 23. 🧠 System Pipeline

```js
const systems = [];

function register(fn) {
  systems.push(fn);
}
```

---

# 24. ⚙️ Priority Scheduler

```js
const high = [];
const low = [];
```

---

# 25. 🧠 Spatial Partition

```js
function key(x, z) {
  return (x >> 4) + ":" + (z >> 4);
}
```

---

# 26. 📸 Snapshot

```js
const snap = players.slice();
```

---

# 27. 🧵 Double Buffer

```js
let cur = [];
let nextBuf = [];
```

---

# 28. 🧠 Command Buffer

```js
const cmds = [];
```

---

# 29. 🧠 Bitmask State

```js
const ALIVE = 1;
state |= ALIVE;
```

---

# 30. 🔄 Delta Update

```js
if (old === newVal) return;
```

---

# 31. 🧊 Write Buffer

```js
const writes = [];
```

---

# 32. 🧠 Pull Model

```js
if (!dirty) return;
```

---

# 33. ⚡ Inline Fast Path

```js
if (data.state === 0) continue;
```

---

# 34. 🧵 Async Split

```js
system.run(() => {});
```

---

# 35. 🧠 Memory Layout (SoA)

```js
const ids = [];
const scores = [];
```

---

# 36. 🔄 Reuse Array

```js
arr.length = 0;
```

---

# 37. 🧠 Stable Object Shape

```js
const data = { a: 0, b: 0 };
```

---

# 38. 🧠 Frame Budget

```js
let budget = 5;
```

---

# 39. 🧠 Early Exit Loop

```js
for (...) {
  if (found) break;
}
```

---

# 40. 🧠 Data-Oriented Design

```js
const hp = [];
const x = [];
const y = [];
```

---

# 💀 FINAL SUMMARY (ของจริง)

```text
BEGINNER:
- loop ทุกอย่าง

INTERMEDIATE:
- loop น้อยลง

ADVANCED:
- loop เฉพาะที่จำเป็น

ENGINE:
- ออกแบบให้ไม่ต้อง loop
```

---

# 🔥 TL;DR (Production จริง)

```text
Data  = Map / SoA
Loop  = Batch + Budget
Exec  = Queue
State = Dirty
Scale = Partition + ECS
```

---

# 🧠 Insight สุดท้าย

> ❌ ปัญหาไม่ใช่ “code ช้า”
> ✅ แต่คือ “code รันเยอะเกินไป”

---

ถ้าคุณอยาก “ไปสุดจริง”
ผมสามารถออกแบบให้คุณเป็น:

* ⚙️ Full ECS System (เหมือน Unity)
* 🧠 Tick Scheduler + Priority Engine
* 🚀 รองรับ 100+ players แบบนิ่ง

บอกมาได้เลย เดี๋ยวผมจัด architecture ระดับ engine ให้ 👍
เข้าใจโจทย์: คุณต้องการ **JavaScript Optimization Pattern ระดับ production (แนว Big Tech)** โดยโฟกัส **Minecraft Bedrock Script API (multiplayer + loop หนัก + data-heavy)**
ผมจะจัดให้เป็น 2 ชุด:

* **Core 20 (พื้นฐานที่ต้องใช้จริง)**
* **Advanced 20 (แนวใหม่ / Big Tech pattern)**

ทุกข้อจะมี **แนวคิด + example function แบบ production**

---

# 🚀 PART 1: Core 20 Optimization Patterns (ต้องใช้จริง)

## 1. Data Locality (Cache ก่อน loop)

```js
const players = world.getPlayers(); // cache once

for (let i = 0; i < players.length; i++) {
  const p = players[i];
}
```

✔ ลด native bridge call

---

## 2. Avoid getPlayers() in loops

❌ ห้าม:

```js
for (...) {
  world.getPlayers();
}
```

✔ ใช้:

```js
const players = world.getPlayers();
```

---

## 3. Use Plain Object over Map (hot path)

```js
const cache = Object.create(null);
cache[player.id] = data;
```

✔ เร็วกว่า Map ใน hot loop

---

## 4. Use Map for dynamic large dataset

```js
const db = new Map();
db.set(player.id, data);
```

✔ เมื่อ insert/delete บ่อย

---

## 5. Loop: for (i) > for-of > forEach

```js
for (let i = 0; i < arr.length; i++) {}
```

✔ fastest

---

## 6. Object Pooling (ลด GC)

```js
const pool = [];

function getObj() {
  return pool.pop() || { x: 0, y: 0 };
}

function release(obj) {
  pool.push(obj);
}
```

---

## 7. Batch Updates

```js
const updates = [];

function queueUpdate(player, data) {
  updates.push({ player, data });
}

function flush() {
  for (let i = 0; i < updates.length; i++) {
    const u = updates[i];
  }
  updates.length = 0;
}
```

---

## 8. Tick Scheduler (แทน setInterval spam)

```js
let tick = 0;

system.runInterval(() => {
  tick++;
}, 1);
```

---

## 9. Chunk Processing (แบ่งงาน)

```js
function process(players, chunkSize = 5) {
  for (let i = 0; i < players.length; i += chunkSize) {
    const slice = players.slice(i, i + chunkSize);
  }
}
```

---

## 10. Early Exit Pattern

```js
if (!player || player.isDead) return;
```

✔ ลด branch cost

---

## 11. Avoid JSON stringify/parse

❌ ห้ามใช้ใน tick loop

✔ ใช้:

```js
dynamicProperties
scoreboard
```

---

## 12. Bit Flag (compact state)

```js
const FLAG_ALIVE = 1 << 0;
const FLAG_VIP = 1 << 1;

player.flags |= FLAG_VIP;
```

---

## 13. Reuse Array

```js
const buffer = [];

function update() {
  buffer.length = 0;
}
```

---

## 14. Avoid Closure in hot loop

❌

```js
players.forEach(p => {});
```

✔

```js
for (let i = 0; i < players.length; i++) {}
```

---

## 15. Cache Components

```js
const inv = player.getComponent("inventory");
```

✔ ห้ามเรียกซ้ำ

---

## 16. Spatial Filtering (radius check)

```js
function near(a, b, r) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz < r * r;
}
```

✔ ไม่ใช้ sqrt

---

## 17. Debounce Heavy Logic

```js
let last = 0;

function update(tick) {
  if (tick - last < 20) return;
  last = tick;
}
```

---

## 18. Immutable Config

```js
const CONFIG = Object.freeze({
  MAX: 100
});
```

---

## 19. ID-based indexing

```js
const playersData = Object.create(null);
playersData[player.id] = {};
```

---

## 20. Avoid try/catch in hot path

✔ wrap outside instead

---

# ⚡ PART 2: Advanced 20 Patterns (Big Tech Style)

## 21. ECS (Entity Component System)

```js
const Position = {};
const Health = {};

Position[id] = { x: 0, y: 0 };
Health[id] = 20;
```

✔ แยก data = cache friendly

---

## 22. System Pipeline

```js
function tick() {
  updateMovement();
  updateCombat();
  updateUI();
}
```

✔ predictable order

---

## 23. Dirty Flag System

```js
if (!player.dirty) return;
```

✔ update เฉพาะที่เปลี่ยน

---

## 24. Double Buffer State

```js
let current = {};
let next = {};
```

✔ no mutation conflict

---

## 25. Read/Write Separation

```js
readPhase();
writePhase();
```

✔ ลด race condition

---

## 26. Lockstep Multiplayer Tick

```js
const TICK_RATE = 20;
```

✔ deterministic

---

## 27. Delta Update

```js
if (hp !== prevHp) sendUpdate();
```

✔ ลด network

---

## 28. Event Queue System

```js
const events = [];

events.push({ type: "damage", id });
```

---

## 29. Command Pattern

```js
function execute(cmd) {
  COMMANDS[cmd.type](cmd);
}
```

---

## 30. Memory Layout Optimization

```js
const hp = new Uint8Array(1000);
```

✔ ใช้ typed array

---

## 31. Frame Budget Control

```js
const MAX = 2; // ms
```

✔ ตัดงานถ้าเกิน

---

## 32. Work Stealing Queue (manual)

```js
const jobs = [];

function worker() {
  const job = jobs.pop();
}
```

---

## 33. Priority Queue

```js
high.push(task);
low.push(task);
```

---

## 34. Object Shape Stability

✔ ห้าม add/remove field runtime

---

## 35. Flat Data Structure

```js
const x = [];
const y = [];
```

✔ faster than nested object

---

## 36. Snapshot System

```js
const snapshot = { ...state };
```

---

## 37. Predictive Simulation

✔ client-side simulate (ถ้าใช้ net)

---

## 38. Modular Systems

```js
CombatSystem.update();
InventorySystem.update();
```

---

## 39. Lazy Initialization

```js
if (!cache[id]) init();
```

---

## 40. Fail-fast Validation

```js
if (!id) throw new Error();
```

---

# 🔥 Example: Production Multiplayer Tick Loop

```js
import { world, system } from "@minecraft/server";

const playersData = Object.create(null);

let tick = 0;

system.runInterval(() => {
  tick++;

  const players = world.getPlayers();

  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const id = p.id;

    let data = playersData[id];
    if (!data) {
      data = playersData[id] = { hp: 20, dirty: true };
    }

    // early exit
    if (!data.dirty) continue;

    // update
    data.hp--;

    // delta update
    if (data.hp <= 0) {
      data.hp = 20;
    }

    data.dirty = false;
  }

}, 1);
```

---

# 🎯 สรุปแบบตรงไปตรงมา

ถ้าจะให้ระดับ **production / Big Tech mindset** จริง:

* CPU bottleneck = loop + allocation
* Memory bottleneck = GC + object churn
* Multiplayer bottleneck = sync + data size

ดังนั้น rule หลักคือ:

> ❝ Loop ให้น้อยที่สุด, allocate ให้น้อยที่สุด, sync เท่าที่จำเป็น ❞

---

# ถ้าจะต่อยอด (แนะนำ)

ถ้าคุณอยากไประดับ “engine-level optimization” สำหรับ Bedrock:

* ผมสามารถออกแบบ:

  * ECS framework สำหรับ Script API
  * Tick scheduler แบบ adaptive
  * Data layer (QIDB-style ultra fast)
  * Multiplayer sync architecture (near real-time)

บอกผมได้ เดี๋ยวจัดให้แบบ production จริง ๆ ไม่ใช่แค่ tutorial
# Minecraft Bedrock Script API 1.26.10 - JavaScript Optimization Patterns (Production & Big Tech)

**Modules:** `@minecraft/server`, `@minecraft/server-ui` (if needed), `@minecraft/server-net` (BDS only).  
**Focus:** Data storage + loops + multiplayer basics for copy-paste production code. Ensures high performance in 100+ player servers by minimizing ticks, GC, and entity ops. [web:11][web:12][page:0]

## 20 Essential Patterns (Back to Basics)
Copy these functions directly for reliable multiplayer perf.

1. **Player Data Map**  
   ```js
   const playerData = new Map();
   world.afterEvents.playerSpawn.subscribe(ev => {
     if (ev.initialSpawn) playerData.set(ev.player.id, { kills: 0, health: 20 });
   });
   world.afterEvents.playerLeave.subscribe(ev => playerData.delete(ev.playerId));
   ```

2. **Safe All-Players Loop**  
   ```js
   system.runInterval(() => {
     for (const player of world.getAllPlayers()) {
       if (!player.isValid()) continue;
       updatePlayer(player);  // Your logic here
     }
   }, 1);
   ```

3. **Dynamic Property Save**  
   ```js
   function savePlayer(player) {
     const data = playerData.get(player.id);
     player.setDynamicProperty('data', JSON.stringify(data));
   }
   ```

4. **Filtered Hurt Event**  
   ```js
   world.afterEvents.entityHurt.subscribe(ev => {
     if (ev.hurtEntity.typeId !== 'minecraft:player') return;
     const p = ev.hurtEntity;
     playerData.get(p.id).health--;
   });
   ```

5. **Scoreboard Batch Update**  
   ```js
   function syncScores() {
     for (const [id, data] of playerData) {
       const player = world.getPlayers({ name: id });
       if (player?.isValid()) player.runCommandAsync(`scoreboard players set @s kills ${data.kills}`);
     }
   }
   system.runInterval(syncScores, 20);
   ```

6. **Tick Counter Loop**  
   ```js
   let tick = 0;
   system.runInterval(() => {
     tick++;
     if (tick % 20 === 0) heavyGlobalUpdate();
   }, 1);
   ```

7. **Cached UI Form**  
   ```js
   const formCache = new Map();
   function showStats(player) {
     let form = formCache.get(player.id);
     if (!form) {
       form = new ActionFormData()
         .title('Stats')
         .body(`Kills: ${playerData.get(player.id)?.kills ?? 0}`);
       formCache.set(player.id, form);
     }
     player.showForm(form);
   }
   ```

8. **Entity Cleanup**  
   ```js
   const overworld = world.getDimension('overworld');
   system.runInterval(() => {
     for (const e of overworld.getEntities({ type: 'my:proj' })) {
       if (!e.isValid() || e.location.y < -64) e.remove();
     }
   }, 5);
   ```

9. **Hit Throttle**  
   ```js
   const throttle = new Map();
   world.afterEvents.entityHitEntity.subscribe(ev => {
     const key = `${ev.damagingEntity.id}-${ev.hitEntity.id}`;
     const last = throttle.get(key) ?? 0;
     if (Date.now() - last < 200) return;
     throttle.set(key, Date.now());
     // Damage logic
   });
   ```

10. **Delayed Teleport**  
    ```js
    function safeTeleport(player, pos) {
      system.runTimeout(() => {
        if (player.isValid()) player.teleport(pos);
      }, 5);
    }
    ```

11. **Map Cleanup Check**  
    ```js
    system.runInterval(() => {
      if (playerData.size > 200) {
        for (const [id] of playerData) {
          if (!world.getPlayers({ id })) playerData.delete(id);
        }
      }
    }, 100);
    ```

12. **Top Score Loop**  
    ```js
    system.runInterval(() => {
      const obj = world.scoreboard.getObjective('kills');
      if (obj) {
        const top = obj.getScores().slice(0, 3);
        top.forEach(score => rewardPlayer(score.participant));
      }
    }, 40);
    ```

13. **UI Submit Handler**  
    ```js
    world.beforeEvents.chatSend.subscribe(ev => {
      if (ev.message === '!stats') {
        showStats(ev.sender);
        ev.cancel = true;
      }
    });
    ```

14. **Limited Entity Loop**  
    ```js
    system.runInterval(() => {
      const entities = overworld.getEntities({
        location: { x: 0, y: 64, z: 0 },
        maxDistance: 64,
        excludeTypes: ['minecraft:player']
      });
      entities.slice(0, 50).forEach(processEntity);
    }, 2);
    ```

15. **Join Data Load**  
    ```js
    world.afterEvents.playerJoin.subscribe(ev => {
      try {
        const str = ev.player.getDynamicProperty('data');
        if (str) playerData.set(ev.player.id, JSON.parse(str));
      } catch {}
    });
    ```

16. **Sorted Leaderboard**  
    ```js
    function getTopPlayers(n = 5) {
      return Array.from(playerData.entries())
        .sort(([,a], [,b]) => b.kills - a.kills)
        .slice(0, n)
        .map(([id]) => world.getPlayers({ id }));
    }
    ```

17. **Tag Filter**  
    ```js
    world.afterEvents.playerSpawn.subscribe(ev => ev.player.addTag('active'));
    // Loop: overworld.getEntities({ tags: ['target'] })
    ```

18. **Timeout Manager**  
    ```js
    const playerTimeouts = new Map();
    function schedule(playerId, fn, ticks) {
      const id = system.runTimeout(fn, ticks);
      playerTimeouts.set(playerId, id);
    }
    ```

19. **Dimension Loop**  
    ```js
    const dims = ['overworld', 'nether', 'the_end'];
    system.runInterval(() => {
      dims.forEach(dimKey => {
        const dim = world.getDimension(dimKey);
        dim.getEntities({ families: ['mob'] }).slice(0, 20).forEach(aiUpdate);
      });
    }, 10);
    ```

20. **Basic Profiler**  
    ```js
    system.runInterval(() => {
      console.time('fullTick');
      // All logic
      console.timeEnd('fullTick');
    }, 200);
    ```

## 20 Advanced Big Tech Patterns (New/Enterprise)
Scalable for large SMPs, inspired by AAA engines.

| # | Pattern | Code Snippet | Perf Win |
|---|---------|-------------|----------|
| 21 | Object Pool | `class Pool{constructor(fn,size=100){this.pool=[];for(let i=0;i<size;i++)this.pool.push(fn());}get(){return this.pool.pop()&#124;&#124;this.create();}release(o){this.pool.push(o);}}` [web:17] | No alloc in loops |
| 22 | WeakMap Cache | `const wcache=new WeakMap();function state(p){return wcache.get(p)??wcache.set(p,{}).get(p);}` [web:25] | Auto cleanup |
| 23 | Dirty Flags | `data.dirty=true;system.run(()=>{if(data.dirty){save();data.dirty=false;}});` [page:0] | Lazy sync |
| 24 | Spatial Grid | `const grid=new Map();function key(x,y){return Math.floor(x/16)+':'+Math.floor(y/16);} grid.get(key(e.x,e.y))` [web:20] | Fast nearby |
| 25 | Gen Loop | `function* ents(){for(const e of entities)yield e;} /* for(const e of ents()) process(e); */` [web:22] | Memory low |
| 26 | Dist Memo | `const memo=new Map();function d(a,b){const k=a.id+':'+b.id;return memo.get(k)??memo.set(k,dist(a,b)).get(k);}` | Repeats fast |
| 27 | Pri Queue | `class PQ{add(t,p){/* min-heap */}tick(){while(this.top.p<=now)this.top.t();}}` [web:17] | Fair tasks |
| 28 | Immutable | `const next={...cur,kills:cur.kills+1};playerData.set(id,next);` [web:25] | No races |
| 29 | Debounce | `const db=new Map();db.set(id,setTimeout(fn,300));` [page:0] | Spam free |
| 30 | Bin Pack | `function pack([k,h]){return (k<<16)\|h;} player.setDynamicProperty('st',pack([kills,health]));` | Tiny data |
| 31 | Event Bus | `class Bus{on(e,cb){/*arr.push(cb)*/}emit(e,d){this[e]?.forEach(f=>f(d));}}` [web:22] | Loose couple |
| 32 | Rate Limit | `p.last??=0;if(Date.now()-p.last<500)return;p.last=Date.now();` | Anti abuse |
| 33 | Adapt Tick | `interval=players.length>32?2:1;system.runInterval(fn,interval);` [web:18] | Scale load |
| 34 | BDS Net Ping | `fetch('https://api.example/ping',{method:'POST',body:JSON.stringify(metrics)});` [web:13] | Monitor |
| 35 | Predict Path | `function predict(p,t){return{x:p.location.x+p.velocity.x*t};}` [web:25] | Smooth net |
| 36 | Bit Tags | `const bits=new Uint32Array(1024);function has(tagId){return bits[tagId>>5]&(1<<(tagId&31));}` | Fast check |
| 37 | Vec Reuse | `const vecs=[];function vec(x,y,z){let v=vecs.pop()||{};v.x=x;v.y=y;v.z=z;return v;}` | GC zero |
| 38 | LOD Dist | `if(dist(p,e)>64)simpleAI(e);else fullAI(e);` [web:20] | Far cheap |
| 39 | Circuit Break | `let fails=0;if(++fails>10)disabled=true;setTimeout(()=>disabled=false,5000);` [web:13] | Stable |
| 40 | TPS Metric | `let lastTime=Date.now();system.runInterval(()=>{const tps=1000/(Date.now()-lastTime);console.warn('TPS:',tps);lastTime=Date.now();},20);` [web:16] | Live debug |

**Usage:** Import in `main.ts`: `import { world, system } from '@minecraft/server';` Run on load. Test in BDS for net. [web:18][page:1]