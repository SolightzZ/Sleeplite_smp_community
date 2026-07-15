import { nowUnix, formatThaiDateTime } from '../../../shared/datetime.js';

export const formatDuration = (seconds) => {
   if (seconds <= 0) return 'ถาวร';
   const days = Math.floor(seconds / 86400);
   const hours = Math.floor((seconds % 86400) / 3600);
   const minutes = Math.floor((seconds % 3600) / 60);
   const secs = seconds % 60;

   const parts = [];
   if (days > 0) parts.push(`${days} วัน`);
   if (hours > 0) parts.push(`${hours} ชั่วโมง`);
   if (minutes > 0) parts.push(`${minutes} นาที`);
   if (secs > 0 || parts.length === 0) parts.push(`${secs} วินาที`);

   return parts.join(' ');
};

export const formatRemaining = (expiresAt) => {
   const remaining = expiresAt - nowUnix();
   if (remaining <= 0) return 'หมดอายุ';
   return formatDuration(remaining);
};

export const formatDate = (timestamp) => formatThaiDateTime(timestamp);
