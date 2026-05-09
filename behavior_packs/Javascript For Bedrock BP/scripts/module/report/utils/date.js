export const getTime = () => {
  const now = new Date();

  // UTC+7 Thailand
  now.setHours(now.getHours() + 7);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${pad(now.getDate())}/` +
    `${pad(now.getMonth() + 1)}/` +
    `${now.getFullYear()} ` +
    `${pad(now.getHours())}:` +
    `${pad(now.getMinutes())}`
  );
};
