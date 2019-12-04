class Listener {
    constructor(...params) {
        this.send_to_channels = [];
        this.event_name = '';
        this._client = null;
    }
    get is_debug() {
        return process.env.DEBUG;
    }

    get_channel_from_id(channel_id) {
        this._client.channels.get(channel_id);
    }

    execute(...params) {
        throw new DOMException('THE EXECUTE METHOD IN A LISTENER SHOULD BE OVERRULED!!!');
    }
}

module.exports = Listener;