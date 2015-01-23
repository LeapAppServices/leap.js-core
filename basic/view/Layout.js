define([
        'app',
        'basic/Object',
        'U',
        'Q',
        'dispatcher',
        'jquery',
        'underscore'
    ],
    function (AppCube, CObject, U, Q, Dispatcher, $, _) {

        var defaults = ['store', 'action', 'root', 'stateRoot', 'template', 'defaultState'];

        var Layout = CObject.extend({
            initialize: function (options) {
                this._configure(options);
                if (typeof this.options.root == 'undefined')throw new Error('Layout: layout root must be set');
                this._defaultState = this.options.defaultState ? this.options.defaultState : 'default';
                this._currentState = this._defaultState;
                this._state = {};
                this._stateRoot = null;
                this._registerEvent();
                return true;
            },
            _configure: function (options) {
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                this.options = _.pick(options, defaults);
            },
            _registerEvent: function () {
                Dispatcher.on('hide', this.hide, this, 'Layout');
                Dispatcher.on('show', this.show, this, 'Layout');
            },
            show: function (options) {
                if (this.options.action == options.action) {
                    this.changeState(options.state || this._defaultState);
                    if (this.options.store)this.loadStoreData();
                    AppCube.current_action = options.action;
                    AppCube.current_state = this._currentState;
                    this.renderState(options.options);
                    $(this.options.root).show();
                }
            },
            hide: function (options) {
                if (this.options.action != options.action) {
                    if ($(this.options.root).is(':visible')) {
                        $(this.options.root).hide();
                        this.clearState();
                    }
                }
            },
            render: function () {
                var html = this.options.template ? this.options.template : '';
                $(this.options.root).append(html).hide();
                if (this.options.stateRoot) {
                    var stateRoot = $(this.options.root).find(this.options.stateRoot);
                    if (stateRoot.length > 0) {
                        this._stateRoot = stateRoot.get(0);
                    } else {
                        throw new Error('Layout: "' + stateRoot + '" can not be found');
                    }
                } else {
                    this._stateRoot = $(this.options.root).get(0);
                }
            },
            addDefaultState: function (options) {
                this.addState(this._defaultState, options);
            },
            addState: function (key, containers) {
                var self = this;
                this._state[key] = [];
                if (!_.isArray(containers))containers = [containers];

                _.forEach(containers, function (options) {
                    var container = options.container.create(options);
                    container.loadComponents(options.components);
                    self._state[key].push(container);
                });
            },
            changeState: function (state) {
                throw new Error('Layout: You must implement changeState method');
            },
            renderState: function (options) {
                throw new Error('Layout: You must implement renderState method');
            },
            clearState: function () {
                throw new Error('Layout: You must implement clearState method');
            },
            loadStoreData: function () {
                throw new Error('Layout: You must implement loadStoreData method');
            }
        });

        Layout.create = function (options) {
            var ret = new Layout();
            if (ret.initialize(options) == false) {
                return false;
            }
            return ret;
        };

        return Layout;
    });