const discord = require('discord.js');

class DiscordBot {
    #debug;
    #commands = [];
    #listeners = [];
    #voice;
    #webserver;
    constructor(token) {
        this.token = token;
    }

    run(startup_settings = {commands: true, listeners: true, voice: true}) {
        this.#voice = startup_settings.voice;
        this.#debug = startup_settings.debug;
        this.#webserver = startup_settings.webserver;


    }

    #generate_commands(fs, glob) {

    }

    #generate_listeners(fs, glob) {

    }
}

module.exports = DiscordBot;