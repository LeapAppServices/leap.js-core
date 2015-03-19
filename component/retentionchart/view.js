define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'marionette',
        'jquery',
        'underscore',
        'moment',
        'extend/ui/RetentionChart',
        'i18n'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, moment, RetentionChart, i18n) {
        /**
         * title
         * ranges
         * tabs
         * time
         * stats
         * options (highchart options)
         * compared
         * maxLength
         * storeName
         * stateName
         * valueEventName
         */

        return Marionette.ItemView.extend({
            template: template,
            events: {
                "click .tabs li": "clickTabs",
                "click .btn-group-stats>.btn": "clickStats"
            },
            init: function () {
                var storeName = this.options.storeName;
                Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
            },
            beforeShow: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.on('change:Time', this.setTimeUnit, this, 'Component');
                Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
            },
            initChart: function () {
                var title = this.options.doI18n?i18n.t(this.options.title):this.options.title;
                this.$('.caption').html('<span class="app-icon app-icon-close"></span>' + title);
                this.ranges = this.options.ranges;
                if (this.options.time && this.options.time.length > 0) {
                    this.initTime();
                }
                if (this.options.timerange && this.options.timerange.length > 0) {
                    this.initTimeRange();
                }
            },
            initTime: function () {
                var times = this.options.time;
                var self = this;
                var default_time_unit = this.options.default_time_unit;
                this.time_unit = times[default_time_unit || 0].value;
                _.forEach(times, function (time, index) {
                    var timeName = self.options.doI18n?i18n.t(time.name):time.name;
                    self.$('.tabs>.nav').append('<li class="' + (index == default_time_unit ? 'active' : '') + '" data-value="' + time.value + '">' +
                        '<a href="javascript:void(0)">' + timeName + '</a></li>');
                });
                if (this.setTimeUnit)this.setTimeUnit(this.ranges, true);
            },
            initTimeRange:function (){
                var times = this.options.timerange;
                var self = this;
                var default_time_unit = this.options.default_time_unit;
                this.time_unit = times[default_time_unit || 0].value;
                _.forEach(times, function (time, index) {
                    var node = $('<li class="' + (index == default_time_unit ? 'active' : '') +
                        '<a href="javascript:void(0)">' + time.name + '</a></li>');
                    node.attr('data-value',JSON.stringify(time.value));
                    self.$('.tabs>.nav').append(node);
                });
            },
            setTimeUnit: function (length, refresh) {
                var self = this;
                var times = this.options.time;
                var time_unit = this.time_unit;
                var days = length;
                this.ranges = days;
                this.$('.tabs li').addClass('disabled');
                var prev = "";
                for (var i in times) {
                    var time = times[i];
                    if (days >= time.length - 1) {
                        prev = time.value;
                        self.$('.tabs li[data-value=' + time.value + ']').removeClass('disabled');
                    } else {
                        var node = self.$('.tabs li[data-value=' + time_unit + ']');
                        if (node.hasClass('disabled'))time_unit = prev;
                        break;
                    }
                }
                if (!refresh)this.changeTimeUnit(time_unit);
            },
            clickTabs: function (e) {
                if ($(e.currentTarget).hasClass('disabled'))return;
                var time_unit = $(e.currentTarget).attr('data-value');
                this.changeTimeUnit(time_unit)
            },
            changeTimeUnit: function (time_unit) {
                this.$('.tabs li').removeClass('active');
                this.$('.tabs li[data-value=' + time_unit + ']').addClass('active');
                this.time_unit = time_unit;
                this.refresh();
            },
            showLoading: function () {
                this.$('.view-placeholder').addClass('show');
                this.$('.view-placeholder>.loading-view').show();
            },
            hideLoading: function () {
                this.$('.view-placeholder').removeClass('show');
                this.$('svg').show();
                this.$('.view-placeholder>.loading-view').hide();
            },
            showNoData: function () {
                this.$('.view-placeholder').addClass('show');
                this.$('svg').hide();
                this.$('.view-placeholder>.no-data-view').show();
            },
            hideNoData: function () {
                this.$('.view-placeholder').removeClass('show');
                this.$('.view-placeholder>.no-data-view').hide();
            },
            renderChart: function (data) {
                this.hideLoading();
                if(!data||data.stats.length==0){
                    this.showNoData();
                }else{
                    this.hideNoData();
                    this.chart.setData(data.stats);
                    this.chart.setRange(this.time_unit);
                    this.chart.render();
                }
            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                AppCube.DataRepository.fetch(storeName, stateName, this.stats).done(function (res){
                    self.renderChart(res);
                });
            },
            getValue: function () {
                return this.time_unit;
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                this.$el.i18n();
                var chartOptions = this.options.retention;
                chartOptions.height = (length+1)*32;
                chartOptions.renderTo = '.chart-content';
                chartOptions.date_width = 150;
                chartOptions.data = [];
                chartOptions.grid.width = 100;
                chartOptions.width = 100*31+150;
                this.chart = new RetentionChart(chartOptions);
                this.initChart();
                this.refresh();
            },
            refresh: function () {
                var storeName = this.options.storeName;
                this.showLoading();
                AppCube.DataRepository.refresh(storeName);
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.off('Request.getValue:' + eventName, 'Component');
                Dispatcher.off('change:Time', 'Component');
                var chart = this.chart;
                if (chart){
                    chart.destroy();
                    this.chart = null;
                }
            }
        });
    });