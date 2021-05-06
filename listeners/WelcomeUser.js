class WelcomeUser extends Listener {
    constructor() {
        super();
        this.send_to_channels = ['630471767521230867'];
        this.event_name = 'guildMemberAdd';
    }
    execute(member) {
        this.send_to_channels.forEach(async channel_id => {
            const channel = await this.get_channel_from_id(channel_id);

            await channel.send(`User ${member.user.tag} has joined the guild!`);
        });
    }
}

module.exports = WelcomeUser;