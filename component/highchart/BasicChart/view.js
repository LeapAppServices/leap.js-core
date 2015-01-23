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
        'highcharts',
        'datetimepicker'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, moment) {
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
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.on('change:Time', this.setTimeUnit, this, 'Component');
                Dispatcher.on('Request.getValue' + eventName, this.getValue, this, 'Component');
            },
            initChart: function () {
                var title = this.options.title;
                this.$('.caption').html('<span class="app-icon app-icon-close"></span>' + title);
                this.ranges = this.options.ranges;
                if (this.options.compared) {
                    this.initCompare();
                }
                if (this.options.stats_list && this.options.stats_list.length > 0) {
                    this.initStats();
                }else{
                    this.stats = this.options.stats;
                }
                if (this.options.time && this.options.time.length > 0) {
                    this.initTime();
                }
                if (this.options.timerange && this.options.timerange.length > 0) {
                    this.initTimeRange();
                }
            },
            initCompare: function () {
                var self = this;
                this.$('.portlet-title').after('' +
                '<div class="btn btn-compare btn-default">' +
                '<i class="app-icon-sm app-icon-compare"></i>' +
                'Compare</div>');
                this.$('.btn-compare').datetimepicker({
                    useCurrent: true,
                    pickTime: false,
                    maxDate: moment(),
                    icons: {
                        date: 'fa fa-lg fa-calendar',
                        up: 'fa fa-chevron-up',
                        down: 'fa fa-chevron-down'
                    }
                });
                this.$('.btn-compare').on("dp.change", function (e) {
                    self.addSeries(e.date);
                });
            },
            initStats: function () {
                var stats = this.options.stats_list;
                var node = $('<div class="btn-group btn-group-stats"></div>');
                _.forEach(stats, function (tab) {
                    node.append('<div class="btn btn-default" data-value="' +
                    tab.stats + '">' + tab.name + '</div>');
                });
                this.stats = this.options.stats;
                node.children().first().addClass('active');
                this.$('.portlet-title').after(node);
            },
            initTime: function () {
                var times = this.options.time;
                var self = this;
                var default_time_unit = this.options.default_time_unit;
                this.time_unit = times[default_time_unit || 0].value;
                _.forEach(times, function (time, index) {
                    self.$('.tabs>.nav').append('<li class="' + (index == default_time_unit ? 'active' : '') + '" data-value="' + time.value + '">' +
                    '<a href="javascript:void(0)">' + time.name + '</a></li>');
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
                if (days > 7) {
                    self.$('.tabs li[data-value=hourly]').addClass('disabled');
                    if (time_unit == 'hourly')time_unit = 'daily';
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
            clickStats: function (e) {
                if ($(e.currentTarget).hasClass('disabled'))return;
                var stats = $(e.currentTarget).attr('data-value');
                this.changeStats(stats);
            },
            //todo change Stats
            changeStats: function (stats) {
                this.$('.btn-group-stats>.btn').removeClass('active');
                this.$('.btn-group-stats>.btn[data-value=' + stats + ']').addClass('active');
                this.stats = stats;
                this.renderComponent();
            },
            showNoData: function () {
                this.$('svg').hide();
                this.$('.chart-view').append('<div class="no-data-view">No Data To Display</div>');
            },
            hideNoData: function () {
                this.$('svg').show();
                this.$('.no-data-view').remove();
            },
            clearSeries: function (chart) {
                if (chart.series.length != 0) {
                    do {
                        chart.series[0].remove();
                    }
                    while (chart.series.length > 0);
                }
            },
            addSeries: function (end_moment) {
                var self = this;
                var stats = this.options.stats;
                var storeName = this.options.storeName;
                var chart = self.$('.chart-content').highcharts();
                this.hideNoData();
                chart.showLoading();
                AppCube.DataRepository.fetchNew(storeName, {
                    end_date: end_moment,
                    is_compared: true
                }).done(function (res) {
                    var data;
                    var stateFormatter = self.options.stateFormatter;
                    if(typeof stateFormatter=='function'){
                        data = stateFormatter(res,stats);
                    }else{
                        var tmp = [];
                        for(var index in res.stats){
                            tmp.push(res.stats[index][stats]);
                        }
                        data = {
                            dates:res.dates,
                            is_compared:res.is_compared,
                            stats:[{
                                data:tmp,
                                name:res.chart_name||'name'
                            }]
                        };
                    }
                    //todo merge 2 axis
                    if(chart && chart.hideLoading)
                        chart.hideLoading();
                    if (data.is_compared && data.stats.length) {
                        if (chart.series && chart.series[0]) {
                            chart.series[0].options.showInLegend = true;
                        }
                        var series = chart.addSeries(data.stats[0]);
                        series.series_type = storeName;
                    } else {
                        console.log('No compared data');
                    }
                });
            },
            renderChart: function (data) {
                var self = this;
                var chart = this.$('.chart-content').highcharts();
                chart.hideLoading();
                if (!data.dates || data.dates.length == 0||_.values(data.dates).length==0) {
                    chart.options.legend.enabled = true;
                    this.clearSeries(chart);
                    this.showNoData();
                    return;
                } else {
                    this.clearSeries(chart);
                    //calculate interval
                    var length = _.isArray(data.dates)?data.dates.length:_.values(data.dates).length;
                    var maxlength = this.options.maxlength || 15;
                    var tick = 1;
                    if (length > maxlength) {
                        tick = Math.floor(length / maxlength);
                    }
                    //calculate date
                    chart.xAxis[0].setCategories(U.formatAxis(data.dates));
                    chart.xAxis[0].update({
                        tickInterval: tick
                    });
                    _.forEach(data.stats, function (item) {
                        item.showInLegend = self.options.showLegend || (data.stats.length > 1);
                        var series = chart.addSeries(item);
                        series.series_type = self.options.storeName;
                    });
                }
                chart.setSize(self.$('.chart-content').width(), 300);
            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                var chart = this.$('.chart-content').highcharts();
                this.hideNoData();
                if(chart){
                    chart.colorCounter = 0;
                    chart.showLoading();
                }
                AppCube.DataRepository.fetch(storeName, stateName, this.stats).done(function (res) {
                    self.renderChart(res);
                });
            },
            getValue: function () {
                return this.time_unit;
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                this.$('.chart-content').highcharts(this.options.options);
                this.initChart();
                this.refresh();
            },
            refresh: function () {
                var chart = this.$('.chart-content').highcharts();
                var storeName = this.options.storeName;
                this.hideNoData();
                if (chart)chart.showLoading();
                AppCube.DataRepository.refresh(storeName);
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.off('Request.getValue' + eventName, 'Component');
                Dispatcher.off('change:Time', 'Component');
                var chart = this.$('.chart-content').highcharts();
                if (chart)chart.destroy();
                this.$('.btn-compare').each(function (index, item) {
                    var dtp = $(item).data('DateTimePicker');
                    if (dtp) {
                        dtp.destroy();
                    }
                });
            }
        });
    });