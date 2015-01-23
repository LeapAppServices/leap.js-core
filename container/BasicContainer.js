define([
    'view/Container',
    'jquery',
    'underscore'
], function (Container, $, _) {
    var BasicContainer = Container.extend({
        getContainer: function (index, options) {
            return $('<div id="' + index + '">');
        }
    });

    BasicContainer.create = function (options) {
        var ret = new BasicContainer();
        if (ret.initialize(options) == false) {
            return false;
        }
        return ret;
    };

    return BasicContainer;
});