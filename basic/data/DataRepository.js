define([
        'Logger',
        'basic/Object',
        'data/Task',
        'dispatcher',
        'Q',
        'jquery',
        'underscore'
    ],
    function (Logger, CObject, Task, Dispatcher, Q, $, _) {

        var defaults = [];

        var DataRepository = CObject.extend({
            initialize: function (options) {
                this.isRunning = false;
                this._configure(options);
                this._store_list = {};
                return true;
            },
            _configure: function (options) {
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                this.options = _.pick(options, defaults);
            },
            start: function () {
                this.isRunning = true;
            },
            stop: function () {
                this.isRunning = false;
            },
            push: function (key, store) {
                if (!this.isRunning) {
                    return false;
                } else {
                    this._store_list[key] = store;
                }
            },
            getStore: function (key) {
                if (typeof this._store_list[key] == 'undefined') {
                    return false;
                } else {
                    return this._store_list[key];
                }
            },
            remove: function (key) {
                if (typeof this._store_list[key] == 'undefined') {
                    return false;
                } else {
                    return delete this._store_list[key];
                }
            },
            fetch: function (key, state, options) {
                if (typeof this._store_list[key] == 'undefined') {
                    throw new Error('DataRepository: "' + key + '" is not existed');
                } else {
                    var store = this._store_list[key];
                    if (typeof state == 'string') {
                        return store.getState(state, options);
                    } else {
                        return store.getData();
                    }
                }
            },
            fetchNew: function (key, options) {
                if (typeof this._store_list[key] == 'undefined') {
                    throw new Error('DataRepository: "' + key + '" is not existed');
                } else {
                    var store = this._store_list[key];
                    return store.refreshData(options, true);
                }
            },
            refresh: function (key, options) {
                if (typeof this._store_list[key] == 'undefined') {
                    throw new Error('DataRepository: "' + key + '" is not existed');
                } else {
                    var store = this._store_list[key];
                    try {
                        store.refreshData(options).done(function (res) {
                            console.log('refresh:"' + key + '"');
                            Dispatcher.trigger('refresh:' + key, res, 'Component');
                        });
                    } catch (e) {
                        Logger.error(e);
                    }
                }
            }
        });

        DataRepository.create = function (options) {
            var ret = new DataRepository();
            if (ret.initialize(options) == false) {
                return false;
            }
            return ret;
        };

        return DataRepository;
    });