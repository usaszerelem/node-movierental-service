require('express-async-errors');
const { dbUri } = require('./database');

const {
    createLogger,
    transports,
    format
} = require('winston');

require('winston-mongodb');

const myConsoleFormat = format.combine(
    format.cli({
        colors: {
            debug: 'brightCyan',
            info: 'brightWhite',
            warn: 'brightYellow',
            error: 'brightRed'
        }}),
    format.errors({ stack: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            // print log trace
            return `${timestamp} ${level}: ${message} - ${stack}`;
        }
        return `${timestamp} ${level}: ${message}`;
    }));

const myLogFormat = format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
            // print log trace
            return `${timestamp} ${level}: ${message} - ${stack}`;
        }
        return `${timestamp} ${level}: ${message}`;
    }));

const logger = createLogger({
    transports: [
        new transports.Console({
            level: 'debug',
            format: myConsoleFormat
        }),
        new transports.File({
            filename: 'info.log',
            level: 'info',
            format: myConsoleFormat
        }),
        new transports.MongoDB({
            level: 'error',
            db: dbUri,
            options: {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            },
            collection: 'appErrors',
            format: myConsoleFormat
        })
    ]
});

module.exports = logger;
