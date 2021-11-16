const { SlashCommandBuilder } = require('@discordjs/builders');

class Command {
    constructor(...params) {
        this.allowed_channels = [];
        // this.allowed_roles = [];
        this.name = 'No name set';
        this.aliases = [];
        this.parameters = [];
        this.description = 'No description set';
    }
    get is_debug() {
        return process.env.DEBUG;
    }

    get client() {
        return this._client;
    }

    set client(c) {
        this._client = c;
    }

    execute(interaction) {
        throw new DOMException('THE EXECUTE COMMAND SHOULD BE OVERRULED!!!');
    }

    register() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
    }
}

module.exports = Command;
