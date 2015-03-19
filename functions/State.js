define(['underscore', 'jquery'], function (_, $) {


    return {
        page: function (data, options) {
            if (!_.isArray(data))return [];
            var tmp;
            var skip = options.skip;
            var limit = options.limit;
            var order = options.order;
            var sort_field = order.field||data.sort_key||false;
            if (sort_field) {
                tmp = _.sortBy(data, function (item) {
                    return item[sort_field];
                });
                var sort_rule = order.rule||-1;
                if (sort_rule < 0) {
                    tmp = tmp.reverse();
                }
            } else {
                tmp = data
            }
            return tmp.slice(skip, skip + limit);
        }
    }
});