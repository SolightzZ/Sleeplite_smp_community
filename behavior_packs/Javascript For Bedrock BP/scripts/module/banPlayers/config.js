export const banReasons = ['Cheating / Hacking', 'Griefing', 'Harassment', 'Spamming', 'Exploiting Bugs', 'Inappropriate Build', 'Alt Account', 'Scamming', 'Combat Logging', 'Other'];

export const kickReasons = ['Server Restart', 'Lag / Performance', 'Inappropriate Behavior', 'AFK Too Long', 'Other'];

export const Config = {
   dbKey: 'BAN_DATA',
   adminTag: 'admin',
   defaultDuration: 3 * 3600,
   maxDuration: 365 * 24 * 3600,
   maxReasons: 10,
   kickPermission: 'any',
   banPermission: 'admin',
   unbanPermission: 'admin',
   banlistPermission: 'any',
};
