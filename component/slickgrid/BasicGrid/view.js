define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'marionette',
        'jquery',
        'underscore',
        'slickgrid',
        'slick_rowselect',
        'slick_checkbox'
    ],
    function (AppCube, U, Dispatcher, template, Marionette, $, _, Slick) {

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
                this.$('.table-overlay').show();
            },
            hideLoading: function () {
                this.$('.table-overlay').hide();
            },
            showNoData: function () {
                this.$('.no-data-view').show();
            },
            hideNoData: function () {
                this.$('.no-data-view').hide();
            },
            renderGrid: function (data) {
                this.hideLoading();
                if (!data || data.length == 0){
                    this.showNoData();
                }else{
                    this.hideLoading();
                }
                this.grid.setData(data);
                this.grid.invalidate();
            },
            getValue:function(){
                return {};
            },
            render: function () {
                Marionette.ItemView.prototype.render.call(this);
                var columns = [],checkboxColumn;
                if(this.initColumn&&typeof this.initColumn == 'function'){
                    this.initColumn(columns,this.options.columns);
                }else{
                    columns = this.options.columns;
                }
                if(this.options.with_checkbox){
                    checkboxColumn = new Slick.CheckboxSelectColumn({cssClass: "slick-cell-checkboxsel"});
                    columns = [checkboxColumn.getColumnDefinition()].concat(columns);
                }
                this.grid = new Slick.Grid(this.$('.grid-content'),[], columns, this.options.options);
                if(this.options.with_checkbox){
                    this.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
                    this.grid.registerPlugin(checkboxColumn);
                }
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
                AppCube.DataRepository.refresh(storeName,this.getValue());
            },
            beforeHide: function () {
                this.grid.destroy();
            }
        });
    });