exports.buffer = function buffer(Class) {
    const bufferProps = Class._bufferProps = Class._bufferProps || [];
    const staticProps = Class._staticProps = Class._staticProps || [];

    Class._isDoubleBuffer = true;

    Object.assign(Class.prototype, {

        getState() {
            const prev = {};

            for (const { prop, state } of bufferProps) {
                prev[prop] = this[state];
            }

            for (const key of staticProps) {
                prev[key] = this[key];
            }

            return prev;
        },

        setState(newState) {
            this._isBufferDirty = false;

            for (const { prop, state, next } of bufferProps) {
                this[state] = newState[prop];
                this[next] = newState[prop];
            }

            for (const key of staticProps) {
                this[key] = newState[key];
            }
        },

        flushState() {
            if (!this._isBufferDirty) {
                return;
            }

            this._isBufferDirty = false;

            for (const { state, next } of bufferProps) {
                this[state] = this[next];
            }
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

exports.staticProp = function staticProp(prototype, key) {
    const Class = prototype.constructor;
    const staticProps = Class._staticProps = Class._staticProps || [];

    staticProps.push(key);
};
