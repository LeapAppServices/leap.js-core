define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'marionette',
        'jquery',
        'underscore',
        'extend/ui/AdvancedTable'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, AdvancedTable) {

        return Marionette.ItemView.extend({
            template: template,
            events: {},
            init: function () {
                var storeName = this.options.storeName;
                Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
            },
            beforeShow: function () {
            },
            initGrid: function () {
                var title = this.options.title;
                this.$('.caption').html('<span class="app-icon app-icon-close"></span>' + title);
//                if(this.options.noHead == true){
//                    this.$('.portlet-title').remove();
//                }
//                if(this.options.time&&this.options.time.length>0){
//                    this.initTime(components.time);
//                }
            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                AppCube.DataRepository.fetch(storeName, stateName).done(function (res) {
                    self.renderGrid(res);
                });
            },
            showLoading: function () {
                this.$('.table-overlay').show();
            },
            hideLoading: function () {
                this.$('.table-overlay').hide();
            },
            showNoData: function () {
                this.$('.no-data-view').show();
                this.$('.advanced-table').show();
            },
            hideNoData: function () {
                this.$('.no-data-view').hide();
                this.$('.advanced-table').hide();
            },
            renderGrid: function (data) {
                this.hideLoading();
                if (!data || data.length == 0)this.showNoData();
                this.table.render(data, this.options.columns, this.options.options);
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                this.table = new AdvancedTable(this.$('.table-view'), {}, this.options.columns, this.options.options);
                this.initGrid();
                if (!this.options.static_data) {
                    this.refresh();
                } else {
                    this.renderComponent();
                }
            },
            refresh: function () {
                var storeName = this.options.storeName;
                this.showLoading();
                this.hideNoData();
                AppCube.DataRepository.refresh(storeName);
            },
            beforeHide: function () {
                this.table.destroy();
            }
        });
    });