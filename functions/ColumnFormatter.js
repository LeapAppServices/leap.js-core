define([
    'moment'
],function(moment){
    return {
        EmptyFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||typeof value == "object"){
                return "<span class='light'>(undefined)</span>";
            }
            else{
                return value;
            }
        },
        PasswordFormatter:function(row, cell, value, columnDef, dataContext){
            return "<span>(hidden)</span>";
        },
        PointerFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null||typeof value.className == 'undefined'){
                return "<span class='light'>(undefined)</span>";
            }
            else{
                return '<div class="wrapper"><a href="#classes/'+value.className+'/'+value.objectId+'">'+value.objectId+'</a></div>';
            }
        },
        RelationFormatter:function (row, cell, value, columnDef, dataContext){
            var oid = dataContext.objectId;
            var className = columnDef.className;
            if(typeof oid == "undefined"||oid == null){
                return '<div class="wrapper"><a href="javascript:void(0)">Add Relations</a></div>';
            }
            else{
                return '<div class="wrapper"><a href="#relation/'+className+'/'+dataContext.objectId+'/'+columnDef.field+'">View Relations</a></div>';
            }
        },
        JSONFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null){
                return "<span class='light'>(undefined)</span>";
            }
            else{
                return JSON.stringify(value);
            }
        },
        ACLFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null){
                return "<div class='btn btn-sm btn-default btn-edit'>Edit</div>";
            }
            else{
                return JSON.stringify(value)+"<div class='btn btn-sm btn-default btn-edit'>Edit</div>";
            }
        },
        DateFormatter:function(row, cell, value, columnDef, dataContext) {
            if(typeof value == "undefined"||value == null|| typeof value.iso == "undefined"){
                return "<span class='light'>(undefined)</span>";
            }
            else{
                var iso = value.iso?value.iso:value;
                return moment(iso.substring(0,iso.length-5)).format("MM/DD/YY hh:mm:ss");
            }
        },
        FixedDateFormatter:function(row, cell, value, columnDef, dataContext){
            if(typeof value == "undefined"||value == null){
                return "<span class='light'>(undefined)</span>";
            }
            else{
                var iso = value;
                return moment(iso.substring(0,iso.length-5)).format("MM/DD/YY hh:mm:ss");
            }
        },
        FileFormatter:function(row, cell, value, columnDef, dataContext) {
            if(typeof value == "undefined"||value == null||!value.url){
                return "<div class='btn btn-sm btn-default btn-upload'>Upload</div>" +
                    "<input type='file' style='display:none'/>" +
                    "<div class='progress'>" +
                    "<div class='progress-bar'></div>" +
                    "</div>";
            }
            else{
                return "<span>"+value.url+"</span>" +
                    "<div class='btn btn-sm btn-default btn-remove'>Remove</div>";
            }
        },
        GeoPointFormatter:function(row, cell, value, columnDef, dataContext) {
            if(typeof value == "undefined"||value == null||typeof value.latitude == "undefined"||typeof value.longitude == "undefined"){
                return "<span class='light'>(undefined)</span>";
            }
            else{
                var latitude = Math.floor(value.latitude*100)/100;
                var longitude = Math.floor(value.longitude*100)/100;
                return "<div class='field-geo'>"+latitude+","+longitude+"</div>";
            }
        }
    }
});