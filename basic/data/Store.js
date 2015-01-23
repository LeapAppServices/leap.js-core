define([
        'app',
        'basic/Object',
        'data/Task',
        'U',
        'Q',
        'jquery',
        'underscore'
    ],
    function (AppCube, CObject, Task, U, Q, $, _) {

        var defaults = ['generator'];
        var INIT = 0, PENDING = 1, SUCCESS = 2, ERROR = 3;

        var Store = CObject.extend({
            initialize: function (options) {
                this._configure(options);
                this.QUEUE = false;
                this._state_list = {};
                this._resultStack = [];
                this._callbackStack = [];
                this._currentProgress = 0;
                this.addDefaultState();
                if (options.name)this.register(options.name);
                return true;
            },
            _configure: function (options) {
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                this.options = _.pick(options, defaults);
            },
            register: function (name) {
                AppCube.DataRepository.push(name, this);
            },
            setData: function (data) {
                var origin_data = {};
                if (data instanceof Task) {
                    origin_data.data = data;
                    origin_data.type = 'task';
                    data.state = SUCCESS;
                    //data.start();
                } else {
                    origin_data.data = U.Clone(data);
                    origin_data.type = 'data';
                }
                this._origin_data = origin_data;
            },
            getData: function () {
                var defer = Q.defer();
                var type = this._origin_data.type;

                if (type == 'data') {
                    defer.resolve(U.Clone(this._origin_data.data));
                } else {
                    var task = this._origin_data.data;
                    var state = task.state;
                    if (state == SUCCESS || state == ERROR) {
                        defer.resolve(U.Clone(task.result));
                    } else if (state == PENDING) {
                        return task.defer.promise;
                    } else {
                        defer.reject(new Error('Store: unknown error'));
                    }
                }
                return defer.promise;
            },
            addState: function (key, formatter) {
                this._state_list[key] = formatter;
            },
            addDefaultState: function () {
                this.addState('default', function (res) {
                    return res;
                });
            },
            getState: function (key, options) {
                if (typeof this._state_list[key] == 'undefined') {
                    throw new Error('State: "' + key + '" is not defined');
                }
                var defer = Q.defer();
                var formatter = this._state_list[key];
                this.getData().done(function (res) {
                    var data = formatter(U.Clone(res), options);
                    if (data && data.done) {
                        data.done(function (d) {
                            defer.resolve(d);
                        })
                    } else {
                        defer.resolve(data);
                    }
                });
                return defer.promise;
            },
            refreshData: function (options, nocache) {
                var self = this;
                var type = this._origin_data.type;
                if (type == 'data') {
                    var tmp_defer = Q.defer();
                    tmp_defer.resolve(this._origin_data.data);
                    return tmp_defer.promise;
                }
                var task = this._origin_data.data;
                var generate_options = this.options.generator ? this.options.generator(options || {}, task.options) : options || {};
                var new_options = _.extend({}, task.options, generate_options);
                var state = task.state;
                if (nocache) {
                    return Task.create(new_options).start();
                } else if (state == PENDING || this.QUEUE == true) {
                    if (this.checkEqual(new_options, task.options) && this.QUEUE == false) {
                        console.log('equal return same');
                        return task.defer.promise;
                    } else {
                        console.log('unequal start new');
                        this.QUEUE = true;
                        if (this._callbackStack.length == 0) {
                            this.MAIN_TASK = false;
                            task.defer.promise.done(function () {
                                self.MAIN_TASK = true;
                                var i = 0;
                                console.log('main task clear: T');
                                while (typeof self._resultStack[i] != 'undefined') {
                                    console.log('task call' + i);
                                    self._origin_data.data._configure(self._resultStack[i].options);
                                    self._origin_data.data.result = self._resultStack[i].result;
                                    self._callbackStack[i].resolve(self._resultStack[i].result);
                                    self._callbackStack[i] = undefined;
                                    i++;
                                }
                            });
                        }
                        var defer = Q.defer();
                        defer.index = this._callbackStack.length;
                        this._callbackStack.push(defer);
                        var tmp_task = Task.create(new_options);
                        tmp_task.start().done(function (res) {
                            console.log('sub task clear:' + defer.index);
                            self._currentProgress++;
                            self._resultStack[defer.index] = tmp_task;

                            if (self._currentProgress == self._callbackStack.length && self.MAIN_TASK) {
                                self._currentProgress = 0;
                                _.forEach(self._callbackStack, function (item, index) {
                                    if (item) {
                                        console.log('task call' + index);
                                        self._origin_data.data._configure(self._resultStack[index].options);
                                        self._origin_data.data.result = self._resultStack[index].result;
                                        item.resolve(self._resultStack[index].result);
                                    }
                                });
                                self._callbackStack = [];
                                self._resultStack = [];
                                self.QUEUE = false;
                            }
                        });
                        return defer.promise;
                    }
                } else if (state == SUCCESS || state == ERROR) {
                    task._configure(new_options);
                    return task.start();
                }
            },
            checkEqual: function (new_options, old_options) {
                return _.isEqual(new_options.params, old_options.params) &&
                    (new_options.method == old_options.method) &&
                    (new_options.url == old_options.url)
            }
        });

        Store.create = function (options) {
            var ret = new Store();
            if (ret.initialize(options || {}) == false) {
                return false;
            }
            return ret;
        };

        return Store;
    });