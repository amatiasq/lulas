exports.buffer = function buffer(Class) {
    const bufferProps = Class._bufferProps = Class._bufferProps || [];

    Class._isDoubleBuffer = true;

    Object.assign(Class.prototype, {

        getState() {
            const prev = {};

            for (const { prop, state } of bufferProps) {
                prev[prop] = this[state];
            }

            return prev;
        },

        setState(newState) {
            this._isBufferDirty = false;

            for (const { prop, state, next } of bufferProps) {
                this[state] = newState[prop];
                this[next] = newState[prop];
            }
        },

        flushState() {
            if (!this._isBufferDirty) {
                return;
            }

            this._isBufferDirty = false;
            const prev = {};

            for (const { prop, state, next } of bufferProps) {
                prev[prop] = this[state];
                this[state] = this[next];
            }

            return prev;
        },

    });
}

exports.bufferProp = function bufferProp(prototype, key) {
    const Class = prototype.constructor;
    const bufferProps = Class._bufferProps = Class._bufferProps || [];
    const state = `_${key}`;
    const next = `_${key}_next`;

    bufferProps.push({
        prop: key,
        state,
        next,
    });

    Object.defineProperty(prototype, key, {

        get() {
            return this[state];
        },

        set(value) {
            this[next] = value;
            this._isBufferDirty = true;
        },

    });
}
