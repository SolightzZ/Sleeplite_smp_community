(function (_0x29e4d8, _0x460598) {
   const _0x351556 = _0x4a97,
      _0x12476c = _0x29e4d8();
   while (!![]) {
      try {
         const _0x3e7639 =
            -parseInt(_0x351556(0xcc)) / 0x1 +
            (parseInt(_0x351556(0xb1)) / 0x2) * (-parseInt(_0x351556(0xc5)) / 0x3) +
            (parseInt(_0x351556(0xac)) / 0x4) * (-parseInt(_0x351556(0xb7)) / 0x5) +
            parseInt(_0x351556(0xc1)) / 0x6 +
            (parseInt(_0x351556(0xa4)) / 0x7) * (parseInt(_0x351556(0xa3)) / 0x8) +
            (parseInt(_0x351556(0xa6)) / 0x9) * (-parseInt(_0x351556(0xa0)) / 0xa) +
            parseInt(_0x351556(0xb4)) / 0xb;
         if (_0x3e7639 === _0x460598) break;
         else _0x12476c['push'](_0x12476c['shift']());
      } catch (_0x4de798) {
         _0x12476c['push'](_0x12476c['shift']());
      }
   }
})(_0x7147, 0xe85c3);
function _0x7147() {
   const _0xa7cbcb = [
      'getEquipment',
      'dimension',
      'enchantable',
      '4730ejMkOR',
      'minecraft:health',
      'vanilla',
      '41280HuYSpO',
      '287RTwbby',
      'maxDurability',
      '9558aeccBz',
      'leashable',
      'attribute.name.generic.armor',
      'rme:custom_elytra',
      'armor',
      'params',
      '183116RGCIUA',
      'minecraft:durability',
      'rme:absorption',
      'getEnchantments',
      'location',
      '1126vmRGQJ',
      'getDynamicProperty',
      'damage',
      '24253691fcFcCu',
      'minecraft:enchantable',
      'spawnEntity',
      '15LKhfUQ',
      'knockback_resistance',
      'armor_data',
      'then',
      'addEnchantment',
      'attribute.name.minecraft:knockback_resistance',
      'typeId',
      'waitTicks',
      'toughness',
      'rme:elytra_data',
      '6127920tmvNvB',
      'equippable',
      'leashTo',
      '§r§9+',
      '8313YbdoBf',
      'addEnchantments',
      'removeEnchantment',
      'getComponent',
      'Chest',
      'type',
      'slot.armor.chest.when_equipped',
      '286278vvYOnG',
      'floor',
      'max',
      'parse',
      'push',
      'rme:default',
   ];
   _0x7147 = function () {
      return _0xa7cbcb;
   };
   return _0x7147();
}
import {
   system,
   ItemStack,
   ItemEnchantableComponent,
   EnchantmentType,
   world,
} from '@minecraft/server';
export const currentElytra = (_0x277906) => {
   const _0x264031 = _0x4a97,
      _0x1ba212 = _0x277906[_0x264031(0xc8)](_0x264031(0xc2)),
      _0x569a6c = _0x1ba212[_0x264031(0x9d)](_0x264031(0xc9));
   if (!_0x569a6c) return null;
   const _0x25dfce = _0x569a6c[_0x264031(0xbd)],
      _0x55c5eb = getParams(_0x569a6c);
   if (_0x25dfce !== 'minecraft:elytra' && !_0x55c5eb) return null;
   const _0xd3c4cc = _0x569a6c[_0x264031(0xc8)](_0x264031(0xad)),
      _0xd17658 =
         (_0xd3c4cc?.[_0x264031(0xb3)] ?? 0x0) >= _0xd3c4cc?.[_0x264031(0xa5)] - 0x1 ?? ![];
   return {
      item: _0x569a6c,
      id: _0x25dfce,
      isBroken: _0xd17658,
      type: _0x55c5eb?.[_0x264031(0xca)] ?? _0x264031(0xa2),
   };
};
function _0x4a97(_0x31e039, _0x4faad0) {
   _0x31e039 = _0x31e039 - 0x98;
   const _0x7147a1 = _0x7147();
   let _0x4a97e2 = _0x7147a1[_0x31e039];
   return _0x4a97e2;
}
export function getColytraData(_0x18cb2a) {
   const _0x4913ba = _0x4a97;
   try {
      const _0x597450 = _0x18cb2a[_0x4913ba(0xb2)](_0x4913ba(0xc0));
      if (!_0x597450 || typeof _0x597450 !== 'string') return null;
      return JSON[_0x4913ba(0x9a)](_0x597450);
   } catch {
      return null;
   }
}
export const updateMolang = (_0x2658b0, _0x4217ef) => {
   const _0x428a4f = _0x4a97;
   try {
      const { x: _0x12185f, y: _0x5efbfe, z: _0x202217 } = _0x2658b0[_0x428a4f(0xb0)],
         _0x1c8ff9 = _0x2658b0[_0x428a4f(0x9e)][_0x428a4f(0xb6)](
            _0x4217ef?.['replace']('_p', '')['replace']('_b', '') ?? _0x428a4f(0x9c),
            { x: _0x12185f, y: _0x5efbfe, z: _0x202217 },
         );
      (_0x1c8ff9['getComponent'](_0x428a4f(0xa7))[_0x428a4f(0xc3)](_0x2658b0),
         system[_0x428a4f(0xbe)](0x1)[_0x428a4f(0xba)](() => {
            _0x1c8ff9['remove']();
         }));
   } catch {}
};
export const attributeLore = (_0x4c2acc, _0x282404) => {
   const _0x43d15e = _0x4a97,
      _0x41d0da = _0x282404?.[_0x43d15e(0xb9)] ?? _0x282404?.['armorData'] ?? null;
   if (!_0x41d0da) return;
   let _0x2bf9ed = [];
   return (
      (_0x41d0da['armor'] || _0x41d0da[_0x43d15e(0xbf)] || _0x41d0da['knockback_resistance']) &&
         _0x2bf9ed[_0x43d15e(0x9b)]('§r', {
            rawtext: [{ text: '§r§7' }, { translate: _0x43d15e(0xcb) }],
         }),
      _0x41d0da[_0x43d15e(0xaa)] &&
         _0x2bf9ed[_0x43d15e(0x9b)]({
            rawtext: [
               { text: _0x43d15e(0xc4) },
               { text: _0x41d0da[_0x43d15e(0xaa)] + '\x20' },
               { translate: _0x43d15e(0xa8) },
            ],
         }),
      _0x41d0da[_0x43d15e(0xbf)] &&
         _0x2bf9ed[_0x43d15e(0x9b)]({
            rawtext: [
               { text: _0x43d15e(0xc4) },
               { text: _0x41d0da[_0x43d15e(0xbf)] + '\x20' },
               { translate: 'attribute.name.generic.armorToughness' },
            ],
         }),
      _0x41d0da['knockback_resistance'] &&
         _0x2bf9ed[_0x43d15e(0x9b)]({
            rawtext: [
               { text: _0x43d15e(0xc4) },
               { text: _0x41d0da[_0x43d15e(0xb8)] + '\x20' },
               { translate: _0x43d15e(0xbc) },
            ],
         }),
      _0x2bf9ed
   );
};
export const getParams = (_0x5a5ce0) => {
   const _0x227777 = _0x4a97,
      _0x420d17 = _0x5a5ce0?.[_0x227777(0xc8)](_0x227777(0xa9))?.['customComponentParameters'][
         _0x227777(0xab)
      ];
   if (!_0x420d17) return null;
   return _0x420d17;
};
export function transferDurabilityByPercent(_0x35d7de, _0x4147c4) {
   const _0x49e557 = _0x4a97;
   if (!_0x35d7de || !_0x4147c4) return;
   const _0x52c0bd = _0x35d7de[_0x49e557(0xb3)] ?? 0x0;
   if (_0x52c0bd >= _0x35d7de[_0x49e557(0xa5)] - 0x1) {
      _0x4147c4['damage'] = _0x4147c4[_0x49e557(0xa5)];
      return;
   }
   const _0x13caaa = _0x52c0bd / _0x35d7de[_0x49e557(0xa5)];
   _0x4147c4[_0x49e557(0xb3)] = Math[_0x49e557(0x98)](_0x13caaa * _0x4147c4[_0x49e557(0xa5)]);
}
export const cloneItemStack = (_0x2ef569, _0x393d99) => {
   const _0x1092de = _0x4a97,
      _0x6e62d = new ItemStack(_0x393d99),
      _0x1e0fce = (_0x53b65f, _0x378510) => {
         const _0x52434d = _0x4a97,
            _0x3b67b5 = _0x2ef569['getComponent'](_0x53b65f),
            _0xc3edf8 = _0x6e62d[_0x52434d(0xc8)](_0x53b65f);
         _0x3b67b5 && _0xc3edf8 && _0x378510(_0x3b67b5, _0xc3edf8);
      };
   return (
      _0x1e0fce('durability', (_0x46bd04, _0x289236) => {
         transferDurabilityByPercent(_0x46bd04, _0x289236);
      }),
      _0x1e0fce(_0x1092de(0x9f), (_0x346dfb, _0x3f5d43) => {
         const _0x5c2eb2 = _0x1092de;
         _0x3f5d43[_0x5c2eb2(0xc6)](_0x346dfb[_0x5c2eb2(0xaf)]());
      }),
      _0x6e62d
   );
};
export function addEnchantmentsData(_0x5ec88a, _0x2c9ed0) {
   const _0x4afe62 = _0x4a97,
      _0x1dcdef = _0x5ec88a['getComponent'](_0x4afe62(0xb5));
   if (!_0x1dcdef || !_0x2c9ed0['enchantments']) return;
   for (const _0x4b03e3 of _0x1dcdef[_0x4afe62(0xaf)]()) {
      _0x1dcdef[_0x4afe62(0xc7)](_0x4b03e3[_0x4afe62(0xca)]['id']);
   }
   for (const _0x59c4c5 of _0x2c9ed0['enchantments']) {
      _0x1dcdef[_0x4afe62(0xbb)]({
         type: new EnchantmentType(_0x59c4c5[_0x4afe62(0xca)]),
         level: _0x59c4c5['level'],
      });
   }
}
export const rowNumber = (_0x6838d3) => {
   const _0x422915 = _0x4a97,
      _0x520b0d = _0x6838d3['getComponent'](_0x422915(0xa1)),
      _0x4c1d73 = _0x6838d3[_0x422915(0xb2)](_0x422915(0xae)) ?? 0x0,
      _0x339465 = _0x520b0d['effectiveMax'] + _0x4c1d73;
   let _0x2fb57b = Math['ceil'](_0x339465 / 0x14);
   const _0x37cc4f = _0x339465 % 0x14;
   return (
      _0x37cc4f > 0x0 && _0x37cc4f < 0x2 && _0x2fb57b--,
      Math[_0x422915(0x99)](0x0, _0x2fb57b - 0x1)
   );
};
