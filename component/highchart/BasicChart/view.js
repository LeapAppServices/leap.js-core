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
        'i18n',
        'highcharts',
        'datetimepicker'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, moment,i18n) {
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
                Dispatcher.on('toggle:Time', this.setDefaultTimeUnit, this, 'Component');
                Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.off('Request.getValue:' + eventName, 'Component');
                Dispatcher.off('change:Time', 'Component');
                Dispatcher.off('toggle:Time', 'Component');
                var chart = this.$('.chart-content').highcharts();
                if (chart)chart.destroy();
                this.$('.btn-compare').each(function (index, item) {
                    var dtp = $(item).data('DateTimePicker');
                    if (dtp) {
                        dtp.destroy();
                    }
                });
            },
            initChart: function () {
                var title = this.options.doI18n?i18n.t(this.options.title):this.options.title;
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
                '<i class="app-icon-sm app-icon-compare"></i>' + i18n.t('analytics.tag.compare') +
                '</div>');
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
                var self = this;
                var stats = this.options.stats_list;
                var node = $('<div class="btn-group btn-group-stats"></div>');
                _.forEach(stats, function (tab) {
                    var tabName = self.options.doI18n?i18n.t(tab.name):tab.name;
                    node.append('<div class="btn btn-default" data-value="' +
                    tab.stats + '">' + tabName + '</div>');
                });
                this.stats = this.options.stats;
                node.children().first().addClass('active');
                this.$('.portlet-title').after(node);
            },
            initTime: function () {
                var self = this;
                var times = this.options.time;
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
                var self = this;
                var times = this.options.timerange;
                var default_time_unit = this.options.default_time_unit;
                this.time_unit = times[default_time_unit || 0].value;
                _.forEach(times, function (time, index) {
                    var timeName = self.options.doI18n?i18n.t(time.name):time.name;
                    var node = $('<li class="' + (index == default_time_unit ? 'active' : '') +
                        '<a href="javascript:void(0)">' + timeName + '</a></li>');
                    node.attr('data-value',JSON.stringify(time.value));
                    self.$('.tabs>.nav').append(node);
                });
            },
            setDefaultTimeUnit: function(length){
                var time_unit = this.setTimeUnit(length,true);
                this.$('.tabs li').removeClass('active');
                this.$('.tabs li[data-value=' + time_unit + ']').addClass('active');
                this.time_unit = time_unit;
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
                return time_unit;
            },
            clickTabs: function (e) {
                if ($(e.currentTarget).hasClass('disabled'))return;
                var time_unit = $(e.currentTarget).attr('data-value');
                this.changeTimeUnit(time_unit);
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
            changeStats: function (stats) {
                this.$('.btn-group-stats>.btn').removeClass('active');
                this.$('.btn-group-stats>.btn[data-value=' + stats + ']').addClass('active');
                this.stats = stats;
                this.renderComponent();
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
            clearSeries: function (chart) {
                if (chart&&chart.series.length != 0) {
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
                this.showLoading();
                AppCube.DataRepository.fetchNew(storeName, {
                    end_date: end_moment,
                    is_compared: true
                }).done(function (res) {
                    self.hideLoading();
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
                    if (data.is_compared && data.stats.length) {
                        self.hideNoData();
                        if (chart.series && chart.series[0]) {
                            chart.series[0].options.showInLegend = true;
                        }
                        var series = chart.addSeries(data.stats[0]);
                        series.series_type = storeName;
                    } else {
                        self.showNoData();
                        console.log('No compared data');
                    }
                });
            },
            renderChart: function (data) {
                var self = this;
                var chart = this.$('.chart-content').highcharts();
                if(!chart)return;
                this.hideLoading();
                if (!data.dates || data.dates.length == 0||_.values(data.dates).length==0) {
                    chart.options.legend.enabled = true;
                    this.clearSeries(chart);
                    this.showNoData();
                    return;
                } else {
                    this.hideNoData();
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
                this.showLoading();
                if(chart)chart.colorCounter = 0;
                AppCube.DataRepository.fetch(storeName, stateName, this.stats).done(function (res) {
                    self.renderChart(res);
                });
            },
            getValue: function () {
                return this.time_unit;
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                this.$el.i18n();
                this.$('.chart-content').highcharts(this.options.options);
                this.initChart();
                this.refresh();
            },
            refresh: function () {
                var storeName = this.options.storeName;
                this.showLoading();
                Dispatcher.trigger('startRefresh:'+storeName,{},'Component');
                AppCube.DataRepository.refresh(storeName);
            }
        });
    });