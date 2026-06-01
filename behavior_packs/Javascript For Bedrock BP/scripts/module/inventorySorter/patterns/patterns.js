export const applyChessPattern = (items, containerSize) => {
    const result = new Array(containerSize);
    for (let i = 0; i < containerSize; i++) result[i] = undefined;

    let idx = 0;
    const itemsLen = items.length;
    for (let i = 0; i < containerSize && idx < itemsLen; i += 2) {
        result[i] = items[idx++];
    }

    for (let i = 1; i < containerSize && idx < itemsLen; i += 2) {
        result[i] = items[idx++];
    }

    return result;
};

export const applyLinePattern = (items, containerSize) => {
    const ROW = 9;
    const result = new Array(containerSize);

    for (let i = 0; i < containerSize; i++) result[i] = undefined;
    const itemsLen = items.length;
    let idx = 0;

    for (let i = 0; i < containerSize && idx < itemsLen; i++) {
        if (Math.floor(i / ROW) % 2 === 0) result[i] = items[idx++];
    }

    for (let i = 0; i < containerSize && idx < itemsLen; i++) {
        if (Math.floor(i / ROW) % 2 !== 0) result[i] = items[idx++];
    }

    return result;
};

export const applyColumnPattern = (items, containerSize) => {
    const ROW = 9;
    const result = new Array(containerSize);

    for (let i = 0; i < containerSize; i++) result[i] = undefined;
    const itemsLen = items.length;
    let idx = 0;

    for (let i = 0; i < containerSize && idx < itemsLen; i++) {
        if ((i % ROW) % 2 === 0) result[i] = items[idx++];
    }

    for (let i = 0; i < containerSize && idx < itemsLen; i++) {
        if ((i % ROW) % 2 !== 0) result[i] = items[idx++];
    }

    return result;
};
