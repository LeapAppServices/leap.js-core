define([
    'dispatcher',
    'marionette',
    'jquery',
    'underscore',
    'i18n'
], function (Dispatcher, Marionette, $, _) {
    return Marionette.ItemView.extend({
        template: _.template('<div class="ui button"></div>'),
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
            if (this.options.content)this.$('.ui.button').html(this.options.content);
            if (this.options.className)this.$('.ui.button').addClass(this.options.className);
            this.$el.i18n();
        },
        beforeHide: function () {

        }
    });
});