define(
    [
        'app',
        'dispatcher',
        'marionette',
        'jquery',
        'underscore',
        'moment',
        'bootstrap',
        'daterangepicker'
    ],
    function (AppCube, Dispatcher, Marionette, $, _, moment) {

        return Marionette.ItemView.extend({
            beforeShow: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.on('Request.getValue' + eventName, this.getValue, this, 'Component');
            },
            renderRangerPicker: function () {
                var self = this;
                var options = this.options.daterangepicker;
                var start = options.startDate.format('MM/DD/YY');
                var end = options.endDate.format('MM/DD/YY');
                this.$('.daterangepicker-parts').daterangepicker();
                var calendar = this.$('.daterangepicker-parts').data('daterangepicker');
                calendar.setOptions(options, function (start, end) {
                    self.$('.daterangepicker-parts>span').html(start.format(' MM/DD/YY') + ' - ' + end.format('MM/DD/YY'));
                });
                this.$('.daterangepicker-parts>span').html(' ' + start + ' - ' + end);
                this.$('.daterangepicker-parts').on('apply.daterangepicker', function (ev, picker) {
                    var days = picker.endDate.diff(picker.startDate, 'days');
                    Dispatcher.trigger('change:Time', days, 'Component');
                });
            },
            getValue: function () {
                var calendar = this.$('.daterangepicker-parts').data('daterangepicker');
                return calendar ? calendar : null;
            },
            render: function () {
                this.$el.html('<div class="btn btn-default daterangepicker-parts pull-right">' +
                '<i class="fa fa-calendar fa-lg"></i><span></span><i class="fa fa-angle-down"></i></div>');
                this.renderRangerPicker();
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.off('Request.getValue' + eventName, 'Component');
                var calendar = this.$('.daterangepicker-parts').data('daterangepicker');
                if (calendar)calendar.remove();
            }
        });
    });