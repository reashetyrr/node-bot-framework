class Command {
    constructor(...params) {
        this.allowed_channels = [];
        this.allowed_roles = [];
        this.aliases = [];
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

    execute(...params) {
        throw new DOMException('THE EXECUTE COMMAND SHOULD BE OVERRULED!!!');
    }
}

module.exports = Command;