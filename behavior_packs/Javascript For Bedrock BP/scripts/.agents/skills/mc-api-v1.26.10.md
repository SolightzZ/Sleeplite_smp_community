# Skill: Minecraft Bedrock Script API 1.26.10 (JavaScript Only)

## Modules
- ใช้เฉพาะ:
  - @minecraft/server
  - @minecraft/server-ui (ถ้าจำเป็น)
  - @minecraft/server-net (เฉพาะ BDS)

---

## Core Rules
- ใช้ ES6+ เท่านั้น
- ห้ามใช้ API deprecated
- ใช้ `world.afterEvents` เป็นหลัก
- ใช้ try/catch ทุกครั้งเมื่อทำงานกับ entity
- ตรวจสอบ entity ด้วย `isValid()` ก่อนใช้งาน

---

## Events (1.26.10 Standard)

### Entity Events
- world.afterEvents.entityHurt
- world.afterEvents.entityHit
- world.afterEvents.entityDie

### Player Events
- world.afterEvents.playerSpawn
- world.afterEvents.itemUse

### System
- system.runInterval
- system.runTimeout

---

## Safe Entity Handling

ตัวอย่าง:
```js
if (!entity || !entity.isValid()) return;