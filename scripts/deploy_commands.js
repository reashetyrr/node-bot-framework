require('dotenv').config();
const glob = require('glob');
const path = require('path');
global.Command = require('../framework/core/Command');
// const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const is_dev = process.env.hasOwnProperty('mode') && process.env.mode === 'dev'

const token = is_dev? process.env.DISCORD_TOKEN_DEV : process.env.DISCORD_TOKEN_PROD;

if (!token && is_dev)
    return console.error('Missing bot dev token in .env');

if (!token && !is_dev)
    return console.error('Missing bot prod token in .env');


const clientId = is_dev? process.env.CLIENT_ID_DEV : process.env.CLIENT_ID_PROD;

const commands = [];

glob.sync('./commands/*.js').map(file => {
    const resolved_path = path.resolve(file);
    delete require.cache[resolved_path];
    return require(resolved_path)
}).map(c => {
    try {
        const t = new c();
        if (!(t instanceof Command))
            return false;
        commands.push(t.register().toJSON());
    }  catch (e) {
        return false;
    }
});


const rest = new REST({ version: '9' }).setToken(token);

const put_route = is_dev ?
    Routes.applicationGuildCommands(clientId, process.env.DEV_GUILD_ID) :
    Routes.applicationCommands(clientId);

rest.put(put_route, { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
