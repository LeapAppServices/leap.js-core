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
         * name_key
         * value_key
         * valueEventName
         */

        return Marionette.ItemView.extend({
            template: _.template(template),
            events: {
                "click .dropdown-menu>.list-confirm": "clickItem",
                "click .container>ul>.list-item [type=checkbox]": "checkItem",
                "click .container>ul>li": "cancelClick",
                "click .search-input>input": "cancelClick",
                "keyup .search-input>input": "filterList",
                "click .dropdown>.btn": "focusInput"
            },
            init: function () {
                var storeName = this.options.storeName;
                Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
                var name = this.options.name_key;
                var value = this.options.value_key;
                this.childTemplate = _.template('' +
                '<li class="list-item" data-value="<%= ' + value + ' %>" data-name="<% if(typeof ' + name + '=="string"){ %><%= ' + name + ' %><% } %>) %>">' +
                '<div class="checkbox"><label><input type="checkbox">' +
                '<span><% if(typeof ' + name + '=="string"){ %><%= ' + name + ' %><% } %></span></label></div></li>');
            },
            beforeShow: function () {
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.on('Request.getValue' + eventName, this.getValue, this, 'Component');
            },
            checkItem: function (e) {
                if (!this.options.multi) {
                    var checked = e.target.checked;
                    if (checked) {
                        this.$('[type=checkbox]').each(function () {
                            if (this != e.target) {
                                this.checked = false;
                            }
                        });
                        var value = $(e.currentTarget).parents('.list-item').attr('data-value');
                        this.$('.dropdown').attr('data-value', value);
                    } else {
                        this.$('.dropdown').attr('data-value', '');
                    }
                } else {
                    var value = [];
                    this.$('[type=checkbox]').each(function () {
                        if (this.checked) {
                            value.push($(this).parents('.list-item').attr('data-value'));
                        }
                    });
                    this.$('.dropdown').attr('data-value', value);
                }
            },
            clickItem: function (e) {

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
                var eventName = this.options.valueEventName ? ':' + this.options.valueEventName : '';
                Dispatcher.off('Request.getValue' + eventName, 'Component');
            }
        });
    });