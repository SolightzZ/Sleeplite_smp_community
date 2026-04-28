import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

const CONFIG = {
  maxReports: 10,
  tool: "minecraft:paper",
  dbKey: "server_reports_data",
  adminTag: "admin",
};

const isAdmin = (player) => player.hasTag(CONFIG.adminTag);

const getTime = () => {
  try {
    return new Date().toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return new Date().toLocaleString;
  }
};

class Database {
  static load() {
    try {
      const data = world.getDynamicProperty(CONFIG.dbKey);
      if (!data) return {};
      return JSON.parse(data);
    } catch (e) {
      console.warn("[DB Load Error]: " + e);
      return {};
    }
  }

  static save(data) {
    try {
      world.setDynamicProperty(CONFIG.dbKey, JSON.stringify(data));
    } catch (e) {
      console.warn("[DB Save Error]: " + e);
    }
  }

  static add(name, title, body) {
    try {
      const db = this.load();
      if (!db[name]) db[name] = [];
      db[name].push({ t: title, b: body, d: getTime(), r: "" });
      this.save(db);
    } catch (e) {
      console.warn("[DB Add Error]: " + e);
    }
  }

  static update(name, index, title, body) {
    try {
      const db = this.load();
      if (db[name] && db[name][index]) {
        db[name][index].t = title;
        db[name][index].b = body;
        db[name][index].d = getTime() + " (edit)";
        this.save(db);
      }
    } catch (e) {
      console.warn("[DB Update Error]: " + e);
    }
  }

  static delete(name, index) {
    try {
      const db = this.load();
      if (db[name]) {
        db[name].splice(index, 1);
        if (db[name].length === 0) delete db[name];
        this.save(db);
      }
    } catch (e) {
      console.warn("[DB Delete Error]: " + e);
    }
  }

  static reply(name, index, text) {
    try {
      const db = this.load();
      if (db[name] && db[name][index]) {
        db[name][index].r = text;
        this.save(db);
      }
    } catch (e) {
      console.warn("[DB Reply Error]: " + e);
    }
  }

  static get(name) {
    try {
      const db = this.load();
      return db[name] || [];
    } catch (e) {
      console.warn("[DB Get Error]: " + e);
      return [];
    }
  }

  static getAll() {
    return this.load();
  }
}

const sure = (player, onConfirm, onCancel) => {
  try {
    const ui = new MessageFormData();
    ui.title("ยืนยันการลบข้อมูล");
    ui.body("ท่านแน่ใจหรือไม่ที่จะลบรายการนี้? การกระทำนี้ไม่สามารถยกเลิกได้");
    ui.button1("Confirm (ยืนยัน)");
    ui.button2("Cancel (ยกเลิก)");

    ui.show(player).then((res) => {
      if (res.canceled) {
        if (onCancel) onCancel();
        return;
      }
      if (res.selection === 0) onConfirm();
      else if (onCancel) onCancel();
    });
  } catch (e) {
    console.warn("System Error (Sure): " + e);
  }
};

const note = (player) => {
  try {
    const ui = new ActionFormData();
    ui.title("บันทึกการอัปเดตระบบ");

    const data = [
      {
        category: "1. เครื่องมือและระบบช่วยเล่น (Utility)",
        items: [
          "Magnet: แม่เหล็กดูดไอเทมรอบตัวอัตโนมัติ",
          "Protection: ระบบป้องกันพื้นที่ส่วนตัว",
          "Full Bright: ปรับการมองเห็นให้สว่างเสมอ",
          "Light Blocks: วางบล็อกแสงได้ในโหมดเอาชีวิตรอด",
          "Inventory Sorter: จัดเรียงไอเทมในตัวอัตโนมัติ",
          "Chest Sorter: จัดเรียงไอเทมในกล่องอัตโนมัติ",
          "Food Stats: แสดงค่าสถานะอาหารและความอิ่ม",
          "Door Air: ประตูใช้หายใจใต้น้ำได้",
          "End Portal Frame: ขุดตาเอนเดอร์ได้ (มีเงื่อนไข)",
          "Free Camera: โหมดกล้องอิสระ",
          "Java Saturation: ฟื้นฟูเลือดจากอาหารแบบ Java",
          "Durability & Name: แสดงชื่อและความทนทานไอเทม",
          "QuickServer: ย้ายเซิร์ฟเวอร์แบบเร่งด่วน",
          "HUB Setting: เมนูตั้งค่าส่วนตัว",
          "Private Message: ระบบแชทส่วนตัว",
          "Reward: รับรางวัลประจำวัน/ล็อกอิน",
          "Economy: ระบบธนาคารและเงิน",
          "Wolf Hoe: จอบเก็บผลผลิตระยะ 16 บล็อก",
          "Wolf Pickaxe: พลั่วขุดเจาะแบบ 3x3",
        ],
      },
      {
        category: "2. หน้าจอและท่าทาง (HUD & Emotes)",
        items: [
          "Day Counter: นับจำนวนวันที่ผ่านไป",
          "Biome Title: แสดงชื่อสถานที่เมื่อเดินผ่าน",
          "Daily Food Limit: จำกัดปริมาณการกินต่อวัน",
          "Help Command: คำสั่งช่วยเหลือ (!help)",
          "Thirst: ระบบกระหายน้ำ (ต้องดื่มน้ำ)",
          "Boss Title: หลอดเลือดบอสแบบเคลื่อนไหว",
          "Emotes: ท่าทางแสดงอารมณ์",
          "Patch Note: สมุดบันทึกการอัปเดต",
          "Report: ระบบแจ้งปัญหา",
          "Welcome UI: หน้าจอต้อนรับ",
          "Dimensions Locked: เงื่อนไขล็อคมิติ The End",
          "Hotbar Sound: เสียงเลื่อนช่องเก็บของแบบ Java",
        ],
      },
      {
        category: "3. อุปกรณ์สวมใส่ (Armor & Tools)",
        items: ["Wolf Armor: ชุดเกราะหมาป่า", "Wolf Tool: เครื่องมือหมาป่า", "Demon Armor: ชุดเกราะปีศาจ", "Demon Sword: ดาบปีศาจ"],
      },
      {
        category: "4. ระบบการตาย (Death System)",
        items: ["Gravestones: หลุมศพเก็บของเมื่อตาย", "Death Location: แจ้งพิกัดจุดตายในแชท", "Player Heads: ดรอปหัวผู้เล่นเมื่อถูกฆ่า"],
      },
      {
        category: "5. เครื่องมือผู้ดูแล (Admin Tools)",
        items: ["Ban Player: ระบบแบนและปลดแบน", "View Inventory: ดูของในตัวผู้เล่นอื่น"],
      },
      {
        category: "6. การสร้างของ (Crafting)",
        items: [
          "Crafting: สูตรคราฟของแบบพิเศษ",
          "Recipes: เพิ่มสูตรไอเทมใหม่",
          "Stonecutter: เพิ่มสูตรในเครื่องตัดหิน",
          "Advanced Crafting: โต๊ะคราฟขั้นสูง",
          "Painting Custom: ภาพวาดและของตกแต่ง",
          "Barrel Custom: ถังเก็บของลวดลายใหม่",
        ],
      },
      {
        category: "7. อัปเกรดสิ่งมีชีวิต (Mobs Upgrade)",
        items: [
          "Big Salmon: ปลาแซลมอนตัวใหญ่ (ดรอปของ)",
          "Cod: ปลาค็อดตัวใหญ่ (ดรอปของ)",
          "Bee: ผึ้งขนาดตัวเล็กลง",
          "Donkey: ขี่ได้ 2 คน",
          "Ender Dragon: เพิ่มความยากและขนาดตัว",
          "Happy Ghast: แกสต์พาหนะ (12 ที่นั่ง)",
          "Horse: ขี่ได้ 2 คน",
          "Husk: ขนาดตัวใหญ่กว่าปกติ",
          "Mule: ขี่ได้ 2 คน",
          "Spider: ขนาดตัวใหญ่กว่าปกติ",
          "Wolf: ขนาดตัวใหญ่กว่าปกติ",
          "Zombie: ขนาดตัวใหญ่กว่าปกติ",
        ],
      },
      {
        category: "8. ไอเทมและของใช้ (Items & Consumables)",
        items: [
          "Magnet: ไอเทมเปิด/ปิดแม่เหล็ก",
          "Camera: กล้องถ่ายรูป",
          "Emote: ไอเทมใช้ท่าทาง",
          "Protection: ไอเทมจัดการพื้นที่",
          "Reward: เหรียญรับรางวัล",
          "Banking: สมุดบัญชีธนาคาร",
          "Cooked Axolotl Bucket: อาโซลอเติลปรุงสุก",
          "Sprite: น้ำอัดลมสไปรท์",
          "Fruit Juice: น้ำผลไม้รวม",
          "Coca-Cola: น้ำอัดลมโค้ก",
          "Matcha Green Tea: ชาเขียวมัทฉะ",
          "GIF: กล่องของขวัญ",
          "Dollar: เงินดอลลาร์",
          "Dunkin Donuts: โดนัท",
          "McDonalds: อาหารแมคโดนัลด์",
          "Songkran Water Bucket: ถังน้ำสงกรานต์",
          "Garland: พวงมาลัย",
          "Songkran Shirt: เสื้อลายดอกสงกรานต์",
          "Game Boy Pink: เกมบอย (สีชมพู)",
          "Game Boy Cyan: เกมบอย (สีฟ้า)",
          "Game Boy Lime: เกมบอย (สีเขียว)",
          "Game Boy Purple: เกมบอย (สีม่วง)",
          "Game Boy Orange: เกมบอย (สีส้ม)",
          "KFC: ไก่ทอด",
          "Orange Juice: น้ำส้ม",
          "Green Tea: ชาเขียว",
          "Strawberry Juice: น้ำสตรอว์เบอร์รี",
          "Tamago Sushi: ซูชิไข่หวาน",
          "Salmon Sushi: ซูชิแซลมอน",
          "The Coffee Bean: กาแฟ",
          "Water Bottle: ขวดน้ำดื่ม",
          "Lingering Potion: น้ำยาแบบคงค้าง",
          "Potion: น้ำยาปกติ",
          "Splash Potion: น้ำยาแบบปา",
        ],
      },
      {
        category: "9. สิ่งก่อสร้างใหม่ (Structures)",
        items: [
          "Compact Medieval Tower: หอคอยยุคกลาง",
          "Thematic Camp: ค่ายพักแรม",
          "Cabin in Cherry Blossom: กระท่อมป่าซากุระ",
          "Wooden House with Tower: บ้านไม้มีหอคอย",
          "Curved Roof Cabin: กระท่อมหลังคาโค้ง",
          "Snowy Cabin: กระท่อมหิมะ",
          "Blacksmith Workshop: โรงตีเหล็ก",
          "Japanese House: บ้านสไตล์ญี่ปุ่น",
          "Beachhouse: บ้านริมหาด",
          "Dark Tower: หอคอยทมิฬ (ดันเจี้ยน)",
          "Forest Pillager: ค่ายโจรป่า",
          "Herobrine: สิ่งก่อสร้างลึกลับ",
          "House 1: บ้านแบบทั่วไป",
          "Jungle Pyramid: พีระมิดป่า",
          "Oracle: วิหารเทพพยากรณ์",
          "Pantheon: วิหารแพนธีออนใหญ่",
          "Pyramid: พีระมิดทะเลทราย",
          "Sphinx: สฟิงซ์",
          "Statue: รูปปั้นอนุสาวรีย์",
          "Swamp Pillager: ค่ายโจรบึง",
          "Sword: รูปปั้นดาบยักษ์",
          "Tower 1: หอคอยสังเกตการณ์",
        ],
      },
      {
        category: "10. สภาพแวดล้อมใหม่ (Biomes)",
        items: [
          "Amethyst Canyon: หุบเขาอเมทิสต์",
          "Aspen Forest: ป่าต้นแอสเพน (ใบสีทอง)",
          "Badlands Desert: ทะเลทรายทุรกันดาร",
          "Birch Bog: บึงป่าเบิร์ช",
          "Blooming Grove: ป่าดอกไม้บาน",
          "Bog: บึง/หนองน้ำ",
          "Boreal Grove: ป่าสนเขตหนาว",
          "Brushland: ทุ่งพุ่มไม้แห้งแล้ง",
          "Coniferous Forest: ป่าสนใบแหลม",
          "Dense Woodland: ป่าทึบ",
          "Desert Oasis: โอเอซิสกลางทะเลทราย",
          "Desert Pillars: เสาหินกลางทะเลทราย",
          "Eucalyptus Forest: ป่ายูคาลิปตัส",
          "Flower Taiga: ป่าไทกาดอกไม้",
          "Fungal Swamp: หนองน้ำเห็ด",
          "Glacier: ธารน้ำแข็ง",
          "Gravel Beach: หาดหินกรวด",
          "Gravel Canyon: หุบเขากรวด",
          "Heathland: ทุ่งพุ่มไม้แคระ",
          "Hot Springs: บ่อน้ำพุร้อน",
          "Jungle Pillars: เสาหินกลางป่าดงดิบ",
          "Mossy Beach: หาดตะไคร่น้ำ",
          "Outback: พื้นที่ทุรกันดาร",
          "Prairie: ทุ่งหญ้าแพรรี",
          "Pumpkin Valley: หุบเขาฟักทอง",
          "Red Oasis: โอเอซิสสีแดง",
          "Rose Field: ทุ่งกุหลาบ",
          "Sakura Grove: ป่าซากุระ",
          "Sequoia Forest: ป่าต้นเซควอยายักษ์",
          "Shrubland: ป่าละเมาะ",
          "Snowy Cherry Grove: ป่าซากุระหิมะ",
          "Snowy Mesa Bryce: ภูเขาหินยอดหิมะ",
          "Snowy Mesa: ภูเขาหินราบหิมะ",
          "Stony Pine Grove: ป่าสนหิน",
          "Temperate Birch: ป่าเบิร์ชเขตอบอุ่น",
          "Tropical Jungle: ป่าดงดิบเขตร้อน",
          "Valley Clearing: ทุ่งโล่งกลางหุบเขา",
          "Volcano: ภูเขาไฟ",
          "White Mesa: ภูเขาหินสีขาว",
        ],
      },
    ];

    let bodyText = "§6[ รายละเอียดระบบ ]§r\n§7รายการฟีเจอร์ ไอเทม และสิ่งก่อสร้างทั้งหมด\n\n";

    // Loop ข้อมูลออกมาแสดงผล
    bodyText += data.map((section) => `§3${section.category}§r\n§f- ${section.items.join("\n- ")}`).join("\n\n");

    ui.body(bodyText);
    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) menu(player);
    });
  } catch (e) {
    console.warn("System Error (Note): " + e);
  }
};

const sendform = (player) => {
  try {
    const name = player.name;
    const list = Database.get(name);

    if (list.length >= CONFIG.maxReports) {
      player.sendMessage(`§c[Report] กล่องข้อความเต็มแล้ว (${CONFIG.maxReports}/${CONFIG.maxReports})`);
      reportmenu(player);
      return;
    }

    const ui = new ModalFormData();
    ui.title("แจ้งปัญหา / ข้อเสนอแนะ");
    ui.textField("หัวข้อเรื่อง", "เช่น: ฟาร์มบั๊ก, บล็อกหาย, ของหาย");
    ui.textField("รายละเอียด", "ระบุพิกัด และวิธีทำให้เกิดปัญหา");

    ui.show(player).then((res) => {
      try {
        if (res.canceled) {
          reportmenu(player);
          return;
        }
        const [t, b] = res.formValues;

        if (!t || !b || t.trim() === "" || b.trim() === "") {
          player.sendMessage("§c[Report] กรุณากรอกข้อมูลให้ครบถ้วน");
          system.runTimeout(() => sendform(player), 20);
          return;
        }

        Database.add(name, t, b);
        player.sendMessage("§a[Report] บันทึกข้อมูลเรียบร้อยแล้ว");
        reportmenu(player);
      } catch (innerError) {
        console.warn("Logic Error (SendForm): " + innerError);
        player.sendMessage("§cเกิดข้อผิดพลาดในการบันทึกข้อมูล");
        reportmenu(player);
      }
    });
  } catch (e) {
    console.warn("System Error (SendForm): " + e);
    reportmenu(player);
  }
};

const mylist = (player, mode) => {
  try {
    const name = player.name;
    const list = Database.get(name);

    if (list.length === 0) {
      player.sendMessage("§c[Report] ไม่พบข้อมูลในระบบ");
      reportmenu(player);
      return;
    }

    const ui = new ActionFormData();
    ui.title(mode === "edit" ? "เลือกรายการเพื่อแก้ไข" : "เลือกรายการเพื่อลบ");
    ui.body("รายการข้อความของท่าน");

    list.forEach((item, i) => {
      ui.button(`${i + 1}. ${item.t}`);
    });

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === list.length) {
        reportmenu(player);
        return;
      }

      const idx = res.selection;

      if (mode === "edit") {
        const f = new ModalFormData();
        f.title("แก้ไขรายงาน");
        f.textField("หัวข้อเรื่อง", "", { defaultValue: list[idx].t });
        f.textField("รายละเอียด", "", { defaultValue: list[idx].b });

        f.show(player).then((r) => {
          try {
            if (r.canceled) {
              mylist(player, mode);
              return;
            }
            const [nt, nb] = r.formValues;
            Database.update(name, idx, nt, nb);
            player.sendMessage("§e[Report] แก้ไขข้อมูลสำเร็จ");
            mylist(player, mode);
          } catch (e) {
            console.warn("Update Error: " + e);
            mylist(player, mode);
          }
        });
      } else {
        sure(
          player,
          () => {
            Database.delete(name, idx);
            player.sendMessage("§c[Report] ลบข้อมูลสำเร็จ");
            mylist(player, mode);
          },
          () => mylist(player, mode)
        );
      }
    });
  } catch (e) {
    console.warn("System Error (MyList): " + e);
    reportmenu(player);
  }
};

const reportmenu = (player) => {
  try {
    const ui = new ActionFormData();
    ui.title("เมนูรายงาน (Report)");
    ui.body("กรุณาเลือกรายการที่ต้องการ");

    ui.button("ส่งข้อความ");
    ui.button("แก้ไขข้อความ");
    ui.button("ลบข้อความ");
    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) sendform(player);
      if (res.selection === 1) mylist(player, "edit");
      if (res.selection === 2) mylist(player, "del");
      if (res.selection === 3) menu(player);
    });
  } catch (e) {
    console.warn("System Error (ReportMenu): " + e);
    menu(player);
  }
};

const inbox = (player) => {
  try {
    const name = player.name;
    const list = Database.get(name);
    const replied = list.filter((item) => item.r !== "");

    if (replied.length === 0) {
      const ui = new ActionFormData();
      ui.title("กล่องจดหมาย (Inbox)");
      ui.body("§7[Report] ยังไม่มีการตอบกลับจากผู้ดูแลระบบ");
      ui.button("ย้อนกลับ", "textures/ui/arrow_left");
      ui.show(player).then(() => menu(player));
      return;
    }

    const ui = new ActionFormData();
    ui.title("กล่องจดหมาย (Inbox)");
    ui.body("รายการที่ได้รับการตอบกลับแล้ว");

    replied.forEach((item) => {
      ui.button(`อ่าน: ${item.t}`);
    });

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === replied.length) {
        menu(player);
        return;
      }

      const item = replied[res.selection];
      const show = new MessageFormData();
      show.title("รายละเอียดการตอบกลับ");
      show.body(`หัวข้อ: ${item.t}\nคำถาม: ${item.b}\n\n§eตอบกลับ: ${item.r}`);
      show.button1("ย้อนกลับ");
      show.button2("ปิดหน้าต่าง");

      show.show(player).then((r) => {
        if (r.selection === 0) inbox(player);
      });
    });
  } catch (e) {
    console.warn("System Error (Inbox): " + e);
    menu(player);
  }
};

const adminact = (player, targetName, index) => {
  try {
    const list = Database.get(targetName);

    if (!list || !list[index]) {
      player.sendMessage("§c[Report] ข้อมูลถูกเปลี่ยนแปลงหรือลบแล้ว");
      adminmsg(player, targetName);
      return;
    }
    const item = list[index];
    const ui = new ActionFormData();

    ui.title("จัดการข้อความ");
    ui.body(`ผู้ส่ง: ${targetName}\nหัวข้อ: ${item.t}`);

    ui.button("อ่านรายละเอียด");
    ui.button("ตอบกลับ (Reply)");
    ui.button("ดู JSON (Console)");
    ui.button("ลบทิ้ง (Delete)");
    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;

      if (res.selection === 0) {
        const f = new ModalFormData();
        f.title("รายละเอียดรายงาน");
        f.textField("ผู้ส่ง", "", { defaultValue: targetName });
        f.textField("เวลา", "", { defaultValue: item.d });
        f.textField("หัวข้อ", "", { defaultValue: item.t });
        f.textField("เนื้อหา", "", { defaultValue: item.b });
        if (item.r) f.textField("§aคำตอบเดิม", "", { defaultValue: item.r });
        f.show(player).then(() => adminact(player, targetName, index));
      } else if (res.selection === 1) {
        const f = new ModalFormData();
        f.title("ตอบกลับผู้ใช้งาน");
        f.textField("ข้อความตอบกลับ", "", { defaultValue: item.r });

        f.show(player).then((r) => {
          if (r.canceled) {
            adminact(player, targetName, index);
            return;
          }
          Database.reply(targetName, index, r.formValues[0]);
          player.sendMessage("§a[Report] บันทึกการตอบกลับสำเร็จ");
          adminact(player, targetName, index);
        });
      } else if (res.selection === 2) {
        console.warn(JSON.stringify(item, null, 2));
        adminact(player, targetName, index);
      } else if (res.selection === 3) {
        sure(
          player,
          () => {
            Database.delete(targetName, index);
            player.sendMessage("§c[Report] ลบข้อมูลสำเร็จ");
            adminmsg(player, targetName);
          },
          () => adminact(player, targetName, index)
        );
      } else {
        adminmsg(player, targetName);
      }
    });
  } catch (e) {
    console.warn("System Error (AdminAct): " + e);
    adminmsg(player, targetName);
  }
};

const adminmsg = (player, targetName) => {
  try {
    const list = Database.get(targetName);
    if (!list || list.length === 0) {
      adminpanel(player);
      return;
    }

    const ui = new ActionFormData();
    ui.title(`ข้อความจาก ${targetName}`);

    list.forEach((item) => {
      const status = item.r ? "[ตอบแล้ว]" : "[รอ]";
      ui.button(`${status} ${item.t}`);
    });

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");
    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === list.length) {
        adminpanel(player);
        return;
      }
      adminact(player, targetName, res.selection);
    });
  } catch (e) {
    console.warn("System Error (AdminMsg): " + e);
    adminpanel(player);
  }
};

const adminpanel = (player) => {
  try {
    const db = Database.getAll();
    const names = Object.keys(db);

    const ui = new ActionFormData();
    ui.title("แผงควบคุมผู้ดูแล (Admin Panel)");
    ui.body(`มีผู้แจ้งปัญหาทั้งหมด ${names.length} คน`);

    ui.button("Dump (Console)");

    names.forEach((n) => {
      ui.button(`${n} (${db[n].length})`);
    });

    ui.button("ย้อนกลับ", "textures/ui/arrow_left");

    ui.show(player).then((res) => {
      if (res.canceled) return;

      if (res.selection === 0) {
        console.warn("***** Server Dump *****");
        console.warn(JSON.stringify(db, null, 2));
        player.sendMessage("§e[System] Dump ข้อมูลลง Console แล้ว");
        adminpanel(player);
      } else if (res.selection === names.length + 1) {
        menu(player);
      } else {
        const realIndex = res.selection - 1;
        if (realIndex >= 0) adminmsg(player, names[realIndex]);
      }
    });
  } catch (e) {
    console.warn("System Error (AdminPanel): " + e);
    menu(player);
  }
};

const menu = (player) => {
  try {
    const ui = new ActionFormData();
    ui.title("เมนูหลัก (Main Menu)");
    ui.body("แจ้งปัญหาต่างได้ที่นี้เลย!!");

    ui.button("บันทึกการอัปเดต (Patch Note)");
    ui.button("แจ้งปัญหา (Report)");
    ui.button("กล่องตอบกลับ (Inbox)");

    if (isAdmin(player)) {
      ui.button("แผงควบคุม (Admin)");
    }

    ui.show(player).then((res) => {
      if (res.canceled) return;
      if (res.selection === 0) note(player);
      if (res.selection === 1) reportmenu(player);
      if (res.selection === 2) inbox(player);
      if (res.selection === 3 && isAdmin(player)) adminpanel(player);
    });
  } catch (e) {
    console.warn("System Error (Menu): " + e);
  }
};

export function RUNREPORT({ source }) {
  menu(source);
}


