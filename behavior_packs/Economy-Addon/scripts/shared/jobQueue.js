const _queue = [];
let _head = 0;

const _pending = new Set();
const _playerJobCount = new Map();
const _playerLastJobEnd = new Map();

export class JobQueue {
  static get length() {
    return _queue.length - _head;
  }

  static isPending(key) {
    return _pending.has(key);
  }

  static addPending(key) {
    _pending.add(key);
  }

  static removePending(key) {
    _pending.delete(key);
  }

  static push(job) {
    _queue.push(job);
    return job;
  }

  static peek() {
    return _queue[_head] ?? null;
  }

  static pop() {
    if (_head >= _queue.length) return null;
    const job = _queue[_head++];
    if (_head > 64 && _head * 2 > _queue.length) {
      _queue.splice(0, _head);
      _head = 0;
    }
    return job;
  }

  static getPlayerJobCount(playerId) {
    return _playerJobCount.get(playerId) ?? 0;
  }

  static incrementPlayerJobCount(playerId) {
    _playerJobCount.set(playerId, (_playerJobCount.get(playerId) ?? 0) + 1);
  }

  static decrementPlayerJobCount(playerId) {
    const n = _playerJobCount.get(playerId) ?? 0;
    if (n <= 1) _playerJobCount.delete(playerId);
    else _playerJobCount.set(playerId, n - 1);
  }

  static getPlayerLastJobEnd(playerId) {
    return _playerLastJobEnd.get(playerId) ?? 0;
  }

  static setPlayerLastJobEnd(playerId, tick) {
    _playerLastJobEnd.set(playerId, tick);
  }

  static cleanupPlayerState(playerId) {
    _playerJobCount.delete(playerId);
    _playerLastJobEnd.delete(playerId);
  }
}
