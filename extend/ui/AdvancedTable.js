define(['jquery', 'underscore'], function ($, _) {
    var defaults = {
        display_header: true
    };

    var AdvancedTable = function (renderTo, data, columns, options) {
        var params = _.extend({}, defaults, options);
        if ($(renderTo).length == 0) {
            throw new Error('AdvancedTable: 1st argument must be root');
        } else {
            this.root = $('<table class="advanced-table">' +
            '<thead class="advanced-table-header"></thead>' +
            '<tbody class="advanced-table-body"></tbody>' +
            '</table>').appendTo($(renderTo));
            this.render(data, columns, params);
        }

    };

    AdvancedTable.prototype.render = function (data, columns, options) {
        var params = _.extend({}, defaults, options);
        var root = this.root;
        var head = root.children('thead');
        var body = root.children('tbody');
        head.html('');
        body.html('');
        if (params.display_header) {
            this.renderHead(columns, params);
        }
        this.renderBody(data, columns, params);
    };

    AdvancedTable.prototype.renderBody = function (data, columns, params) {
        var body = this.root.children('tbody');
        for (var rid in data) {
            var d = data[rid];
            var row = $('<tr></tr>').appendTo(body);
            if (params.row_color) {
                var orderClass = (rid % 2 == 0) ? 'even' : 'odd';
                row.addClass(orderClass);
            }
            for (var cid in columns) {
                var columnOptions = columns[cid];
                var field = columnOptions.field;
                var className = columnOptions.cssClass;
                var formatter = columnOptions.formatter;

                var content = formatter ? formatter(rid, cid, d[field], columnOptions, d) : d[field];
                var td = $('<td>' + content + '</td>').appendTo(row).addClass('advanced-table-cell');
                if (className)td.addClass(className);
            }
        }
    };

    AdvancedTable.prototype.clearBody = function () {
        var body = this.root.children('tbody');
        body.html('');
    };

    AdvancedTable.prototype.renderHead = function (columns, params) {
        var head = this.root.children('thead');
        for (var cid in columns) {
            var headColumn = columns[cid];
            var name = headColumn.name;
            var className = headColumn.cssClass;
            var th = $('<th data-value="' + headColumn.field + '">' + name + (headColumn.sortable ? '<span class="sort-indicator"></span>' : '') + '</th>');
            if (headColumn.sortable)th.addClass('sortable');
            if (params.field == headColumn.field)th.find('.sort-indicator').addClass(params.rule > 0 ? 'asc' : 'desc');
            if (headColumn.width) {
                th.attr('width', headColumn.width);
            }
            th.appendTo(head).addClass('advanced-table-header-cell');
            if (className)th.addClass(className);
        }
    };


    AdvancedTable.prototype.destroy = function () {
        var root = this.root;
        var head = root.children('thead');
        var body = root.children('tbody');
        head.html('');
        body.html('');
    };

    return AdvancedTable;
});