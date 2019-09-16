const DiscordBot = require("./framework/DiscordBot");
// if using glitch comment out the line below
require('dotenv').config();

const bot = new DiscordBot(process.env.DISCORD_PREFIX, process.env.DISCORD_TOKEN).run();