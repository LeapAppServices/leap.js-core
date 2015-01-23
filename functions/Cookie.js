define([], function () {
    return {
        get: function (key) {
            var value = document.cookie.match(new RegExp("(^| )" + key + "=([^;]*)(;|$)"));
            if (value != null) {
                return decodeURI(value[2]);
            }
            return null;
        },
        set: function (key, value, days, path) {
            var d = new Date();
            d.setTime(d.getTime() + (typeof days == 'undefined' ? 1 : days) * 24 * 60 * 60 * 1000);
            document.cookie = key + "=" + encodeURI(value) + ";expires=" + d.toGMTString() + ";path=" + path || "/";
        },
        remove: function (key) {
            this.set(key, '', -1);
        },
        clear: function () {
            var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            if (keys) {
                for (var i = keys.length; i--;)
                    document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
            }
        }
    }
});