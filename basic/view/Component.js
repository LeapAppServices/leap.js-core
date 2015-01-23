define(
    [
        'app',
        'dispatcher',
        'marionette',
        'jquery',
        'underscore'
    ],
    function (AppCube, Dispatcher, Marionette, $, _) {

        return Marionette.ItemView.extend({
            init: function () {
                var storeName = this.options.storeName;
                Dispatcher.on('refresh:' + storeName, this.renderComponent, this, 'Component');
                Dispatcher.on('Request.getValue', this.getValue, this, 'Dropdown');
            },
            showNoData: function () {
                console.log('show no data');
            },
            hideNoData: function () {
                console.log('hide no data');
            },
            showLoading: function () {
                console.log('show loading');
            },
            hideLoading: function () {
                console.log('hide loading');
            },
            getValue: function () {

            },
            refresh: function () {
                var storeName = this.options.storeName;
                AppCube.DataRepository.refresh(storeName);
            },
            destroy: function () {
                Dispatcher.off('Request.getValue', 'Dropdown');
            }
        });
    });