const isProd = process.env.NODE_ENV === 'production';
const showSocketLogs = process.env.SHOW_SOCKET_LOGS === 'true';
const showAuthLogs = process.env.SHOW_AUTH_LOGS === 'true';
const util = require('util');

function safeLog(shouldLog, fn, ...args) {
  if (shouldLog) fn(...args);
}

function formatArgs(args) {
  return Array.from(args)
    .map((a) => (typeof a === 'object' ? util.inspect(a, { depth: 3 }) : a))
    .join(' ');
}

module.exports = {
  socket: (...args) => safeLog(showSocketLogs || !isProd, console.log, '[SOCKET]', formatArgs(args)),
  auth: (...args) => safeLog(showAuthLogs || !isProd, console.log, '[AUTH]', formatArgs(args)),
  info: (...args) => safeLog(!isProd, console.log, '[INFO]', formatArgs(args)),
  warn: (...args) => console.warn('[WARN]', new Date().toISOString(), formatArgs(args)),
  debug: (...args) => { if (process.env.DEBUG === 'true') console.debug('[DEBUG]', new Date().toISOString(), formatArgs(args)); },
  error: (...args) => console.error('[ERROR]', new Date().toISOString(), formatArgs(args)),
};
