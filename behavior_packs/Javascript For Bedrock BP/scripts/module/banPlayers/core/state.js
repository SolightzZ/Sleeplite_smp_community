const _bannedNames = new Set();
const _banCache = new Map();
let _cacheDirty = true;

export const BanState = {
   isBanned(name) {
      if (!_cacheDirty) return _bannedNames.has(name);
      return false;
   },

   isDirty() {
      return _cacheDirty;
   },

   rebuildCache(data) {
      _bannedNames.clear();
      _banCache.clear();
      const now = Math.floor(Date.now() / 1000);
      for (const [name, entry] of Object.entries(data)) {
         if (entry.duration === 0 || entry.expiresAt > now) {
            _bannedNames.add(name);
            _banCache.set(name, entry);
         }
      }
      _cacheDirty = false;
   },

   getBan(name) {
      return _banCache.get(name) ?? null;
   },

   getAllBans() {
      return Array.from(_banCache.entries()).map(([name, entry]) => ({
         name,
         ...entry,
      }));
   },

   markDirty() {
      _cacheDirty = true;
   },

   get size() {
      return _bannedNames.size;
   },
};
