define([
    'dispatcher',
    'jquery',
    'underscore'
],function(Dispatcher,$,_){
    function EditorCore(args,scope) {
        _.extend(scope,{
            init:function(){
                scope.input = $("<input type=text class='editor-text' />")
                    .appendTo(args.container)
                    .bind("keydown.nav", function (e) {
                        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                            e.stopImmediatePropagation();
                        }
                    })
                    .focus()
                    .select();
                if(scope.afterInit)scope.afterInit();
            },
            destroy:function(){
                scope.input.unbind('.slick');
                scope.input.parents('.slick-cell').removeClass('error');
                scope.input.remove();
            },
            focus:function(){
                scope.input.focus();
            },
            getValue:function(){
                return scope.input.val();
            },
            setValue:function(value){
                scope.input.val(value);
            },
            serializeValue:function () {
                return scope.input.val();
            },
            loadValue:function(item){
                scope.defaultValue = item[args.column.field] || "";
                scope.input.val(scope.defaultValue);
                scope.input[0].defaultValue = scope.defaultValue;
                scope.input.select();
            },
            isValueChanged:function(){
                return (!(scope.input.val() == "" && scope.defaultValue == null)) && (scope.input.val() != scope.defaultValue);
            },
            validate:function(){
                if (args.column.validator) {
                    var validationResults = args.column.validator(scope.input.val());
                    if (!validationResults.valid) {
                        return validationResults;
                    }
                }
                return {
                    valid: true,
                    msg: null
                };
            },
            applyValue:function(item, state){
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
        });
    }

    return EditorCore;
});