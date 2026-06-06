const pad = (num) => String(num).padStart(2, '0');

export const getTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const thailand = new Date(utc + 7 * 3600000);

    return `${pad(thailand.getDate())}/${pad(thailand.getMonth() + 1)}/${thailand.getFullYear()} ${pad(thailand.getHours())}:${pad(thailand.getMinutes())}`;
};
