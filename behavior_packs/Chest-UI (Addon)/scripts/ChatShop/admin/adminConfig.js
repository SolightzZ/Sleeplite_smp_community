// ===== Import ร้านเดียว =====
// ใส่ JSON ที่ Export จากร้านเดียว แล้วกดปุ่ม Import JSON
export const importJsonData = `{
  "shopId": "",
  "exportedAt": "",
  "owner": {
    "playerId": "",
    "playerName": ""
  },
  "location": {
    "x": "",
    "y": "",
    "z": ""
  },
  "createdAt": "",
  "deletedAt": "",
  "prices": {},
  "buyers": {},
  "salesHistory": [],
  "salesSummary": 0,
  "revenue": 0
}`;

// ===== Import ข้อมูลทั้งหมด =====
// ใส่ JSON ที่ Export จาก Export JSON All (ทั้ง shops, deletedShops, protectedBlocks)
export const importAllJsonData = `{
  "shops": {},
  "deletedShops": {},
  "protectedBlocks": {}
}`;
