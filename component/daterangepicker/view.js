define(
    [
        'app',
        'Storage',
        'dispatcher',
        'marionette',
        'jquery',
        'underscore',
        'moment',
        'i18n',
        'daterangepicker'
    ],
    function (AppCube, Storage,Dispatcher, Marionette, $, _, moment,i18n) {

        return Marionette.ItemView.extend({
            beforeShow: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
            },
            renderRangerPicker: function () {
                var self = this;
                var options = $.extend(true,{},this.options.daterangepicker);
                var cache_start = Storage.get('cache_start_date');
                var cache_end = Storage.get('cache_end_date');
                var start = cache_start?cache_start:options.startDate.format('MM/DD/YY');
                var end = cache_end?cache_end:options.endDate.format('MM/DD/YY');
                if(cache_start)options.startDate = moment(cache_start,'MM/DD/YY');
                if(cache_end)options.endDate = moment(cache_end,'MM/DD/YY');
                //doI18n for daterange
                //locale
                _.forEach(options.locale,function(item,index){
                    options.locale[index] = i18n.t(item);
                });
                //label
                var range = {};
                _.forEach(options.ranges,function(item,index){
                    range[i18n.t(index)] = item;
                });
                options.ranges = range;

                this.$('.daterangepicker-parts').daterangepicker(options, function (start, end) {
                    Storage.set('cache_end_date',end.format('MM/DD/YY'));
                    Storage.set('cache_start_date',start.format('MM/DD/YY'));
                    self.$('.daterangepicker-parts>span').html(start.format(' MM/DD/YY') + ' - ' + end.format('MM/DD/YY'));
                });
                if(cache_start&&cache_end){
                    var days = options.endDate.diff(options.startDate, 'days');
                    setTimeout(function(){
                        Dispatcher.trigger('toggle:Time', days, 'Component');
                    },0)
                }
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
                var eventName = this.options.valueEventName;
                Dispatcher.off('Request.getValue:' + eventName, 'Component');
                var calendar = this.$('.daterangepicker-parts').data('daterangepicker');
                if (calendar)calendar.remove();
            }
        });
    });