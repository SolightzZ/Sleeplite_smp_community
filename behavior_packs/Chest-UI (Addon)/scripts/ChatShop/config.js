export const CONFIG = {
    dimension: 'minecraft:overworld',
    maxDistance: 256,

    currencyId: 'minecraft:diamond',

    shopTool: 'minecraft:stick',

    allowedContainers: ['minecraft:chest'],
    baseBlock: 'minecraft:emerald_block',

    maxItemsPerShop: 54,

    maxShopsPerPlayer: 10,

    minPrice: 1,
    maxPrice: 64,

    protection: {
        allowOwnerBreak: true,
        allowOtherBreak: false,
        allowExplosion: false,
        allowOtherOpen: true,
    },

    dbPrefix: 'shop:',
    dbIndexKey: 'shop:index',
    dbMaxChunkSize: 15000,

    adminTag: 'admin',
};
