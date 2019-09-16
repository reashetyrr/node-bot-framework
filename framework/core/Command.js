class Command {
    constructor(...params) {
        this.allowed_channels = [];
        this.allowed_roles = [];
        this.aliases = [];
    }
    get is_debug() {
        return process.env.DEBUG;
    }
    execute(...params) {
        throw new DOMException('THE EXECUTE COMMAND SHOULD BE OVERRULED!!!');
    }
}

export default Command;