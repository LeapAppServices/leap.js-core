define(
    [
        'app',
        'component/highchart/BasicChart/view',
        'U',
        'dispatcher',
        'jquery',
        'underscore',
        'marionette',
        'moment',
        'highcharts',
        'datetimepicker'
    ],
    function (AppCube, BasicChart, U, Dispatcher, $, _, Marionette,moment) {
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

        return BasicChart.extend({
            events: {
                "click .tabs li": "clickTabs",
                "click .btn-group-stats>.btn": "clickStats"
            },
            initChart: function () {
                //todo
                var title = this.options.title;
                this.$('.caption').html('<span class="app-icon app-icon-close"></span>' + title);
                this.ranges = this.options.ranges;
                if (this.options.stats_list && this.options.stats_list.length > 0) {
                    this.initStats();
                }else{
                    this.stats = this.options.stats;
                }
                if (this.options.time && this.options.time.length > 0) {
                    this.initTime();
                }
            },
            renderChart: function (data) {
                var self = this;
                var chart = this.$('.chart-content').highcharts();
                chart.hideLoading();
                if (!data.dates || data.dates.length == 0) {
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
                        item.showInLegend = true;
                        var series = chart.addSeries(item);
                        series.series_type = self.options.storeName;
                    });
                }
                chart.setSize(self.$('.chart-content').width(), 300);
            },
            changeStats: function (stats) {
                //todo
                this.$('.btn-group-stats>.btn').removeClass('active');
                this.$('.btn-group-stats>.btn[data-value=' + stats + ']').addClass('active');
                this.stats = stats;
                this.refresh();
            },
            getValue: function () {
                //todo
                return {
                    time_unit:this.time_unit,
                    stats:this.stats
                };
            }
        });
    });