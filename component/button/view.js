define([
    'dispatcher',
    'marionette',
    'jquery',
    'underscore'
], function (Dispatcher, Marionette, $, _) {
    return Marionette.ItemView.extend({
        template: _.template('<div class="btn"></div>'),
        events: {
            "click .btn": "clickItem"
        },
        init: function () {
        },
        beforeShow: function () {

        },
        getValue: function () {
            return this.options.value ? this.options.value : this.options.content;
        },
        clickItem: function (e) {
            if (this.options.valueEventName) {
                Dispatcher.trigger('Click:' + this.options.valueEventName, {}, 'Component');
            }
        },
        render: function () {
            Marionette.ItemView.prototype.render.call(this);
            if (this.options.content)this.$('.btn').html(this.options.content);
            if (this.options.className)this.$('.btn').addClass(this.options.className);
        },
        beforeHide: function () {

        }
    });
});