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
        'extend/ui/FlowChart'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, moment, FlowChart) {
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
            init: function () {
            },
            beforeShow: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.on('change:Time', this.refresh, this, 'Component');
                Dispatcher.on('Request.getValue' + eventName, this.getValue, this, 'Component');

                var storeName = this.options.storeName;
                Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
            },
            initChart: function () {
                var title = this.options.title;
                this.$('.caption').html('<span class="app-icon app-icon-close"></span>' + title);
            },
            showLoading:function(){

            },
            hideLoading:function(){

            },
            showNoData: function () {
                this.$('canvas').hide();
                this.$('.chart-content').append('<div class="no-data-view">No Data To Display</div>');
            },
            hideNoData: function () {
                this.$('canvas').show();
                this.$('.no-data-view').remove();
            },
            renderChart: function (data) {
                if(data.length==0){
                    this.chart.clearAll();
                    this.showNoData();
                }else{
                    this.chart.renderFull(data);
                }
            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                this.hideNoData();
                AppCube.DataRepository.fetch(storeName, stateName, this.stats).done(function (res){
                    self.renderChart(res.stats);
                });
            },
            getValue: function () {
                return this.time_unit;
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                var chartOptions = this.options.flow;
                chartOptions.renderTo = this.$('.chart-content');
                this.chart = new FlowChart(chartOptions);
                this.initChart();
                this.refresh();
            },
            refresh: function () {
                var storeName = this.options.storeName;
                this.hideNoData();
                this.showLoading();
                AppCube.DataRepository.refresh(storeName);
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.off('Request.getValue' + eventName, 'Component');
                Dispatcher.off('change:Time', 'Component');
                var storeName = this.options.storeName;
                Dispatcher.off('refresh:' + storeName, 'Component');
                var chart = this.chart;
                if (chart){
                    chart.clearAll();
                    this.chart = null;
                }
            }
        });
    });