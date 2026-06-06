export const CONFIG = {
    dim: 'minecraft:overworld',
    maxDistance: 256,

    currencyId: 'minecraft:diamond',
    currencyName: 'Diamond',

    shopTool: 'minecraft:stick',

    allowedContainers: ['minecraft:chest', 'minecraft:barrel'],

    maxItemsPerShop: 54,

    maxShopPerPlayer: 10,

    minAmount: 1,
    maxAmount: 64,
    minPrice: 1,
    maxPrice: 64,

    protection: {
        allowOwnerBreak: true,
        allowOtherBreak: false,
        allowExplosion: false,
        allowPiston: false,
        allowHopper: false,
        allowOtherOpen: true,
    },

    dbPrefix: 'shop:',
    dbIndexKey: 'shop:index',
    dbMaxChunkSize: 15000,

    adminTag: 'admin',
};

export const Colors = {
    error: '§c',
    success: '§a',
    warning: '§6',
    info: '§7',
    highlight: '§e',
    title: '§l§6',
};
