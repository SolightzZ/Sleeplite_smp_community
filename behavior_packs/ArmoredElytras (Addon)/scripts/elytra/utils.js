(function (_0x18dde8, _0x6cf91e) {
    const _0x231398 = _0x3f52,
        _0x296fb1 = _0x18dde8();
    while (!![]) {
        try {
            const _0x324ff2 =
                -parseInt(_0x231398(0xf1)) / 0x1 +
                (parseInt(_0x231398(0x106)) / 0x2) * (parseInt(_0x231398(0xf2)) / 0x3) +
                -parseInt(_0x231398(0xf4)) / 0x4 +
                -parseInt(_0x231398(0xe2)) / 0x5 +
                (parseInt(_0x231398(0x112)) / 0x6) * (-parseInt(_0x231398(0x10b)) / 0x7) +
                (parseInt(_0x231398(0x111)) / 0x8) * (-parseInt(_0x231398(0x109)) / 0x9) +
                parseInt(_0x231398(0xed)) / 0xa;
            if (_0x324ff2 === _0x6cf91e) break;
            else _0x296fb1['push'](_0x296fb1['shift']());
        } catch (_0x3f4074) {
            _0x296fb1['push'](_0x296fb1['shift']());
        }
    }
})(_0x57d4, 0x99722);
import { system, ItemStack, ItemEnchantableComponent, EnchantmentType, world } from '@minecraft/server';
export const currentElytra = (_0x2d9e48) => {
    const _0x252fc7 = _0x3f52,
        _0x2a6419 = _0x2d9e48['getComponent'](_0x252fc7(0xfd)),
        _0x185687 = _0x2a6419[_0x252fc7(0xe5)]('Chest');
    if (!_0x185687) return null;
    const _0x56a6de = _0x185687[_0x252fc7(0xff)],
        _0x57230a = getParams(_0x185687);
    if (_0x56a6de !== _0x252fc7(0xfe) && !_0x57230a) return null;
    const _0xccde8 = _0x185687[_0x252fc7(0xf8)](_0x252fc7(0xe7)),
        _0x40e72c = (_0xccde8?.['damage'] ?? 0x0) >= _0xccde8?.[_0x252fc7(0x10f)] - 0x1 ?? ![];
    return { item: _0x185687, id: _0x56a6de, isBroken: _0x40e72c, type: _0x57230a?.['type'] ?? _0x252fc7(0x104) };
};
export function getColytraData(_0x33117d) {
    const _0x2f7766 = _0x3f52;
    try {
        const _0x548b76 = _0x33117d[_0x2f7766(0x10e)](_0x2f7766(0xf3));
        if (!_0x548b76 || typeof _0x548b76 !== _0x2f7766(0xee)) return null;
        return JSON[_0x2f7766(0xe3)](_0x548b76);
    } catch {
        return null;
    }
}
export const updateMolang = (_0x3d66ea, _0x3175ae) => {
    const _0x424eb0 = _0x3f52;
    try {
        const { x: _0x316c42, y: _0x482050, z: _0xb199ea } = _0x3d66ea[_0x424eb0(0xe4)],
            _0x3ca368 = _0x3d66ea[_0x424eb0(0x10a)][_0x424eb0(0xf6)](_0x3175ae?.['replace']('_p', '')[_0x424eb0(0x10c)]('_b', '') ?? 'rme:default', { x: _0x316c42, y: _0x482050, z: _0xb199ea });
        (_0x3ca368[_0x424eb0(0xf8)](_0x424eb0(0x108))[_0x424eb0(0xfa)](_0x3d66ea),
            system[_0x424eb0(0xec)](0x1)['then'](() => {
                const _0x2fcca9 = _0x424eb0;
                _0x3ca368[_0x2fcca9(0xe9)]();
            }));
    } catch {}
};
export const attributeLore = (_0x456340, _0x2fae96) => {
    const _0x3f4d38 = _0x3f52,
        _0x4c437a = _0x2fae96?.['armor_data'] ?? _0x2fae96?.[_0x3f4d38(0x101)] ?? null;
    if (!_0x4c437a) return;
    let _0x41d04c = [];
    return (
        (_0x4c437a[_0x3f4d38(0x10d)] || _0x4c437a['toughness'] || _0x4c437a[_0x3f4d38(0x100)]) &&
            _0x41d04c[_0x3f4d38(0x105)]('§r', { rawtext: [{ text: _0x3f4d38(0xeb) }, { translate: _0x3f4d38(0xf0) }] }),
        _0x4c437a[_0x3f4d38(0x10d)] && _0x41d04c['push']({ rawtext: [{ text: '§r§9+' }, { text: _0x4c437a['armor'] + '\x20' }, { translate: 'attribute.name.generic.armor' }] }),
        _0x4c437a[_0x3f4d38(0xfb)] && _0x41d04c['push']({ rawtext: [{ text: _0x3f4d38(0xea) }, { text: _0x4c437a['toughness'] + '\x20' }, { translate: _0x3f4d38(0xf9) }] }),
        _0x4c437a[_0x3f4d38(0x100)] && _0x41d04c[_0x3f4d38(0x105)]({ rawtext: [{ text: _0x3f4d38(0xea) }, { text: _0x4c437a[_0x3f4d38(0x100)] + '\x20' }, { translate: _0x3f4d38(0xe6) }] }),
        _0x41d04c
    );
};
export const getParams = (_0x10a2f9) => {
    const _0x25a074 = _0x3f52,
        _0x3457a0 = _0x10a2f9?.[_0x25a074(0xf8)](_0x25a074(0x103))?.['customComponentParameters']['params'];
    if (!_0x3457a0) return null;
    return _0x3457a0;
};
function _0x3f52(_0x4db9a4, _0x19379a) {
    _0x4db9a4 = _0x4db9a4 - 0xe2;
    const _0x57d45a = _0x57d4();
    let _0x3f52cf = _0x57d45a[_0x4db9a4];
    return _0x3f52cf;
}
export function transferDurabilityByPercent(_0x3121b3, _0xd909be) {
    const _0x857d82 = _0x3f52;
    if (!_0x3121b3 || !_0xd909be) return;
    const _0x382fbe = _0x3121b3[_0x857d82(0xf5)] ?? 0x0;
    if (_0x382fbe >= _0x3121b3[_0x857d82(0x10f)] - 0x1) {
        _0xd909be[_0x857d82(0xf5)] = _0xd909be['maxDurability'];
        return;
    }
    const _0x4d1f61 = _0x382fbe / _0x3121b3['maxDurability'];
    _0xd909be['damage'] = Math[_0x857d82(0x110)](_0x4d1f61 * _0xd909be['maxDurability']);
}
function _0x57d4() {
    const _0x5c3fac = [
        'maxDurability',
        'floor',
        '574072gzNzoO',
        '6feBXld',
        'addEnchantments',
        '349635tllLaF',
        'parse',
        'location',
        'getEquipment',
        'attribute.name.minecraft:knockback_resistance',
        'minecraft:durability',
        'addEnchantment',
        'remove',
        '§r§9+',
        '§r§7',
        'waitTicks',
        '35986130lAGxVa',
        'string',
        'removeEnchantment',
        'slot.armor.chest.when_equipped',
        '1129236UoIENN',
        '21llPMYw',
        'rme:elytra_data',
        '3039060MvMgpN',
        'damage',
        'spawnEntity',
        'getEnchantments',
        'getComponent',
        'attribute.name.generic.armorToughness',
        'leashTo',
        'toughness',
        'type',
        'equippable',
        'minecraft:elytra',
        'typeId',
        'knockback_resistance',
        'armorData',
        'enchantments',
        'rme:custom_elytra',
        'vanilla',
        'push',
        '161962MeqvVn',
        'enchantable',
        'leashable',
        '63EOemCN',
        'dimension',
        '7530075NFxQgy',
        'replace',
        'armor',
        'getDynamicProperty',
    ];
    _0x57d4 = function () {
        return _0x5c3fac;
    };
    return _0x57d4();
}
export const cloneItemStack = (_0x43a2fb, _0x5956b3) => {
    const _0xc3ae94 = _0x3f52,
        _0x4a33df = new ItemStack(_0x5956b3),
        _0x3e6b02 = (_0x24584a, _0x43035d) => {
            const _0x16d04c = _0x3f52,
                _0xad19d2 = _0x43a2fb['getComponent'](_0x24584a),
                _0x1ccaf1 = _0x4a33df[_0x16d04c(0xf8)](_0x24584a);
            _0xad19d2 && _0x1ccaf1 && _0x43035d(_0xad19d2, _0x1ccaf1);
        };
    return (
        _0x3e6b02('durability', (_0x1e102b, _0x53d149) => {
            transferDurabilityByPercent(_0x1e102b, _0x53d149);
        }),
        _0x3e6b02(_0xc3ae94(0x107), (_0x4d451c, _0x43393d) => {
            const _0x387f88 = _0xc3ae94;
            _0x43393d[_0x387f88(0x113)](_0x4d451c[_0x387f88(0xf7)]());
        }),
        _0x4a33df
    );
};
export function addEnchantmentsData(_0x421d74, _0x4bd4a5) {
    const _0x2cc294 = _0x3f52,
        _0x41ba1a = _0x421d74[_0x2cc294(0xf8)]('minecraft:enchantable');
    if (!_0x41ba1a || !_0x4bd4a5[_0x2cc294(0x102)]) return;
    for (const _0x190d9c of _0x41ba1a[_0x2cc294(0xf7)]()) {
        _0x41ba1a[_0x2cc294(0xef)](_0x190d9c[_0x2cc294(0xfc)]['id']);
    }
    for (const _0x37ed24 of _0x4bd4a5[_0x2cc294(0x102)]) {
        _0x41ba1a[_0x2cc294(0xe8)]({ type: new EnchantmentType(_0x37ed24[_0x2cc294(0xfc)]), level: _0x37ed24['level'] });
    }
}
