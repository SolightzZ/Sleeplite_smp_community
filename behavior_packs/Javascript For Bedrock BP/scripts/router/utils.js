// เรียกใช้ฟังก์ชันตัวจัดการหลายฟังก์ชันในลูป for โดยแยกแต่ละฟังก์ชันไว้ในส่วนของตัวเอง
export function runEventHandlers(tag, handlers, event) {
    for (let i = 0; i < handlers.length; i++) {
        try {
            handlers[i](event);
        } catch (error) {
            console.error(`[${tag}] handler ${i} error:`, error?.message ?? error);
        }
    }
}

// เหมือนกับ runEventHandlers แต่จะหยุดทำงานก่อนกำหนดหาก `event.cancel` กลายเป็นค่าจริง
export function runEventHandlersWithCancel(tag, handlers, event) {
    for (let i = 0; i < handlers.length; i++) {
        try {
            handlers[i](event);
            if (event.cancel) return;
        } catch (error) {
            console.error(`[${tag}] handler ${i} error:`, error?.message ?? error);
        }
    }
}
