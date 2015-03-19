define([
    './Base',
    'dispatcher',
    'jquery',
    'underscore'
],function(EditorCore,Dispatcher,$,_){
    function Pointer(args){
        this.input = {};
        this.defaultValue = "";
        var scope = this;
        EditorCore(args,scope);
        _.extend(this,{
            loadValue:function(item){
                var obj = item[args.column.field]||{};
                var value = obj.objectId||"";
                scope.defaultValue = value;
                scope.input.val(value);
            },
            applyValue:function (item, state) {
                var row = args.grid.getActiveCell().row;
                var model = args.grid.getData()[row];
                var data = {};
                var col = args.grid.getActiveCell().cell;
                var column =args.grid.getColumns()[col];
                //column
                item[args.column.field] = {
                    objectId:state,
                    __type:"Pointer",
                    className:column.className
                };
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
        });
        this.init();
    }

    return Pointer;
});