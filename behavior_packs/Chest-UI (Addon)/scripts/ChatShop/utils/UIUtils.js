export function handleFormError(player, error) {
    if (player?.isValid) {
        player.sendMessage('§c[Shop] เกิดข้อผิดพลาดในการเปิดเมนู');
    }

    const message = error?.stack ?? error?.message ?? String(error);

    console.error(`[Shop] ${message}`);
}
