import { system } from '@minecraft/server';
import { Registry } from './registry.js';
import { Queue } from './queue.js';
import { logError } from './logger.js';

const _intervals = [];

export const Interval = {
    register(fn, ticks) {
        _intervals.push({ fn, ticks, counter: 0 });
    },

    tick() {
        for (let i = 0; i < _intervals.length; i++) {
            const iv = _intervals[i];
            iv.counter++;
            if (iv.counter < iv.ticks) continue;
            iv.counter = 0;
            try {
                iv.fn();
            } catch (error) {
                const name = iv.fn?.name || `anonymous_interval[${i}]`;
                logError('Interval', `${name} error`, error);
            }
        }
    }
};

// สร้างตัววนซ้ำผู้เล่นแบบมีสถานะเฉพาะสำหรับการประมวลผลแบบเวียน (Round-robin)
export function createPlayerBatchIterator() {
    let index = 0;
    return function (fn) {
        const entries = Registry.getEntries();
        if (entries.length === 0) return;
        if (index >= entries.length) {
            index = 0;
        }
        const entry = entries[index];
        if (entry && entry.player?.isValid) {
            try {
                fn(entry);
            } catch (error) {
                logError('PlayerBatchIterator', 'task error', error);
            }
        }
        index++;
    };
}

// ขับเคลื่อนระบบช่วงเวลาและคิวงานจากลูปช่วงเวลาหลักเพียงลูปเดียว
system.runInterval(() => {
    try {
        Interval.tick();
        Queue.tick();
    } catch (error) {
        logError('Tick', 'main loop error', error);
    }
}, 1);
