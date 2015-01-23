define([
    'app',
    'dispatcher',
    'U',
    'container/BasicContainer',
    'text!./template.html',
    'jquery',
    'underscore'
], function (AppCube, Dispatcher, U, BasicContainer, template, $, _) {

    var defaults = ['template', 'root', 'name', 'title'];

    var Container = BasicContainer.extend({
        events: {
            "click .container-elastic-head>.close": "closeContainer"
        },
        _configure: function (options) {
            if (this.options) options = _.extend({}, _.result(this, 'options'), options);
            if (options.events) {
                this.events = _.extend({}, this.events || {}, options.events);
            }
            this.options = _.pick(options, defaults);
        },
        closeContainer: function () {
            this._containerRoot.removeClass('active');
        },
        openContainer: function (options) {
            this.type = options.type;
            this._containerRoot.addClass('active');
        },
        delegateEvents: function () {
            BasicContainer.prototype.delegateEvents.call(this);
            Dispatcher.on('Request.getValue:SVType', this.getValue, this, this.options.name);
            Dispatcher.on('Open:' + this.options.name, this.openContainer, this, 'ElasticContainer');
            Dispatcher.on('Close:' + this.options.name, this.closeContainer, this, 'ElasticContainer');
        },
        undelegateEvents: function () {
            BasicContainer.prototype.undelegateEvents.call(this);
            Dispatcher.off('Request.getValue:SVType', this.options.name);
            Dispatcher.off('Open:' + this.options.name, 'ElasticContainer');
            Dispatcher.off('Close:' + this.options.name, 'ElasticContainer');
        },
        getValue: function () {
            return this.type;
        },
        render: function (stateRoot, options) {
            BasicContainer.prototype.render.call(this, stateRoot, options);
            this._containerRoot.find('.container-elastic-head>h4').text(this.options.title);
        }
    });

    Container.create = function (options) {
        var ret = new Container();
        options.template = template;
        options.root = '.container-elastic-body';
        if (ret.initialize(options) == false) {
            return false;
        }
        return ret;
    };

    return Container;
});