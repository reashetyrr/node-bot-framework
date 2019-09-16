import discord from "discord.js";
import glob from "glob";
import path from "path";
import shlex from 'shlex';
import Command from './core/Command';

class DiscordBot {
    #client;
    #debug;
    #commands = {};
    #listeners = {};
    #voice;
    #webserver;
    #cache = {};
    #token;
    constructor(token) {
        this.#token = token;
    }

    run(startup_settings = {commands: true, listeners: true, voice: true}) {
        this.#voice = startup_settings.voice;
        this.#debug = process.env.DEBUG;
        this.#webserver = process.env.WEBSERVER;
        this._generate_commands();
        this._generate_listeners();
        this.#client = discord.client(this.#token)
        if (this.#debug) {
            this._on_connected();
        }
        this._on_message();
    }

    _generate_commands() {
        const commands = glob.sync('../commands/*.js').map(file => require( path.resolve( file ) ));
        let all_commands = {all: commands.map(c => {
            try {
                const t =  new c();
                if (!(t instanceof Command)) {
                    return false;
                }
                return t;
            } catch (e) {
                return false;
            }
        })};

        for (let command of commands){
            all_commands[command.name] = {execute: command.execute, allowed_channels: command.allowed_channels};
        }
        this.#commands = all_commands;
    }

    _generate_listeners() {

    }

    _on_connected() {
        this.#client.on('connected', () => {
            console.log(`Succesfully logged in as ${this.#client.user.tag}`)
        });
    }

    _on_message() {
        this.#client.on('message', async message => {
            if (message.author.bot || !message.content.startsWith('~')) return;
            const args = shlex.split(message.content.slice(1).trim());
            const command = args.shift().toLowerCase();
            let found_command = null;
            for (let c of this.#commands) {
                if (c.name === command || c.aliases.includes(command)) {
                    found_command = c;
                    return;
                }
            }
            if (found_command === null) return false;
            console.log(`Received command ${command} with params: ${JSON.stringify(args)}`);
            if (this.#commands.allowed_channels.length !== 0 && !this.#commands[command].allowed_channels.includes(message.channel.id)) {
                console.log(`Command ${command} not allowed in channel ${message.channel.name}`);
                return;
            }
            await found_command.execute(message, message.author, ...args);
        });
    }
}

export default DiscordBot;