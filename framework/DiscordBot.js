const discord = require("discord.js");
const glob = require("glob");
const path = require("path");
const shlex = require('shlex');
const Command = require('./core/Command');

class DiscordBot {
    #client=null;
    #debug=null;
    #commands = {};
    #listeners = {};
    #voice=null;
    #webserver=null;
    #cache = {};
    #token=null;
    #prefix=null;
    constructor(prefix, token) {
        this.#token = token;
        this.#prefix = prefix;
    }

    run(startup_settings = {commands: true, listeners: true, voice: true}) {
        this.#voice = startup_settings.voice;
        this.#debug = process.env.DEBUG;
        this.#webserver = process.env.WEBSERVER;
        this._generate_commands();
        this._generate_listeners();
        this.#client = new discord.Client();
        if (this.#debug) {
            this._on_connected();
        }
        this._on_message();
        try{
            this.#client.login(this.#token);
        } catch (e) {
            console.error(e.message);
        }

    }

    _generate_commands() {
        const commands = glob.sync('./commands/*.js').map(file => require( path.resolve( file )));
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

        for (let command of all_commands.all){
            all_commands[command.name] = command;
        }
        this.#commands = all_commands;
    }

    _generate_listeners() {

    }

    _on_connected() {
        this.#client.on('ready', () => {
            console.log(`Succesfully logged in as ${this.#client.user.tag}`)
        });
    }

    _on_message() {
        this.#client.on('message', async (message) => {
            if (message.author.bot || !message.content.startsWith(this.#prefix)) return;
            const args = shlex.split(message.content.slice(this.#prefix.length).trim());
            const command = args.shift().toLowerCase();
            let found_command = null;
            for (let [name, c] of Object.entries(this.#commands)) {
                if (name === 'all') continue;
                if (c.name === command || (c.aliases !== undefined && c.aliases.includes(command))) {
                    found_command = c;
                    break;
                }
            }
            if (found_command === null) return false;
            console.log(`Received command ${command} with params: ${JSON.stringify(args)}`);
            if (found_command.allowed_channels.length !== 0 && !found_command.allowed_channels.includes(message.channel.id)) {
                console.log(`Command ${command} not allowed in channel ${message.channel.name}`);
                return;
            }
            await found_command.execute(message, message.author, ...args);
        });
    }
}

module.exports = DiscordBot;