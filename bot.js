global.discord = require("discord.js");
global.glob = require("glob");
global.path = require("path");
global.shlex = require('./framework/custom_edits/shlex');
global.Command = require('./framework/core/Command');
global.Listener = require('./framework/core/Listener');


const base_classes = glob.sync('./base_classes/**/*.js').map(file => {
    const resolved_path = path.resolve(file);
    delete require.cache[resolved_path];
    return require(resolved_path)
});

for (const c of base_classes) {
    global[c.name] = c;
}


const DiscordBot = require("./framework/DiscordBot");
// if using glitch comment out the line below
require('dotenv').config();

if (!process.env.DISCORD_TOKEN)
    return console.error('Missing bot token in .env');

if (!process.env.DISCORD_PREFIX) {
    console.error('Missing bot prefix, using / as default')
    process.env.DISCORD_PREFIX = '/';
}

new DiscordBot(process.env.DISCORD_PREFIX, process.env.DISCORD_TOKEN).run();
