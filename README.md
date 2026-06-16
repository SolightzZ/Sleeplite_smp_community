<div align="center">
  <img src="https://raw.githubusercontent.com/SolightzZ/Sleeplite_smp_community/dev/world_icon.jpeg" width="120" height="120" style="border-radius: 20px;" alt="Sleeplite SMP">

# Sleeplite SMP Community

<b>Minecraft Bedrock 1.26.20</b> — World Save + Add-on Development

  <br>

[![Minecraft](https://img.shields.io/badge/Minecraft-Bedrock_1.26.20-00AA00?style=for-the-badge&logo=minecraft&logoColor=white)]()
[![Language](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()
[![mcfunction](https://img.shields.io/badge/mcfunction-FF6F00?style=for-the-badge&logo=minetest&logoColor=white)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

</div>

---

## ภาพรวม

Sleeplite SMP Community เป็นโลก Minecraft Bedrock Edition สำหรับพัฒนาและทดสอบ Add-on และ Script API บนเวอร์ชัน 1.26.20 มาพร้อม Behavior Pack 21 รายการ และ Resource Pack 20 รายการ สำหรับประสบการณ์การเล่นที่หลากหลายทั้งระบบอาวุธ อาหาร สิ่งมีชีวิต โครงสร้าง และ Visual Effects

## คุณสมบัติหลัก

- **Script API Integration** — ใช้ `Javascript For Bedrock BP` สำหรับระบบที่ซับซ้อน
- **Armor Plus** — ชุดเกราะและอาวุธเพิ่มเติม
- **Food Expanded** — ระบบอาหารใหม่ ๆ
- **Custom Structures** — โครงสร้างโลกที่เพิ่มขึ้นจาก 5 Structure Packs
- **Player Heads** — หัวผู้เล่นดรอปเมื่อตาย
- **Mobs เพิ่มเติม** — Goblin Traders, Peter, Silent Hill Entities
- **VisualHD + Custom Frames** — กราฟิกและเฟรมตกแต่ง
- **Emotes & Enchant Icons** — อารมณ์ตัวละครและไอคอน enchant

## ความต้องการของระบบ

> [!IMPORTANT]
> ต้องเปิด Experimental Features (Gametest Framework) และ Holiday Creator Features ในโลกถึงจะใช้งาน Script API และ Add-on บางรายการได้

- **Minecraft Bedrock Edition** 1.26.20+
- **Experimental Features** เปิด Gametest Framework (สำหรับ Script API)
- **Holiday Creator Features** — เปิดเพื่อรองรับ Add-on บางรายการ
- ใช้ได้ทั้ง单人เล่น และ Bedrock Dedicated Server (BDS)

## การติดตั้ง

1. Clone โปรเจกต์:
   ```bash
   git clone https://github.com/SolightzZ/Sleeplite_smp_community.git
   ```
2. เปิด Minecraft → เล่น → เลือกโลกนี้
3. ไปที่ Settings → Add-Ons → ตรวจสอบว่า Behavior Packs และ Resource Packs ทั้งหมดถูกเปิดใช้งาน
4. (Optional) สำหรับ Script API:
   ```bash
   npm install
   ```

> [!NOTE]
> Add-on และ Resource Pack บางรายการอาจต้องเปิดใช้งานเองที่ Settings → Storage ถ้าไม่แสดงอัตโนมัติ

## การใช้งาน

> [!TIP]
> Structure Packs จะ生成โครงสร้างเมื่อสำรวจพื้นที่ใหม่ — ออกจากพื้นที่เดิมแล้วกลับมาใหม่เพื่อให้ structures โผล่

- โหลดโลกแล้วเล่นตามปกติ — Add-on และ Script API ทั้งหมดทำงานอัตโนมัติ
- หากต้องการแก้ไข Script: ไปที่ `behavior_packs/Javascript For Bedrock BP/scripts/`

## Behavior Packs

| #   | Pack                                                                                                                                                                       | Path                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | [ArmoredElytras](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/ArmoredElytras%20%28Addon%29)                                                | `behavior_packs/ArmoredElytras (Addon)`                 |
| 2   | [ArmorPlus BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/ArmorPlus%20BP)                                                                | `behavior_packs/ArmorPlus BP`                           |
| 3   | [CampfireCreations](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/CampfireCreations%20%28Addon%29)                                          | `behavior_packs/CampfireCreations (Addon)`              |
| 4   | [CraftRecipes BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/CraftRecipes%20BP)                                                          | `behavior_packs/CraftRecipes BP`                        |
| 5   | [CustomFrames](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/CustomFrames%20%28Addon%29)                                                    | `behavior_packs/CustomFrames (Addon)`                   |
| 6   | [EntitiePacks BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/EntitiePacks%20BP)                                                          | `behavior_packs/EntitiePacks BP`                        |
| 7   | [FoodExpanded](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/FoodExpanded%20%28Addon%29)                                                    | `behavior_packs/FoodExpanded (Addon)`                   |
| 8   | [Goblintraders](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Goblintraders%20%28Addon%29)                                                  | `behavior_packs/Goblintraders (Addon)`                  |
| 9   | [Items BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Items%20BP)                                                                        | `behavior_packs/Items BP`                               |
| 10  | [Javascript For Bedrock BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Javascript%20For%20Bedrock%20BP)                                  | `behavior_packs/Javascript For Bedrock BP`              |
| 11  | [MemePack](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/MemePack%20%28Addon%29)                                                            | `behavior_packs/MemePack (Addon)`                       |
| 12  | [Peter](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Peter%20%28Addon%29)                                                                  | `behavior_packs/Peter (Addon)`                          |
| 13  | [PlayerHeads](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/PlayerHeads%20%28Addon%29)                                                      | `behavior_packs/PlayerHeads (Addon)`                    |
| 14  | [Ruby](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Ruby%20%28Addon%29)                                                                    | `behavior_packs/Ruby (Addon)`                           |
| 15  | [SilentHill](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/SilentHill%20%28Addon%29)                                                        | `behavior_packs/SilentHill (Addon)`                     |
| 16  | [Structures Nics Castles & Dungeons BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20%20Nics%20Castles%20%26%20Dungeons%20BP) | `behavior_packs/Structures  Nics Castles & Dungeons BP` |
| 17  | [Structures Ancient Ruins BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Ancient%20Ruins%20BP)                              | `behavior_packs/Structures Ancient Ruins BP`            |
| 18  | [Structures Better BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Better%20BP)                                              | `behavior_packs/Structures Better BP`                   |
| 19  | [Structures Immersive Flora](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Immersive%20Flora%20%28Addon%29)                    | `behavior_packs/Structures Immersive Flora (Addon)`     |
| 20  | [Structures Reds More BP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/Structures%20Reds%20More%20BP)                                      | `behavior_packs/Structures Reds More BP`                |
| 21  | [VisualHD](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/behavior_packs/VisualHD%20%28Addon%29)                                                            | `behavior_packs/VisualHD (Addon)`                       |

## Resource Packs

| #   | Pack                                                                                                                                    | Path                                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | [ArmoredElytras (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/ArmoredElytras%20%28Texture%29) | `resource_packs/ArmoredElytras (Texture)` |
| 2   | [Armorplus RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Armorplus%20RP)                             | `resource_packs/Armorplus RP`             |
| 3   | [Blocks RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Blocks%20RP)                                   | `resource_packs/Blocks RP`                |
| 4   | [CustomFrames (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/CustomFrames%20%28Texture%29)     | `resource_packs/CustomFrames (Texture)`   |
| 5   | [CustomNPC (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/CustomNPC%20%28Texture%29)           | `resource_packs/CustomNPC (Texture)`      |
| 6   | [Emotes RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Emotes%20RP)                                   | `resource_packs/Emotes RP`                |
| 7   | [EnchantIcon RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/EnchantIcon%20RP)                         | `resource_packs/EnchantIcon RP`           |
| 8   | [FoodExpanded (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/FoodExpanded%20%28Texture%29)     | `resource_packs/FoodExpanded (Texture)`   |
| 9   | [FusedsBirds (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/FusedsBirds%20%28Texture%29)       | `resource_packs/FusedsBirds (Texture)`    |
| 10  | [GoblinTraders (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/GoblinTraders%20%28Texture%29)   | `resource_packs/GoblinTraders (Texture)`  |
| 11  | [ImmersiveFlora (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/ImmersiveFlora%20%28Texture%29) | `resource_packs/ImmersiveFlora (Texture)` |
| 12  | [Items RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Items%20RP)                                     | `resource_packs/Items RP`                 |
| 13  | [MemePack (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/MemePack%20%28Texture%29)             | `resource_packs/MemePack (Texture)`       |
| 14  | [Peter (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Peter%20%28Texture%29)                   | `resource_packs/Peter (Texture)`          |
| 15  | [PlayerHeads (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/PlayerHeads%20%28Texture%29)       | `resource_packs/PlayerHeads (Texture)`    |
| 16  | [RainParticle (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/RainParticle%20%28Texture%29)     | `resource_packs/RainParticle (Texture)`   |
| 17  | [Ruby (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/Ruby%20%28Texture%29)                     | `resource_packs/Ruby (Texture)`           |
| 18  | [ServerPacks RP](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/ServerPacks%20RP)                         | `resource_packs/ServerPacks RP`           |
| 19  | [SilentHill (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/SilentHill%20%28Texture%29)         | `resource_packs/SilentHill (Texture)`     |
| 20  | [VisualHD (Texture)](https://github.com/SolightzZ/Sleeplite_smp_community/tree/dev/resource_packs/VisualHD%20%20%28Texture%29)          | `resource_packs/VisualHD  (Texture)`      |

---

## Tech Stack

| Category    | Technology                                                      |
| ----------- | --------------------------------------------------------------- |
| Language    | JavaScript (Script API), mcfunction                             |
| Framework   | @minecraft/server ^2.8.0-beta, @minecraft/server-ui ^2.1.0-beta |
| Runtime     | Minecraft Bedrock Engine 1.26.20                                |
| CI          | GitHub Actions                                                  |
| Add-on Type | Behavior Packs, Resource Packs, Script API                      |

## Known Issues / Limitations

- Structure Packs อาจต้องสำรวจพื้นที่ใหม่เพื่อให้ structures ปรากฏ
- Script API ต้องเปิด Experimental Features (Gametest Framework) ในโลก
- บาง Add-on อาจไม่ compatible กับเวอร์ชัน 1.26.20 โดยตรง ต้องปรับ format_version
- `VisualHD (Texture)` มี space ในชื่อโฟลเดอร์ อาจมีปัญหากับบางระบบ

## Changelog

### v2.0.0

- Initial release — Sleeplite SMP Community World Save
- 21 Behavior Packs, 20 Resource Packs
- README documentation

## Contributing

1. Fork repository
2. สร้าง branch ใหม่ (`git checkout -b feature/your-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add your feature'`)
4. Push ไปที่ branch (`git push origin feature/your-feature`)
5. เปิด Pull Request

## ผู้พัฒนา

- **SolightzZ** — [GitHub](https://github.com/SolightzZ)

## License

[MIT](./LICENSE)

---

<div align="center">

[![Repo](https://img.shields.io/badge/GitHub-SolightzZ%2FSleeplite__smp__community-181717?style=flat-square&logo=github)]()
[![Bedrock Wiki](https://img.shields.io/badge/Bedrock_Wiki-00AA00?style=flat-square&logo=minecraft&logoColor=white)](https://wiki.bedrock.dev/)
[![Minecraft Creator Docs](https://img.shields.io/badge/Creator_Docs-0078D4?style=flat-square&logo=microsoft&logoColor=white)](https://learn.microsoft.com/en-us/minecraft/creator/)

</div>
