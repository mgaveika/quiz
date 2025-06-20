/* eslint-disable no-nested-ternary */
const morgan = require('morgan');

// Use native Date formatting instead of moment
function formatDate() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  }).format(new Date());
}

// Handle chalk ESM import in CommonJS (works in Node 22+)
const chalk = (await import('chalk')).default;

morgan.token('date', () => formatDate());

morgan.token('status', (req, res) => {
  const status = res.headersSent ?? res.header ? res.statusCode : undefined;

  const getColor = () =>
    status >= 500 ? 31 :
    status >= 400 ? 33 :
    status >= 300 ? 36 :
    status >= 200 ? 32 : 0;

  const color = getColor();
  return `\x1b[${color}m${status}\x1b[0m`;
});

const morganChalk = morgan((tokens, req, res) => [
  chalk.white(tokens.date(req, res)),
  chalk.green.bold(tokens.method(req, res)),
  chalk.bold(tokens.status(req, res)),
  chalk.white(tokens.url(req, res)),
  chalk.yellow(`${tokens['response-time'](req, res)} ms`),
].join(' '));

module.exports = morganChalk;