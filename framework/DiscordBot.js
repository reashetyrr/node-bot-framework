class DiscordBot {
    #client=null;
    #debug=null;
    #commands = new Map();
    #listeners = new Map();
    #voice=null;
    #webserver=null;
    #token=null;

    constructor(token) {
        this.#token = token;
    }

    run(startup_settings = {commands: true, listeners: true, voice: true}) {
        this.#voice = startup_settings.voice;
        this.#debug = process.env.DEBUG;

        const intents = new discord.Intents();

        const env_intents = json.parse(process.env.DISCORD_INTENTS);

        for (const intent of env_intents) {
            if (!discord.Intents.FLAGS.hasOwnProperty(intent)) {
                logger.error(`Invalid intent passed (${intent}`);
                continue;
            }
            intents.add(discord.Intents.FLAGS[intent]);
        }

        this.#client = new discord.Client({intents: intents});

        if (this.#debug) {
            this._on_connected();
        }
        this._on_message();
        try{
            this.#client.login(this.#token);
        } catch (e) {
            console.error(e.message);
        }
        this.#client.on('custom.reload', () => {
            this._generate_commands();
            this._generate_listeners();
        });

        this.#client.emit('custom.reload');
    }

    _generate_commands() {
        const commands = glob.sync('./commands/*.js').map(file => {
            const resolved_path = path.resolve(file);
            delete require.cache[resolved_path];
            return require(resolved_path)
        });
        const all_commands = new Map();
        const _commands = commands.map(c => {
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

        for (let command of _commands){
            all_commands.set(command.name, command);
        }
        all_commands.set('all', _commands);
        this.#commands = all_commands;
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

        console.log(`Listening to  ${Object.keys(all_listeners).length - 1} events: ${listening_events.slice(0, -1)}`)

        this.#listeners = all_listeners;
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
            for (let [name, c] of this.#commands) {
                if (name === 'all') continue;
                if (c.name === command || (c.aliases !== undefined && c.aliases.includes(command))) {
                    found_command = c;
                    break;
                }
            }
            if (found_command === null) return false;
            if (found_command.hasOwnProperty('allowed_permissions')) {
                if (!message.member.permissions.has(found_command.allowed_permissions))
                    return message.channel.send(`For the ${command} command you need to have: ${found_command.allowed_permissions} permissions`);
            }
            console.log(`Received command ${command} with params: ${JSON.stringify(args)}`);
            if (found_command.hasOwnProperty('allowed_channels')) {
                if (found_command.allowed_channels.length !== 0 && !found_command.allowed_channels.includes(message.channel.id)) {
                    console.log(`Command ${command} not allowed in channel ${message.channel.name}`);
                    return;
                }
            }
            await found_command.execute(message, message.author, ...args);
        });
    }
}

module.exports = DiscordBot;
