define([
    'app',
    'core/functions/StoreLoader',
    'view/Layout',
    'jquery',
    'underscore'
], function (AppCube, StoreLoader, Layout, $, _) {

    var BasicLayout = Layout.extend({
        renderState: function (options) {
            var currentState = this._state[this._currentState];
            if (!currentState)throw new Error('BasicLayout: state "' + this._currentState + '" is not defined');
            var stateRoot = this._stateRoot;
            _.forEach(currentState, function (container) {
                container.render(stateRoot, options);
            });
        },
        changeState: function (state) {
            this.clearState();
            this._currentState = state;
        },
        clearState: function () {
            var currentState = this._state[this._currentState];
            if (!currentState)throw new Error('BasicLayout: state "' + this._currentState + '" is not defined');
            var stateRoot = this._stateRoot;
            _.forEach(currentState, function (container) {
                container.clear(stateRoot);
            });
        },
        loadStoreData: function () {
            var storeList = this.options.store;
            StoreLoader.load(storeList);
        }
    });

    BasicLayout.create = function (options) {
        var ret = new BasicLayout();
        if (ret.initialize(options) == false) {
            return false;
        }
        return ret;
    };

    return BasicLayout;
});