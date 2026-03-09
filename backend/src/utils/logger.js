const util = require('util');

function formatArgs(args) {
  return Array.from(args).map(a => (typeof a === 'object' ? util.inspect(a, { depth: 3 }) : a)).join(' ');
}

module.exports = {
  info: (...args) => console.log('[INFO]', new Date().toISOString(), formatArgs(args)),
  warn: (...args) => console.warn('[WARN]', new Date().toISOString(), formatArgs(args)),
  error: (...args) => console.error('[ERROR]', new Date().toISOString(), formatArgs(args)),
  debug: (...args) => { if (process.env.DEBUG) console.debug('[DEBUG]', new Date().toISOString(), formatArgs(args)); },
};
