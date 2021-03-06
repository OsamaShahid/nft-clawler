import * as winston from "winston";
import { inspect } from "util";

const getFormattedMsg = (...argss: any) => {
  const strArgs = [];
  for (let index = 0; index < argss.length; index += 1) {
    let arg = argss[index];
    if (typeof arg !== "string") {
      arg = inspect(arg, {});
    }
    strArgs.push(arg);
  }
  return [``].concat(...strArgs).join(" ");
};

const myFormat = winston.format.printf(
  (info: any) => `[${new Date(info.timestamp).toISOString()}] ${info.message}`
);

const getConsoleFormat = () => {
  return winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize({ all: true }),
    myFormat
  );
};

const myCustomLevels = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    mute: 0,
    debug: 0,
    important: 0,
  },
  colors: {
    error: "red",
    warn: "yellow",
    success: "green",
    info: "cyan",
    mute: "grey",
    debug: "blue",
    important: "magenta",
  },
};

winston.addColors(myCustomLevels.colors);

const transportOptions = {
  handleExceptions: true,
  json: false,
  colorize: true,
  prettyPrint: true,
  level: "info",
  format: getConsoleFormat(),
};

const consoleTransport = new winston.transports.Console(transportOptions);

const loggerOptions = {
  colorize: true,
  levels: myCustomLevels.levels,
  level: "info",
  json: true,
  prettyPrint: true,
};

const logger: Record<any, any> = winston.createLogger(loggerOptions);

logger.add(consoleTransport);

const getLogger =
  (type: string) =>
  (...args: any) => {
    return logger[type](getFormattedMsg(...args));
  };

console.log = getLogger("info");
console.info = getLogger("info");
console.error = getLogger("error");
console.warn = getLogger("warn");
console.error = getLogger("error");

const consoleLogger = {
  error: getLogger("error"),
  warn: getLogger("warn"),
  success: getLogger("success"),
  info: getLogger("info"),
  mute: getLogger("mute"),
  debug: getLogger("debug"),
  important: getLogger("important"),
};

export { consoleLogger };
