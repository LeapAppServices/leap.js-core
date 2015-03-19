define(
    [
        'app',
        'dispatcher',
        'text!./template.html',
        'marionette',
        'jquery',
        'underscore',
        'bootstrap'
    ],
    function (AppCube, Dispatcher, template, Marionette, $, _) {
        /**
         * storeName
         * stateName
         * search_key
         * search_info
         * default_info
         * no_data_info
         * childTemplate
         * valueEventName
         */

        return Marionette.ItemView.extend({
            template: _.template(template),
            events: {
                "click .container>ul>.list-item": "clickItem",
                "click .search-input>input": "cancelClick",
                "keyup .search-input>input": "filterList",
                "click .dropdown>.btn": "focusInput"
            },
            init: function () {
                var storeName = this.options.storeName;
                this.childTemplate = _.template(this.options.childTemplate || '');
                Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
            },
            beforeShow: function () {
                var eventName = this.options.valueEventName;
                Dispatcher.on('Request.getValue:' + eventName, this.getValue, this, 'Component');
            },
            clickItem: function (e) {
                var value = $(e.currentTarget).attr('data-value');
                var name = $(e.currentTarget).attr('data-name');
                this.setValue(value, name);
            },
            cancelClick: function (e) {
                e.stopPropagation();
            },
            focusInput: function () {
                var self = this;
                setTimeout(function () {
                    self.$('.search-input>input').focus();
                }, 0);
            },
            filterList: function (e) {
                var self = this;
                if (this.onInterval) {
                    clearTimeout(this.onInterval);
                }
                this.onInterval = setTimeout(function () {
                    self.filterListHandler(e);
                }, 200);
            },
            filterListHandler: function (e) {
                var value = $(e.currentTarget).val();
                this.$('.container>ul>.list-msg').hide();
                this.$('.container>ul>.list-item').show();
                var length = 0;
                if (value) {
                    this.$('.container>ul>.list-item').each(function () {
                        var name = $(this).attr('data-name').toLowerCase();
                        if (name.indexOf(value.toLowerCase()) == -1) {
                            $(this).hide();
                        } else {
                            length++;
                        }
                    });
                }
                if (length <= 0 && value != "") {
                    this.showNoData();
                }
            },
            renderDropdown: function (data) {
                var root = this.$('.container>ul');
                root.find('.list-item').remove();
                var tmp = [];
                var template = this.childTemplate;
                _.forEach(data, function (item) {
                    var li = $(template(item)).addClass('list-item');
                    tmp.push(li);
                });
                root.append(tmp);
            },
            showNoData: function () {
                this.$('.container>ul>.list-msg').show();
            },
            hideNoData: function () {
                this.$('.container>ul>.list-msg').hide();
            },
            showLoading: function () {

            },
            hideLoading: function () {

            },
            renderComponent: function () {
                var self = this;
                var storeName = this.options.storeName;
                var stateName = this.options.stateName;
                this.hideNoData();
                this.showLoading();
                AppCube.DataRepository.fetch(storeName, stateName).done(function (res) {
                    self.renderDropdown(res);
                });
            },
            setValue: function (value, name) {
                this.$('.dropdown').attr('data-value', value);
                this.$('.dropdown>.btn>span').text(name);
            },
            getValue: function () {
                return this.$('.dropdown').attr('data-value');
            },
            render: function () {
                this.$el.html(this.template(this.options));
                this.refresh();
            },
            refresh: function () {
                this.$('.dropdown').attr('data-value', '');
                var storeName = this.options.storeName;
                AppCube.DataRepository.refresh(storeName);
            },
            beforeHide: function () {
                this.$('.dropdown').attr('data-value', '');
                var eventName = this.options.valueEventName;
                Dispatcher.off('Request.getValue:' + eventName, 'Component');
            }
        });
    });