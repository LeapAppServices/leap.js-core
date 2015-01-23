define([
        'basic/Object',
        'core/functions/ComponentFactory',
        'jquery',
        'underscore'
    ],
    function (CObject, ComponentFactory, $, _) {

        var defaults = ['template', 'root'];

        var Container = CObject.extend({
            initialize: function (options) {
                this._configure(options || {});
                this._renderindex = 0;
                this._components = [];
                this._componentStack = {};
                this._containerRoot = null;
                this._root = null;
                this.cid = _.uniqueId('container_');
                return true;
            },
            _configure: function (options) {
                if (this.options) options = _.extend({}, _.result(this, 'options'), options);
                if (options.events) {
                    this.events = _.extend({}, this.events || {}, options.events);
                }
                this.options = _.pick(options, defaults);
            },
            loadComponents: function (components) {
                var self = this;
                _.forEach(components, function (item) {
                    self.addComponent(item);
                });
            },
            getContainer: function (index, options) {
                return $('<div id="' + _.uniqueId('component-') + '"></div>');
            },
            getComponentByIndex: function (index) {
                if (!this._components[index])return false;
                var name = this._components[index].name;
                return this._componentStack[name] || false;
            },
            createComponent: function (item, options) {
                return item.factory.createComponent(item, options);
            },
            addComponent: function (options) {
                this._components.push({
                    name: options.name,
                    constructor: options.constructor,
                    factory: options.factory || ComponentFactory,
                    options: options.options,
                    extend: options.extend
                });
            },
            renderComponents: function (options) {
                var self = this;
                var containerRoot;
                if (this.options.root) {
                    var tmp = this._containerRoot.find(this.options.root);
                    containerRoot = tmp.length ? tmp : $(this._containerRoot.get(0));
                } else {
                    containerRoot = $(this._containerRoot.get(0));
                }
                _.forEach(this._components, function (item) {
                    var name = item.name;
                    if (typeof self._componentStack[name] == 'undefined') {
                        self._componentStack[name] = self.createComponent(item, options || {});
                    }
                    var component = self._componentStack[name];
                    var el = self.getContainer(name, options || {}).appendTo(containerRoot).get(0);

                    component.setElement(el);
                    if (component.beforeShow) {
                        component.beforeShow();
                    }
                    component.render(options || {});
                });
            },
            beforeRenderComponents: function () {
            },
            render: function (stateRoot, options) {
                var rootNode;
                this._root = $(stateRoot);
                this.delegateEvents();
                if (this.options.template) {
                    rootNode = $((this.options.template)).appendTo($(stateRoot));
                } else {
                    rootNode = $(stateRoot);
                }
                this._containerRoot = rootNode;
                this.beforeRenderComponents();
                this.renderComponents(options);
            },
            clear: function (stateRoot) {
                this.undelegateEvents();
                _.forEach(this._componentStack, function (item) {
                    if (item.beforeHide)item.beforeHide();
                    //item.destroy();
                });
                if (!this._containerRoot) {
                    return false;
                } else if (this._containerRoot.length > 1) {
                    this._containerRoot.each(function () {
                        $(this).remove();
                    })
                } else {
                    var croot = this._containerRoot.get(0);
                    if (croot && croot != stateRoot) {
                        this._containerRoot.remove();
                    } else {
                        //todo clear more gently
                        $(stateRoot).html('');
                    }
                }
            },
            delegateEvents: function () {
                var events = this.events;
                if (!events) {
                    return false;
                } else {
                    this.undelegateEvents();
                    for (var key in events) {
                        var method = events[key];
                        if (!_.isFunction(method)) method = this[events[key]];
                        if (!method) continue;

                        var match = key.match(/^(\S+)\s*(.*)$/);
                        var eventName = match[1], selector = match[2];
                        method = _.bind(method, this);
                        eventName += '.delegateEvents' + this.cid;
                        if (selector === '') {
                            this._root.on(eventName, method);
                        } else {
                            this._root.on(eventName, selector, method);
                        }
                    }
                    return this;
                }

            },
            undelegateEvents: function () {
                if (this._root) {
                    this._root.off('.delegateEvents' + this.cid);
                }
                return this;
            }
        });

        Container.create = function (options) {
            var ret = new Container();
            if (ret.initialize(options) == false) {
                return false;
            }
            return ret;
        };

        return Container;
    });