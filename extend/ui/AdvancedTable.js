define(['jquery', 'underscore','i18n'], function ($, _,i18n) {
    var defaults = {
        display_header: true,
        table_class:'',
        header_class:'',
        body_class:'',
        header_cell_class:'',
        cell_class:'',
        row_color:false
    };

    var AdvancedTable = function (renderTo, data, columns, options) {
        var params = _.extend({}, defaults, options);
        if ($(renderTo).length == 0) {
            throw new Error('AdvancedTable: 1st argument must be root');
        } else {
            this.root = $('<table class="'+params.table_class+'">' +
            '<thead class="'+params.header_class+'"></thead>' +
            '<tbody class="'+params.body_class+'"></tbody>' +
            '</table>').prependTo($(renderTo));
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
                var td = $('<td>' + content + '</td>').appendTo(row).addClass(params.cell_class);
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
            var name = params.doI18n?i18n.t(headColumn.name):headColumn.name;
            var className = headColumn.cssClass;
            var th = $('<th data-value="' + headColumn.field + '">' + name + (headColumn.sortable ? '<span class="sort-indicator"></span>' : '') + '</th>');
            if (headColumn.sortable)th.addClass('sortable');
            if (params.field == headColumn.field)th.find('.sort-indicator').addClass(params.rule > 0 ? 'asc' : 'desc');
            if (headColumn.width) {
                th.attr('width', headColumn.width);
            }
            th.appendTo(head).addClass(params.header_cell_class);
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