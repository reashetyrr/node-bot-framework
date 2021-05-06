const { ShardingManager } = require('discord.js');
require('dotenv').config();

if (!process.env.DISCORD_TOKEN)
    return console.error('Missing bot token in .env');

const manager = new ShardingManager('./bot.js', {totalShards: 'auto', token: process.env.DISCORD_TOKEN, respawn: false});

manager.spawn();

manager.on('shardCreate', shard => console.log(`Shard ${shard.id} launched`));