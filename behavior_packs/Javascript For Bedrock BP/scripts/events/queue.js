import { logError } from './logger.js';

const _tasks = [];
const _priority = [];

let _pHead = 0;
let _qHead = 0;

export const Queue = {
   push(task, priority = false) {
      if (priority) {
         _priority.push(task);
      } else {
         _tasks.push(task);
      }
   },

    // ประมวลผลงานในคิวตามเวลาที่กำหนด (maxMs) ต่อ tick
    tick(maxMs = 5) {
      const startTime = Date.now();
      let checked = 0;
      let pCount = 0;

      while (_pHead < _priority.length || _qHead < _tasks.length) {
           // เช็คเวลาในทุก 8 งานเพื่อลด overhead ของ Date.now()
           if (++checked % 8 === 0 && Date.now() - startTime > maxMs) {
              break; // งานที่เหลือยกยอดไป tick ถัดไป
           }

           // ป้องกัน starvation: ทำงาน priority 3 งาน ต่อ งานปกติ 1 งาน
         const task = _pHead < _priority.length && pCount++ % 4 !== 3 ? _priority[_pHead++] : _qHead < _tasks.length ? _tasks[_qHead++] : _priority[_pHead++];

         if (!task) continue;
         try {
            task();
         } catch (error) {
            logError('Queue', 'task error', error);
         }
      }

        // ลบงานที่ประมวลผลแล้วออกเมื่อ head pointer เกิน 256 เพื่อไม่ให้หน่วยความจำบวม
      if (_pHead > 256) {
         _priority.splice(0, _pHead);
         _pHead = 0;
      }
      if (_qHead > 256) {
         _tasks.splice(0, _qHead);
         _qHead = 0;
      }
   },

   get size() {
      return _priority.length - _pHead + (_tasks.length - _qHead);
   },
};
