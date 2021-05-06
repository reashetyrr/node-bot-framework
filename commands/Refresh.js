class Refresh extends Command {
    constructor() {
        super();
        this.name = 'refresh';
        this.aliases = ['reload', 'rl'];
        this.allowed_permissions = 'ADMINISTRATOR';
    }

    async execute(message, author, ...params) {
        this.client.emit('custom.reload');
        return message.reply('Succesfully reloaded commands and listeners');
    }
}

module.exports = Refresh;