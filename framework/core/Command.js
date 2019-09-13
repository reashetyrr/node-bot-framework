class Command {
    get is_debug() {
        return process.env.DEBUG;
    }
}

module.exports = Command;