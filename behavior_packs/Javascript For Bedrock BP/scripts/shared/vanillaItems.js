import { BlockTypes, system } from '@minecraft/server';

const DEFAULT_NAMESPACE = 'minecraft:';

let _blockIds = null;

/**
 * เติม namespace ให้ id ถ้ายังไม่มี (ค่าเริ่มต้น "minecraft:")
 * @param {unknown} id
 * @returns {string | undefined} id ที่ normalize แล้ว หรือ undefined ถ้าไม่ใช่ string
 */
function withNamespace(id) {
   if (typeof id !== 'string' || id.length === 0) return undefined;
   return id.includes(':') ? id : DEFAULT_NAMESPACE + id;
}

/**
 * สร้าง Set ของ id จากรายการทั้งหมด
 * @param {() => Array<{ id: string }>} getAll
 * @returns {Set<string>}
 */
function buildIdSet(getAll) {
   const all = getAll();
   const set = new Set();

   for (let i = 0; i < all.length; i++) {
      set.add(all[i].id);
   }

   return set;
}

// สร้างแคช block id แบบ lazy (ครั้งเดียว)
function blockIdSet() {
   if (_blockIds === null) _blockIds = buildIdSet(() => BlockTypes.getAll());

   return _blockIds;
}

class VanillaItems {
   // ห้ามสร้าง instance : ใช้เป็น static utility เท่านั้น
   constructor() {
      throw new TypeError('VanillaItems เป็น static class ห้าม new');
   }

   /**
    * เช็คว่า id เป็น block วานิลลาที่มีจริงไหม
    * @param {string} id
    * @returns {boolean}
    */
   static isValidBlock(id) {
      const key = withNamespace(id);
      return key ? blockIdSet().has(key) : false;
   }
}

system.run(() => {
   blockIdSet();
});

export { VanillaItems };
