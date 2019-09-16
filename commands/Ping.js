const Command = require("../framework/core/Command.js");

class Ping extends Command {
    constructor() {
        super();
        this.name = 'ping';
        this.aliases = ['p'];
        this.allowed_channels = [];
    }

    async execute(message, author, ...params) {
        const m = await message.channel.send('Ping?');
        return m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms.`);
    }
}

module.exports = Ping;