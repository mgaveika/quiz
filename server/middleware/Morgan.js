// import morgan from 'morgan';
const morgan = require('morgan');

// import { format as dateFormat } from 'date-fns';
const { format: dateFormat } = require('date-fns');
// import chalk from 'chalk';
const chalk = require('chalk');

// Custom date token
morgan.token('date', () => dateFormat(new Date(), 'dd-MM-yyyy HH:mm:ss:SSS'));

// Custom colored status token
morgan.token('status', (req, res) => {
  // Get the status code of response written
  const status = (typeof res.headersSent !== 'boolean' ? Boolean(res.header) : res.headersSent)
    ? res.statusCode
    : undefined;

  function getColor() {
    // Red
    if (status >= 500) {
      return 31;
    }

    // Yellow
    if (status >= 400) {
      return 33;
    }

    // Cyan
    if (status >= 300) {
      return 36;
    }

    // Green
    if (status >= 200) {
      return 32;
    }

    // White
    return 0;
  }

  const color = getColor();

  return `\x1b[${color}m${status}\x1b[0m`;
});

// Morgan with chalk formatting
const morganMiddleware = morgan((tokens, req, res) =>
  [
    chalk.white(tokens.date(req, res)),
    chalk.green.bold(tokens.method(req, res)),
    chalk.bold(tokens.status(req, res)),
    chalk.white(tokens.url(req, res)),
    chalk.yellow(`${tokens['response-time'](req, res)} ms`),
  ].join(' ')
);

module.exports = morganMiddleware

