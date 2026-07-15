export const pad2 = (n) => String(n).padStart(2, '0');

export const nowUnix = () => Math.floor(Date.now() / 1000);

export const formatThaiDateTime = (timestampSeconds) => {
  const ts = (timestampSeconds ?? nowUnix()) + 7 * 3600;
  const d = new Date(ts * 1000);
  return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};
