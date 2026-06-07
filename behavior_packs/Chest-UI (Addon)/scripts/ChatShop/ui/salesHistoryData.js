import { formatName } from '../utils/helpers.js';

const MAX_VISIBLE = 50;

export function processSalesHistory(history) {
    const data = history || [];

    const sorted = [...data].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, MAX_VISIBLE);

    const totals = {
        totalItems: data.reduce((sum, e) => sum + (e.amount || 0), 0),
        totalRevenue: data.reduce((sum, e) => sum + (e.price || 0), 0),
        count: data.length,
        hasMore: data.length > MAX_VISIBLE,
    };

    return { sorted, totals };
}

export function buildSalesHistoryBody(totals, isDeleted) {
    let body =
        `§fทั้งหมด §e${totals.count} §fรายการ` + (totals.hasMore ? ` (แสดง ${MAX_VISIBLE} ล่าสุด)` : '') + `\n§fขายรวม: §e${totals.totalItems} §fชิ้น` + `\n§fรายได้รวม: §e${totals.totalRevenue} $`;

    if (isDeleted) {
        body += `\n\n§7[ร้านนี้ถูกลบแล้ว — ข้อมูลประวัติ]`;
    }
    return body;
}

export function buildSaleButtonDesc(entry) {
    return {
        itemName: formatName(entry.itemId || ''),
        buyerName: entry.buyerName || 'Unknown',
        label: `§f${formatName(entry.itemId || '')} §7x${entry.amount ?? 0}`,
        desc: [`§7${entry.buyerName || 'Unknown'}`, `§e$${entry.price ?? 0}`, ''],
    };
}

export { MAX_VISIBLE };
