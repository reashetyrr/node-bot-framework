class Ping extends Command {
    constructor() {
        super();
        this.name = 'ping';
        this.aliases = ['p'];
        this.allowed_channels = [];
    }

    async execute(interaction) {
        const m = await interaction.editReply('Ping?');
        return interaction.editReply(`Pong! Latency is ${m.createdTimestamp - interaction.createdTimestamp}ms.`);
    }
}

module.exports = Ping;
