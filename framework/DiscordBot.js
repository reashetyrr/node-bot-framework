class DiscordBot {
    #client=null;
    #debug=null;
    #voice=null;
    #token=null;

    constructor(token) {
        this.#token = token;
    }

    run(startup_settings = {commands: true, listeners: true, voice: true}) {
        this.#voice = startup_settings.voice;
        this.#debug = process.env.DEBUG;

        const intents = new discord.Intents();

        const env_intents = JSON.parse(process.env.DISCORD_INTENTS);

        for (const intent of env_intents) {
            if (!discord.Intents.FLAGS.hasOwnProperty(intent)) {
                logger.error(`Invalid intent passed (${intent}`);
                continue;
            }
            intents.add(discord.Intents.FLAGS[intent]);
        }

        this.#client = new discord.Client({intents: intents});

        this.#client.on('ready', () => {
            logger.info(`Listening to commands`)
        });

        if (this.#debug) {
            this._on_connected();
        }

        this._on_command();

        try{
            this.#client.login(this.#token);
        } catch (e) {
            logger.error(e.message);
        }
        this.#client.on('custom.reload', () => {
            this._generate_commands();
            this._generate_listeners();
        });

        this.#client.emit('custom.reload');
    }

    _generate_commands() {
        this.#client.commands = new discord.Collection();

        const commands = glob.sync('./commands/*.js').map(file => {
            const resolved_path = path.resolve(file);
            delete require.cache[resolved_path];
            return require(resolved_path)
        });

        let _commands = commands.map(c => {
            try {
                const t = new c();
                if (!(t instanceof Command))
                    return false;
                t.client = this.#client;
                return t;
            }  catch (e) {
                return false;
            }
        });

        _commands = _commands.filter(c => c);

        for (let command of _commands){
            const cbuilder = command.register();
            this.#client.commands.set(cbuilder.name, command);
        }
    }

    _generate_listeners() {
        const listeners = glob.sync('./listeners/*.js').map(listener => {
            const resolved_path = path.resolve(listener);
            delete require.cache[resolved_path];
            return require(resolved_path)
        });

        const _listeners = listeners.map(c => {
            try {
                const t =  new c();
                if (!(t instanceof Listener)) {
                    return false;
                }
                t.client = this.#client;
                return t;
            } catch (e) {
                return false;
            }
        });
        const all_listeners = new Map();

        for (let listener of _listeners){
            if (!all_listeners.has(listener.event_name))
                all_listeners.set(listener.event_name, []);
            const _tl = all_listeners.get(listener.event_name);
            _tl.push(listener);
            all_listeners.set(listener.event_name, _tl);
        }

        all_listeners.set('all', _listeners);

        let listening_events = '';
        for (let [event_name, listeners] of all_listeners) {
            if (event_name === 'all') continue;
            listening_events += `${event_name}(${listeners.length} registered actions),`;
            listeners.forEach(listener => {
                this.#client.on(event_name, (...params) => {
                    listener.execute(...params);
                });
            });
        }

        console.log(`Listening to  ${Object.keys(all_listeners).length} events: ${listening_events}`)
    }

    _on_connected() {
        this.#client.on('ready', () => {
            logger.info(`Succesfully logged in as ${this.#client.user.tag}`)
        });
    }

    _on_command() {
        this.#client.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;

            if (interaction.user.bot) return;

            await interaction.deferReply(); // give us more than 3s

            const command = this.#client.commands.get(interaction.commandName);
            if (!command) return;

            if (command.allowed_channels && command.allowed_channels.length > 0 && !command.allowed_channels.includes(interaction.channel.id)) {
                await interaction.editReply('This command is not allowed in this channel');
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                logger.error(error);
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
    }
}

module.exports = DiscordBot;
