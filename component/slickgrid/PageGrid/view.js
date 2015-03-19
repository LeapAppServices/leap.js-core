define(
    [
        'app',
        'U',
        'dispatcher',
        'tpl!./template.html',
        'component/slickgrid/BasicGrid/view',
        'jquery',
        'underscore',
        'semanticui_dropdown'
    ],
    function (AppCube, U, Dispatcher, template, BasicGrid, $, _) {

        return BasicGrid.extend({
            template: template,
            events: {
                'click .pagination .menu>.item': 'changePerpage',
                'click .page-btn>.button': 'changePage',
                'click th.sortable': 'changeSort'
            },
            beforeShow: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
            },
            initGrid: function () {
                var title = this.options.doI18n?i18n.t(this.options.title):this.options.title;
                this.$('.caption').html('<span class="app-icon app-icon-close"></span>' + title);
                if (this.options.page && this.options.page.length > 0) {
                    this.initPage();
                }
                this.initSort();
            },
            initPage: function () {
                var page = this.options.page;
                var tmp = [];
                _.forEach(page, function (item) {
                    var node = $('<div class="item" data-value="' + item.value + '">' + item.name + '</div>');
                    tmp.push(node);
                });
                this.pagebar = {start: 1, end: 1};
                this.perpage = page[0].value;
                this.page = 1;
                this.maxPage = 1;
                this.$('.pagination .ui.dropdown>.menu').html(tmp);
                this.$('.pagination .ui.dropdown').dropdown();
                this.$('.pagination .ui.dropdown').dropdown('set selected',this.perpage);
            },
            initSort: function () {
                var self = this;
                this.grid.onSort.subscribe(function(e,args){
                    var sortCol = args.sortCol.field;
                    var sortAsc = args.sortAsc?1:-1;
                    if(sortCol){
                        self.order = {
                            rule:sortAsc,
                            field:sortCol
                        };
                        self.refresh();
                    }
                });
                this.order = this.options.order;
            },
            changePerpage: function () {
                var value = this.$('.pagination .ui.dropdown').dropdown('get value');
                this.perpage = parseInt(value);
                this.page = 1;
                if (!this.options.static_data) {
                    this.refresh();
                } else {
                    this.renderComponent();
                }
            },
            changePage: function (e) {
                if ($(e.currentTarget).hasClass('disabled'))return;
                if ($(e.currentTarget).hasClass('prev')) {
                    if (this.page > 1) {
                        $(e.currentTarget).addClass('disabled');
                        this.page--;
                        if (!this.options.static_data) {
                            this.refresh();
                        } else {
                            this.renderComponent();
                        }
                    }
                } else if ($(e.currentTarget).hasClass('next')) {
                    if (this.page < this.maxPage) {
                        $(e.currentTarget).addClass('disabled');
                        this.page++;
                        if (!this.options.static_data) {
                            this.refresh();
                        } else {
                            this.renderComponent();
                        }
                    }
                }
            },
            getValue: function (){
                var limit = this.perpage + 1;
                var skip = (this.page - 1) * (this.perpage);
                var order = this.order;
                return {
                    limit: limit,
                    skip: skip,
                    order: order
                };
            },
            renderPagebar: function (start, end) {
                this.pagebar.start = start;
                this.pagebar.end = end;
                this.$('.page-status').text(start + ' - ' + end);
                this.$('.page-btn>.button').addClass('disabled');
                if (this.maxPage > this.page) {
                    this.$('.page-btn>.next').removeClass('disabled')
                }
                if (this.page > 1) {
                    this.$('.page-btn>.prev').removeClass('disabled')
                }
            },
            renderGrid: function (data) {
                var tmp, end, next;
                this.hideLoading();
                if (!data || data.length == 0){
                    this.showNoData();
                }else{
                    this.hideLoading();
                }
                var start = (this.page - 1) * (this.perpage) + 1;
                if (data && data.length > this.perpage) {
                    this.maxPage = this.page + 1;
                    tmp = data.slice(0, -1);
                    end = start + data.length - 2;
                } else {
                    this.maxPage = this.page;
                    tmp = data;
                    end = start + data.length - 1;
                }
                this.renderPagebar(start, end);
                this.grid.setData(tmp);
                this.grid.invalidate();
            },
            showNoData: function () {
                this.$('.no-data-view').show();
                this.$('.advanced-table').hide();
                this.$('.pagination').hide();
            },
            hideNoData: function () {
                this.$('.no-data-view').hide();
                this.$('.advanced-table').show();
                this.$('.pagination').show();
            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                this.showLoading();
                var options = this.getValue();
                AppCube.DataRepository.fetch(storeName, stateName, options).done(function (res) {
                    self.renderGrid(res);
                });
            },
            beforeHide: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.off('Request.getValue:' + eventName, 'Component');
                if(this.table)this.table.destroy();
            }
        });
    });