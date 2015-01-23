define(['underscore'], function (_) {
    function CObject() {
    }

    function extend(protoProps, staticProps) {
        var parent = this;
        var child;

        if (protoProps && _.has(protoProps, 'constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                return parent.apply(this, arguments);
            };
        }
        _.extend(child, parent, staticProps);

        var Surrogate = function () {
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate;
        if (protoProps) _.extend(child.prototype, protoProps);

        child.__super__ = parent.prototype;
        return child;
    }

    CObject.create = function (options) {
        var ret = new CObject();
        if (ret.initialize(options) == false) {
            return false;
        }
        return ret;
    };

    CObject.extend = extend;

    CObject.prototype.initialize = function (options) {
        options || (options = {});
        _.extend(this, options);
        return true
    };

    CObject.prototype.get = function (key) {
        if (!key)throw new Error("CObject: method get need argument key");
        //todo send message
        return this[key];
    };

    CObject.prototype.set = function (key, value) {
        if (!key)throw new Error("CObject: method set need arguments key");
        this[key] = value;
        //todo send message
        return this;
    };

    CObject.prototype.destroy = function () {
        //todo send message
        return delete this;
    };

    return CObject;
});