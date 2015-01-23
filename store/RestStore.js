define([
    'data/Store',
    'data/Task',
    'Q',
    'underscore'
], function (Store, Task, Q, _) {
    var RestStore = Store.extend({
        getDataById: function (id) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var type = this._origin_data.type;
            if (type == 'data') {
                var item = _.find(task, function (o) {
                    return o.id == id;
                });
                defer.resolve(item);
            } else {
                var url = task.options.url + '/' + id;
                Task.create({
                    url: url
                }).start().done(function (res) {
                    defer.resolve(res);
                });
            }
            return defer.promise;
        },
        addData: function (options) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var type = this._origin_data.type;
            if (type == 'data') {
                throw new Error('RestStore: "add" static data to be implement');
            } else {
                var tmp_task = Task.create({
                    url: task.options.url,
                    method: 'post',
                    params: options
                });
                tmp_task.start().done(function (res) {
                    if (tmp_task.state != 3) {
                        defer.resolve(res);
                    } else {
                        defer.reject(res);
                    }
                });
            }
            return defer.promise;
        },
        deleteData: function (id) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var type = this._origin_data.type;
            if (type == 'data') {
                throw new Error('RestStore: "delete" static data to be implement');
            } else {
                var url = task.options.url + '/' + id;
                var tmp_task = Task.create({
                    url: url,
                    method: 'delete'
                });
                tmp_task.start().done(function (res) {
                    if (tmp_task.state != 3) {
                        defer.resolve(res);
                    } else {
                        defer.reject(res);
                    }
                });
            }
            return defer.promise;
        },
        updateData: function (id, options) {
            var task = this._origin_data.data;
            var defer = Q.defer();
            var type = this._origin_data.type;
            if (type == 'data') {
                var item = _.find(task, function (o) {
                    return o.id == id;
                });
                _.extend(item, options);
                //todo
                defer.resolve(item);
            } else {
                var url = task.options.url + '/' + id;
                var tmp_task = Task.create({
                    url: url,
                    method: 'put',
                    params: options
                });
                tmp_task.start().done(function (res) {
                    if (tmp_task.state != 3) {
                        defer.resolve(res);
                    } else {
                        defer.reject(res);
                    }
                });
            }
            return defer.promise;
        }
    });

    RestStore.create = function (options) {
        var ret = new RestStore();
        if (ret.initialize(options || {}) == false) {
            return false;
        }
        return ret;
    };

    return RestStore;
});