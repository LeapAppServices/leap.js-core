define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function Text(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args,scope);
        _.extend(this, {
            init: function () {
                scope.input = $("<textarea></textarea>")
                    .appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    });
                setTimeout(function () {
                    scope.input.focus().select();
                }, 0);
            },
            loadValue:function(item){
                scope.defaultValue = (typeof item[args.column.field]=='string')?item[args.column.field]:"";
                scope.input.val(scope.defaultValue);
                scope.input[0].defaultValue = scope.defaultValue;
                scope.input.select();
            },
            isValueChanged:function(){
                return true;
            },
            applyValue:function(item, state){
                if(item[args.column.field] != state){
                    var row = args.grid.getActiveCell().row;
                    var model = args.grid.getData()[row];
                    var data = {};
                    item[args.column.field] = state;
                    if(item.objectId != "" && item.objectId){
                        data[args.column.field] = item[args.column.field];
                        Dispatcher.trigger('update:Class',{model:model,data:data},'Component');
                    }else{
                        _.forEach(item,function(value,index){
                            if(index!='objectId'&&index!='createdAt'&&index!='updatedAt'){
                                data[index]=value;
                            }
                        });
                        Dispatcher.trigger('create:Class',{model:model,data:data},'Component');
                    }
                }
            }
        });
        this.init();
    }

    return Text;
});