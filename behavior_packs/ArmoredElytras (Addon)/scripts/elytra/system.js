const _0x538b68 = _0x4e5f;
(function (_0x18f767, _0x2ba544) {
    const _0xfc2929 = _0x4e5f,
        _0x5a149d = _0x18f767();
    while (!![]) {
        try {
            const _0x2699f5 =
                (parseInt(_0xfc2929(0x8f)) / 0x1) * (-parseInt(_0xfc2929(0xd3)) / 0x2) +
                (parseInt(_0xfc2929(0xd4)) / 0x3) * (-parseInt(_0xfc2929(0xc3)) / 0x4) +
                -parseInt(_0xfc2929(0xbd)) / 0x5 +
                (-parseInt(_0xfc2929(0x81)) / 0x6) * (parseInt(_0xfc2929(0x84)) / 0x7) +
                -parseInt(_0xfc2929(0x94)) / 0x8 +
                -parseInt(_0xfc2929(0xa5)) / 0x9 +
                (-parseInt(_0xfc2929(0x7b)) / 0xa) * (-parseInt(_0xfc2929(0x87)) / 0xb);
            if (_0x2699f5 === _0x2ba544) break;
            else _0x5a149d['push'](_0x5a149d['shift']());
        } catch (_0x4162ab) {
            _0x5a149d['push'](_0x5a149d['shift']());
        }
    }
})(_0x29f8, 0x3b411);
function _0x4e5f(_0x3ffcfc, _0x3fb507) {
    _0x3ffcfc = _0x3ffcfc - 0x72;
    const _0x29f81a = _0x29f8();
    let _0x4e5ff0 = _0x29f81a[_0x3ffcfc];
    return _0x4e5ff0;
}
import { world, system, ItemStack } from '@minecraft/server';
import * as _0x2a0d57 from './utils';
import * as _0x19b8f2 from './consts';
function _0x29f8() {
    const _0x52eed4 = [
        'startup',
        '741142iXWKMK',
        '69VGJMns',
        'push',
        'currentValue',
        'typeId',
        'itemComponentRegistry',
        'knockbackResistance',
        'ELYTRA_ENCHANTS',
        'updateMolang',
        'handleArmor',
        'durability',
        'getGameMode',
        'totalArmor',
        'subscribe',
        'random',
        'elytraDamageMap',
        'getAllPlayers',
        'getComponent',
        'isBroken',
        'damagingEntity',
        'includes',
        'minecraft:elytra',
        '5925020HtgFzA',
        'thorns',
        'broken',
        'entityHurt',
        'cause',
        'stopsound\x20@s\x20armor.equip_leather',
        '131754zaiPSO',
        'getColytraData',
        'run',
        '7adwbPo',
        '!custom_armor.',
        'setLore',
        '44XAmPNY',
        'health',
        'rme:custom_elytra',
        'setItem',
        'transferDurabilityByPercent',
        'registerComponent',
        'level',
        'getVelocity',
        '1yJpyUl',
        'replace',
        'playSound',
        'ARMOR_ENCHANT_LORE',
        'getParams',
        '3610008zZEwga',
        'maxDurability',
        'addEnchantment',
        'minecraft:enchantable',
        'toughness',
        'getEnchantments',
        'damage.thorns',
        'rme:elytra_data',
        'vanilla',
        'attributeLore',
        'set',
        'has',
        'runCommand',
        'updateDurability',
        'Creative',
        'tick',
        'armorStateMap',
        '3961863fyonOq',
        'getEnchantment',
        'sqrt',
        'length',
        'stringify',
        'afterEvents',
        'calculateArmorDamage',
        'map',
        'get',
        'isValid',
        'armor',
        'Chest',
        'beforeEvents',
        'inventory',
        'setDynamicProperty',
        'item',
        'equip_sound',
        'itemChange',
        'cloneItemStack',
        'transformElytra',
        'minecraft:durability',
        'floor',
        'currentElytra',
        'location',
        '2413835ayKWZC',
        'armorData',
        'updateTicksMap',
        '§r§7',
        'max',
        'onScreenDisplay',
        '62704wzeZsR',
        'damage',
        'itemUse',
        'displayArmor',
        'setEquipment',
        'minecraft:player',
        'updateElytra',
        'enchantment.level.',
        'equippable',
        'Spectator',
        'isGliding',
        'runTimeout',
        'type',
        'armor_data',
        'entityAttack',
    ];
    _0x29f8 = function () {
        return _0x52eed4;
    };
    return _0x29f8();
}
import * as _0x23ec58 from './armor';
class CustomElytraManager {
    constructor() {
        const _0x48747c = _0x4e5f;
        ((this[_0x48747c(0xa4)] = new Map()), (this[_0x48747c(0xbf)] = new Map()), (this[_0x48747c(0x74)] = new Map()), this['start']());
    }
    ['start']() {
        const _0x2514ba = _0x4e5f;
        (system['runInterval'](() => this[_0x2514ba(0xa3)]()), this[_0x2514ba(0x8c)](), this[_0x2514ba(0xdc)](), this[_0x2514ba(0xd9)](), this[_0x2514ba(0xb6)](), this['molangOnUse']());
    }
    [_0x538b68(0x8c)]() {
        const _0x2403b4 = _0x538b68;
        system[_0x2403b4(0xb1)][_0x2403b4(0xd2)]['subscribe']((_0xa26444) => {
            const _0x29d2e5 = _0x2403b4;
            _0xa26444[_0x29d2e5(0xd8)]['registerCustomComponent'](_0x29d2e5(0x89), {});
        });
    }
    [_0x538b68(0xa3)]() {
        const _0x93377 = _0x538b68;
        for (const _0x55cd9f of world[_0x93377(0x75)]()) {
            if (!_0x55cd9f?.[_0x93377(0xae)]) continue;
            if (_0x55cd9f[_0x93377(0xde)]() === _0x93377(0xcc)) continue;
            const _0x15bd45 = _0x2a0d57['currentElytra'](_0x55cd9f);
            this[_0x93377(0xc6)](_0x55cd9f, _0x15bd45);
            if (!_0x15bd45) {
                this[_0x93377(0xbf)]['delete'](_0x55cd9f['id']);
                continue;
            }
            if (_0x15bd45?.[_0x93377(0xcf)] !== 'vanilla') {
                this[_0x93377(0xb8)](_0x55cd9f, _0x15bd45);
                continue;
            }
            const _0x4e8853 = _0x2a0d57['getColytraData'](_0x15bd45?.[_0x93377(0xb4)]) ?? null;
            this[_0x93377(0xc9)](_0x55cd9f, _0x4e8853);
            if (!_0x4e8853) continue;
            this[_0x93377(0xa1)](_0x55cd9f, _0x4e8853, _0x15bd45);
        }
    }
    [_0x538b68(0xb8)](_0x587cea, _0x43165e) {
        const _0x57637a = _0x538b68,
            { item: _0xc5effc, id: _0x4707d3 } = _0x43165e;
        if (!_0xc5effc) return;
        const _0x5d6a04 = _0x2a0d57[_0x57637a(0x93)](_0xc5effc);
        if (!_0x5d6a04) return;
        const _0x37695b = new ItemStack(_0x57637a(0x7a));
        _0x2a0d57[_0x57637a(0x8b)](_0xc5effc['getComponent'](_0x57637a(0xdd)), _0x37695b[_0x57637a(0x76)]('durability'));
        const _0x550e32 = [],
            _0x15b349 = _0xc5effc['getComponent']('minecraft:enchantable')?.[_0x57637a(0x99)]() ?? [],
            _0x24e410 = _0x37695b['getComponent'](_0x57637a(0x97));
        for (const _0x55501f of _0x15b349) {
            const _0x1b9314 = _0x55501f['type']['id'];
            if (!_0x19b8f2[_0x57637a(0xda)][_0x57637a(0x9f)](_0x1b9314)) {
                const _0x4b9239 = _0x19b8f2[_0x57637a(0x92)]['get'](_0x1b9314);
                _0x4b9239 &&
                    _0x550e32[_0x57637a(0xd5)]({ rawtext: [{ text: _0x57637a(0xc0) }, { translate: _0x4b9239 }, { text: '\x20' }, { translate: _0x57637a(0xca) + _0x55501f[_0x57637a(0x8d)] }] });
                continue;
            }
            _0x24e410?.[_0x57637a(0x96)](_0x55501f);
        }
        (_0x550e32['push'](..._0x2a0d57[_0x57637a(0x9d)]([], _0x5d6a04)), _0x37695b[_0x57637a(0x86)](_0x550e32));
        const _0x4b8ee9 = {
            id: _0x4707d3?.['replace'](/(_p|_b)$/, '') ?? 'rme:default',
            maxDurability: _0xc5effc['getComponent'](_0x57637a(0xdd))[_0x57637a(0x95)] ?? 0x0,
            armorData: _0x5d6a04[_0x57637a(0xd0)],
            enchantments: _0x15b349[_0x57637a(0xac)]((_0x3faef0) => ({ type: _0x3faef0[_0x57637a(0xcf)]['id'], level: _0x3faef0['level'] })),
        };
        (_0x37695b[_0x57637a(0xb3)](_0x57637a(0x9b), JSON[_0x57637a(0xa9)](_0x4b8ee9)),
            this[_0x57637a(0xbf)][_0x57637a(0x9e)](_0x587cea['id'], 0x0),
            _0x2a0d57[_0x57637a(0xdb)](_0x587cea, _0x4707d3),
            _0x587cea[_0x57637a(0x76)](_0x57637a(0xcb))?.[_0x57637a(0xc7)](_0x57637a(0xb0), _0x37695b));
        if (_0x5d6a04[_0x57637a(0xb5)]) _0x587cea[_0x57637a(0x91)](_0x5d6a04[_0x57637a(0xb5)], { volume: 0.8 });
    }
    ['updateElytra'](_0x2f2298, _0x20df59) {
        const _0x2a4c1a = _0x538b68,
            _0x412ccd = (this['updateTicksMap'][_0x2a4c1a(0xad)](_0x2f2298['id']) ?? 0x0) + 0x1;
        this[_0x2a4c1a(0xbf)][_0x2a4c1a(0x9e)](_0x2f2298['id'], _0x412ccd);
        if (_0x412ccd < 0x4) return;
        (_0x2a0d57[_0x2a4c1a(0xdb)](_0x2f2298, _0x20df59?.['id']), this[_0x2a4c1a(0xbf)][_0x2a4c1a(0x9e)](_0x2f2298['id'], 0x0));
    }
    [_0x538b68(0xa1)](_0x5a47f6, _0x74583e, _0x5f2550) {
        const _0x4a1841 = _0x538b68;
        if (_0x5a47f6[_0x4a1841(0x76)]('health')['currentValue'] <= 0x0) return;
        const _0x386482 = _0x5f2550[_0x4a1841(0xb4)]['getComponent'](_0x4a1841(0xb9)),
            _0x187ced = _0x386482[_0x4a1841(0xc4)] ?? 0x0,
            _0x3fa56c = this[_0x4a1841(0x74)][_0x4a1841(0xad)](_0x5a47f6['id']) ?? _0x187ced;
        if (_0x5a47f6[_0x4a1841(0xcd)] && _0x187ced > _0x3fa56c) {
            const _0x1f21fd = _0x74583e['maxDurability'],
                _0x3d10f6 = _0x386482[_0x4a1841(0x95)];
            if (_0x1f21fd < _0x3d10f6) return;
            const _0x3c230c = _0x3d10f6 / _0x1f21fd;
            if (Math['random']() > _0x3c230c) {
                if (_0x5a47f6[_0x4a1841(0x76)](_0x4a1841(0x88))[_0x4a1841(0xd6)] <= 0x0) return;
                ((_0x386482['damage'] = Math[_0x4a1841(0xc1)](0x0, _0x187ced - 0x1)),
                    _0x5a47f6[_0x4a1841(0x76)](_0x4a1841(0xcb))?.[_0x4a1841(0xc7)](_0x4a1841(0xb0), _0x5f2550['item']),
                    system[_0x4a1841(0xce)](() => {
                        const _0x571756 = _0x4a1841;
                        _0x5a47f6[_0x571756(0xa0)](_0x571756(0x80));
                    }, 0x1));
            }
        }
        this[_0x4a1841(0x74)][_0x4a1841(0x9e)](_0x5a47f6['id'], _0x187ced);
    }
    [_0x538b68(0xc6)](_0x3961b1, _0x4aced5) {
        const _0xe973bf = _0x538b68,
            _0x34d731 = _0x2a0d57['getColytraData'](_0x4aced5?.[_0xe973bf(0xb4)]),
            _0x54e5f4 = _0x3961b1['id'];
        if (_0x34d731 && _0x3961b1[_0xe973bf(0xde)]() !== _0xe973bf(0xa2) && !_0x4aced5?.[_0xe973bf(0x77)]) {
            const _0x43c1e0 = _0x3961b1['getComponent']('equippable'),
                _0x29db39 = _0x43c1e0?.[_0xe973bf(0xdf)] ?? 0x0,
                _0x26a30c = _0x34d731['armorData'][_0xe973bf(0xaf)];
            (_0x3961b1[_0xe973bf(0xc2)]['setActionBar'](_0xe973bf(0x85) + (_0x29db39 + _0x26a30c)), this[_0xe973bf(0xa4)][_0xe973bf(0x9e)](_0x54e5f4, !![]));
            return;
        }
        if (!this[_0xe973bf(0xa4)][_0xe973bf(0xad)](_0x54e5f4)) return;
        (_0x3961b1[_0xe973bf(0xc2)]['setActionBar']('\x20'), this[_0xe973bf(0xa4)][_0xe973bf(0x9e)](_0x54e5f4, ![]));
    }
    [_0x538b68(0xdc)]() {
        const _0x549339 = _0x538b68,
            _0x1cf901 = (_0x1076bd, _0x59cb89, _0x4d2108, _0x52ff24, _0x55f773) => {
                const _0x4babaf = _0x4e5f,
                    { armorData: _0x1bfde0, enchantments: _0x1b7ad1, maxDurability: _0x5437ca } = _0x52ff24;
                if (!_0x1bfde0?.['armor'] && !_0x1bfde0?.[_0x4babaf(0x98)] && !_0x1b7ad1?.[_0x4babaf(0xa8)]) return;
                const { armorDamage: _0x345b4d, baseDamage: _0x41050e } = _0x23ec58[_0x4babaf(0xab)](
                    _0x59cb89,
                    _0x4d2108['cause'],
                    _0x1076bd['damage'],
                    _0x1bfde0[_0x4babaf(0xaf)] ?? 0x0,
                    _0x1bfde0[_0x4babaf(0x98)] ?? 0x0,
                    _0x1b7ad1,
                );
                (_0x43d50e(_0x345b4d, _0x59cb89, _0x5437ca, _0x55f773), (_0x1076bd['damage'] = _0x345b4d));
            },
            _0x43d50e = (_0x43f801, _0xa9c806, _0x14d9e0, _0x1c4da5) => {
                const _0x58bb79 = _0x4e5f;
                if (_0xa9c806[_0x58bb79(0x76)]('health')['currentValue'] <= 0x0) return;
                const _0x12ba9f = _0x1c4da5?.['item'];
                if (!_0x12ba9f) return;
                const _0x276ad3 = _0x12ba9f[_0x58bb79(0x76)](_0x58bb79(0xb9));
                if (!_0x276ad3 || _0x276ad3[_0x58bb79(0xc4)] >= 0x1af) return;
                const _0x4e151d = Math[_0x58bb79(0xc1)](0x1, Math[_0x58bb79(0xba)](_0x43f801 / 0x4));
                let _0x43fa8e = _0x4e151d;
                if (_0x14d9e0 > 0x1b0) {
                    const _0x456d19 = 0x1b0 / _0x14d9e0;
                    _0x43fa8e = Math[_0x58bb79(0xc1)](0x1, Math[_0x58bb79(0xba)](_0x4e151d * _0x456d19));
                }
                const _0x45bc37 = _0x12ba9f[_0x58bb79(0x76)]('minecraft:enchantable')?.[_0x58bb79(0xa6)]('unbreaking');
                if (_0x45bc37) {
                    let _0x4fa05a = 0x0;
                    const _0x5941a = 0.6 + 0.4 / (_0x45bc37[_0x58bb79(0x8d)] + 0x1);
                    for (let _0x1b08a7 = 0x0; _0x1b08a7 < _0x43fa8e; _0x1b08a7++) {
                        Math[_0x58bb79(0x73)]() <= _0x5941a && _0x4fa05a++;
                    }
                    _0x43fa8e = _0x4fa05a;
                }
                if (_0x43fa8e <= 0x0) return;
                const _0x16144b = (_0x276ad3[_0x58bb79(0xc4)] ?? 0x0) + _0x43fa8e;
                system[_0x58bb79(0x83)](() => {
                    const _0x319ed8 = _0x58bb79;
                    if (_0xa9c806[_0x319ed8(0x76)]('health')['currentValue'] <= 0x0) return;
                    if (_0x16144b >= _0x276ad3[_0x319ed8(0x95)]) {
                        _0x276ad3['damage'] = _0x276ad3[_0x319ed8(0x95)] - 0x1;
                        return;
                    }
                    ((_0x276ad3[_0x319ed8(0xc4)] = _0x16144b),
                        _0xa9c806[_0x319ed8(0x76)]('equippable')?.['setEquipment'](_0x319ed8(0xb0), _0x12ba9f),
                        system['runTimeout'](() => {
                            const _0x30f807 = _0x319ed8;
                            _0xa9c806[_0x30f807(0xa0)](_0x30f807(0x80));
                        }, 0x1));
                });
            },
            _0x32dfb3 = (_0x3ac013, _0x2e6d00, { enchantments: _0x152b9e }) => {
                const _0x27542a = _0x4e5f;
                if (![_0x27542a(0xd1), 'projectile'][_0x27542a(0x79)](_0x2e6d00[_0x27542a(0x7f)])) return;
                const _0x4dd934 = _0x2e6d00[_0x27542a(0x78)];
                if (!_0x4dd934?.[_0x27542a(0xae)]) return;
                const _0x1ab0b6 = _0x152b9e['find']((_0x5e633a) => _0x5e633a[_0x27542a(0xcf)] === _0x27542a(0x7c));
                if (!_0x1ab0b6) return;
                const _0x211888 = _0x1ab0b6[_0x27542a(0x8d)] * 0.15;
                if (Math[_0x27542a(0x73)]() > _0x211888) return;
                const _0x58a97b = Math['random']() * 0x4 + 0x1;
                system['run'](() => {
                    const _0x148010 = _0x27542a;
                    (_0x3ac013['dimension'][_0x148010(0x91)](_0x148010(0x9a), _0x3ac013[_0x148010(0xbc)]), _0x4dd934['applyDamage'](_0x58a97b, { cause: _0x148010(0x7c), damagingEntity: _0x3ac013 }));
                });
            };
        world[_0x549339(0xb1)][_0x549339(0x7e)][_0x549339(0x72)]((_0x22f0f1) => {
            const _0x439dd4 = _0x549339,
                { hurtEntity: _0x2a3c97, damageSource: _0x374078 } = _0x22f0f1;
            if (!_0x2a3c97?.[_0x439dd4(0xae)] || _0x2a3c97[_0x439dd4(0xd7)] !== _0x439dd4(0xc8)) return;
            const _0x22a511 = _0x2a0d57[_0x439dd4(0xbb)](_0x2a3c97);
            if (!_0x22a511 || _0x22a511?.[_0x439dd4(0x77)]) return;
            const _0x5252a0 = _0x2a0d57[_0x439dd4(0x82)](_0x22a511[_0x439dd4(0xb4)]);
            if (!_0x5252a0) return;
            (_0x1cf901(_0x22f0f1, _0x2a3c97, _0x374078, _0x5252a0, _0x22a511), _0x32dfb3(_0x2a3c97, _0x374078, _0x5252a0));
        });
    }
    [_0x538b68(0xd9)]() {
        const _0x554289 = _0x538b68;
        world[_0x554289(0xaa)][_0x554289(0x7e)][_0x554289(0x72)]((_0x48299e) => {
            const _0x471c2b = _0x554289,
                { hurtEntity: _0x4486e1, damageSource: _0x5e211f } = _0x48299e;
            if (!_0x4486e1?.[_0x471c2b(0xae)] || _0x4486e1[_0x471c2b(0xd7)] !== _0x471c2b(0xc8) || !_0x5e211f?.[_0x471c2b(0x78)]) return;
            const _0x18c82c = _0x2a0d57['currentElytra'](_0x4486e1);
            if (!_0x18c82c || _0x18c82c?.[_0x471c2b(0x77)]) return;
            const _0x1a27cb = _0x2a0d57[_0x471c2b(0x82)](_0x18c82c[_0x471c2b(0xb4)]);
            if (!_0x1a27cb) return;
            const _0x3919a0 = _0x1a27cb?.[_0x471c2b(0xbe)]?.['knockback_resistance'] ?? 0x0;
            if (_0x3919a0 <= 0x0) return;
            system[_0x471c2b(0xce)](() => {
                const _0x3edf85 = _0x471c2b,
                    _0x330fdd = _0x4486e1[_0x3edf85(0x8e)](),
                    _0x19ce27 = Math[_0x3edf85(0xa7)](_0x330fdd['x'] ** 0x2 + _0x330fdd['z'] ** 0x2);
                if (_0x19ce27 <= 0.01) return;
                const _0x26f0ae = Math[_0x3edf85(0xc1)](0x0, 0x1 + -_0x3919a0 / 0xa),
                    _0x41bbf1 = _0x330fdd['x'] * _0x26f0ae,
                    _0x4dd490 = _0x330fdd['z'] * _0x26f0ae,
                    _0x3ccd64 = { x: _0x41bbf1 - _0x330fdd['x'], y: 0x0, z: _0x4dd490 - _0x330fdd['z'] };
                _0x4486e1['applyImpulse'](_0x3ccd64);
            }, 0x2);
        });
    }
    [_0x538b68(0xb6)]() {
        const _0x485461 = _0x538b68;
        world[_0x485461(0xaa)]['playerInventoryItemChange']['subscribe']((_0x5994bb) => {
            const _0x485954 = _0x485461,
                { player: _0x3672e7, itemStack: _0x1a7781, slot: _0x259713 } = _0x5994bb;
            if (!_0x3672e7?.[_0x485954(0xae)] || !_0x1a7781) return;
            const { container: _0x3c85bd } = _0x3672e7[_0x485954(0x76)](_0x485954(0xb2));
            if (!_0x3c85bd) return;
            if (_0x1a7781[_0x485954(0xd7)] === _0x485954(0x7a)) {
                const _0x5ca540 = _0x2a0d57[_0x485954(0x82)](_0x1a7781);
                if (!_0x5ca540) return;
                const _0x1ead33 = _0x1a7781[_0x485954(0x76)](_0x485954(0xb9));
                if (!_0x1ead33) return;
                const _0xef5ce0 = _0x1ead33[_0x485954(0xc4)] >= _0x1ead33[_0x485954(0x95)] - 0x1,
                    _0x54d83b = _0x2a0d57[_0x485954(0xb7)](_0x1a7781, _0xef5ce0 ? _0x5ca540['id'] + '_b' : _0x5ca540['id']);
                (_0x2a0d57['addEnchantmentsData'](_0x54d83b, _0x5ca540), _0x54d83b[_0x485954(0x86)](_0x2a0d57[_0x485954(0x9d)]([], _0x5ca540)), _0x3c85bd['setItem'](_0x259713, _0x54d83b));
                return;
            }
            const _0x23896d = _0x2a0d57['getParams'](_0x1a7781);
            if (!_0x23896d) return;
            if (_0x23896d[_0x485954(0xcf)] === 'placeholder') {
                const _0x22fa1e = _0x2a0d57[_0x485954(0xb7)](_0x1a7781, _0x1a7781[_0x485954(0xd7)][_0x485954(0x90)]('_p', ''));
                (_0x22fa1e[_0x485954(0x86)](_0x2a0d57['attributeLore']([], _0x23896d)), _0x3c85bd[_0x485954(0x8a)](_0x259713, _0x22fa1e));
                return;
            }
            if (_0x23896d[_0x485954(0xcf)] === _0x485954(0x7d)) {
                const _0x2d99c2 = _0x1a7781[_0x485954(0x76)]('minecraft:durability');
                if ((_0x2d99c2[_0x485954(0xc4)] ?? 0x0) >= _0x2d99c2['maxDurability']) return;
                const _0x5b3983 = _0x2a0d57[_0x485954(0xb7)](_0x1a7781, _0x1a7781[_0x485954(0xd7)]['replace']('_b', ''));
                (_0x5b3983[_0x485954(0x86)](_0x2a0d57[_0x485954(0x9d)]([], _0x23896d)), _0x3c85bd[_0x485954(0x8a)](_0x259713, _0x5b3983));
                return;
            }
        });
    }
    ['molangOnUse']() {
        const _0x345f5b = _0x538b68;
        world[_0x345f5b(0xaa)][_0x345f5b(0xc5)][_0x345f5b(0x72)](({ itemStack: _0x52c7ab, source: _0x244eef }) => {
            const _0x39b0ab = _0x345f5b;
            if (!_0x244eef?.[_0x39b0ab(0xae)]) return;
            if (!_0x52c7ab) return;
            const _0x432fd3 = _0x2a0d57[_0x39b0ab(0x93)](_0x52c7ab);
            if (!_0x432fd3) return;
            if (_0x432fd3?.['type'] === _0x39b0ab(0x9c)) return;
            (this[_0x39b0ab(0xbf)][_0x39b0ab(0x9e)](_0x244eef['id'], 0x0), _0x2a0d57[_0x39b0ab(0xdb)](_0x244eef, _0x52c7ab[_0x39b0ab(0xd7)]));
        });
    }
}
new CustomElytraManager();
