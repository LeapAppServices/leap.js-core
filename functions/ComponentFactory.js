define([], function () {
    var ComponentFactory = {};

    ComponentFactory.createComponent = function (options) {
        var Component = options.constructor;
        var extend = options.extend;
        if (extend && extend.storeName)options.options.storeName = extend.storeName;
        var component = new Component(options.options);
        if (component.init)component.init();
        return component;
    };

    return ComponentFactory;
});