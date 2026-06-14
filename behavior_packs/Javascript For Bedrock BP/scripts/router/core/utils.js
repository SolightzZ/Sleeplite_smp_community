// รันฟังก์ชันจัดการเหตุการณ์หลายฟังก์ชันในลูปพร้อมกำหนดชื่อพารามิเตอร์ที่ชัดเจน
export function runEventHandlers(tag, handlers, event) {
    for (let i = 0; i < handlers.length; i++) {
        try {
            handlers[i](event);
        } catch (error) {
            const name = handlers[i]?.name || `anonymous[${i}]`;
            console.error(`[${tag}] ${name} error:`, error?.message ?? error);
        }
    }
}

// ทำงานเหมือน runEventHandlers แต่จะหยุดทำงานก่อนกำหนดหาก event.cancel ถูกตั้งค่าเป็นจริง
export function runEventHandlersWithCancel(tag, handlers, event) {
    for (let i = 0; i < handlers.length; i++) {
        try {
            handlers[i](event);
            if (event.cancel) {
                const name = handlers[i]?.name || `anonymous[${i}]`;
                console.warn(`[${tag}] ${name} cancelled event`);
                return;
            }
        } catch (error) {
            const name = handlers[i]?.name || `anonymous[${i}]`;
            console.error(`[${tag}] ${name} error:`, error?.message ?? error);
        }
    }
}
