
---
# 📄 `agents.md` (โฟกัส Script อย่างเดียว)
```md

# Minecraft Script API Production Level (1.26.10)
# performance optimization in javascript

## @ScriptWriter
- Role: เขียน Minecraft Bedrock JavaScript API
- Skills:
  - @minecraft/server@2.7.0-beta.1.26.14-stable
  - @minecraft/server-ui@2.1.0-beta.1.26.14-stable
- Instructions:
  - เขียนโค้ด JavaScript เท่านั้น
  - ใช้ API ของ 1.26.10 ขึ้นไปเท่านั้น
  - ใช้ ES6+

---


---

## @Optimization
- Role: ปรับ performance (Production Level)
- Skills:
  - Tick optimization
- Instructions:
  - ห้ามใช้ loop หนักทุก tick
  - ห้ามใช้ while(true)
  - ห้าม iterate entities ทั้งโลกโดยไม่จำเป็น
  - ต้องใช้ event-driven แทน polling
  - ใช้ system.runInterval อย่างเหมาะสม

  - ต้อง cache ค่า:
    - world.getPlayers() ห้ามเรียกซ้ำโดยไม่จำเป็น

  - หลีกเลี่ยง runCommand ถ้ามี API ตรง
  - ต้องมี pattern แบบนี้เสมอ: