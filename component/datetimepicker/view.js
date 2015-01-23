define(
    [
        'app',
        'dispatcher',
        'marionette',
        'jquery',
        'underscore',
        'moment',
        'bootstrap',
        'datetimepicker'
    ],
    function (AppCube, Dispatcher, Marionette, $, _, moment) {

        return Marionette.ItemView.extend({
            beforeShow: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.on('Request.getValue' + eventName, this.getValue, this, 'Component');
            },
            renderTimePicker: function () {
                var self = this;
                var startDate;
                this.$('.datetimepicker-parts').datetimepicker({
                    useCurrent: true,
                    pickTime:false,
                    maxDate:moment(),
                    icons:{
                        date: 'fa fa-lg fa-calendar',
                        up:   'fa fa-chevron-up',
                        down: 'fa fa-chevron-down'
                    }
                });
                startDate = moment().subtract(-(this.options.datetimepicker.start||0),'days');
                this.$('.datetimepicker-parts>span').text(startDate.format(' MM/DD/YY'));
                if(this.options.datetimepicker.start){
                    this.$('.datetimepicker-parts').data('DateTimePicker').setDate(startDate.format('MM/DD/YY'));
                }
                this.$('.datetimepicker-parts').on('dp.change',function(e){
                    self.$('.datetimepicker-parts>span').text(e.date.format(' MM/DD/YY'));
                    Dispatcher.trigger('change:Time', 0 , 'Component');
                });

            },
            getValue: function () {
                var calendar = this.$('.datetimepicker-parts').data('DateTimePicker');
                return calendar ? calendar.getDate() : null;
            },
            render: function () {
                this.$el.html('<div class="btn btn-default datetimepicker-parts pull-right">' +
                '<i class="fa fa-calendar fa-lg"></i><span></span><i class="fa fa-angle-down"></i></div>');
                this.renderTimePicker();
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.off('Request.getValue' + eventName, 'Component');
                var calendar = this.$('.datetimepicker-parts').data('DateTimePicker');
                if(calendar&&this.$('.datetimepicker-parts').is(':visible')){
                    calendar.destroy();
                }
            }
        });
    });