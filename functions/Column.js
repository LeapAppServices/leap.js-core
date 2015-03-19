define([
    'jquery',
    'underscore',
    'slickgrid',
    'moment',
    'core/functions/Editor',
    'core/functions/ColumnFormatter'
],function($,_,Slick,moment,Editor,Formatter){
    function BasicColumn(name,option){
        this.name = name;
        this.id = name.toLowerCase();
        this.field = name;
        _.extend(this,option);
    }

    return {
        String:function(name,option){
            this.cssClass = "cell-string";
            this.editor = Editor.Text;
            this.formatter = Formatter.EmptyFormatter;
            this.sortable = true;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "String";
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">STRING</span>';
        },
        Password:function(name,option){
            this.cssClass = "cell-string";
            this.editor = Editor.Password;
            this.formatter = Formatter.PasswordFormatter;
            this.sortable = true;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "String";
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">STRING</span>';
        },
        Number:function(name,option){
            this.cssClass = "cell-number";
            this.editor = Editor.Integer;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "Number";
            this.formatter = function (row, cell, value, columnDef, dataContext) {
                if(value === ""||value == null){
                    return "<span class='light'>(undefined)</span>";
                }
                else{
                    return parseFloat(value);
                }
            }
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">NUMBER</span>';
        },
        Date:function(name,option){
            this.cssClass = "cell-date";
            this.editor = Editor.Date;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "Date";
            this.formatter = Formatter.DateFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">DATE</span>';
        },
        File:function(name,option){
            this.cssClass = "cell-file";
            this.editor = null;
            this.width = 260;
            this.maxWidth = 260;
            this.formatter = Formatter.FileFormatter;
            this.sortable = true;
            this.type = "File";
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">FILE</span>';
        },
        Boolean:function(name,option){
            this.cssClass = "cell-bool";
            this.editor = Editor.Boolean;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "Boolean";
            this.formatter = Formatter.EmptyFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">BOOLEAN</span>';
        },
        GeoPoint:function(name,option){
            this.cssClass = "cell-geopoint";
            this.editor = Editor.GeoPoint;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "GeoPoint";
            this.formatter = Formatter.GeoPointFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">GEOPOINT</span>';
        },
        Array:function(name,option){
            this.cssClass = "cell-array";
            this.editor = Editor.Array;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "Array";
            this.formatter = Formatter.JSONFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">ARRAY</span>';
        },
        Object:function(name,option){
            this.cssClass = "cell-object";
            this.editor = Editor.Object;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "Object";
            this.formatter = Formatter.JSONFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">OBJECT</span>';
        },
        Pointer:function(name,option){
            this.cssClass = "cell-pointer";
            this.editor = Editor.Pointer;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "Pointer";
            this.formatter = Formatter.PointerFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">POINTER</span>';
        },
        Relation:function(name,option){
            this.cssClass = "cell-relation";
            this.editor = null;
            this.width = 260;
            this.maxWidth = 260;
            this.type = "Relation";
            this.formatter = Formatter.RelationFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">RELATION</span>';
        },
        ACL:function(name,option){
            this.cssClass = "cell-acl";
            this.width = 260;
            this.maxWidth = 260;
            this.type = "ACL";
            this.editor = Editor.ACL;
            this.formatter = Formatter.ACLFormatter;
            this.sortable = true;
            BasicColumn.call(this,name,option);
            this.name = name + '<span class="light">ACL</span>';
        }

    }
});