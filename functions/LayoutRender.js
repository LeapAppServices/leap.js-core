define([
    'underscore'
], function (_) {
    var LayoutRender = {};
    LayoutRender.render = function (layouts) {
        _.forEach(layouts, function (options, action) {
            var Layout = options.constructor;
            var layout = Layout.create({
                'action': action,
                'root': options.root,
                'stateRoot': options.stateRoot,
                'defaultState': options.defaultState,
                'template': options.template,
                'store': options.store,
                'stay': options.stay
            });
            layout.render();
            _.forEach(options.state, function (stateOptions, name) {
                layout.addState(name, stateOptions);
            });
        });
    };

    return LayoutRender;
});