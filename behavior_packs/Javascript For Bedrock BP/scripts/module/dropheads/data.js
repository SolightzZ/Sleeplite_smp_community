import { namespace } from './config.js';

const headMap = {
    Bank5273: `${namespace}:player_head_1`,
    Cxnthiaz: `${namespace}:player_head_2`,
    KinorlSAO: `${namespace}:player_head_3`,
    DAM0NZ17: `${namespace}:player_head_4`,
    DeMonKung9987: `${namespace}:player_head_5`,
    DoomyZazaz: `${namespace}:player_head_6`,
    FewerHen6405811: `${namespace}:player_head_7`,
    GDuM71: `${namespace}:player_head_8`,
    GuyyaReiki: `${namespace}:player_head_9`,
    NamaewaHenry: `${namespace}:player_head_10`,
    Ironbongbang951: `${namespace}:player_head_11`,
    KartoZx: `${namespace}:player_head_12`,
    // 13: Freddy Fazbear
    // 14: Chica The Chicken
    // 15: Foxy The Pirate Fox
    SolightzZ: `${namespace}:player_head_16`,
    red2535a: `${namespace}:player_head_17`,
    SoulSkyCraft: `${namespace}:player_head_18`,
    TaFlookXD: `${namespace}:player_head_19`,
    Tawan8347T: `${namespace}:player_head_20`,
    winosata2009: `${namespace}:player_head_21`,
    XxsomponxX: `${namespace}:player_head_22`,
    zeerza22: `${namespace}:player_head_23`,
    NEUMAXz: `${namespace}:player_head_24`,
    NaraphatZ: `${namespace}:player_head_25`,
    Mutantbowl7440: `${namespace}:player_head_26`,
    sakumoii: `${namespace}:player_head_27`,
    maewsanCH8: `${namespace}:player_head_28`,
    'Love Bullet8722': `${namespace}:player_head_29`,
    yuyuKw: `${namespace}:player_head_30`,
};

export const getHead = (name) => {
    return headMap[name] || null;
};
