define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'marionette',
        'jquery',
        'underscore',
        'extend/ui/AdvancedTable',
        'i18n'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, AdvancedTable,i18n) {

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
                var title = this.options.doI18n?i18n.t(this.options.title):this.options.title;
                this.$('.caption').html('<span class="app-icon app-icon-close"></span>' + title);
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
                this.$('.view-placeholder').addClass('show');
                this.$('.view-placeholder>.loading-view').show();
            },
            hideLoading: function () {
                this.$('.view-placeholder').removeClass('show');
                this.$('.view-placeholder>.loading-view').hide();
            },
            showNoData: function () {
                this.$('.view-placeholder').addClass('show relative');
                this.$('.view-placeholder>.no-data-view').show();
            },
            hideNoData: function () {
                this.$('.view-placeholder').removeClass('show relative');
                this.$('.view-placeholder>.no-data-view').hide();
            },
            renderGrid: function (data) {
                this.hideLoading();
                if (!data || data.length == 0){
                    this.showNoData();
                }else{
                    this.hideNoData();
                }
                this.table.render(data, this.options.columns, this.options.options);
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                this.table = new AdvancedTable(this.$('.table-view'), {}, this.options.columns, this.options.options);
                this.initGrid();
                this.$el.i18n();
                if (!this.options.static_data) {
                    this.refresh();
                } else {
                    this.renderComponent();
                }
            },
            refresh: function () {
                var storeName = this.options.storeName;
                this.showLoading();
                AppCube.DataRepository.refresh(storeName);
            },
            beforeHide: function () {
                if(this.table)this.table.destroy();
            }
        });
    });