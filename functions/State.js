define(['underscore', 'jquery'], function (_, $) {


    return {
        page: function (data, options) {
            if (!_.isArray(data))return [];
            var tmp;
            var skip = options.skip;
            var limit = options.limit;
            var order = options.order;
            if (order) {
                tmp = _.sortBy(data, function (item) {
                    return item[order.field];
                });

                if (order.rule < 0) {
                    tmp = tmp.reverse();
                }
            } else {
                tmp = data
            }
            return tmp.slice(skip, skip + limit);
        }
    }
});