import { ActionFormData } from '@minecraft/server-ui';
import { hasBright, toggleBright } from './state.js';

export function showMenu(player) {
    if (!player || !player.isValid) return;

    const isOn = hasBright(player);

    const form = new ActionFormData();
    form.title('Full Bright');
    form.header(isOn ? `§aBright ON` : `§cBright OFF`);
    form.button(isOn ? 'Turn Off' : 'Turn On', isOn ? 'textures/items/fullbright' : 'textures/ui/icon_none');
    form.label('                 @Sleeplite SMP');

    form.show(player)
        .then((res) => {
            if (!res || res.canceled || res.selection !== 0) return;

            const next = toggleBright(player);

            if (player.isValid) {
                player.onScreenDisplay.setActionBar(next ? `§aBright ON §f(${player.name})` : `§cBright OFF §f(${player.name})`);
            }
        })
        .catch((error) => console.error('[FullBright] UI Error:', error));
}
