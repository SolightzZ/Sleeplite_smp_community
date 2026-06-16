<div align="center">
  <img src="resource_packs\ServerPacks RP\textures\ui\title.png" width="auto" height="120" style="border-radius: 20px;" alt="Sleeplite SMP">

# Sleeplite SMP Community

<b>Minecraft Bedrock 1.26.30</b> — Add-on Development

  <br>

[![Minecraft](https://img.shields.io/badge/Minecraft-Bedrock_1.26.30-00AA00?style=for-the-badge&logo=minecraft&logoColor=white)]()
[![Language](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![mcfunction](https://img.shields.io/badge/mcfunction-FF6F00?style=for-the-badge&logo=minetest&logoColor=white)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

</div>

---

## ภาพรวม (Overview)

**Sleeplite SMP Community** คือ Workspace สำหรับใช้ในการพัฒนาและทดสอบ Behavior Packs (BP) และ Resource Packs (RP) ของเกม Minecraft Bedrock Edition (เวอร์ชัน 1.26.30) ด้วยภาษา JavaScript (Script API) และ mcfunction เพื่อให้สามารถเปิดรันและทดสอบแพ็กต่างๆ ในเกมได้โดยตรง

---

## 💻 คู่มือการใช้งานสำหรับผู้พัฒนา (Developer Guide)

Workspace นี้ออกแบบมาเพื่ออำนวยความสะดวกในการเข้าถึงซอร์สโค้ดและช่วยให้สามารถปรับปรุง แก้ไข หรือทดสอบระบบ Add-on Packs ได้แบบเรียลไทม์

### 1. การติดตั้งและเตรียมสภาพแวดล้อม (Setup)

1. **Clone หรือดาวน์โหลดโปรเจกต์** เพื่อใช้เป็นสภาพแวดล้อมจำลองในการรันและทดสอบแพ็กต่างๆ ในเกม
2. **ติดตั้ง Dependencies สำหรับพัฒนาสคริปต์**: เปิด Terminal ในตำแหน่งโฟลเดอร์นี้และรันคำสั่งติดตั้งโมดูลเสริมสำหรับใช้ช่วยเขียนโค้ด (Auto-complete) และการตรวจชนิดข้อมูล (Type Checking):
   ```bash
   npm install
   ```

> [!IMPORTANT]
> **การตั้งค่าสำหรับการทดสอบ**: ต้องเปิดตัวเลือก **Experimental Features (Beta APIs / Gametest Framework)** และ **Holiday Creator Features** ในหน้าการตั้งค่าเปิดใช้งานสคริปต์และแพ็กเสมอ เพื่อให้ระบบสคริปต์ (Script API) และ Add-on สามารถทำงานได้สมบูรณ์

### 2. โครงสร้างโฟลเดอร์โครงการ

- `behavior_packs/` — โฟลเดอร์หลักสำหรับพัฒนา Behavior Packs (BP) เช่น ตรรกะระบบ, พฤติกรรมของเอนทิตี, สูตรคราฟต์ และ Script API
- `resource_packs/` — โฟลเดอร์หลักสำหรับพัฒนา Resource Packs (RP) เช่น โมเดลสามมิติ (3D Models), พื้นผิว (Textures), ไอคอน และเอฟเฟกต์เสียง

### 3. การเขียนสคริปต์ระบบ (Script API)

ตัวโปรเจกต์ควบคุมเหตุการณ์ในเกมด้วยภาษา JavaScript โดยซอร์สโค้ดหลักสำหรับเขียนควบคุมจะอยู่ในตำแหน่ง:
📂 `behavior_packs/Javascript For Bedrock BP/scripts/main.js`

---

## 📦 รายละเอียด Add-on ที่ติดตั้ง (Pack Details)

### Behavior Packs (ทั้งหมด 21 รายการ)

| #   | Pack Name                                                                                                                                                         | Path                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | [Armored Elytras (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/ArmoredElytras%20%28Addon%29)                              | `behavior_packs/ArmoredElytras (Addon)`                 |
| 2   | [Armor plus BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/ArmorPlus%20BP)                                                      | `behavior_packs/ArmorPlus BP`                           |
| 3   | [Campfire Creations (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/CampfireCreations%20%28Addon%29)                        | `behavior_packs/CampfireCreations (Addon)`              |
| 4   | [\[Craft and Recipes BP\]](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/CraftRecipes%20BP)                                        | `behavior_packs/CraftRecipes BP`                        |
| 5   | [Custom Paintings (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/CustomFrames%20%28Addon%29)                               | `behavior_packs/CustomFrames (Addon)`                   |
| 6   | [Sleeplite Enitie Packs BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/EntitiePacks%20BP)                                       | `behavior_packs/EntitiePacks BP`                        |
| 7   | [Food Expanded BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/FoodExpanded%20%28Addon%29)                                       | `behavior_packs/FoodExpanded (Addon)`                   |
| 8   | [Goblin Traders (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Goblintraders%20%28Addon%29)                                | `behavior_packs/Goblintraders (Addon)`                  |
| 9   | [Pack Items BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Items%20BP)                                                          | `behavior_packs/Items BP`                               |
| 10  | [JavaScripts API For Bedrock BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Javascript%20For%20Bedrock%20BP)                    | `behavior_packs/Javascript For Bedrock BP`              |
| 11  | [Meme Packs (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/MemePack%20%28Addon%29)                                         | `behavior_packs/MemePack (Addon)`                       |
| 12  | [Peter (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Peter%20%28Addon%29)                                                 | `behavior_packs/Peter (Addon)`                          |
| 13  | [Player Heads BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/PlayerHeads%20%28Addon%29)                                         | `behavior_packs/PlayerHeads (Addon)`                    |
| 14  | [Rubies Reborn (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Ruby%20%28Addon%29)                                          | `behavior_packs/Ruby (Addon)`                           |
| 15  | [Silent Hill (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/SilentHill%20%28Addon%29)                                      | `behavior_packs/SilentHill (Addon)`                     |
| 16  | [Nics Castles and Dungeons BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20%20Nics%20Castles%20%26%20Dungeons%20BP) | `behavior_packs/Structures  Nics Castles & Dungeons BP` |
| 17  | [Ancient Structures BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Ancient%20Ruins%20BP)                           | `behavior_packs/Structures Ancient Ruins BP`            |
| 18  | [Better Structures BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Better%20BP)                                     | `behavior_packs/Structures Better BP`                   |
| 19  | [Immersive Flora (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Immersive%20Flora%20%28Addon%29)              | `behavior_packs/Structures Immersive Flora (Addon)`     |
| 20  | [Reds More Structures BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Reds%20More%20BP)                             | `behavior_packs/Structures Reds More BP`                |
| 21  | [Visual Damage Tint (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/VisualHD%20%28Addon%29)                                 | `behavior_packs/VisualHD (Addon)`                       |

### Resource Packs (ทั้งหมด 20 รายการ)

| #   | Pack Name                                                                                                                                | Path                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | [Armored Elytras (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/ArmoredElytras%20%28Texture%29) | `resource_packs/ArmoredElytras (Texture)` |
| 2   | [Armor plus RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Armorplus%20RP)                             | `resource_packs/Armorplus RP`             |
| 3   | [Blocks Gravestone RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Blocks%20RP)                         | `resource_packs/Blocks RP`                |
| 4   | [Custom Paintings (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/CustomFrames%20%28Texture%29)  | `resource_packs/CustomFrames (Texture)`   |
| 5   | [Custom NPC (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/CustomNPC%20%28Texture%29)           | `resource_packs/CustomNPC (Texture)`      |
| 6   | [Emote for Sleeplite RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Emotes%20RP)                       | `resource_packs/Emotes RP`                |
| 7   | [Enchant Icon RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/EnchantIcon%20RP)                         | `resource_packs/EnchantIcon RP`           |
| 8   | [Food Expanded (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/FoodExpanded%20%28Texture%29)     | `resource_packs/FoodExpanded (Texture)`   |
| 9   | [Fused Birds (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/FusedsBirds%20%28Texture%29)        | `resource_packs/FusedsBirds (Texture)`    |
| 10  | [Goblin Traders (Addon)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/GoblinTraders%20%28Texture%29)     | `resource_packs/GoblinTraders (Texture)`  |
| 11  | [Immersive Flora (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/ImmersiveFlora%20%28Texture%29) | `resource_packs/ImmersiveFlora (Texture)` |
| 12  | [Items RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Items%20RP)                                      | `resource_packs/Items RP`                 |
| 13  | [MemePack (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/MemePack%20%28Texture%29)              | `resource_packs/MemePack (Texture)`       |
| 14  | [Peter (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Peter%20%28Texture%29)                    | `resource_packs/Peter (Texture)`          |
| 15  | [PlayerHeads (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/PlayerHeads%20%28Texture%29)        | `resource_packs/PlayerHeads (Texture)`    |
| 16  | [RainParticle (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/RainParticle%20%28Texture%29)      | `resource_packs/RainParticle (Texture)`   |
| 17  | [Ruby (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Ruby%20%28Texture%29)                      | `resource_packs/Ruby (Texture)`           |
| 18  | [ServerPacks RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/ServerPacks%20RP)                          | `resource_packs/ServerPacks RP`           |
| 19  | [SilentHill (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/SilentHill%20%28Texture%29)          | `resource_packs/SilentHill (Texture)`     |
| 20  | [VisualHD (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/VisualHD%20%20%28Texture%29)           | `resource_packs/VisualHD  (Texture)`      |

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| Category        | Technology                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Language**    | JavaScript (Script API), mcfunction                                                                                           |
| **Framework**   | `@minecraft/server` ^2.8.0-beta.1.26.30-stable, `@minecraft/server-ui` ^2.1.0-beta.1.26.30-stable, `@minecraft/common` ^1.3.0 |
| **Runtime**     | Minecraft Bedrock Engine 1.26.30 (ทำงานร่วมกับสคริปต์สอดรับถึงเวอร์ชัน 1.26.30)                                               |
| **CI / CD**     | GitHub Actions                                                                                                                |
| **Add-on Type** | Behavior Packs (21), Resource Packs (20, เปิดใช้งานอยู่: 18), Script API                                                      |

---

## ⚠️ ข้อจำกัดและปัญหาที่พบ (Known Issues)

- **การสปอว์นสิ่งก่อสร้างใหม่**: แอดออนหมวด Structure Packs จะสร้างสิ่งก่อสร้างใหม่เมื่อผู้เล่นเดินทางไปยังพื้นที่ใหม่ที่ยังไม่เคยถูกสำรวจ (หากเดินวนเวียนในพื้นที่เดิมที่เคยโหลดแผนที่ไปแล้ว สิ่งก่อสร้างใหม่จะไม่ถูกสร้างเพิ่ม)
- **การทำงานของสคริปต์ระบบ**: จำเป็นต้องเปิดใช้งานตัวเลือกโหมดการทดลอง **Experimental Features (Beta APIs / Gametest Framework)** และ **Holiday Creator Features** ในเกมเสมอ เพื่อให้ระบบสคริปต์ (Script API) และ Add-on สามารถทำงานได้สมบูรณ์
- **ความเข้ากันได้ของรุ่นเกม**: Add-on บางตัวถูกสร้างขึ้นสำหรับเกมรุ่นเก่ากว่า อาจพบหน้าต่างแจ้งเตือนเรื่องความเข้ากันได้ (Compatibility Warning) สามารถแก้ไขได้โดยการปรับค่าเวอร์ชันในไฟล์ `manifest.json` ของแพ็กเหล่านั้น
- **การเว้นวรรคในชื่อโฟลเดอร์**: โฟลเดอร์ทรัพยากรบางตัว เช่น `VisualHD  (Texture)` (มีเว้นวรรคติดกัน 2 ช่อง) อาจส่งผลให้ระบบจัดการไฟล์ (File Manager) หรือโปรแกรมแก้ไขโค้ด (IDE) ในบางระบบปฏิบัติการเกิดความผิดพลาดในการค้นหาพาธ (Path Resolution)

---

## 🔄 Changelog

### v2.0.0

- Initial release — Sleeplite SMP Community
- 21 Behavior Packs, 20 Resource Packs
- README documentation

---

## 🤝 Contributing

1. Fork repository
2. สร้าง branch ใหม่ (`git checkout -b feature/your-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add your feature'`)
4. Push ไปที่ branch (`git push origin feature/your-feature`)
5. เปิด Pull Request

## 👥 ผู้พัฒนา (Developers)

- **SolightzZ** — [GitHub](https://github.com/SolightzZ)

## 📄 License

[MIT](./LICENSE)

---

<div align="center">

[![Repo](https://img.shields.io/badge/GitHub-SolightzZ%2FSleeplite__smp__community-181717?style=flat-square&logo=github)]()
[![Bedrock Wiki](https://img.shields.io/badge/Bedrock_Wiki-00AA00?style=flat-square&logo=minecraft&logoColor=white)](https://wiki.bedrock.dev/)
[![Minecraft Creator Docs](https://img.shields.io/badge/Creator_Docs-0078D4?style=flat-square&logo=microsoft&logoColor=white)](https://learn.microsoft.com/en-us/minecraft/creator/)

</div>
