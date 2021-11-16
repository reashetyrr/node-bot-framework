global.discord = require("discord.js");
global.glob = require("glob");
global.path = require("path");
global.shlex = require('./framework/custom_edits/shlex');
global.Command = require('./framework/core/Command');
global.Listener = require('./framework/core/Listener');

require('dotenv').config();

const is_dev = process.env.hasOwnProperty('mode') && process.env.mode === 'dev'
const winston = require('winston');

global.logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    defaultMeta: { service: 'discord-bot-framework' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});


const base_classes = glob.sync('./base_classes/**/*.js').map(file => {
    const resolved_path = path.resolve(file);
    delete require.cache[resolved_path];
    return require(resolved_path)
});

for (const c of base_classes) {
    global[c.name] = c;
}


const DiscordBot = require("./framework/DiscordBot");
const token = is_dev? process.env.DISCORD_TOKEN_DEV : process.env.DISCORD_TOKEN_PROD;

if (!token && is_dev)
    return console.error('Missing bot dev token in .env');

if (!token && !is_dev)
    return console.error('Missing bot prod token in .env');

new DiscordBot(token).run();
