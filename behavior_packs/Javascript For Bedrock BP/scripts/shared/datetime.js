const pad2 = (n) => String(n).padStart(2, '0');

export const nowUnix = () => Math.floor(Date.now() / 1000);

export const formatThaiDateTime = (timestampSeconds) => {
   const ts = (timestampSeconds ?? nowUnix()) + 7 * 3600;
   const d = new Date(ts * 1000);
   return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};

const THAI_OFFSET_MS = 7 * 3600 * 1000;

export const formatThaiDate = (format, date = new Date()) => {
   const d = new Date((date?.getTime?.() ?? Date.now()) + THAI_OFFSET_MS);
   const map = {
      yyyy: d.getUTCFullYear(),
      mm: pad2(d.getUTCMonth() + 1),
      dd: pad2(d.getUTCDate()),
      HH: pad2(d.getUTCHours()),
      nn: pad2(d.getUTCMinutes()),
      ss: pad2(d.getUTCSeconds()),
   };
   return format.replace(/yyyy|mm|dd|HH|nn|ss/g, (token) => map[token]);
};

export const thaiDateKey = (date = new Date()) => {
   const d = new Date((date?.getTime?.() ?? Date.now()) + THAI_OFFSET_MS);
   return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
};

export const parseThaiDateKey = (key) => {
   const [dd, mm, yyyy] = String(key).split('/').map(Number);
   return Date.UTC(yyyy, mm - 1, dd);
};
