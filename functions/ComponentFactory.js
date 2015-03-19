define([], function () {
    var ComponentFactory = {};

    ComponentFactory.createComponent = function (options) {
        options = options || {};
        var Component = options.constructor;
        var extend = options.extend;
        if (extend && extend.storeName){
            options.options = options.options || {};
            options.options.storeName = extend.storeName;
        }
        var component = new Component(options.options);
        if (component.init)component.init();
        return component;
    };

    return ComponentFactory;
});