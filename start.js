const { ShardingManager } = require('discord.js');
require('dotenv').config();

const is_dev = process.env.hasOwnProperty('mode') && process.env.mode === 'dev'
const token = is_dev? process.env.DISCORD_TOKEN_DEV : process.env.DISCORD_TOKEN_PROD;

if (!token && is_dev)
    return console.error('Missing bot dev token in .env');

if (!token && !is_dev)
    return console.error('Missing bot prod token in .env');

const manager = new ShardingManager('./bot.js', {totalShards: 'auto', token: token, respawn: false});

manager.spawn();

manager.on('shardCreate', shard => console.log(`Shard ${shard.id} launched`));
