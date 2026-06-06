const ARMOR_CAUSES = new Set([
    'anvil',
    'blockExplosion',
    'entityAttack',
    'entityExplosion',
    'fire',
    'maceSmash',
    'piston',
    'projectile',
    'ramAttack',
    'stalactite',
    'stalagmite',
    'suffocation',
    'thorns',
]);

const PROTECTION_TYPES = {
    protection: new Set([
        'anvil',
        'blockExplosion',
        'entityAttack',
        'entityExplosion',
        'fire',
        'fireTick',
        'maceSmash',
        'piston',
        'projectile',
        'ramAttack',
        'stalactite',
        'stalagmite',
        'suffocation',
        'thorns',
    ]),

    fire_protection: new Set(['fire', 'fireTick']),

    blast_protection: new Set(['blockExplosion', 'entityExplosion']),

    projectile_protection: new Set(['projectile']),
};

export const calculateArmorDamage = (hurtEntity, damageCause, finalVanillaDamage, extraArmor = 0, extraToughness = 0, extraEnchantments = []) => {
    const equip = hurtEntity.getComponent('equippable');

    const vanillaArmor = equip.totalArmor ?? 0;

    const vanillaToughness = equip.totalToughness ?? 0;

    const vanillaEnchantments = [];

    const slots = ['Head', 'Chest', 'Legs', 'Feet'];

    for (const slot of slots) {
        const item = equip.getEquipment(slot);

        if (!item) continue;

        const enchantable = item.getComponent('minecraft:enchantable');

        if (!enchantable) continue;

        for (const enchantment of enchantable.getEnchantments()) {
            vanillaEnchantments.push({
                type: enchantment.type.id,

                level: enchantment.level,
            });
        }
    }

    function applyArmorReduction(damage, armor, toughness) {
        armor = Math.min(armor, 30);

        toughness = Math.min(toughness, 20);

        const reduction = Math.min(
            20,

            Math.max(
                armor / 5,

                armor - damage / (2 + toughness / 4),
            ),
        );

        return damage * (1 - reduction / 25);
    }

    function getEPF(cause, enchantments) {
        let epf = 0;

        for (const enchantment of enchantments) {
            const type = enchantment.type;

            const level = enchantment.level;

            if (!type || !level) continue;

            const validCauses = PROTECTION_TYPES[type];

            if (!validCauses?.has(cause)) continue;

            switch (type) {
                case 'protection':
                    epf += level;
                    break;

                case 'fire_protection':
                case 'blast_protection':
                case 'projectile_protection':
                    epf += level * 2;
                    break;
            }
        }

        return Math.min(epf, 20);
    }

    function applyEPFReduction(damage, epf) {
        return damage * (1 - epf / 25);
    }

    const vanillaEPF = getEPF(damageCause, vanillaEnchantments);

    function simulateVanilla(baseDamage) {
        let damage = baseDamage;

        if (ARMOR_CAUSES.has(damageCause)) {
            damage = applyArmorReduction(damage, vanillaArmor, vanillaToughness);
        }

        damage = applyEPFReduction(damage, vanillaEPF);

        return damage;
    }

    let baseDamageGuess = finalVanillaDamage;

    for (let i = 0; i < 15; i++) {
        const simulated = simulateVanilla(baseDamageGuess);

        if (simulated <= 0) break;

        const ratio = finalVanillaDamage / simulated;

        baseDamageGuess *= ratio;
    }

    const baseDamage = Math.max(baseDamageGuess, 0);

    let finalDamage = baseDamage;

    if (ARMOR_CAUSES.has(damageCause)) {
        finalDamage = applyArmorReduction(
            finalDamage,

            vanillaArmor + extraArmor,

            vanillaToughness + extraToughness,
        );
    }

    const totalEPF = getEPF(damageCause, [...vanillaEnchantments, ...extraEnchantments]);

    finalDamage = applyEPFReduction(finalDamage, totalEPF);

    return {
        armorDamage: Number.isFinite(finalDamage) ? Math.max(finalDamage, 0) : 0,

        baseDamage,
    };
};
