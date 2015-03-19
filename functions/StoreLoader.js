define([
    'app',
    'API',
    'underscore'
], function (AppCube, API, _) {
    var StoreLoader = {};
    StoreLoader.load = function (store_list) {
        _.forEach(store_list, function (item) {
            var name = item.name;
            if (!AppCube.DataRepository.getStore(name)) {
                var task;
                var store = item.constructor.create({
                    name: item.name,
                    generator: item.generator
                });
                _.forEach(item.state, function (callback, index) {
                    store.addState(index, callback);
                });

                if (item.task) {
                    item.taskOptions.url = API.get(item.taskOptions.url);
                    if(item.taskOptions.queryUrl){
                        item.taskOptions.queryUrl = API.get(item.taskOptions.queryUrl);
                    }
                    task = item.task.create(item.taskOptions);
                } else {
                    task = item.data || {};
                }
                store.setData(task);
                if (item.initialize) {
                    store.refreshData();
                }
            }
        });
    };

    return StoreLoader;
});