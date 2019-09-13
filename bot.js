require('dotenv').config();
const DiscordBot = require('./framework/DiscordBot');

const bot = new DiscordBot(process.env.DISCORD_TOKEN).run();