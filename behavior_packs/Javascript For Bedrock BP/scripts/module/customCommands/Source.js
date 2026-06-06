export const SERVER_LIST = [
    {
        displayName: 'The Hive',
        ipAddress: 'geo.hivebedrock.network',
        portNumber: 19132,
        iconTexture: 'textures/items/4',
    },
    {
        displayName: 'Zeqa',
        ipAddress: 'zeqa.net',
        portNumber: 19132,
        iconTexture: 'textures/items/5',
    },
    {
        displayName: 'Cube Craft',
        ipAddress: 'play.cubecraft.net',
        portNumber: 19132,
        iconTexture: 'textures/items/6',
    },
    {
        displayName: 'Venity Network',
        ipAddress: 'play.venitymc.com',
        portNumber: 19132,
        iconTexture: 'textures/items/3',
    },
    {
        displayName: 'Nether Games',
        ipAddress: 'play.nethergames.org',
        portNumber: 19132,
        iconTexture: 'textures/items/2',
    },
    {
        displayName: 'Lifeboat',
        ipAddress: 'play.lbsg.net',
        portNumber: 19132,
        iconTexture: 'textures/items/1',
    },
    {
        displayName: 'PokeBedrock',
        ipAddress: 'play.pokebedrock.com',
        portNumber: 19132,
        iconTexture: 'textures/items/7',
    },
];

export const MESSAGES = {
    INVALID_IP: '§c[x] IP หรือ Port ไม่ถูกต้อง โปรดลองอีกครั้ง',
    TRANSFER_START: (ip, port) => `§a[/] กำลังย้ายคุณไปยัง ${ip}:${port}...`,
    TRANSFER_FAIL: '§c[x] ไม่สามารถย้ายผู้เล่นได้ อาจเกิดจากข้อจำกัดของเครือข่าย',
};
