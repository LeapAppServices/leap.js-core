define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function Boolean(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args, scope);
        _.extend(this, {
            init:function () {
                scope.input = $("<select tabIndex='0' class='editor-boolean'>" +
                    "<option value='true' >True</option>" +
                    "<option value='false' >False</option>" +
                    "</select>");
                scope.input.appendTo(args.container);
                scope.input.focus();
            },
            isValueChanged:function(){
                return scope.input.val() != scope.defaultValue;
            },
            serializeValue:function () {
                return (scope.input.val() == "true");
            },
            loadValue:function(item){
                var value = item[args.column.field]?true:false;
                if(typeof item[args.column.field] !='object'){
                    scope.defaultValue = item[args.column.field]?'true':'false';
                }
                scope.input.find('[value='+value+']').prop('selected',true);
            }
        });
        this.init();
    }

    return Boolean;
});