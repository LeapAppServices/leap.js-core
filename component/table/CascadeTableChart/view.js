define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'component/table/PageTable/view',
        'jquery',
        'underscore',
        'extend/ui/AdvancedTable',
        'marionette',
        'highcharts'
    ],
    function (AppCube, U, Dispatcher, template, PageTable, $, _, AdvancedTable, Marionette) {

        return PageTable.extend({
            template: template,
            events: {
                'change .pageinate select': 'changePerpage',
                'click .page-btn>.btn': 'changePage',
                'click th.sortable': 'changeSort',
                'click .open-subtable': 'openSub',
                'click .close-subtable': 'closeSub'
            },
            init: function () {
            },
            beforeShow: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.on('Request.getValue' + eventName, this.getValue, this, 'Component');
                var storeName = this.options.storeName;
                Dispatcher.on('refresh:' + storeName, this.refreshHandler, this, 'Component');
                var subStoreName = this.options.subStoreName;
                Dispatcher.on('refresh:' + subStoreName, this.renderSubComponent, this, 'Component');
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.off('Request.getValue' + eventName, 'Component');
                var subStoreName = this.options.subStoreName;
                Dispatcher.off('refresh:' + subStoreName, 'Component');
                var storeName = this.options.storeName;
                Dispatcher.off('refresh:' + storeName, 'Component');
                this.table.destroy();
                var chart = this.$('.chart-content').highcharts();
                if (chart)chart.destroy();
            },
            getValue: function () {
                var limit = this.perpage + 1;
                var skip = (this.page - 1) * (this.perpage);
                var order = this.order;
                return {
                    limit: limit,
                    skip: skip,
                    order: order
                };
            },
            showNoData: function () {
                if(this.sub_state){
                    this.$('.no-data-view').css({'right':'0','left':'initial'}).show();
                }else{
                    this.$('.no-data-view').css({'left':'0','right':'initial'}).show();
                    this.$('.advanced-table').hide();
                }
                this.$('.pageinate').hide();
            },
            hideNoData: function () {
                if(this.sub_state){
                    this.$('.no-data-view').css({'right':'0','left':'initial'}).hide();
                }else{
                    this.$('.no-data-view').css({'left':'0','right':'initial'}).hide();
                    this.$('.advanced-table').show();
                }
                this.$('.pageinate').show();
            },
            clearSeries: function (chart) {
                if (chart.series.length != 0) {
                    do {
                        chart.series[0].remove();
                    }
                    while (chart.series.length > 0);
                }
            },
            renderSubChart: function (data) {
                this.hideLoading();
                //render
                var self = this;
                var chart = this.$('.sub-grid-content').highcharts();
                //chart.hideLoading();
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
                chart.setSize(self.$('.sub-grid-content').width(), 300);
            },
            showSubChart: function () {
                this.$('.close-subtable').show();
                this.$('.subtable').addClass('on');
            },
            hideSubGrid: function () {
                this.$('.close-subtable').hide();
                var chart = this.$('.sub-grid-content').highcharts();
                this.clearSeries(chart);
                this.$('.subtable').removeClass('on');
            },
            closeSub: function () {
                this.sub_state = false;
                //this.perpage = this.back_perpage;
                //this.$('.pageinate select').val(this.perpage);
                //this.page = this.back_page;
                //this.maxPage = this.back_max;
                this.hideSubGrid();
                //this.renderPagebar(this.back_start, this.back_end);
            },
            openSub: function (e) {
                this.sub_state = true;
//                this.back_perpage = this.perpage;
//                this.back_max = this.maxPage;
//                this.back_page = this.page;
//                this.back_start = this.pagebar.start;
//                this.back_end = this.pagebar.end;
                this.page = 1;
                this.showLoading();
                var storeName = this.options.subStoreName;
                AppCube.DataRepository.refresh(storeName, {});
                e.stopPropagation();
            },
            changePerpage: function (e) {
                if (!this.sub_state){
                    PageTable.prototype.changePerpage.call(this, e);
                }
            },
            changePage: function (e) {
                if (!this.sub_state){
                    PageTable.prototype.changePage.call(this, e);
                }
            },
            refreshHandler: function () {
                if (this.sub_state) {
                    this.closeSub();
                }
                this.page = 1;
                PageTable.prototype.renderComponent.call(this);

            },
            renderSubComponent: function (res) {
                if(!this.sub_state)return false;
                var self = this;
                var storeName = this.options.subStoreName;
                var stateName = this.options.subStateName;
                var options = this.getValue();
                AppCube.DataRepository.fetch(storeName, stateName, options).done(function (data) {
                    self.showSubChart();
                    self.renderSubChart(data);
                });
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                this.table = new AdvancedTable(this.$('.grid-content'), {}, this.options.columns, this.options.options);
                this.$('.sub-grid-content').highcharts(this.options.chart);
                this.initGrid();
                if (!this.options.static_data) {
                    this.refresh();
                } else {
                    this.renderComponent();
                }
            }
        });
    });