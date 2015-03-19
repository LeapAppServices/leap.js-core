define(['store2'], function (store2) {
    window.store2 = store2;

    return {
        get: function (key) {
            return store2.local.get(key);
        },
        set: function (key, value) {
            store2.local.set(key, value);
        },
        remove: function (key) {
            store2.local.remove(key);
        },
        clear: function () {
            store2.local.clearAll();
        }
    }
});