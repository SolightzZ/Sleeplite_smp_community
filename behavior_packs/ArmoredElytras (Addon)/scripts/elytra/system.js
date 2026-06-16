function _0x4568(_0x4ac01c, _0x44af46) {
   _0x4ac01c = _0x4ac01c - 0x1a9;
   const _0x50b9d1 = _0x50b9();
   let _0x4568e7 = _0x50b9d1[_0x4ac01c];
   return _0x4568e7;
}
const _0x1f8775 = _0x4568;
(function (_0x9280e5, _0x2e2dc0) {
   const _0x1f9db5 = _0x4568,
      _0x26e590 = _0x9280e5();
   while (!![]) {
      try {
         const _0x5266b7 =
            -parseInt(_0x1f9db5(0x1b8)) / 0x1 +
            parseInt(_0x1f9db5(0x1e4)) / 0x2 +
            -parseInt(_0x1f9db5(0x20e)) / 0x3 +
            parseInt(_0x1f9db5(0x21a)) / 0x4 +
            (parseInt(_0x1f9db5(0x224)) / 0x5) * (parseInt(_0x1f9db5(0x1c8)) / 0x6) +
            parseInt(_0x1f9db5(0x200)) / 0x7 +
            (-parseInt(_0x1f9db5(0x1e8)) / 0x8) * (parseInt(_0x1f9db5(0x210)) / 0x9);
         if (_0x5266b7 === _0x2e2dc0) break;
         else _0x26e590['push'](_0x26e590['shift']());
      } catch (_0x172956) {
         _0x26e590['push'](_0x26e590['shift']());
      }
   }
})(_0x50b9, 0x592d0);
import { world, system, ItemStack } from '@minecraft/server';
function _0x50b9() {
   const _0x32decf = [
      'damage',
      'itemCompleteUse',
      'minecraft:enchantable',
      'item',
      'getVelocity',
      'afterEvents',
      'max',
      'equippable',
      '1141392VtvTuc',
      'itemChange',
      'getEnchantment',
      'health',
      '24DbNQOy',
      'map',
      'armorStateMap',
      'applyImpulse',
      'isValid',
      'getComponent',
      'damage.thorns',
      'set',
      'riptide',
      'beforeEvents',
      'includes',
      'toString',
      'unbreaking',
      'getGameMode',
      'getEffect',
      'level',
      'absMap',
      'inventory',
      'absorptionEvents',
      'setLore',
      'itemStartUse',
      'attributeLore',
      'knockbackResistance',
      'rowNumber',
      '3614443oQtgpB',
      'runInterval',
      'rme:absorption',
      'location',
      'registerComponent',
      'run',
      'lastRiptideTickMap',
      '§r§7',
      'minecraft:durability',
      'thorns',
      'toughness',
      'currentTick',
      'replace',
      'setItem',
      '615714HpRNvN',
      'random',
      '774018nBemKE',
      'typeId',
      'applyDamage',
      'getParams',
      'maxDurability',
      'armorMap',
      'cloneItemStack',
      'onScreenDisplay',
      'transformElytra',
      'minecraft:player',
      '10972KrcVBf',
      'has',
      'Spectator',
      'Mainhand',
      'setActionBar',
      'addEnchantmentsData',
      'onUseItem',
      'getDynamicProperty',
      'removeEffect',
      'updateTicksMap',
      '380905CkfyOV',
      'addEffect',
      'rme:custom_elytra',
      'updateElytra',
      'trackAbsorption',
      'itemComponentRegistry',
      'type',
      'currentValue',
      'transferDurabilityByPercent',
      'subscribe',
      'handleArmor',
      'delete',
      'start',
      'getItem',
      'elytraDamageMap',
      'updateMolang',
      'rme:elytra_data',
      'isGliding',
      'armorData',
      'itemUse',
      '566004mrHwAf',
      'calculateArmorDamage',
      'getAllPlayers',
      'floor',
      'currentElytra',
      'get',
      'cause',
      'absorption',
      'setEquipment',
      'setDynamicProperty',
      'Chest',
      'isBroken',
      'startup',
      'duration',
      'push',
      'tick',
      '24rWytfU',
      'entityAttack',
      'enchantment.level.',
      'getColytraData',
      'displayArmor',
      'armor',
      '!custom_armor.',
      'playerInventoryItemChange',
      'projectile',
      'minecraft:elytra',
      'getEnchantments',
      'amplifier',
      'durability',
      'sqrt',
      'playSound',
      'vanilla',
      'rowMap',
      'entityHurt',
      'enchantable',
      'hasEnchantment',
   ];
   _0x50b9 = function () {
      return _0x32decf;
   };
   return _0x50b9();
}
import * as _0x125ac0 from './utils';
import * as _0x53a635 from './consts';
import * as _0x51e69d from './armor';
class CustomElytraManager {
   constructor() {
      const _0x23ea06 = _0x4568;
      ((this[_0x23ea06(0x1ea)] = new Map()),
         (this['updateTicksMap'] = new Map()),
         (this['absMap'] = new Map()),
         (this['rowMap'] = new Map()),
         (this[_0x23ea06(0x215)] = new Map()),
         (this['elytraDamageMap'] = new Map()),
         (this[_0x23ea06(0x206)] = new Map()),
         this['start']());
   }
   [_0x1f8775(0x1b0)]() {
      const _0x180e3c = _0x1f8775;
      (system[_0x180e3c(0x201)](() => this[_0x180e3c(0x1c7)]()),
         this[_0x180e3c(0x204)](),
         this[_0x180e3c(0x1ae)](),
         this[_0x180e3c(0x1fe)](),
         this[_0x180e3c(0x1e5)](),
         this[_0x180e3c(0x220)](),
         this[_0x180e3c(0x1fa)]());
   }
   ['registerComponent']() {
      const _0x4f9c0f = _0x1f8775;
      system[_0x4f9c0f(0x1f1)][_0x4f9c0f(0x1c4)][_0x4f9c0f(0x1ad)]((_0x487332) => {
         const _0x5605e9 = _0x4f9c0f;
         _0x487332[_0x5605e9(0x1a9)]['registerCustomComponent'](_0x5605e9(0x226), {});
      });
   }
   ['tick']() {
      const _0x58e7bf = _0x1f8775;
      for (const _0x4c5547 of world[_0x58e7bf(0x1ba)]()) {
         if (!_0x4c5547?.[_0x58e7bf(0x1ec)]) continue;
         if (_0x4c5547[_0x58e7bf(0x1f5)]() === _0x58e7bf(0x21c)) continue;
         const _0x35406d = _0x125ac0[_0x58e7bf(0x1bc)](_0x4c5547);
         (this[_0x58e7bf(0x228)](_0x4c5547), this[_0x58e7bf(0x1cc)](_0x4c5547, _0x35406d));
         if (!_0x35406d) {
            this[_0x58e7bf(0x223)][_0x58e7bf(0x1af)](_0x4c5547['id']);
            continue;
         }
         if (_0x35406d?.['type'] !== _0x58e7bf(0x1d7)) {
            this[_0x58e7bf(0x218)](_0x4c5547, _0x35406d);
            continue;
         }
         const _0x581fcd = _0x125ac0[_0x58e7bf(0x1cb)](_0x35406d?.['item']) ?? null;
         this[_0x58e7bf(0x227)](_0x4c5547, _0x581fcd);
         if (!_0x581fcd) continue;
         this['updateDurability'](_0x4c5547, _0x581fcd, _0x35406d);
      }
   }
   ['transformElytra'](_0x4d2e09, _0x284656) {
      const _0x529b3e = _0x1f8775,
         { item: _0x483748, id: _0x58bfaa } = _0x284656;
      if (!_0x483748) return;
      const _0x1997e0 = _0x125ac0[_0x529b3e(0x213)](_0x483748);
      if (!_0x1997e0) return;
      const _0x388fcc = new ItemStack(_0x529b3e(0x1d1));
      _0x125ac0[_0x529b3e(0x1ac)](
         _0x483748[_0x529b3e(0x1ed)](_0x529b3e(0x1d4)),
         _0x388fcc[_0x529b3e(0x1ed)]('durability'),
      );
      const _0xbf242f = [],
         _0x3a7b29 = _0x483748[_0x529b3e(0x1ed)](_0x529b3e(0x1de))?.[_0x529b3e(0x1d2)]() ?? [],
         _0xd47dfc = _0x388fcc[_0x529b3e(0x1ed)](_0x529b3e(0x1de));
      for (const _0x33d67f of _0x3a7b29) {
         const _0x592770 = _0x33d67f['type']['id'];
         if (!_0x53a635['ELYTRA_ENCHANTS'][_0x529b3e(0x21b)](_0x592770)) {
            const _0x1dcada = _0x53a635['ARMOR_ENCHANT_LORE'][_0x529b3e(0x1bd)](_0x592770);
            _0x1dcada &&
               _0xbf242f['push']({
                  rawtext: [
                     { text: _0x529b3e(0x207) },
                     { translate: _0x1dcada },
                     { text: '\x20' },
                     { translate: _0x529b3e(0x1ca) + _0x33d67f[_0x529b3e(0x1f7)] },
                  ],
               });
            continue;
         }
         _0xd47dfc?.['addEnchantment'](_0x33d67f);
      }
      (_0xbf242f[_0x529b3e(0x1c6)](..._0x125ac0[_0x529b3e(0x1fd)]([], _0x1997e0)),
         _0x388fcc[_0x529b3e(0x1fb)](_0xbf242f));
      const _0xac2416 = {
         id: _0x58bfaa?.[_0x529b3e(0x20c)](/(_p|_b)$/, '') ?? 'rme:default',
         maxDurability: _0x483748[_0x529b3e(0x1ed)]('durability')[_0x529b3e(0x214)] ?? 0x0,
         armorData: _0x1997e0['armor_data'],
         enchantments: _0x3a7b29[_0x529b3e(0x1e9)]((_0x706c37) => ({
            type: _0x706c37['type']['id'],
            level: _0x706c37[_0x529b3e(0x1f7)],
         })),
      };
      (_0x388fcc[_0x529b3e(0x1c1)](_0x529b3e(0x1b4), JSON['stringify'](_0xac2416)),
         this[_0x529b3e(0x223)][_0x529b3e(0x1ef)](_0x4d2e09['id'], 0x0),
         _0x125ac0[_0x529b3e(0x1b3)](_0x4d2e09, _0x58bfaa),
         _0x4d2e09[_0x529b3e(0x1ed)](_0x529b3e(0x1e3))?.['setEquipment'](
            _0x529b3e(0x1c2),
            _0x388fcc,
         ));
      if (_0x1997e0['equip_sound'])
         _0x4d2e09[_0x529b3e(0x1d6)](_0x1997e0['equip_sound'], { volume: 0.8 });
   }
   ['updateElytra'](_0x3bd65d, _0x11f0d2) {
      const _0x463729 = _0x1f8775,
         _0xe275cb = this[_0x463729(0x206)][_0x463729(0x1bd)](_0x3bd65d['id']) ?? -Infinity;
      if (system['currentTick'] - _0xe275cb < 0x3c) {
         this['updateTicksMap'][_0x463729(0x1ef)](_0x3bd65d['id'], 0x0);
         return;
      }
      const _0x487b46 = (this['updateTicksMap']['get'](_0x3bd65d['id']) ?? 0x0) + 0x1;
      this[_0x463729(0x223)]['set'](_0x3bd65d['id'], _0x487b46);
      if (_0x487b46 < 0x4) return;
      (_0x125ac0[_0x463729(0x1b3)](_0x3bd65d, _0x11f0d2?.['id']),
         this[_0x463729(0x223)][_0x463729(0x1ef)](_0x3bd65d['id'], 0x0));
   }
   ['updateDurability'](_0x38f016, _0x2e1e86, _0x109dfe) {
      const _0x333d27 = _0x1f8775;
      if (_0x38f016[_0x333d27(0x1ed)](_0x333d27(0x1e7))['currentValue'] <= 0x0) return;
      const _0x2718c8 = _0x109dfe[_0x333d27(0x1df)][_0x333d27(0x1ed)](_0x333d27(0x208)),
         _0x868b8f = _0x2718c8[_0x333d27(0x1dc)] ?? 0x0,
         _0x421665 = this[_0x333d27(0x1b2)][_0x333d27(0x1bd)](_0x38f016['id']) ?? _0x868b8f;
      if (_0x38f016[_0x333d27(0x1b5)] && _0x868b8f > _0x421665) {
         const _0x37f402 = _0x2e1e86[_0x333d27(0x214)],
            _0x2b6d05 = _0x2718c8[_0x333d27(0x214)];
         if (_0x37f402 < _0x2b6d05) return;
         const _0x49303e = _0x2b6d05 / _0x37f402;
         if (Math[_0x333d27(0x20f)]() > _0x49303e) {
            if (_0x38f016[_0x333d27(0x1ed)]('health')['currentValue'] <= 0x0) return;
            ((_0x2718c8['damage'] = Math['max'](0x0, _0x868b8f - 0x1)),
               _0x38f016[_0x333d27(0x1ed)](_0x333d27(0x1e3))?.[_0x333d27(0x1c0)](
                  _0x333d27(0x1c2),
                  _0x109dfe[_0x333d27(0x1df)],
               ));
         }
      }
      this[_0x333d27(0x1b2)][_0x333d27(0x1ef)](_0x38f016['id'], _0x868b8f);
   }
   [_0x1f8775(0x1cc)](_0xb6634f, _0x243ae6) {
      const _0xae584a = _0x1f8775,
         _0x5876a1 = _0x125ac0[_0xae584a(0x1cb)](_0x243ae6?.[_0xae584a(0x1df)]),
         _0x3a44dd = _0xb6634f['id'];
      if (
         _0x5876a1 &&
         _0xb6634f[_0xae584a(0x1f5)]() !== 'Creative' &&
         !_0x243ae6?.[_0xae584a(0x1c3)]
      ) {
         const _0x23355a = _0xb6634f['getComponent'](_0xae584a(0x1e3)),
            _0x531eb6 = _0x23355a?.['totalArmor'] ?? 0x0,
            _0x9e89cb = _0x5876a1[_0xae584a(0x1b6)][_0xae584a(0x1cd)],
            _0x37b7b4 = _0x531eb6 + _0x9e89cb,
            _0x443fff = _0x37b7b4[_0xae584a(0x1f3)]()['padStart'](0x2, '0'),
            _0x2972fa = _0x125ac0[_0xae584a(0x1ff)](_0xb6634f),
            _0x3c1216 = this[_0xae584a(0x215)][_0xae584a(0x1bd)](_0x3a44dd),
            _0x482c81 = this['rowMap']['get'](_0x3a44dd),
            _0x2ff0c4 = _0x3c1216 !== _0x443fff,
            _0x3cfde7 = _0x482c81 !== _0x2972fa;
         (_0x2ff0c4 || _0x3cfde7 || system['currentTick'] % 0x64 === 0x0) &&
            (_0xb6634f[_0xae584a(0x217)][_0xae584a(0x21e)](
               _0xae584a(0x1ce) + _0x443fff + '.' + _0x2972fa,
            ),
            this['armorMap'][_0xae584a(0x1ef)](_0x3a44dd, _0x443fff),
            this[_0xae584a(0x1d8)][_0xae584a(0x1ef)](_0x3a44dd, _0x2972fa));
         this[_0xae584a(0x1ea)][_0xae584a(0x1ef)](_0x3a44dd, !![]);
         return;
      }
      if (!this['armorStateMap']['get'](_0x3a44dd)) return;
      (_0xb6634f[_0xae584a(0x217)][_0xae584a(0x21e)]('\x20'),
         this[_0xae584a(0x1ea)][_0xae584a(0x1ef)](_0x3a44dd, ![]),
         this[_0xae584a(0x1d8)][_0xae584a(0x1af)](_0x3a44dd),
         this[_0xae584a(0x215)][_0xae584a(0x1af)](_0x3a44dd));
   }
   [_0x1f8775(0x1ae)]() {
      const _0x17345 = _0x1f8775,
         _0xf4c161 = (_0xe5b187, _0x2a7fc3, _0xf9ae4c, _0x162478, _0x55fd11) => {
            const _0x5a120 = _0x4568,
               {
                  armorData: _0x3abd41,
                  enchantments: _0x26d6f0,
                  maxDurability: _0x2a6d96,
               } = _0x162478;
            if (
               !_0x3abd41?.[_0x5a120(0x1cd)] &&
               !_0x3abd41?.['toughness'] &&
               !_0x26d6f0?.['length']
            )
               return;
            const { armorDamage: _0x4519b9, baseDamage: _0x137316 } = _0x51e69d[_0x5a120(0x1b9)](
               _0x2a7fc3,
               _0xf9ae4c['cause'],
               _0xe5b187[_0x5a120(0x1dc)],
               _0x3abd41[_0x5a120(0x1cd)] ?? 0x0,
               _0x3abd41[_0x5a120(0x20a)] ?? 0x0,
               _0x26d6f0,
            );
            (_0xb855ef(_0x4519b9, _0x2a7fc3, _0x2a6d96, _0x55fd11),
               (_0xe5b187['damage'] = _0x4519b9));
         },
         _0xb855ef = (_0x24e8d9, _0xb5cf3, _0x79a01, _0x17f570) => {
            const _0x520bfd = _0x4568;
            if (_0xb5cf3[_0x520bfd(0x1ed)](_0x520bfd(0x1e7))['currentValue'] <= 0x0) return;
            const _0x330251 = _0x17f570?.[_0x520bfd(0x1df)];
            if (!_0x330251) return;
            const _0x526dce = _0x330251[_0x520bfd(0x1ed)](_0x520bfd(0x208));
            if (!_0x526dce || _0x526dce['damage'] >= 0x1af) return;
            const _0x2a7bdb = Math['max'](0x1, Math['floor'](_0x24e8d9 / 0x4));
            let _0x369997 = _0x2a7bdb;
            if (_0x79a01 > 0x1b0) {
               const _0x1fa79a = 0x1b0 / _0x79a01;
               _0x369997 = Math['max'](0x1, Math[_0x520bfd(0x1bb)](_0x2a7bdb * _0x1fa79a));
            }
            const _0x248224 = _0x330251[_0x520bfd(0x1ed)](_0x520bfd(0x1de))?.[_0x520bfd(0x1e6)](
               _0x520bfd(0x1f4),
            );
            if (_0x248224) {
               let _0x426abf = 0x0;
               const _0x33e4cd = 0.6 + 0.4 / (_0x248224[_0x520bfd(0x1f7)] + 0x1);
               for (let _0x54868f = 0x0; _0x54868f < _0x369997; _0x54868f++) {
                  Math[_0x520bfd(0x20f)]() <= _0x33e4cd && _0x426abf++;
               }
               _0x369997 = _0x426abf;
            }
            if (_0x369997 <= 0x0) return;
            const _0x42b3b8 = (_0x526dce[_0x520bfd(0x1dc)] ?? 0x0) + _0x369997;
            system[_0x520bfd(0x205)](() => {
               const _0x5cbe01 = _0x520bfd;
               if (_0xb5cf3[_0x5cbe01(0x1ed)](_0x5cbe01(0x1e7))[_0x5cbe01(0x1ab)] <= 0x0) return;
               if (_0x42b3b8 >= _0x526dce['maxDurability']) {
                  _0x526dce['damage'] = _0x526dce[_0x5cbe01(0x214)] - 0x1;
                  return;
               }
               ((_0x526dce[_0x5cbe01(0x1dc)] = _0x42b3b8),
                  _0xb5cf3[_0x5cbe01(0x1ed)](_0x5cbe01(0x1e3))?.['setEquipment'](
                     _0x5cbe01(0x1c2),
                     _0x330251,
                  ));
            });
         },
         _0x52a583 = (_0x3f92c1, _0x4c6b8d, { enchantments: _0x5e3ecf }) => {
            const _0x2eeba2 = _0x4568;
            if (
               ![_0x2eeba2(0x1c9), _0x2eeba2(0x1d0)][_0x2eeba2(0x1f2)](_0x4c6b8d[_0x2eeba2(0x1be)])
            )
               return;
            const _0x2045a8 = _0x4c6b8d['damagingEntity'];
            if (!_0x2045a8?.[_0x2eeba2(0x1ec)]) return;
            const _0x4cd0bd = _0x5e3ecf['find'](
               (_0x1102df) => _0x1102df[_0x2eeba2(0x1aa)] === _0x2eeba2(0x209),
            );
            if (!_0x4cd0bd) return;
            const _0x154bf6 = _0x4cd0bd[_0x2eeba2(0x1f7)] * 0.15;
            if (Math[_0x2eeba2(0x20f)]() > _0x154bf6) return;
            const _0x4cb173 = Math['random']() * 0x4 + 0x1;
            system[_0x2eeba2(0x205)](() => {
               const _0x3448f9 = _0x2eeba2;
               (_0x3f92c1['dimension'][_0x3448f9(0x1d6)](
                  _0x3448f9(0x1ee),
                  _0x3f92c1[_0x3448f9(0x203)],
               ),
                  _0x2045a8[_0x3448f9(0x212)](_0x4cb173, {
                     cause: _0x3448f9(0x209),
                     damagingEntity: _0x3f92c1,
                  }));
            });
         };
      world[_0x17345(0x1f1)]['entityHurt']['subscribe']((_0xb00541) => {
         const _0x341c3f = _0x17345,
            { hurtEntity: _0x8d0ca8, damageSource: _0x3cf79f } = _0xb00541;
         if (!_0x8d0ca8?.['isValid'] || _0x8d0ca8[_0x341c3f(0x211)] !== _0x341c3f(0x219)) return;
         const _0x38638e = _0x125ac0[_0x341c3f(0x1bc)](_0x8d0ca8);
         if (!_0x38638e || _0x38638e?.[_0x341c3f(0x1c3)]) return;
         const _0x33cc6e = _0x125ac0[_0x341c3f(0x1cb)](_0x38638e['item']);
         if (!_0x33cc6e) return;
         (_0xf4c161(_0xb00541, _0x8d0ca8, _0x3cf79f, _0x33cc6e, _0x38638e),
            _0x52a583(_0x8d0ca8, _0x3cf79f, _0x33cc6e));
      });
   }
   ['knockbackResistance']() {
      const _0x49bef9 = _0x1f8775;
      world['afterEvents']['entityHurt'][_0x49bef9(0x1ad)]((_0x2738af) => {
         const _0x2a8852 = _0x49bef9,
            { hurtEntity: _0x2116fb, damageSource: _0x3c233e } = _0x2738af;
         if (
            !_0x2116fb?.[_0x2a8852(0x1ec)] ||
            _0x2116fb[_0x2a8852(0x211)] !== _0x2a8852(0x219) ||
            !_0x3c233e?.['damagingEntity']
         )
            return;
         const _0x12c21c = _0x125ac0[_0x2a8852(0x1bc)](_0x2116fb);
         if (!_0x12c21c || _0x12c21c?.[_0x2a8852(0x1c3)]) return;
         const _0x12e058 = _0x125ac0[_0x2a8852(0x1cb)](_0x12c21c[_0x2a8852(0x1df)]);
         if (!_0x12e058) return;
         const _0x36fb42 = _0x12e058?.[_0x2a8852(0x1b6)]?.['knockback_resistance'] ?? 0x0;
         if (_0x36fb42 <= 0x0) return;
         system['runTimeout'](() => {
            const _0x20e32e = _0x2a8852,
               _0x1d02c0 = _0x2116fb[_0x20e32e(0x1e0)](),
               _0x1ffc2f = Math[_0x20e32e(0x1d5)](_0x1d02c0['x'] ** 0x2 + _0x1d02c0['z'] ** 0x2);
            if (_0x1ffc2f <= 0.01) return;
            const _0x903ccd = Math['max'](0x0, 0x1 + -_0x36fb42 / 0xa),
               _0x9dbe2d = _0x1d02c0['x'] * _0x903ccd,
               _0x260e3f = _0x1d02c0['z'] * _0x903ccd,
               _0x8cad53 = { x: _0x9dbe2d - _0x1d02c0['x'], y: 0x0, z: _0x260e3f - _0x1d02c0['z'] };
            _0x2116fb[_0x20e32e(0x1eb)](_0x8cad53);
         }, 0x2);
      });
   }
   [_0x1f8775(0x1e5)]() {
      const _0x3c98ef = _0x1f8775;
      world['afterEvents'][_0x3c98ef(0x1cf)][_0x3c98ef(0x1ad)]((_0xda6654) => {
         const _0x2366ba = _0x3c98ef,
            { player: _0x15615f, itemStack: _0x2774f0, slot: _0x3d8abe } = _0xda6654;
         if (!_0x15615f?.['isValid'] || !_0x2774f0) return;
         const { container: _0x5c7ce3 } = _0x15615f['getComponent']('inventory');
         if (!_0x5c7ce3) return;
         if (_0x2774f0['typeId'] === _0x2366ba(0x1d1)) {
            const _0x59ab36 = _0x125ac0[_0x2366ba(0x1cb)](_0x2774f0);
            if (!_0x59ab36) return;
            const _0x2b22fa = _0x2774f0[_0x2366ba(0x1ed)](_0x2366ba(0x208));
            if (!_0x2b22fa) return;
            const _0x14b579 = _0x2b22fa[_0x2366ba(0x1dc)] >= _0x2b22fa[_0x2366ba(0x214)] - 0x1,
               _0x2519cf = _0x125ac0[_0x2366ba(0x216)](
                  _0x2774f0,
                  _0x14b579 ? _0x59ab36['id'] + '_b' : _0x59ab36['id'],
               );
            (_0x125ac0[_0x2366ba(0x21f)](_0x2519cf, _0x59ab36),
               _0x2519cf[_0x2366ba(0x1fb)](_0x125ac0[_0x2366ba(0x1fd)]([], _0x59ab36)));
            const _0x23f867 = _0x15615f[_0x2366ba(0x1ed)](_0x2366ba(0x1f9))['container'][
               _0x2366ba(0x1b1)
            ](_0x3d8abe);
            if (!_0x23f867) return;
            const _0xd348d0 =
               _0x2774f0[_0x2366ba(0x221)](_0x2366ba(0x1b4)) ===
                  _0x23f867[_0x2366ba(0x221)](_0x2366ba(0x1b4)) &&
               _0x2774f0[_0x2366ba(0x211)] === _0x23f867[_0x2366ba(0x211)];
            if (!_0xd348d0) return;
            _0x5c7ce3[_0x2366ba(0x20d)](_0x3d8abe, _0x2519cf);
            return;
         }
         const _0x5eda5c = _0x125ac0[_0x2366ba(0x213)](_0x2774f0);
         if (!_0x5eda5c) return;
         if (_0x5eda5c[_0x2366ba(0x1aa)] === 'placeholder') {
            const _0xc63bfe = _0x125ac0[_0x2366ba(0x216)](
               _0x2774f0,
               _0x2774f0['typeId'][_0x2366ba(0x20c)]('_p', ''),
            );
            (_0xc63bfe['setLore'](_0x125ac0['attributeLore']([], _0x5eda5c)),
               _0x5c7ce3[_0x2366ba(0x20d)](_0x3d8abe, _0xc63bfe));
            return;
         }
         if (_0x5eda5c['type'] === 'broken') {
            const _0x131d29 = _0x2774f0['getComponent'](_0x2366ba(0x208));
            if ((_0x131d29['damage'] ?? 0x0) >= _0x131d29[_0x2366ba(0x214)]) return;
            const _0x3a00dd = _0x125ac0[_0x2366ba(0x216)](
               _0x2774f0,
               _0x2774f0[_0x2366ba(0x211)][_0x2366ba(0x20c)]('_b', ''),
            );
            (_0x3a00dd[_0x2366ba(0x1fb)](_0x125ac0[_0x2366ba(0x1fd)]([], _0x5eda5c)),
               _0x5c7ce3[_0x2366ba(0x20d)](_0x3d8abe, _0x3a00dd));
            return;
         }
      });
   }
   [_0x1f8775(0x220)]() {
      const _0x15a51c = _0x1f8775;
      (world[_0x15a51c(0x1e1)][_0x15a51c(0x1b7)][_0x15a51c(0x1ad)](
         ({ itemStack: _0x19eccb, source: _0x56c732 }) => {
            const _0x2f1e5a = _0x15a51c;
            if (!_0x56c732?.[_0x2f1e5a(0x1ec)]) return;
            if (!_0x19eccb) return;
            _0x19eccb['typeId'] === 'minecraft:elytra' &&
               _0x56c732[_0x2f1e5a(0x1d6)]('armor.equip_elytra');
            const _0x114a82 = _0x125ac0['getParams'](_0x19eccb);
            if (!_0x114a82) return;
            if (_0x114a82?.[_0x2f1e5a(0x1aa)] === _0x2f1e5a(0x1d7)) return;
            (this[_0x2f1e5a(0x223)][_0x2f1e5a(0x1ef)](_0x56c732['id'], 0x0),
               _0x125ac0[_0x2f1e5a(0x1b3)](_0x56c732, _0x19eccb[_0x2f1e5a(0x211)]));
         },
      ),
         world['afterEvents'][_0x15a51c(0x1fc)][_0x15a51c(0x1ad)](({ source: _0x442b4a }) => {
            const _0x169614 = _0x15a51c;
            if (!_0x442b4a?.[_0x169614(0x1ec)]) return;
            if (_0x442b4a['typeId'] !== _0x169614(0x219)) return;
            const _0x13f4b9 = _0x442b4a['getComponent'](_0x169614(0x1e3))?.['getEquipment'](
                  _0x169614(0x21d),
               ),
               _0x71963e = _0x13f4b9?.['getComponent'](_0x169614(0x1da))?.[_0x169614(0x1db)](
                  _0x169614(0x1f0),
               );
            if (!_0x71963e) return;
            this['lastRiptideTickMap'][_0x169614(0x1ef)](_0x442b4a['id'], system[_0x169614(0x20b)]);
         }));
   }
   [_0x1f8775(0x228)](_0x2b7fa7) {
      const _0x1ba853 = _0x1f8775,
         _0x2fcf41 = _0x2b7fa7['id'],
         _0x1e38e2 = _0x2b7fa7[_0x1ba853(0x1f6)](_0x1ba853(0x1bf)),
         _0x10836b = this['absMap'][_0x1ba853(0x1bd)](_0x2fcf41);
      if (_0x1e38e2) {
         const _0x1e21ce =
               _0x1e38e2[_0x1ba853(0x1d3)] === 0x0
                  ? 0x4
                  : _0x1e38e2[_0x1ba853(0x1d3)] === 0x1
                    ? 0xc
                    : 0x10,
            _0x298f3f = !_0x10836b;
         _0x298f3f && _0x2b7fa7[_0x1ba853(0x1c1)](_0x1ba853(0x202), _0x1e21ce);
         if (_0x10836b) {
            const _0x219eca = _0x1e38e2[_0x1ba853(0x1c5)] > _0x10836b[_0x1ba853(0x1c5)],
               _0x5f4470 = _0x1e38e2[_0x1ba853(0x1d3)] !== _0x10836b['amplifier'];
            (_0x219eca &&
               !_0x5f4470 &&
               (_0x2b7fa7[_0x1ba853(0x222)](_0x1ba853(0x1bf)),
               _0x2b7fa7['addEffect'](_0x1ba853(0x1bf), _0x10836b[_0x1ba853(0x1c5)], {
                  amplifier: _0x10836b['amplifier'],
               })),
               (_0x219eca || _0x5f4470) &&
                  _0x2b7fa7[_0x1ba853(0x1c1)](_0x1ba853(0x202), _0x1e21ce));
         }
      } else _0x2b7fa7[_0x1ba853(0x1c1)](_0x1ba853(0x202), 0x0);
      this[_0x1ba853(0x1f8)][_0x1ba853(0x1ef)](
         _0x2fcf41,
         _0x1e38e2
            ? { duration: _0x1e38e2[_0x1ba853(0x1c5)], amplifier: _0x1e38e2[_0x1ba853(0x1d3)] }
            : undefined,
      );
   }
   [_0x1f8775(0x1fa)]() {
      const _0x531fe6 = _0x1f8775;
      (world[_0x531fe6(0x1e1)][_0x531fe6(0x1d9)][_0x531fe6(0x1ad)](
         ({ hurtEntity: _0x1023d8, damage: _0x383023 }) => {
            const _0x425d18 = _0x531fe6;
            if (!_0x1023d8?.['isValid']) return;
            if (_0x1023d8?.[_0x425d18(0x211)] !== 'minecraft:player') return;
            const _0x5bd137 = _0x1023d8[_0x425d18(0x221)](_0x425d18(0x202)) ?? 0x0,
               _0x1e6821 = Math[_0x425d18(0x1e2)](0x0, _0x5bd137 - _0x383023);
            _0x1023d8['setDynamicProperty'](_0x425d18(0x202), _0x1e6821);
         },
      ),
         world[_0x531fe6(0x1e1)]['playerSpawn']['subscribe'](({ player: _0x2c32e1 }) => {
            const _0x1819d6 = _0x531fe6;
            if (!_0x2c32e1[_0x1819d6(0x1ec)]) return;
            const _0x456222 = _0x2c32e1['getEffect'](_0x1819d6(0x1bf));
            if (!_0x456222?.[_0x1819d6(0x1ec)]) return;
            const _0xdbdf9c = _0x456222[_0x1819d6(0x1c5)],
               _0x2e1ca7 = _0x456222[_0x1819d6(0x1d3)];
            (_0x2c32e1['removeEffect'](_0x1819d6(0x1bf)),
               _0x2c32e1[_0x1819d6(0x225)]('absorption', _0xdbdf9c, { amplifier: _0x2e1ca7 }));
         }),
         world[_0x531fe6(0x1e1)][_0x531fe6(0x1dd)]['subscribe']((_0xfb0490) => {
            const _0x45ad7b = _0x531fe6,
               { source: _0x3671cc, itemStack: _0x4fe7af } = _0xfb0490;
            if (!_0x3671cc['isValid']) return;
            const _0x16e9bc = _0x3671cc[_0x45ad7b(0x1f6)]('absorption'),
               _0x59ab6f =
                  _0x16e9bc[_0x45ad7b(0x1d3)] === 0x0
                     ? 0x4
                     : _0x16e9bc[_0x45ad7b(0x1d3)] === 0x1
                       ? 0xc
                       : 0x10,
               _0x42608d = _0x4fe7af?.[_0x45ad7b(0x211)],
               _0x57bb04 = {
                  'minecraft:golden_apple': _0x16e9bc[_0x45ad7b(0x1d3)] > 0x0 ? _0x59ab6f : 0x4,
                  'minecraft:enchanted_golden_apple': 0x10,
               },
               _0x32ebe8 = _0x57bb04[_0x42608d] || 0x0;
            if (_0x32ebe8 === 0x0) return;
            _0x3671cc[_0x45ad7b(0x1c1)]('rme:absorption', _0x32ebe8);
         }));
   }
}
new CustomElytraManager();
